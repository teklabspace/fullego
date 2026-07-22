'use client';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import {
  getManualVerification,
  submitManualVerification,
} from '@/utils/kycApi';

// Public manual-verification fallback. Users whose Persona check failed get
// this link by email (/manual-verification?token=...) — the token is the
// credential, so the page must work without login. GET validates the link and
// describes the uploads; POST submits selfie + ID for admin review. The token
// is one-time: it dies on successful submit.

const TYPE_LABELS = {
  'image/jpeg': 'JPG',
  'image/jpg': 'JPG',
  'image/png': 'PNG',
  'image/webp': 'WEBP',
  'application/pdf': 'PDF',
};

const typesLabel = (types = []) => {
  const out = [];
  for (const t of types) {
    const label = TYPE_LABELS[t] || (t.split('/').pop() || t).toUpperCase();
    if (!out.includes(label)) out.push(label);
  }
  if (out.length <= 1) return out[0] || '';
  return `${out.slice(0, -1).join(', ')} or ${out[out.length - 1]}`;
};

const formatSize = (bytes) =>
  bytes >= 1024 * 1024
    ? `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} KB`;

// Upload slots — keys are UI-side; the exact backend multipart field names
// (selfie / id_front / id_back) live in kycApi.submitManualVerification.
const SLOTS = [
  {
    key: 'selfie',
    reqKey: 'selfie',
    kind: 'selfie',
    label: 'Selfie photo',
    hint: 'A clear, well-lit photo of your face',
  },
  {
    key: 'idFront',
    reqKey: 'id_front',
    kind: 'documents',
    label: 'ID document — front',
    hint: "Passport, driver's license or national ID",
  },
  {
    key: 'idBack',
    reqKey: 'id_back',
    kind: 'documents',
    label: 'ID document — back',
    hint: 'Only needed if your document has details on the back',
  },
];

