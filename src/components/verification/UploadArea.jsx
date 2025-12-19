export default function UploadArea({ inputId, onFileChange }) {
  return (
    <div
      className='border-2 border-dashed border-gray-700 rounded-xl p-6 md:p-8 text-center hover:border-akunuba-gold transition-colors cursor-pointer'
      onClick={() => document.getElementById(inputId)?.click()}
    >
      <div className='flex flex-col items-center'>
        <div className='w-12 h-12 bg-akunuba-gold/20 rounded-full flex items-center justify-center mb-3'>
          <svg
            width='24'
            height='24'
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
        <p className='text-white text-sm md:text-base mb-1'>
          Drag & drop your file here, or click to browse
        </p>
        <p className='text-gray-500 text-xs'>JPG, PNG or PDF, max 10MB</p>
      </div>
      <input
        id={inputId}
        type='file'
        accept='image/*,.pdf'
        className='hidden'
        onChange={onFileChange}
      />
    </div>
  );
}

