/// Constantes globales de l'application Next.js
export const APP_CONSTANTS = {
  // Informations de l'application
  APP_NAME: 'Meeting Room Booking',
  APP_VERSION: '1.0.0',
  APP_DESCRIPTION: 'Réservation de salles de réunion professionnelle',
  
  // Configuration de l'API - URL du backend
  API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://reservationapp-0o9k.onrender.com/api',
  
  // Clés de stockage local
  TOKEN_KEY: 'auth_token',
  USER_KEY: 'user_data',
  THEME_KEY: 'theme_mode',
  
  // Routes de navigation
  ROUTES: {
    LOGIN: '/login',
    HOME: '/dashboard',
    ADMIN_DASHBOARD: '/admin',
    RESERVATIONS: '/reservations',
    ROOMS: '/rooms',
    PROFILE: '/profile',
    ADMIN_USERS: '/admin/users',
    ADMIN_ROOMS: '/admin/rooms',
    ADMIN_RESERVATIONS: '/admin/reservations',
    CREATE_RESERVATION: '/reservations/create',
  },
  
  // Rôles utilisateur
  ROLES: {
    ADMIN: 'admin',
    USER: 'utilisateur',
  },
  
  // Formats de date et heure
  DATE_FORMATS: {
    DISPLAY: 'dd/MM/yyyy',
    API: 'yyyy-MM-dd',
    DATETIME: 'dd/MM/yyyy HH:mm',
  },
  
  // Validation des formulaires
  VALIDATION: {
    MIN_PASSWORD_LENGTH: 6,
    MAX_NAME_LENGTH: 100,
    MAX_DESCRIPTION_LENGTH: 500,
    MAX_MOTIF_LENGTH: 500,
  },
  
  // Timeouts réseau
  TIMEOUTS: {
    CONNECTION: 30000,
    REQUEST: 30000,
  },
  
  // Messages d'erreur communs
  ERRORS: {
    NETWORK: 'Erreur de connexion. Vérifiez votre connexion internet.',
    SERVER: 'Erreur du serveur. Veuillez réessayer plus tard.',
    UNKNOWN: 'Une erreur inattendue s\'est produite.',
    SESSION_EXPIRED: 'Session expirée. Veuillez vous reconnecter.',
    UNAUTHORIZED: 'Vous n\'avez pas les permissions nécessaires.',
    NOT_FOUND: 'Ressource non trouvée.',
  },
  
  // Messages de succès
  SUCCESS: {
    LOGIN: 'Connexion réussie',
    LOGOUT: 'Déconnexion réussie',
    RESERVATION_CREATED: 'Réservation créée avec succès',
    RESERVATION_CANCELLED: 'Réservation annulée avec succès',
    PASSWORD_CHANGED: 'Mot de passe modifié avec succès',
  },
} as const;

export type AppConstants = typeof APP_CONSTANTS;