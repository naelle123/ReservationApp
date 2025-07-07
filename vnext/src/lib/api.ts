import axios, { AxiosInstance, AxiosError } from 'axios';
import { APP_CONSTANTS } from './constants';
import { 
  LoginResponse, 
  ReservationsResponse, 
  RoomsResponse, 
  AvailableRoomsResponse,
  UsersResponse,
  StatsResponse,
  ApiResponse,
  LoginFormData,
  CreateReservationFormData,
  CreateRoomFormData,
  CreateUserFormData,
  ChangePasswordFormData
} from '@/types';

/// Service API centralisé pour toutes les communications avec le backend
/// Compatible 100% avec l'API Node.js/Express
class ApiService {
  private api: AxiosInstance;
  private token: string | null = null;

  constructor() {
    this.api = axios.create({
      baseURL: APP_CONSTANTS.API_URL,
      timeout: APP_CONSTANTS.TIMEOUTS.REQUEST,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    this.setupInterceptors();
    this.initializeAuth();
  }

  /// Initialise l'authentification depuis le localStorage
  private initializeAuth() {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem(APP_CONSTANTS.TOKEN_KEY);
      if (token) {
        this.setAuthToken(token);
      }
    }
  }

  /// Configure les intercepteurs pour l'authentification et la gestion d'erreurs
  private setupInterceptors() {
    // Intercepteur de requête
    this.api.interceptors.request.use(
      (config) => {
        if (this.token) {
          config.headers.Authorization = `Bearer ${this.token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Intercepteur de réponse
    this.api.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        const apiError = this.handleApiError(error);
        return Promise.reject(apiError);
      }
    );
  }

  /// Gestion centralisée des erreurs API
  private handleApiError(error: AxiosError): Error {
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data as any;
      
      let message = APP_CONSTANTS.ERRORS.SERVER;
      
      if (data?.error) {
        message = data.error;
      } else if (data?.message) {
        message = data.message;
      }

      switch (status) {
        case 401:
          message = APP_CONSTANTS.ERRORS.SESSION_EXPIRED;
          this.clearAuth();
          break;
        case 403:
          message = APP_CONSTANTS.ERRORS.UNAUTHORIZED;
          break;
        case 404:
          message = APP_CONSTANTS.ERRORS.NOT_FOUND;
          break;
        case 500:
          message = APP_CONSTANTS.ERRORS.SERVER;
          break;
      }

      return new Error(message);
    } else if (error.request) {
      return new Error(APP_CONSTANTS.ERRORS.NETWORK);
    } else {
      return new Error(APP_CONSTANTS.ERRORS.UNKNOWN);
    }
  }

  /// Définit le token d'authentification
  setAuthToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem(APP_CONSTANTS.TOKEN_KEY, token);
    }
  }

  /// Supprime le token d'authentification
  clearAuth() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem(APP_CONSTANTS.TOKEN_KEY);
      localStorage.removeItem(APP_CONSTANTS.USER_KEY);
    }
  }

  // ==================== ENDPOINTS D'AUTHENTIFICATION ====================

  /// Connexion utilisateur - Compatible avec l'API backend
  async login(credentials: LoginFormData): Promise<LoginResponse> {
    const response = await this.api.post<LoginResponse>('/auth/login', credentials);
    return response.data;
  }

  /// Récupération du profil utilisateur
  async getProfile(): Promise<{ user: any }> {
    const response = await this.api.get('/auth/me');
    return response.data;
  }

  /// Changement de mot de passe
  async changePassword(data: ChangePasswordFormData): Promise<ApiResponse> {
    const response = await this.api.put('/auth/change-password', data);
    return response.data;
  }

  // ==================== ENDPOINTS DES SALLES ====================

  /// Récupération de toutes les salles
  async getRooms(): Promise<RoomsResponse> {
    const response = await this.api.get<RoomsResponse>('/salles');
    return response.data;
  }

  /// Récupération des salles disponibles pour une période
  async getAvailableRooms(date: string, startTime: string, endTime: string): Promise<AvailableRoomsResponse> {
    const response = await this.api.get<AvailableRoomsResponse>('/salles/libres', {
      params: {
        date,
        heure_debut: startTime,
        heure_fin: endTime,
      },
    });
    return response.data;
  }

  /// Récupération des réservations d'une salle
  async getRoomReservations(roomId: number, date: string): Promise<any> {
    const response = await this.api.get(`/salles/${roomId}/reservations`, {
      params: { date },
    });
    return response.data;
  }

  /// Création d'une salle (admin)
  async createRoom(roomData: CreateRoomFormData): Promise<ApiResponse> {
    const response = await this.api.post('/salles', roomData);
    return response.data;
  }

  /// Modification d'une salle (admin)
  async updateRoom(roomId: number, roomData: Partial<CreateRoomFormData>): Promise<ApiResponse> {
    const response = await this.api.put(`/salles/${roomId}`, roomData);
    return response.data;
  }

  /// Mise hors service d'une salle (admin)
  async setRoomOutOfService(roomId: number): Promise<ApiResponse> {
    const response = await this.api.post(`/salles/${roomId}/hors-service`);
    return response.data;
  }

  /// Remise en service d'une salle (admin)
  async setRoomInService(roomId: number): Promise<ApiResponse> {
    const response = await this.api.post(`/salles/${roomId}/en-service`);
    return response.data;
  }

  /// Suppression d'une salle (admin)
  async deleteRoom(roomId: number): Promise<ApiResponse> {
    const response = await this.api.delete(`/salles/${roomId}`);
    return response.data;
  }

  // ==================== ENDPOINTS DES RÉSERVATIONS ====================

  /// Création d'une réservation
  async createReservation(reservationData: CreateReservationFormData): Promise<ApiResponse> {
    const response = await this.api.post('/reservations', reservationData);
    return response.data;
  }

  /// Récupération des réservations de l'utilisateur
  async getMyReservations(): Promise<ReservationsResponse> {
    const response = await this.api.get<ReservationsResponse>('/reservations/mes-reservations');
    return response.data;
  }

  /// Récupération de toutes les réservations (admin)
  async getAllReservations(): Promise<ReservationsResponse> {
    const response = await this.api.get<ReservationsResponse>('/reservations/all');
    return response.data;
  }

  /// Annulation d'une réservation
  async cancelReservation(reservationId: number): Promise<ApiResponse> {
    const response = await this.api.delete(`/reservations/${reservationId}`);
    return response.data;
  }

  /// Création d'une réservation prioritaire (admin)
  async createPriorityReservation(reservationData: CreateReservationFormData): Promise<ApiResponse> {
    const response = await this.api.post('/reservations/prioritaire', reservationData);
    return response.data;
  }

  /// Récupération des statistiques des réservations (admin)
  async getReservationStats(): Promise<StatsResponse> {
    const response = await this.api.get<StatsResponse>('/reservations/stats');
    return response.data;
  }

  // ==================== ENDPOINTS DES UTILISATEURS ====================

  /// Récupération de tous les utilisateurs (admin)
  async getUsers(): Promise<UsersResponse> {
    const response = await this.api.get<UsersResponse>('/utilisateurs');
    return response.data;
  }

  /// Récupération d'un utilisateur (admin)
  async getUser(userId: number): Promise<{ utilisateur: any }> {
    const response = await this.api.get(`/utilisateurs/${userId}`);
    return response.data;
  }

  /// Création d'un utilisateur (admin)
  async createUser(userData: CreateUserFormData): Promise<ApiResponse> {
    const response = await this.api.post('/utilisateurs', userData);
    return response.data;
  }

  /// Modification d'un utilisateur (admin)
  async updateUser(userId: number, userData: Partial<CreateUserFormData>): Promise<ApiResponse> {
    const response = await this.api.put(`/utilisateurs/${userId}`, userData);
    return response.data;
  }

  /// Suppression d'un utilisateur (admin)
  async deleteUser(userId: number): Promise<ApiResponse> {
    const response = await this.api.delete(`/utilisateurs/${userId}`);
    return response.data;
  }

  /// Récupération des statistiques des utilisateurs (admin)
  async getUserStats(): Promise<StatsResponse> {
    const response = await this.api.get<StatsResponse>('/utilisateurs/stats/overview');
    return response.data;
  }

  // ==================== ENDPOINT DE SANTÉ ====================

  /// Vérification de l'état du serveur
  async healthCheck(): Promise<any> {
    const response = await this.api.get('/health');
    return response.data;
  }
}

// Instance singleton de l'API
export const apiService = new ApiService();
export default apiService;