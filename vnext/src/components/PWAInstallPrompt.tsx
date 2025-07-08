'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import Button from './ui/Button';
import Card from './ui/Card';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Vérifier si l'app est déjà installée
    const checkIfInstalled = () => {
      if (window.matchMedia('(display-mode: standalone)').matches) {
        setIsInstalled(true);
        return;
      }
      
      if ((window.navigator as any).standalone === true) {
        setIsInstalled(true);
        return;
      }
      
      if (document.referrer.includes('android-app://')) {
        setIsInstalled(true);
        return;
      }
    };

    checkIfInstalled();

    // Écouter l'événement beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Attendre un peu avant de montrer le prompt
      setTimeout(() => {
        if (!isInstalled) {
          setShowInstallPrompt(true);
        }
      }, 3000);
    };

    // Écouter l'événement appinstalled
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [isInstalled]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setShowInstallPrompt(false);
        setDeferredPrompt(null);
      }
    } catch (error) {
      console.error('Erreur lors de l\'installation:', error);
    }
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    // Ne pas montrer à nouveau pendant cette session
    sessionStorage.setItem('pwa-install-dismissed', 'true');
  };

  // Ne pas afficher si déjà installé ou si déjà refusé
  if (isInstalled || !deferredPrompt || !showInstallPrompt) {
    return null;
  }

  // Ne pas afficher si déjà refusé dans cette session
  if (sessionStorage.getItem('pwa-install-dismissed')) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm"
      >
        <Card className="p-4 shadow-lg border-primary-200">
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <ArrowDownTrayIcon className="w-5 h-5 text-primary-600" />
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-gray-900 mb-1">
                Installer l'application
              </h3>
              <p className="text-xs text-gray-600 mb-3">
                Ajoutez Meeting Room Booking à votre écran d'accueil pour un accès rapide et une meilleure expérience.
              </p>
              
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="primary"
                  onClick={handleInstallClick}
                  className="text-xs"
                >
                  Installer
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