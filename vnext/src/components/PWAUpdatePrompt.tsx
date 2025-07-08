'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowPathIcon, XMarkIcon } from '@heroicons/react/24/outline';
import Button from './ui/Button';
import Card from './ui/Card';

export default function PWAUpdatePrompt() {
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload();
      });

      navigator.serviceWorker.ready.then((registration) => {
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setWaitingWorker(newWorker);
                setShowUpdatePrompt(true);
              }
            });
          }
        });
      });
    }
  }, []);

  const handleUpdate = () => {
    if (waitingWorker) {
      waitingWorker.postMessage({ type: 'SKIP_WAITING' });
      setShowUpdatePrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowUpdatePrompt(false);
  };

  if (!showUpdatePrompt) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -100 }}
        className="fixed top-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm"
      >
        <Card className="p-4 shadow-lg border-primary-200 bg-primary-50">
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <ArrowPathIcon className="w-5 h-5 text-primary-600" />
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-gray-900 mb-1">
                Mise à jour disponible
              </h3>
              <p className="text-xs text-gray-600 mb-3">
                Une nouvelle version de l'application est disponible. Redémarrez pour appliquer les améliorations.
              </p>
              
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="primary"
                  onClick={handleUpdate}
                  className="text-xs"
                >
                  Redémarrer
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleDismiss}
                  className="text-xs"
                >
                  Plus tard
                </Button>
              </div>
            </div>
            
            <button
              onClick={handleDismiss}
              className="text-gray-400 hover:text-gray-600 flex-shrink-0"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}