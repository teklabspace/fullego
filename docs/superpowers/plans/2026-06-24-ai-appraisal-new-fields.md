# AI Appraisal — New Fields & Status Integration Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Surface the 9-field `ai_result` response and 4 appraisal statuses the backend now returns from `POST /api/v1/assets/{id}/appraisals`.

**Architecture:** The util layer (`assetsApi.js`) already does snake→camelCase via `transformKeys`, so all new fields arrive correctly named. The work is (1) update the JSDoc to document the new shape, (2) thread `appraisalStatus` state through the handler and JSX in `AssetDetailClient.js` to show status-specific UI, and (3) update the list-page toast handler to distinguish between the four statuses.

**Tech Stack:** React 19, Next.js 15 (App Router, static export), Tailwind CSS 4, react-toastify

## Global Constraints

- JavaScript only — no TypeScript, no type annotations
- Path alias `@/` → `src/`; never use relative `../` imports across feature folders
- All API calls go through `assetsApi.js` helpers — no direct `fetch` in pages
- `transformKeys` in `assetsApi.js` already converts snake_case to camelCase; do not write manual key mappings
- Tailwind only for styling — no inline `style={{}}` objects unless already present
- `isDarkMode` from `useTheme()` is available in every component; always dual-theme new UI
- No new dependencies

---

## File Structure

| File | Action | What changes |
|------|--------|-------------|
| `src/utils/assetsApi.js` | Modify | JSDoc for `runAiAppraisal` — document all 9 `aiResult` fields |
| `src/app/dashboard/assets/[id]/AssetDetailClient.js` | Modify | Add `appraisalStatus` state; update handler to capture status + handle `appraisal_failed`; replace result JSX with full 9-field + status-aware rendering |
| `src/app/dashboard/assets/page.js` | Modify | Update `handleSubmitAppraisal` to branch on `response.data?.status` |

---

### Task 1: Update `assetsApi.js` JSDoc

**Files:**
- Modify: `src/utils/assetsApi.js` (around line 395)

**Interfaces:**
- Produces: no change to runtime behaviour; documents `aiResult` shape for callers

- [ ] **Step 1: Replace the JSDoc block for `runAiAppraisal`**

Find and replace the comment block immediately above `export const runAiAppraisal` (currently lines 394-406).

Old comment:
```js
 * Returns: { data, aiResult } where aiResult = {
 *   estimatedValue, valueRangeLow, valueRangeHigh, currency,
 *   confidence, reasoning, disclaimer, model
 * }
```

New comment (full replacement of the doc block):
```js
/**
 * 14b. Run AI Appraisal — synchronous single-request AI valuation
 * POST /api/v1/assets/{asset_id}/appraisals  { appraisal_type: "API" }
 *
 * Returns { data, aiResult } — both transformed to camelCase.
 *
 * data.status ∈ ai_appraised | needs_more_information |
 *               professional_appraisal_recommended | appraisal_failed
 *
 * aiResult fields:
 *   estimatedValue, valueRangeLow, valueRangeHigh, currency,
 *   confidence ("low"|"medium"|"high"),
 *   appraisalSummary, keyValueDrivers[], riskFactors[],
 *   missingInformation[], recommendedDocuments[],
 *   suggestedNextStep, professionalAppraisalNeeded,
 *   disclaimer, model
 *
 * Error status codes:
 *   403 — monthly AI limit reached
 *   503 — AI service temporarily unavailable
 */
```

- [ ] **Step 2: Verify the file still parses**

Run: `node --input-type=module < src/utils/assetsApi.js 2>&1 | head -5`

Expected: no output (silent) or only a "cannot use import statement" error from Node running it directly — what matters is no syntax errors. Alternatively just confirm the file looks correct by reading lines 393-425.

- [ ] **Step 3: Commit**

```bash
git add src/utils/assetsApi.js
git commit -m "docs(assetsApi): document 9-field aiResult shape and 4 appraisal statuses"
```

---

### Task 2: Add `appraisalStatus` state and update the handler in `AssetDetailClient.js`

**Files:**
- Modify: `src/app/dashboard/assets/[id]/AssetDetailClient.js` (~lines 120-125 and 352-390)

**Interfaces:**
- Consumes: `runAiAppraisal` → `{ data: { status }, aiResult }` (camelCase)
- Produces: `appraisalStatus` state consumed by Task 3's JSX

- [ ] **Step 1: Add `appraisalStatus` state beside the existing AI states**