export default function ManualVerificationPage() {
  // validating | invalid | expired | error | form | review | success
  const [phase, setPhase] = useState('validating');
  const [token, setToken] = useState('');
  const [info, setInfo] = useState(null);
  const [files, setFiles] = useState({}); // slot key -> { file, previewUrl }
  const [slotErrors, setSlotErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  // Revoke preview object URLs when the page unmounts.
  const filesRef = useRef(files);
  useEffect(() => {
    filesRef.current = files;
  }, [files]);
  useEffect(
    () => () => {
      Object.values(filesRef.current).forEach((f) => {
        if (f?.previewUrl) URL.revokeObjectURL(f.previewUrl);
      });
    },
    []
  );

  const validate = async (t) => {
    setPhase('validating');
    try {
      const data = await getManualVerification(t);
      setInfo(data);
      setPhase(data.alreadySubmitted ? 'review' : 'form');
    } catch (err) {
      if (err?.status === 410 || err?.code === 'VERIFICATION_LINK_EXPIRED') {
        setPhase('expired');
      } else if (err?.isNetworkError) {
        setPhase('error');
      } else {
        setPhase('invalid');
      }
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const urlToken = new URLSearchParams(window.location.search).get('token');
    if (!urlToken) {
      setPhase('invalid');
      return;
    }
    setToken(urlToken);
    validate(urlToken);
  }, []);

  const maxMb = info?.maxFileSizeMb ?? 10;

  const isRequired = (slot) => {
    const v = info?.requirements?.[slot.reqKey];
    if (v) return v === 'required';
    return slot.key !== 'idBack';
  };

  const validateFile = (file, kind) => {
    const allowed = info?.acceptedTypes?.[kind] || [];
    const type = (file.type || '').toLowerCase();
    if (allowed.length && !allowed.includes(type)) {
      return `Unsupported file type. Please use ${typesLabel(allowed)}.`;
    }
    if (file.size > maxMb * 1024 * 1024) {
      return `File is too large (${formatSize(file.size)}). Maximum size is ${maxMb}MB.`;
    }
    return null;
  };

  const handleSelect = (slot, fileList) => {
    const file = fileList?.[0];
    if (!file) return;
    const err = validateFile(file, slot.kind);
    setSlotErrors((p) => ({ ...p, [slot.key]: err }));
    if (err) return;
    setFiles((prev) => {
      const old = prev[slot.key];
      if (old?.previewUrl) URL.revokeObjectURL(old.previewUrl);
      const previewUrl = file.type?.startsWith('image/')
        ? URL.createObjectURL(file)
        : null;
      return { ...prev, [slot.key]: { file, previewUrl } };
    });
    setSubmitError('');
  };

  const handleClear = (slotKey) => {
    setFiles((prev) => {
      const old = prev[slotKey];
      if (old?.previewUrl) URL.revokeObjectURL(old.previewUrl);
      const next = { ...prev };
      delete next[slotKey];
      return next;
    });
    setSlotErrors((p) => ({ ...p, [slotKey]: null }));
  };

  const canSubmit = !!files.selfie?.file && !!files.idFront?.file && !submitting;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!files.selfie?.file || !files.idFront?.file) {
      setSubmitError('Please add your selfie and the front of your ID document.');
      return;
    }
    setSubmitting(true);
    setSubmitError('');
    try {
      const res = await submitManualVerification(token, {
        selfie: files.selfie.file,
        idFront: files.idFront.file,
        idBack: files.idBack?.file || null,
      });
      setResult(res);
      setPhase('success');
    } catch (err) {
      if (err?.status === 410 || err?.code === 'VERIFICATION_LINK_EXPIRED') {
        setPhase('expired');
      } else if (err?.status === 404) {
        // Token unknown or consumed between page load and submit.
        setPhase('invalid');
      } else if (err?.isNetworkError) {
        setSubmitError(
          'Could not reach the server. Please check your connection and try again.'
        );
      } else {
        // 422 / 400 messages from the backend are user-safe — show them as-is.
        setSubmitError(err?.message || 'Something went wrong. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className='min-h-screen bg-[#0B0D12] flex flex-col'>
      {/* Header */}
      <header className='px-6 lg:px-12 py-6 border-b border-gray-800'>
        <Link href='/' className='inline-flex items-center gap-2'>
          <div className='w-10 h-10 bg-[#F1CB68] rounded-lg flex items-center justify-center'>
            <span className='text-[#0B0D12] text-xl font-bold'>F</span>
          </div>
          <span className='text-white text-xl font-semibold'>Akunuba</span>
        </Link>
      </header>

      {/* Content */}
      <main className='flex-1 flex items-start justify-center p-6 lg:p-12'>
        <div className='w-full max-w-lg py-8'>
          {phase === 'validating' && (
            <div className='text-center py-16'>
              <div className='w-10 h-10 border-2 border-[#F1CB68] border-t-transparent rounded-full animate-spin mx-auto mb-4' />
              <p className='text-gray-400 text-sm'>Checking your verification link…</p>
            </div>
          )}

          {phase === 'invalid' && (
            <StatusCard
              tone='red'
              icon={
                <>
                  <line x1='18' y1='6' x2='6' y2='18' />
                  <line x1='6' y1='6' x2='18' y2='18' />
                </>
              }
              title='This link is not valid'
              body='The verification link is invalid or has already been used. If you believe this is a mistake, please contact our support team.'
            />
          )}

          {phase === 'expired' && (
            <StatusCard
              tone='amber'
              icon={
                <>
                  <circle cx='12' cy='12' r='10' />
                  <polyline points='12 6 12 12 16 14' />
                </>
              }
              title='This link has expired'
              body='This link has expired — please contact support to request a new one.'
            />
          )}

          {phase === 'error' && (
            <StatusCard
              tone='gray'
              icon={
                <>
                  <path d='M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z' />
                  <line x1='12' y1='9' x2='12' y2='13' />
                  <line x1='12' y1='17' x2='12.01' y2='17' />
                </>
              }
              title="We couldn't check your link"
              body='The server could not be reached. Please check your connection and try again.'
              action={
                <button
                  onClick={() => validate(token)}
                  className='bg-[#F1CB68] hover:bg-[#D6A738] text-[#0B0D12] font-semibold px-8 py-3 rounded-full transition-colors'
                >
                  Try again
                </button>
              }
            />
          )}

          {phase === 'review' && (
            <StatusCard
              tone='gold'
              icon={
                <>
                  <path d='M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z' />
                  <polyline points='14 2 14 8 20 8' />
                  <line x1='16' y1='13' x2='8' y2='13' />
                  <line x1='16' y1='17' x2='8' y2='17' />
                </>
              }
              title='Your documents are under review'
              body="We've already received your documents. Our team is reviewing them — you'll get an email as soon as the review is complete."
            />
          )}

          {phase === 'success' && (
            <StatusCard
              tone='green'
              icon={<polyline points='20 6 9 17 4 12' />}
              title='Documents submitted'
              body={
                result?.message ||
                'Documents submitted successfully. Our team will review your verification.'
              }
              footer="You'll receive an email once the review is complete."
              hideHomeLink
              action={
                <Link
                  href='/'
                  className='bg-[#F1CB68] hover:bg-[#D6A738] text-[#0B0D12] font-semibold px-8 py-3 rounded-full transition-colors'
                >
                  Back to home
                </Link>
              }
            />
          )}

          {phase === 'form' && info && (
            <>
              <div className='mb-8'>
                <h1 className='text-white text-3xl lg:text-4xl font-semibold mb-2'>
                  Verify your identity
                </h1>
                <p className='text-gray-400 text-sm leading-relaxed'>
                  Hi {info.firstName || 'there'} — your automated verification
                  couldn&apos;t be completed. Upload the documents below and our
                  team will review them personally.
                </p>
              </div>

              <form onSubmit={handleSubmit} className='space-y-6'>
                {submitError && (
                  <div className='bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl text-sm'>
                    {submitError}
                  </div>
                )}

                {SLOTS.map((slot) => (
                  <FileSlot
                    key={slot.key}
                    slot={slot}
                    required={isRequired(slot)}
                    value={files[slot.key]}
                    error={slotErrors[slot.key]}
                    accept={(info.acceptedTypes?.[slot.kind] || []).join(',')}
                    constraint={`${typesLabel(info.acceptedTypes?.[slot.kind] || [])} · max ${maxMb}MB`}
                    onSelect={(fileList) => handleSelect(slot, fileList)}
                    onClear={() => handleClear(slot.key)}
                  />
                ))}

                <button
                  type='submit'
                  disabled={!canSubmit}
                  className='w-full bg-[#F1CB68] hover:bg-[#D6A738] disabled:opacity-50 disabled:cursor-not-allowed text-[#0B0D12] font-semibold py-3 rounded-full transition-colors'
                >
                  {submitting ? 'Submitting…' : 'Submit for review'}
                </button>

                <p className='text-center text-gray-500 text-xs'>
                  Your documents are stored securely and reviewed only by our
                  verification team.{' '}
                  <Link
                    href='/contact'
                    className='text-gray-400 hover:text-white underline transition-colors'
                  >
                    Need help?
                  </Link>
                </p>
              </form>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

const STATUS_TONES = {
  red: 'bg-red-500/10 text-red-400',
  amber: 'bg-amber-500/10 text-amber-400',
  gold: 'bg-[#F1CB68]/10 text-[#F1CB68]',
  green: 'bg-green-500/10 text-green-400',
  gray: 'bg-white/5 text-gray-400',
};

function StatusCard({ tone, icon, title, body, footer, action, hideHomeLink }) {
  return (
    <div className='text-center py-10'>
      <div
        className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 ${STATUS_TONES[tone]}`}
      >
        <svg
          width='28'
          height='28'
          viewBox='0 0 24 24'
          fill='none'
          stroke='currentColor'
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'
        >
          {icon}
        </svg>
      </div>
      <h1 className='text-white text-2xl lg:text-3xl font-semibold mb-3'>{title}</h1>
      <p className='text-gray-400 text-sm leading-relaxed max-w-md mx-auto mb-8'>{body}</p>
      {footer && <p className='text-gray-500 text-xs mb-8 -mt-4'>{footer}</p>}
      <div className='flex flex-col items-center gap-4'>
        {action || (
          <Link
            href='/contact'
            className='bg-[#F1CB68] hover:bg-[#D6A738] text-[#0B0D12] font-semibold px-8 py-3 rounded-full transition-colors'
          >
            Contact support
          </Link>
        )}
        {!hideHomeLink && (
          <Link
            href='/'
            className='text-gray-400 text-sm hover:text-white transition-colors'
          >
            Back to home
          </Link>
        )}
      </div>
    </div>
  );
}

function FileSlot({ slot, required, value, error, accept, constraint, onSelect, onClear }) {
  const inputId = `manual-upload-${slot.key}`;
  return (
    <div>
      <label htmlFor={inputId} className='block text-white text-sm mb-2'>
        {slot.label}{' '}
        {required ? (
          <span className='text-[#F1CB68]'>*</span>
        ) : (
          <span className='text-gray-500 text-xs'>(optional)</span>
        )}
      </label>

      {value?.file ? (
        <div className='flex items-center gap-3 border border-gray-700 rounded-xl p-3'>
          {value.previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- blob preview URL, next/image can't optimize it
            <img
              src={value.previewUrl}
              alt={`${slot.label} preview`}
              className='w-14 h-14 rounded-lg object-cover flex-shrink-0'
            />
          ) : (
            <div className='w-14 h-14 rounded-lg bg-[#F1CB68]/10 flex items-center justify-center text-[#F1CB68] text-xs font-semibold flex-shrink-0'>
              PDF
            </div>
          )}
          <div className='flex-1 min-w-0'>
            <p className='text-white text-sm truncate'>{value.file.name}</p>
            <p className='text-gray-500 text-xs'>{formatSize(value.file.size)}</p>
          </div>
          <button
            type='button'
            onClick={onClear}
            className='text-gray-400 hover:text-red-400 text-xs transition-colors flex-shrink-0'
          >
            Remove
          </button>
        </div>
      ) : (
        <div
          onClick={() => document.getElementById(inputId)?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            onSelect(e.dataTransfer?.files);
          }}
          className='border-2 border-dashed border-gray-700 rounded-xl p-5 text-center hover:border-[#F1CB68] transition-colors cursor-pointer'
        >
          <div className='flex flex-col items-center'>
            <div className='w-10 h-10 bg-[#F1CB68]/20 rounded-full flex items-center justify-center mb-2'>
              <svg
                width='20'
                height='20'
                viewBox='0 0 24 24'
                fill='none'
                stroke='#F1CB68'
                strokeWidth='2'
              >
                <path d='M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4' />
                <polyline points='17 8 12 3 7 8' />
                <line x1='12' y1='3' x2='12' y2='15' />
              </svg>
            </div>
            <p className='text-white text-sm mb-1'>
              Click to upload or drag &amp; drop
            </p>
            <p className='text-gray-500 text-xs'>{slot.hint}</p>
            <p className='text-gray-600 text-xs mt-1'>{constraint}</p>
          </div>
        </div>
      )}

      <input
        id={inputId}
        type='file'
        accept={accept}
        className='hidden'
        onChange={(e) => {
          onSelect(e.target.files);
          e.target.value = '';
        }}
      />
      {error && <p className='text-red-400 text-xs mt-1'>{error}</p>}
    </div>
  );
}
