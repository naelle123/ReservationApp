'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { WifiIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { usePWA } from '@/hooks/usePWA';

export default function OfflineIndicator() {
  const { isOnline } = usePWA();

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-0 left-0 right-0 z-50 bg-warning-500 text-white"
        >
          <div className="container mx-auto px-4 py-2">
            <div className="flex items-center justify-center space-x-2">
              <ExclamationTriangleIcon className="w-5 h-5" />
              <span className="text-sm font-medium">
                Vous êtes hors ligne. Certaines fonctionnalités peuvent être limitées.
              </span>
              <WifiIcon className="w-5 h-5 opacity-50" />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}