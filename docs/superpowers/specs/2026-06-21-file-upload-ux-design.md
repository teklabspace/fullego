# File-Upload UX Overhaul — Design Spec

**Date:** 2026-06-21
**Status:** Approved (design), pending implementation plan
**Scope of first plan:** Shared upload layer + Documents page as the reference surface. Other surfaces (KYC identity/document verification, assets/add, entity-structure, support `NewTicketModal`) follow in a later plan.

---

## 1. Goal

Replace the app's bare upload interactions (a `fetch()` POST with a spinner) with an honest, resilient, reusable upload experience:

1. **Drag-and-drop feedback** — the dropzone visibly responds when a file is over it: gold border glow, copy shift, subtle scale.
2. **Honest progress** — real percent, transfer speed, and time-left ETA during the API upload; no mystery spinner.
3. **Per-file independent warm-retry** — if an upload fails, the file *stays loaded* with its preview and a one-tap **Retry** re-sends it. One file failing never blocks the others.
4. **Visual proof of the file** — on add, show a thumbnail (images) or a type badge (docs), plus name, type, and human-readable size.
5. **Resume-ready architecture** — structured so true byte-level resume (Supabase TUS) can be dropped in later by changing one function, with no UI changes.

## 2. Context & constraints

- **Static export SPA** (`output: 'export'`), JavaScript only, React 19 / Next 15. No server runtime; all uploads happen client-side after mount.
- **Current flow:** browser → FastAPI `POST /api/v1/files/upload` (multipart) → Supabase Storage (`KYC-DOCUMENTS` / `KYB-DOCUMENTS` buckets). The browser never touches Supabase directly; there is no `@supabase/supabase-js` or `tus-js-client` dependency and no Supabase env config.
- **`fetch()` cannot report upload progress.** Real percent/ETA requires `XMLHttpRequest` (`xhr.upload.onprogress`) or a streaming transport. We use XHR.
- **The current backend cannot resume a partial upload** (one-shot multipart POST). Therefore "retry" in this plan **restarts the transfer from 0** ("warm retry": file kept in memory, one tap, no re-pick). The microcopy is honest about this — it never claims to resume from a byte offset.
- **Resume-ready, not resumed.** Storage is Supabase, which natively supports the TUS resumable protocol. True resume is a future change requiring backend/Supabase work (a per-file signed upload credential or anon key + bucket RLS, since the app authenticates against the FastAPI backend, not Supabase Auth). This spec isolates the transport so that future swap is localized to one function.
- **Honesty about "walk away":** uploads run in the page. The user may switch tabs or wait, but **closing/reloading the tab cancels** in-flight uploads. Copy reflects this truthfully rather than implying background resilience.

## 3. Architecture

Three layers, consistent with the project's existing structure.

### 3.1 Transport (the resume-ready seam) — `src/lib/api/uploadClient.js`

```
uploadFileWithProgress(file, options, { onProgress, signal }) -> Promise<result>
```

- Builds the same `FormData` the current `uploadDocument` builds (`file`, optional `category`, `tags`, `description`, `related_type`, `related_id`).
- Sends via **`XMLHttpRequest`** to `${API_BASE_URL}/api/v1/files/upload`, attaching the Bearer token from `getDefaultHeaders()` (minus `Content-Type`, so the browser sets the multipart boundary).
- `xhr.upload.onprogress` → calls `onProgress({ loaded, total })`.
- `signal` (an `AbortSignal`) aborts the XHR (used by cancel and by unmount cleanup).
- Resolves with the parsed JSON (camelCased) on 2xx; rejects with an `Error` carrying `status`/`data` on non-2xx or network failure — same error shape the existing `client.js` produces, so callers handle it identically.
- **This function is the only thing that knows the transport.** Swapping to Supabase TUS later means rewriting this body to drive `tus-js-client`; the hook and components above it do not change.

> `documentsApi.uploadDocument` is refactored to delegate here (or kept as a thin wrapper) so existing callers keep working during rollout.

### 3.2 State — `src/hooks/useFileUploads.js`

Owns a list of **upload items**, each independent:

```
item = {
  id,            // stable local id
  file,          // the File object, kept in memory (enables warm retry + preview)
  name, size, type,
  previewUrl,    // object URL for images, else null
  status,        // 'queued' | 'uploading' | 'success' | 'error' | 'canceled'
  progress,      // 0..1
  loaded, total,
  speedBytesPerSec, etaSeconds,
  error,         // message when status === 'error'
  result,        // server response when status === 'success'
  _xhrController, // AbortController for this item
}
```

