'use client';

import { useState, useEffect } from 'react';

interface PWAState {
  isInstalled: boolean;
  isStandalone: boolean;
  canInstall: boolean;
  isOnline: boolean;
  isUpdateAvailable: boolean;
}

export function usePWA() {
  const [pwaState, setPwaState] = useState<PWAState>({
    isInstalled: false,
    isStandalone: false,
    canInstall: false,
    isOnline: true,
    isUpdateAvailable: false,
  });

  useEffect(() => {
    // Vérifier si l'app est installée
    const checkInstallation = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                          (window.navigator as any).standalone === true ||
                          document.referrer.includes('android-app://');
      
      setPwaState(prev => ({
        ...prev,
        isInstalled: isStandalone,
        isStandalone,
      }));
    };

    // Vérifier le statut en ligne
    const updateOnlineStatus = () => {
      setPwaState(prev => ({
        ...prev,
        isOnline: navigator.onLine,
      }));
    };

    // Écouter les événements PWA
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setPwaState(prev => ({
        ...prev,
        canInstall: true,
      }));
    };

    const handleAppInstalled = () => {
      setPwaState(prev => ({
        ...prev,
        isInstalled: true,
        canInstall: false,
      }));
    };

    // Vérifier les mises à jour du service worker
    const checkForUpdates = () => {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then((registration) => {
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  setPwaState(prev => ({
                    ...prev,
                    isUpdateAvailable: true,
                  }));
                }
              });
            }
          });
        });
      }
    };

    checkInstallation();
    updateOnlineStatus();
    checkForUpdates();

    // Ajouter les event listeners
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  return pwaState;
}