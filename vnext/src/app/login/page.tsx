'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { 
  EyeIcon, 
  EyeSlashIcon, 
  EnvelopeIcon, 
  LockClosedIcon,
  BuildingOfficeIcon 
} from '@heroicons/react/24/outline';
import { useAuthStore } from '@/store/auth';
import { APP_CONSTANTS } from '@/lib/constants';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import LoadingOverlay from '@/components/ui/LoadingOverlay';

interface LoginFormData {
  email: string;
  password: string;
}

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading, error, isAuthenticated, isAdmin, clearError } = useAuthStore();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    watch
  } = useForm<LoginFormData>({
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Redirection si déjà connecté
  useEffect(() => {
    if (isAuthenticated) {
      if (isAdmin()) {
        router.push(APP_CONSTANTS.ROUTES.ADMIN_DASHBOARD);
      } else {
        router.push(APP_CONSTANTS.ROUTES.HOME);
      }
    }
  }, [isAuthenticated, isAdmin, router]);

  // Nettoyer les erreurs au changement
  useEffect(() => {
    if (error) {
      clearError();
    }
  }, [watch('email'), watch('password'), clearError]);

  const onSubmit = async (data: LoginFormData) => {
    const success = await login(data.email, data.password);
    
    if (success) {
      toast.success(APP_CONSTANTS.SUCCESS.LOGIN);
      // La redirection se fait automatiquement via useEffect
    } else if (error) {
      toast.error(error);
    }
  };

  const fillTestAccount = (email: string, password: string) => {
    setValue('email', email);
    setValue('password', password);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <LoadingOverlay isLoading={isLoading}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Logo et titre */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="w-20 h-20 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
            >
              <BuildingOfficeIcon className="w-10 h-10 text-white" />
            </motion.div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {APP_CONSTANTS.APP_NAME}
            </h1>
            <p className="text-gray-600">
              Réservez vos salles de réunion en toute simplicité
            </p>
          </div>

          {/* Formulaire de connexion */}
          <Card className="p-8">
            <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">
              Connexion
            </h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Email */}
              <Input
                label="Email"
                type="email"
                placeholder="votre@email.com"
                leftIcon={<EnvelopeIcon className="w-5 h-5" />}
                error={errors.email?.message}
                {...register('email', {
                  required: 'Email requis',
                  pattern: {
                    value: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
                    message: 'Format d\'email invalide',
                  },
                })}
              />

              {/* Mot de passe */}
              <Input
                label="Mot de passe"
                type={showPassword ? 'text' : 'password'}
                placeholder="Votre mot de passe"
                leftIcon={<LockClosedIcon className="w-5 h-5" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="w-5 h-5" />
                    ) : (
                      <EyeIcon className="w-5 h-5" />
                    )}
                  </button>
                }
                error={errors.password?.message}
                {...register('password', {
                  required: 'Mot de passe requis',
                  minLength: {
                    value: APP_CONSTANTS.VALIDATION.MIN_PASSWORD_LENGTH,
                    message: `Le mot de passe doit contenir au moins ${APP_CONSTANTS.VALIDATION.MIN_PASSWORD_LENGTH} caractères`,
                  },
                })}
              />

              {/* Affichage des erreurs */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-error-50 border border-error-200 rounded-lg"
                >
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="w-5 h-5 text-error-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-error-700">{error}</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Bouton de connexion */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                isLoading={isLoading}
                disabled={!isValid}
              >
                Se connecter
              </Button>
            </form>
          </Card>

          {/* Comptes de test */}
          <Card className="mt-6 p-6">
            <div className="flex items-center mb-4">
              <svg className="w-5 h-5 text-primary-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-lg font-semibold text-primary-600">
                Comptes de test
              </h3>
            </div>
            
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => fillTestAccount('admin@example.com', 'admin123')}
                className="w-full p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                    <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Administrateur</p>
                    <p className="text-sm text-gray-500">admin@example.com / admin123</p>
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => fillTestAccount('user@example.com', 'user123')}
                className="w-full p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-success-100 rounded-full flex items-center justify-center mr-3">
                    <svg className="w-4 h-4 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Utilisateur</p>
                    <p className="text-sm text-gray-500">user@example.com / user123</p>
                  </div>
                </div>
              </button>
            </div>
          </Card>
        </motion.div>
      </LoadingOverlay>
    </div>
  );
}