'use client';
import { useTheme } from '@/context/ThemeContext';
import { AnimatePresence, motion } from 'framer-motion';

const Modal = ({ isOpen, setIsOpen, children, maxWidth = 'max-w-2xl' }) => {
  const { isDarkMode } = useTheme();
  
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsOpen(false)}
          className='bg-black/60 backdrop-blur-sm p-2 md:p-4 lg:p-6 fixed inset-0 z-50 grid place-items-center overflow-y-auto cursor-pointer custom-scrollbar'
        >
          <style jsx global>{`
            .custom-scrollbar::-webkit-scrollbar {
              width: 6px;
            }
            .custom-scrollbar::-webkit-scrollbar-track {
              background: transparent;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb {
              background: rgba(241, 203, 104, 0.3);
              border-radius: 3px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover {
              background: rgba(241, 203, 104, 0.5);
            }
          `}</style>
          <motion.div
            initial={{ scale: 0, rotate: '12.5deg' }}
            animate={{ scale: 1, rotate: '0deg' }}
            exit={{ scale: 0, rotate: '0deg' }}
            onClick={e => e.stopPropagation()}
            className={`rounded-2xl w-full ${maxWidth} shadow-2xl cursor-default relative overflow-hidden my-auto`}
            style={
              isDarkMode
                ? {
                    background:
                      'linear-gradient(135deg, rgba(34, 33, 38, 0.98) 0%, rgba(17, 17, 22, 0.98) 100%)',
                    border: '1px solid rgba(241, 203, 104, 0.3)',
                  }
                : {
                    background: 'white',
                    border: '1px solid rgba(0, 0, 0, 0.1)',
                  }
            }
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