- Reducer-driven state (pure reducer, unit-testable).
- API: `addFiles(FileList|File[])`, `retry(id)`, `remove(id)`, `cancel(id)`, plus derived `items`, `isUploading`, `allDone`.
- `addFiles` runs validation (type/size) first; rejected files surface as a non-upload validation error (not a failed upload).
- Each upload gets its **own `AbortController`** → true per-file independence; a rejection updates only that item.
- **Speed/ETA math** (pure, unit-tested): maintain a small rolling window of `(timestamp, loaded)` samples per item; `speed = Δloaded / Δt` over the window; `eta = (total − loaded) / speed`, smoothed and clamped.
- Revokes `previewUrl` object URLs on `remove` and on unmount (memory hygiene).
- `retry(id)` re-invokes the transport for that item from 0, reusing the in-memory `file`.

### 3.3 UI — `src/components/upload/`

- **`FileDropzone.jsx`** — drag + click target.
  - Props: `accept`, `multiple`, `maxSizeMB`, `onFiles`, `disabled`, label/help text.
  - Drag state: gold border glow (`#F1CB68`), background tint, copy shift ("Click or drag file to upload" → "Drop to upload"), subtle scale. Matches existing dark/light theming via `useTheme`.
  - Hidden `<input type="file">` for click-to-browse; keyboard accessible.
- **`FilePreviewCard.jsx`** — one file's visual proof + live status.
  - **Thumbnail:** images (`png/jpg/jpeg/webp/gif`) render a real preview from the object URL; non-images render a colored **type badge** (PDF red, XLS/CSV green, DOC blue, generic gray) with the extension.
  - Always shows: filename (middle-truncated), human size (e.g. "2.4 MB"), type.
  - **Status row by state:**
    - `uploading`: progress bar + `NN%` + speed + `~Xs left` + honest "keep working in another tab; don't close this page" hint.
    - `success`: check + "Uploaded".
    - `error`: inline error message + one-tap **Retry** (warm) + Remove.
    - `queued`: "Waiting…".
  - Remove / cancel control always available.
- **`UploadList.jsx`** — renders a `FilePreviewCard` per item; purely presentational over the hook's `items`.

## 4. Data flow

```
Page/Modal
  ├─ <FileDropzone onFiles={addFiles} ... />
  ├─ const { items, retry, remove, cancel } = useFileUploads({ accept, maxSizeMB, uploadOptions })
  └─ <UploadList items={items} onRetry={retry} onRemove={remove} onCancel={cancel} />

useFileUploads ──▶ uploadFileWithProgress(file, opts, {onProgress, signal})  // src/lib/api/uploadClient.js
                                            │ XHR → POST /api/v1/files/upload (Bearer)
                                            ▼
                                     FastAPI ──▶ Supabase Storage
```

snake_case⇄camelCase mapping stays in the util/transport layer, per the project's one architectural rule.

## 5. Documents page integration (reference surface)

- `src/components/documents/FileUploadModal.jsx` is refactored from its hardcoded single `selectedFile` to **multi-file** using `FileDropzone` + `useFileUploads` + `UploadList`.
- Existing tag UI and the preview hand-off (`onPreview`) are preserved.
- The Documents list refreshes on successful upload(s).

## 6. Error handling

| Case | Behavior |
|------|----------|
| Invalid type/size | Rejected in `addFiles`; inline validation message; not counted as a failed upload. |
| Network / 5xx / timeout | Item → `error`; warm **Retry** available; other items unaffected. |
| User cancels | Item → `canceled`; XHR aborted; removable. |
| Tab closed mid-upload | Upload dies (documented limitation); copy never implied otherwise. |

Error text reuses the existing flattened FastAPI `detail` message shape.

## 7. Testing

- **Unit:** speed/ETA calculation and the upload-item reducer (both pure) — table-driven cases incl. zero-speed, completed, stalled.
- **Manual / Playwright:** drag-over visual state, multi-file independence (fail one, others continue), warm-retry from a forced failure, thumbnail vs badge rendering.
- If no test runner is configured in the repo, the implementation plan adds a minimal one for the pure modules only (no framework sprawl).

## 8. Future work (out of scope here)

- **True byte-level resume via Supabase TUS.** Requires: backend endpoint to mint a per-file signed upload credential (or anon key + bucket RLS policies, since auth is backend-JWT not Supabase Auth), frontend `tus-js-client`, and pointing the transport seam (`uploadFileWithProgress`) at `…/storage/v1/upload/resumable`. A separate backend/Supabase spec will cover this.
- **Rollout to remaining surfaces:** KYC identity/document verification, `assets/add`, `entity-structure`, support `NewTicketModal`.

## 9. New / changed files (first plan)

**New**
- `src/lib/api/uploadClient.js`
- `src/hooks/useFileUploads.js`
- `src/components/upload/FileDropzone.jsx`
- `src/components/upload/FilePreviewCard.jsx`
- `src/components/upload/UploadList.jsx`
- Unit tests for the speed/ETA + reducer modules.

**Changed**
- `src/components/documents/FileUploadModal.jsx` (multi-file via the new layer)
- `src/utils/documentsApi.js` (`uploadDocument` delegates to the new transport)
