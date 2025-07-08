'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CloudIcon, 
  ComputerDesktopIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon 
} from '@heroicons/react/24/outline';
import { apiService } from '@/lib/api';

export default function BackendStatusIndicator() {
  const [backendStatus, setBackendStatus] = useState<{
    isAvailable: boolean;
    mode: 'api' | 'mock';
  }>({ isAvailable: true, mode: 'api' });
  
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Vérification initiale
    const checkStatus = () => {
      const status = apiService.getBackendStatus();
      setBackendStatus(status);
    };

    checkStatus();

    // Vérification périodique
    const interval = setInterval(checkStatus, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleForceCheck = async () => {
    await apiService.forceBackendCheck();
    const status = apiService.getBackendStatus();
    setBackendStatus(status);
  };

  if (backendStatus.isAvailable) {
    return null; // Ne rien afficher si le backend est disponible
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        className="fixed top-16 left-0 right-0 z-40 bg-warning-500 text-white shadow-lg"
      >
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <ExclamationTriangleIcon className="w-5 h-5" />
                <span className="text-sm font-medium">
                  Mode hors ligne - Données de démonstration
                </span>
              </div>
              
              <div className="flex items-center space-x-2 text-xs">
                <ComputerDesktopIcon className="w-4 h-4" />
                <span>Mode Mock</span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleForceCheck}
                className="text-xs bg-white bg-opacity-20 hover:bg-opacity-30 px-2 py-1 rounded transition-colors"
              >
                Reconnecter
              </button>
              
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="text-xs bg-white bg-opacity-20 hover:bg-opacity-30 px-2 py-1 rounded transition-colors"
              >
                {showDetails ? 'Masquer' : 'Détails'}
              </button>
            </div>
          </div>

          <AnimatePresence>
            {showDetails && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mt-2 pt-2 border-t border-white border-opacity-30"
              >
                <div className="text-xs space-y-1">
                  <p>
                    <strong>État:</strong> Backend indisponible - Utilisation des données statiques
                  </p>
                  <p>
                    <strong>Fonctionnalités:</strong> Toutes les fonctions sont disponibles en mode démonstration
                  </p>
                  <p>
                    <strong>Données:</strong> Les modifications ne seront pas persistées
                  </p>
                  <p className="text-warning-100">
                    💡 Démarrez le backend pour synchroniser avec la base de données réelle
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}