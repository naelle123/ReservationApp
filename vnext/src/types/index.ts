// Types pour l'utilisateur
export interface User {
  id: number;
  nom: string;
  email: string;
  role: 'admin' | 'utilisateur';
  telephone: string;
  created_at: string;
  updated_at?: string;
}

// Types pour les salles
export interface Room {
  id: number;
  nom: string;
  capacite: number;
  statut: 'disponible' | 'hors_service' | 'maintenance';
  description?: string;
  created_at: string;
  updated_at?: string;
}

// Types pour les réservations
export interface Reservation {
  id: number;
  utilisateur_id: number;
  salle_id: number;
  date: string;
  heure_debut: string;
  heure_fin: string;
  statut: 'active' | 'annulee' | 'terminee';
  motif?: string;
  created_at: string;
  updated_at?: string;
  
  // Données relationnelles (jointures)
  utilisateur_nom?: string;
  utilisateur_email?: string;
  utilisateur_telephone?: string;
  salle_nom?: string;
  salle_capacite?: number;
}

// Types pour les réponses API
export interface ApiResponse<T = any> {
  message?: string;
  data?: T;
  error?: string;
  details?: string;
}

export interface LoginResponse {
  message: string;
  token: string;
  user: User;
}

export interface ReservationsResponse {
  reservations: Reservation[];
}

export interface RoomsResponse {
  salles: Room[];
}

export interface AvailableRoomsResponse {
  salles_libres: Room[];
  periode: {
    date: string;
    heure_debut: string;
    heure_fin: string;
  };
}

export interface UsersResponse {
  utilisateurs: User[];
}

export interface StatsResponse {
  statistiques: {
    total_reservations: number;
    reservations_actives: number;
    reservations_annulees: number;
    reservations_futures: number;
    reservations_aujourd_hui: number;
    total_utilisateurs?: number;
    total_admins?: number;
  };
  salles_populaires?: Array<{
    nom: string;
    nombre_reservations: number;
  }>;
  utilisateurs_actifs?: Array<{
    nom: string;
    email: string;
    nombre_reservations: number;
  }>;
}

// Types pour les formulaires
export interface LoginFormData {
  email: string;
  mot_de_passe: string;
}

export interface CreateReservationFormData {
  salle_id: number;
  date: string;
  heure_debut: string;
  heure_fin: string;
  motif?: string;
}

export interface CreateRoomFormData {
  nom: string;
  capacite: number;
  description?: string;
}

export interface CreateUserFormData {
  nom: string;
  email: string;
  mot_de_passe: string;
  role: 'admin' | 'utilisateur';
  telephone: string;
}

export interface ChangePasswordFormData {
  ancien_mot_de_passe: string;
  nouveau_mot_de_passe: string;
}

// Types pour les erreurs
export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

// Types pour l'état de l'application
export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

export interface AppState {
  reservations: Reservation[];
  rooms: Room[];
  users: User[];
  availableRooms: Room[];
  stats: StatsResponse | null;
  isLoading: boolean;
  error: string | null;
}