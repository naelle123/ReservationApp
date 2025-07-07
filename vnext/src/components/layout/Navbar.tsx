'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HomeIcon, 
  CalendarIcon, 
  BuildingOfficeIcon, 
  UserIcon,
  Bars3Icon,
  XMarkIcon,
  ArrowRightOnRectangleIcon,
  Cog6ToothIcon,
  UsersIcon
} from '@heroicons/react/24/outline';
import { useAuthStore } from '@/store/auth';
import { APP_CONSTANTS } from '@/lib/constants';
import Button from '@/components/ui/Button';

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout, isAdmin } = useAuthStore();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push(APP_CONSTANTS.ROUTES.LOGIN);
  };

  const navigation = [
    { name: 'Accueil', href: APP_CONSTANTS.ROUTES.HOME, icon: HomeIcon },
    { name: 'Réservations', href: APP_CONSTANTS.ROUTES.RESERVATIONS, icon: CalendarIcon },
    { name: 'Salles', href: APP_CONSTANTS.ROUTES.ROOMS, icon: BuildingOfficeIcon },
    { name: 'Profil', href: APP_CONSTANTS.ROUTES.PROFILE, icon: UserIcon },
  ];

  const adminNavigation = [
    { name: 'Dashboard Admin', href: APP_CONSTANTS.ROUTES.ADMIN_DASHBOARD, icon: Cog6ToothIcon },
    { name: 'Utilisateurs', href: APP_CONSTANTS.ROUTES.ADMIN_USERS, icon: UsersIcon },
    { name: 'Salles Admin', href: APP_CONSTANTS.ROUTES.ADMIN_ROOMS, icon: BuildingOfficeIcon },
    { name: 'Réservations Admin', href: APP_CONSTANTS.ROUTES.ADMIN_RESERVATIONS, icon: CalendarIcon },
  ];

  const allNavigation = isAdmin() ? [...navigation, ...adminNavigation] : navigation;

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo et titre */}
          <div className="flex items-center">
            <Link href={APP_CONSTANTS.ROUTES.HOME} className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <BuildingOfficeIcon className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 hidden sm:block">
                {APP_CONSTANTS.APP_NAME}
              </span>
            </Link>
          </div>

          {/* Navigation desktop */}
          <div className="hidden md:flex items-center space-x-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-primary-600 hover:bg-primary-50 transition-colors"
              >
                <item.icon className="w-4 h-4" />
                <span>{item.name}</span>
              </Link>
            ))}
            
            {isAdmin() && (
              <div className="flex items-center space-x-4 ml-4 pl-4 border-l border-gray-200">
                {adminNavigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                  >
                    <item.icon className="w-4 h-4" />
                    <span className="hidden lg:block">{item.name}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Profil utilisateur et déconnexion */}
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-primary-600">
                  {user?.nom.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="text-sm text-gray-700">{user?.nom}</span>
              {isAdmin() && (
                <span className="px-2 py-1 text-xs bg-primary-100 text-primary-600 rounded-full">
                  Admin
                </span>
              )}
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              leftIcon={<ArrowRightOnRectangleIcon className="w-4 h-4" />}
              className="hidden md:flex"
            >
              Déconnexion
            </Button>

            {/* Menu mobile */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-md text-gray-600 hover:text-primary-600 hover:bg-primary-50"
            >
              {isMobileMenuOpen ? (
                <XMarkIcon className="w-6 h-6" />
              ) : (
                <Bars3Icon className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Menu mobile */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-gray-200"
          >
            <div className="px-4 py-2 space-y-1">
              {/* Profil utilisateur mobile */}
              <div className="flex items-center space-x-3 px-3 py-2 border-b border-gray-200 mb-2">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-lg font-medium text-primary-600">
                    {user?.nom.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{user?.nom}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                  {isAdmin() && (
                    <span className="inline-block px-2 py-1 text-xs bg-primary-100 text-primary-600 rounded-full mt-1">
                      Administrateur
                    </span>
                  )}
                </div>
              </div>

              {/* Navigation mobile */}
              {allNavigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-primary-600 hover:bg-primary-50"
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              ))}

              {/* Déconnexion mobile */}
              <button
                onClick={handleLogout}
                className="flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium text-error-600 hover:bg-error-50 w-full text-left"
              >
                <ArrowRightOnRectangleIcon className="w-5 h-5" />
                <span>Déconnexion</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}