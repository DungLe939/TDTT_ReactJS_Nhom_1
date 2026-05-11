import { motion, AnimatePresence } from 'motion/react';
import { Soup } from 'lucide-react';

interface LoadingModalProps {
  isOpen: boolean;
  message?: string;
  submessage?: string;
}

export function LoadingModal({
  isOpen,
  message = 'Analyzing...',
  submessage
}: LoadingModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
        >
          {/* Blur Background */}
          <motion.div
            initial={{ backdropFilter: 'blur(0px)' }}
            animate={{ backdropFilter: 'blur(8px)' }}
            exit={{ backdropFilter: 'blur(0px)' }}
            className="absolute inset-0 bg-black/40"
          />

          {/* Loading Card */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="relative z-10 bg-neutral-900 border border-orange-500/30 shadow-[0_0_40px_rgba(249,115,22,0.15)] rounded-2xl p-8 flex flex-col items-center gap-5 min-w-[280px]"
          >
            {/* Animated Spinner / Icon */}
            <div className="relative flex items-center justify-center w-24 h-24 bg-black rounded-full mb-2 shadow-[inset_0_0_20px_rgba(249,115,22,0.2)]">
              <motion.div
                animate={{ 
                  y: [0, -10, 0],
                  rotate: [-10, 10, -10],
                }}
                transition={{ 
                  duration: 0.8, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
              >
                <Soup className="w-12 h-12 text-orange-500 drop-shadow-[0_0_8px_rgba(249,115,22,0.8)]" />
              </motion.div>

              {/* Pulse Ring */}
              <motion.div
                animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="absolute inset-0 rounded-full border-[3px] border-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.6)]"
              />
            </div>

            {/* Text */}
            <div className="text-center">
              <h3 className="font-bold text-orange-500 mb-1 tracking-wide drop-shadow-[0_0_5px_rgba(249,115,22,0.4)]">
                {message}
              </h3>
              {submessage && (
                <p className="text-sm text-neutral-400">
                  {submessage}
                </p>
              )}
            </div>

            {/* Animated Dots */}
            <div className="flex gap-2">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{ y: [0, -8, 0], opacity: [0.5, 1, 0.5] }}
                  transition={{
                    duration: 0.6,
                    repeat: Infinity,
                    delay: i * 0.15,
                  }}
                  className="w-2.5 h-2.5 bg-orange-500 rounded-full shadow-[0_0_8px_rgba(249,115,22,0.8)]"
                />
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
