'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  PlusIcon, 
  CalendarIcon, 
  BuildingOfficeIcon,
  ChartBarIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { useAuthStore } from '@/store/auth';
import { useAppStore } from '@/store/app';
import { APP_CONSTANTS } from '@/lib/constants';
import Navbar from '@/components/layout/Navbar';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import LoadingOverlay from '@/components/ui/LoadingOverlay';
import PWAInstallPrompt from '@/components/PWAInstallPrompt';
import PWAUpdatePrompt from '@/components/PWAUpdatePrompt';
import OfflineIndicator from '@/components/OfflineIndicator';
import { format, isToday, isFuture } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { 
    reservations, 
    isLoading, 
    loadMyReservations 
  } = useAppStore();

  useEffect(() => {
    loadMyReservations();
  }, [loadMyReservations]);

  // Filtrer les réservations
  const upcomingReservations = reservations
    .filter(r => r.statut === 'active' && (isFuture(new Date(r.date)) || isToday(new Date(r.date))))
    .slice(0, 3);

  const totalReservations = reservations.length;
  const activeReservations = reservations.filter(r => r.statut === 'active').length;
  const completedReservations = reservations.filter(r => r.statut === 'terminee').length;

  const quickActions = [
    {
      title: 'Nouvelle réservation',
      description: 'Réserver une salle de réunion',
      href: APP_CONSTANTS.ROUTES.CREATE_RESERVATION,
      icon: PlusIcon,
      color: 'bg-primary-600',
    },
    {
      title: 'Voir les salles',
      description: 'Consulter toutes les salles disponibles',
      href: APP_CONSTANTS.ROUTES.ROOMS,
      icon: BuildingOfficeIcon,
      color: 'bg-success-600',
    },
  ];

  const stats = [
    {
      title: 'Total',
      value: totalReservations,
      icon: CalendarIcon,
      color: 'text-primary-600',
      bgColor: 'bg-primary-100',
    },
    {
      title: 'Actives',
      value: activeReservations,
      icon: ClockIcon,
      color: 'text-success-600',
      bgColor: 'bg-success-100',
    },
    {
      title: 'Terminées',
      value: completedReservations,
      icon: ChartBarIcon,
      color: 'text-gray-600',
      bgColor: 'bg-gray-100',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <OfflineIndicator />
      <Navbar />
      
      <LoadingOverlay isLoading={isLoading}>
        <main className="container py-8">
          {/* En-tête de bienvenue */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Bonjour, {user?.nom} 👋
            </h1>
            <p className="text-gray-600">
              Gérez vos réservations de salles de réunion
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Colonne principale */}
            <div className="lg:col-span-2 space-y-8">
              {/* Actions rapides */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Actions rapides
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {quickActions.map((action, index) => (
                    <Card key={action.title} hover className="p-6">
                      <Link href={action.href} className="block">
                        <div className="flex items-center space-x-4">
                          <div className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center`}>
                            <action.icon className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {action.title}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {action.description}
                            </p>
                          </div>
                        </div>
                      </Link>
                    </Card>
                  ))}
                </div>
              </motion.section>

              {/* Prochaines réservations */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Prochaines réservations
                  </h2>
                  <Link 
                    href={APP_CONSTANTS.ROUTES.RESERVATIONS}
                    className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                  >
                    Voir tout
                  </Link>
                </div>

                {upcomingReservations.length === 0 ? (
                  <Card className="p-8 text-center">
                    <CalendarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Aucune réservation à venir
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Créez votre première réservation
                    </p>
                    <Button
                      as={Link}
                      href={APP_CONSTANTS.ROUTES.CREATE_RESERVATION}
                      variant="primary"
                    >
                      Nouvelle réservation
                    </Button>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {upcomingReservations.map((reservation, index) => (
                      <motion.div
                        key={reservation.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * index }}
                      >
                        <Card className="p-4">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                              <BuildingOfficeIcon className="w-6 h-6 text-primary-600" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900">
                                {reservation.salle_nom}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {format(new Date(reservation.date), 'EEEE dd MMMM yyyy', { locale: fr })}
                              </p>
                              <p className="text-sm text-gray-600">
                                {reservation.heure_debut} - {reservation.heure_fin}
                              </p>
                            </div>
                            {isToday(new Date(reservation.date)) && (
                              <span className="px-2 py-1 bg-warning-100 text-warning-600 text-xs font-medium rounded-full">
                                Aujourd'hui
                              </span>
                            )}
                          </div>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.section>
            </div>

            {/* Sidebar avec statistiques */}
            <div className="space-y-6">
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Mes statistiques
                </h2>
                <div className="space-y-4">
                  {stats.map((stat, index) => (
                    <Card key={stat.title} className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                          <stat.icon className={`w-5 h-5 ${stat.color}`} />
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-gray-900">
                            {stat.value}
                          </p>
                          <p className="text-sm text-gray-600">
                            {stat.title}
                          </p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </motion.section>

              {/* Bouton d'action principal */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Button
                  as={Link}
                  href={APP_CONSTANTS.ROUTES.CREATE_RESERVATION}
                  variant="primary"
                  size="lg"
                  className="w-full"
                  leftIcon={<PlusIcon className="w-5 h-5" />}
                >
                  Nouvelle réservation
                </Button>
              </motion.div>
            </div>
          </div>
        </main>
      </LoadingOverlay>

      {/* Composants PWA */}
      <PWAInstallPrompt />
      <PWAUpdatePrompt />
    </div>
  );
}