Find (around line 122):
```js
  const [aiResult, setAiResult] = useState(null);      // { estimatedValue, valueRangeLow, ... }
  const [runningAiAppraisal, setRunningAiAppraisal] = useState(false);
  const [showAiReasoning, setShowAiReasoning] = useState(false);
```

Replace with:
```js
  const [aiResult, setAiResult] = useState(null);
  const [appraisalStatus, setAppraisalStatus] = useState(null); // ai_appraised | needs_more_information | professional_appraisal_recommended | appraisal_failed
  const [runningAiAppraisal, setRunningAiAppraisal] = useState(false);
```

(Remove `showAiReasoning` — the new layout shows `appraisalSummary` inline, no toggle needed.)

- [ ] **Step 2: Update `handleRunAiAppraisal` to capture status and handle all four cases**

Find (around line 352):
```js
  const handleRunAiAppraisal = async () => {
    if (runningAiAppraisal) return;
    try {
      setRunningAiAppraisal(true); // inline "Estimating…" state only — no page spinner
      const response = await runAiAppraisal(asset.id);
      const result = response.aiResult;
      if (!result) {
        toast.error('AI appraisal did not return a result. Please try again.');
        return;
      }
      setAiResult(result);
      setShowAiReasoning(false);
      toast.success('AI estimate ready.');
```

Replace with:
```js
  const handleRunAiAppraisal = async () => {
    if (runningAiAppraisal) return;
    try {
      setRunningAiAppraisal(true);
      const response = await runAiAppraisal(asset.id);
      const status = response.data?.status ?? null;
      const result = response.aiResult;

      setAppraisalStatus(status);

      if (status === 'appraisal_failed') {
        toast.error('AI appraisal could not be completed. Please try again.');
      } else if (result) {
        setAiResult(result);
        toast.success('AI estimate ready.');
      } else {
        toast.error('AI appraisal did not return a result. Please try again.');
      }
```

- [ ] **Step 3: Remove the `showAiReasoning` setter that no longer exists**

The line `setShowAiReasoning(false)` was removed in Step 2. Confirm the file no longer references `setShowAiReasoning` or `showAiReasoning`. If there are remaining references (there was also a `useState` declaration removed in Step 1), remove them now.

Run: `grep -n "showAiReasoning" "src/app/dashboard/assets/[id]/AssetDetailClient.js"`

Expected: zero matches. If any remain, delete them.

- [ ] **Step 4: Commit**

```bash
git add "src/app/dashboard/assets/[id]/AssetDetailClient.js"
git commit -m "feat(asset-detail): capture appraisalStatus from AI appraisal response"
```

---

### Task 3: Render all 9 new fields + status-specific banners in `AssetDetailClient.js`

**Files:**
- Modify: `src/app/dashboard/assets/[id]/AssetDetailClient.js` (~lines 1161-1225)

**Interfaces:**
- Consumes: `aiResult` (Task 2), `appraisalStatus` (Task 2)
- Produces: full-featured AI Appraisal result card

- [ ] **Step 1: Replace the result JSX block**

Find the block starting with:
```jsx
              {/* Result */}
              {aiResult && (
                <div className='mb-4'>
```

…and ending with:
```jsx
                </div>
              )}
```

(This is the entire block from `{/* Result */}` through the closing `</div>` before the `{/* Action */}` comment, currently lines ~1161-1225.)

Replace it entirely with:

