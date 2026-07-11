import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Play } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface VideoModalProps {
  open: boolean;
  onClose: () => void;
}

export function VideoModal({ open, onClose }: VideoModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[1000] flex items-center justify-center"
          style={{ backgroundColor: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(16px)' }}
          onClick={onClose}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 h-10 w-10 flex items-center justify-center rounded-full text-white/60 hover:text-white transition-colors"
            style={{ border: '1px solid rgba(255,255,255,0.15)', backgroundColor: 'rgba(255,255,255,0.05)' }}
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Content container */}
          <motion.div
            initial={{ clipPath: 'inset(43.5% 43.5% 33.5% 43.5%)', opacity: 0 }}
            animate={{ clipPath: 'inset(0% 0% 0% 0%)', opacity: 1 }}
            exit={{ clipPath: 'inset(43.5% 43.5% 33.5% 43.5%)', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 100, damping: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-4xl mx-8 flex items-center justify-center"
            style={{ borderRadius: 16, overflow: 'hidden', position: 'relative', aspectRatio: '16/9', backgroundColor: '#0a0f1a' }}
          >
            {/* Placeholder — video content removed */}
            <div className="flex flex-col items-center gap-4 text-center px-8">
              <div className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ backgroundColor: 'rgba(0,162,182,0.15)', border: '1.5px solid rgba(0,162,182,0.3)' }}>
                <Play className="h-7 w-7 ml-1" style={{ color: '#00A2B6' }} />
              </div>
              <p className="text-white/60 text-sm">Video preview coming soon.</p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ── Inline preview card ─────────────────────────────────────────── */
interface VideoPreviewProps {
  onOpen: () => void;
  children?: React.ReactNode;
}

export function VideoPreview({ onOpen, children }: VideoPreviewProps) {
  return (
    <div
      className="relative w-full cursor-pointer"
      onClick={onOpen}
      role="button"
      aria-label="Open video preview"
    >
      {children}
    </div>
  );
}