```jsx
              {/* Result — appraisal_failed state */}
              {appraisalStatus === 'appraisal_failed' && (
                <div className={`mb-4 p-3 rounded-lg border ${
                  isDarkMode
                    ? 'bg-red-500/10 border-red-500/30 text-red-400'
                    : 'bg-red-50 border-red-200 text-red-700'
                }`}>
                  <p className='text-sm font-semibold mb-0.5'>Appraisal failed</p>
                  <p className='text-xs'>The AI could not complete the appraisal. Please try again later.</p>
                </div>
              )}

              {/* Result — all successful statuses */}
              {aiResult && appraisalStatus !== 'appraisal_failed' && (
                <div className='mb-4'>

                  {/* Estimated value */}
                  <p className={`text-3xl font-bold mb-1 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {formatCurrency(aiResult.estimatedValue, aiResult.currency)}
                  </p>

                  {/* Value range */}
                  {(aiResult.valueRangeLow != null && aiResult.valueRangeHigh != null) && (
                    <p className={`text-sm mb-2 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      Range: {formatCurrency(aiResult.valueRangeLow, aiResult.currency)} – {formatCurrency(aiResult.valueRangeHigh, aiResult.currency)}
                    </p>
                  )}

                  {/* Confidence badge */}
                  {aiResult.confidence && (
                    <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full mb-3 capitalize ${
                      aiResult.confidence === 'high'
                        ? isDarkMode ? 'bg-green-500/10 text-green-400' : 'bg-green-50 text-green-700'
                        : aiResult.confidence === 'medium'
                        ? isDarkMode ? 'bg-[#F1CB68]/10 text-[#F1CB68]' : 'bg-yellow-50 text-yellow-700'
                        : isDarkMode ? 'bg-orange-500/10 text-orange-400' : 'bg-orange-50 text-orange-700'
                    }`}>
                      {aiResult.confidence} confidence
                    </span>
                  )}

                  {/* Missing information banner (needs_more_information status) */}
                  {aiResult.missingInformation?.length > 0 && (
                    <div className={`mb-3 p-3 rounded-lg border ${
                      isDarkMode
                        ? 'bg-orange-500/10 border-orange-500/30'
                        : 'bg-orange-50 border-orange-200'
                    }`}>
                      <p className={`text-xs font-semibold mb-1 ${
                        isDarkMode ? 'text-orange-300' : 'text-orange-700'
                      }`}>
                        To improve accuracy, add:
                      </p>
                      <ul className={`text-xs space-y-0.5 list-disc list-inside ${
                        isDarkMode ? 'text-orange-300' : 'text-orange-700'
                      }`}>
                        {aiResult.missingInformation.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Professional appraisal callout */}
                  {aiResult.professionalAppraisalNeeded && (
                    <div className={`mb-3 p-3 rounded-lg border ${
                      isDarkMode
                        ? 'bg-blue-500/10 border-blue-500/30'
                        : 'bg-blue-50 border-blue-200'
                    }`}>
                      <p className={`text-xs font-semibold mb-0.5 ${
                        isDarkMode ? 'text-blue-300' : 'text-blue-700'
                      }`}>
                        A certified appraisal is recommended for this asset.
                      </p>
                      <p className={`text-xs ${
                        isDarkMode ? 'text-blue-300' : 'text-blue-700'
                      }`}>
                        The AI estimate is for reference. A professional appraisal is advised before insuring or selling.
                      </p>
                    </div>
                  )}

                  {/* Appraisal summary */}
                  {aiResult.appraisalSummary && (
                    <p className={`text-sm mb-3 leading-relaxed ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      {aiResult.appraisalSummary}
                    </p>
                  )}

                  {/* Key value drivers */}
                  {aiResult.keyValueDrivers?.length > 0 && (
                    <div className='mb-3'>
                      <p className={`text-xs font-semibold mb-1.5 uppercase tracking-wide ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        Value drivers
                      </p>
                      <ul className='text-xs space-y-1'>
                        {aiResult.keyValueDrivers.map((driver, i) => (
                          <li key={i} className={`flex items-start gap-1.5 ${
                            isDarkMode ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                            <span className='text-green-500 mt-0.5 shrink-0'>↑</span>
                            {driver}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Risk factors */}
                  {aiResult.riskFactors?.length > 0 && (
                    <div className='mb-3'>
                      <p className={`text-xs font-semibold mb-1.5 uppercase tracking-wide ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        Risk factors
                      </p>
                      <ul className='text-xs space-y-1'>
                        {aiResult.riskFactors.map((risk, i) => (
                          <li key={i} className={`flex items-start gap-1.5 ${
                            isDarkMode ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                            <span className='text-orange-400 mt-0.5 shrink-0'>!</span>
                            {risk}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Suggested next step */}
                  {aiResult.suggestedNextStep && (
                    <div className={`mb-3 p-3 rounded-lg ${
                      isDarkMode ? 'bg-[#2A2A2D]' : 'bg-gray-50'
                    }`}>
                      <p className={`text-xs font-semibold mb-0.5 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        Next step
                      </p>
                      <p className={`text-xs ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        {aiResult.suggestedNextStep}
                      </p>
                    </div>
                  )}

                  {/* Recommended documents */}
                  {aiResult.recommendedDocuments?.length > 0 && (
                    <div className='mb-3'>
                      <p className={`text-xs font-semibold mb-1.5 uppercase tracking-wide ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        Recommended documents
                      </p>
                      <ul className='text-xs space-y-1'>
                        {aiResult.recommendedDocuments.map((doc, i) => (
                          <li key={i} className={`flex items-start gap-1.5 ${
                            isDarkMode ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                            <span className='shrink-0'>•</span>
                            {doc}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Disclaimer — required directly below the value */}
                  {aiResult.disclaimer && (
                    <p className={`text-xs italic leading-relaxed ${
                      isDarkMode ? 'text-gray-500' : 'text-gray-500'
                    }`}>
                      {aiResult.disclaimer}
                    </p>
                  )}

                </div>
              )}
```

- [ ] **Step 2: Confirm no remaining `showAiReasoning` or `aiResult.reasoning` references**

```bash
grep -n "showAiReasoning\|aiResult\.reasoning" "src/app/dashboard/assets/[id]/AssetDetailClient.js"
```

Expected: zero matches.

- [ ] **Step 3: Commit**

```bash
git add "src/app/dashboard/assets/[id]/AssetDetailClient.js"
git commit -m "feat(asset-detail): render 9-field AI appraisal result with status-specific banners"
```

---

### Task 4: Update `assets/page.js` — status-aware toast handling

**Files:**
- Modify: `src/app/dashboard/assets/page.js` (~lines 175-188)

**Interfaces:**
- Consumes: `runAiAppraisal` → `{ data: { status, notes }, aiResult }`
- Produces: appropriate success/info/error toast for each of the 4 statuses

- [ ] **Step 1: Replace the toast block inside `handleSubmitAppraisal`**

Find (around line 175):
```js
      if (appraisalType === 'API') {
        const response = await runAiAppraisal(selectedAsset.id);
        const result = response.aiResult;
        if (result) {
          toast.success(
            `AI estimate: ${formatCurrency(result.estimatedValue, result.currency)}`
          );
          if (result.disclaimer) {
            toast.info(result.disclaimer);
          }
        } else {
          toast.success('Automated appraisal completed.');
        }
        // Backend updated the asset's estimated value — refresh the list.
        fetchAssets();
```

Replace with:
```js
      if (appraisalType === 'API') {
        const response = await runAiAppraisal(selectedAsset.id);
        const status = response.data?.status;
        const result = response.aiResult;

        if (status === 'appraisal_failed') {
          toast.error(response.data?.notes || 'AI appraisal could not be completed. Please try again.');
        } else if (result) {
          const valueStr = formatCurrency(result.estimatedValue, result.currency);
          if (status === 'needs_more_information') {
            toast.success(`AI estimate: ${valueStr} — add missing details to improve accuracy.`);
          } else if (status === 'professional_appraisal_recommended') {
            toast.success(`AI estimate: ${valueStr} — a certified appraisal is recommended.`);
          } else {
            toast.success(`AI estimate: ${valueStr}`);
          }
        } else {
          toast.success('Automated appraisal completed.');
        }
        // Backend updated the asset's estimated value — refresh the list.
        fetchAssets();
```

- [ ] **Step 2: Commit**

```bash
git add src/app/dashboard/assets/page.js
git commit -m "feat(assets-list): branch AI appraisal toast on status (failed/incomplete/pro-recommended)"
```

---

## Self-Review

**Spec coverage check:**

| Requirement | Task |
|-------------|------|
| POST `appraisals` with `appraisal_type: "API"` | Already implemented — no change |
| Return shape: 9 `ai_result` fields | Task 1 (docs), Task 3 (rendering) |
| `appraisalSummary` shown | Task 3 |
| `keyValueDrivers` shown | Task 3 |
| `riskFactors` shown | Task 3 |
| `missingInformation` banner (when `length > 0`) | Task 3 |
| `recommendedDocuments` shown | Task 3 |
| `suggestedNextStep` shown | Task 3 |
| `professionalAppraisalNeeded` callout | Task 3 |
| `confidence` badge (green/amber/red) | Already implemented — no change |
| `disclaimer` shown below estimated value | Already implemented, preserved in Task 3 |
| `ai_appraised` status → full result | Task 2 + 3 |
| `needs_more_information` status → result + missing banner | Task 2 + 3 + 4 |
| `professional_appraisal_recommended` status → result + callout | Task 2 + 3 + 4 |
| `appraisal_failed` status → error state, no result | Task 2 + 3 + 4 |
| Quota check before button (GET `/assets/ai/usage`) | Already implemented — no change |
| Quota-disabled button state | Already implemented — no change |
| Loading spinner during 3-8 s call | Already implemented — no change |

**Placeholder scan:** No TBDs, TODOs, or "similar to Task N" shortcuts found.

**Type consistency:** `appraisalStatus` is set in Task 2 handler and consumed in Task 3 JSX — same variable name throughout. `aiResult.appraisalSummary` used consistently (not `reasoning`).
