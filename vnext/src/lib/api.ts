import axios, { AxiosInstance, AxiosError } from 'axios';
import { APP_CONSTANTS } from './constants';
import { mockApiService } from './mockApi';
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
  private isBackendAvailable: boolean = true;
  private backendCheckInterval: NodeJS.Timeout | null = null;
  private lastBackendCheck: number = 0;
  private readonly BACKEND_CHECK_INTERVAL = 30000; // 30 secondes

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
    this.startBackendHealthCheck();
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

  /// Démarre la vérification périodique de la santé du backend
  private startBackendHealthCheck() {
    // Vérification initiale
    this.checkBackendHealth();
    
    // Vérification périodique
    this.backendCheckInterval = setInterval(() => {
      this.checkBackendHealth();
    }, this.BACKEND_CHECK_INTERVAL);
  }

  /// Vérifie la disponibilité du backend
  private async checkBackendHealth(): Promise<void> {
    const now = Date.now();
    
    // Éviter les vérifications trop fréquentes
    if (now - this.lastBackendCheck < 5000) {
      return;
    }
    
    this.lastBackendCheck = now;
    
    try {
      const response = await axios.get(`${APP_CONSTANTS.API_URL}/health`, {
        timeout: 5000,
        validateStatus: (status) => status < 500
      });
      
      if (response.status === 200) {
        if (!this.isBackendAvailable) {
          console.log('✅ Backend reconnecté - Passage en mode API');
          this.isBackendAvailable = true;
        }
      } else {
        throw new Error(`Backend responded with status ${response.status}`);
      }
    } catch (error) {
      if (this.isBackendAvailable) {
        console.warn('⚠️ Backend indisponible - Passage en mode Mock');
        this.isBackendAvailable = false;
      }
    }
  }

  /// Exécute une requête avec fallback automatique vers le mock
  private async executeWithFallback<T>(
    apiCall: () => Promise<T>,
    mockCall: () => Promise<T>
  ): Promise<T> {
    if (!this.isBackendAvailable) {
      return mockCall();
    }

    try {
      return await apiCall();
    } catch (error: any) {
      // Si erreur réseau, basculer vers le mock
      if (error.code === 'NETWORK_ERROR' || error.code === 'ECONNREFUSED' || !error.response) {
        console.warn('🔄 Erreur réseau - Basculement vers Mock API');
        this.isBackendAvailable = false;
        return mockCall();
      }
      throw error;
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
    
    // Nettoyer aussi le mock
    if (mockApiService) {
      mockApiService.clearAuth();
    }
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem(APP_CONSTANTS.TOKEN_KEY);
      localStorage.removeItem(APP_CONSTANTS.USER_KEY);
    }
  }

  // ==================== ENDPOINTS D'AUTHENTIFICATION ====================

  /// Connexion utilisateur - Compatible avec l'API backend
  async login(credentials: LoginFormData): Promise<LoginResponse> {
    return this.executeWithFallback(
      async () => {
        const response = await this.api.post<LoginResponse>('/auth/login', credentials);
        return response.data;
      },
      async () => {
        const result = await mockApiService.login(credentials);
        // Synchroniser le token avec le mock
        if (result.token) {
          mockApiService.setAuthToken(result.token);
        }
        return result;
      }
    );
  }

  /// Récupération du profil utilisateur
  async getProfile(): Promise<{ user: any }> {
    return this.executeWithFallback(
      async () => {
        const response = await this.api.get('/auth/me');
        return response.data;
      },
      () => mockApiService.getProfile()
    );
  }

  /// Changement de mot de passe
  async changePassword(data: ChangePasswordFormData): Promise<ApiResponse> {
    return this.executeWithFallback(
      async () => {
        const response = await this.api.put('/auth/change-password', data);
        return response.data;
      },
      () => mockApiService.changePassword(data)
    );
  }

  // ==================== ENDPOINTS DES SALLES ====================

  /// Récupération de toutes les salles
  async getRooms(): Promise<RoomsResponse> {
    return this.executeWithFallback(
      async () => {
        const response = await this.api.get<RoomsResponse>('/salles');
        return response.data;
      },
      () => mockApiService.getRooms()
    );
  }

  /// Récupération des salles disponibles pour une période
  async getAvailableRooms(date: string, startTime: string, endTime: string): Promise<AvailableRoomsResponse> {
    return this.executeWithFallback(
      async () => {
        const response = await this.api.get<AvailableRoomsResponse>('/salles/libres', {
          params: {
            date,
            heure_debut: startTime,
            heure_fin: endTime,
          },
        });
        return response.data;
      },
      () => mockApiService.getAvailableRooms(date, startTime, endTime)
    );
  }

  /// Récupération des réservations d'une salle
  async getRoomReservations(roomId: number, date: string): Promise<any> {
    return this.executeWithFallback(
      async () => {
        const response = await this.api.get(`/salles/${roomId}/reservations`, {
          params: { date },
        });
        return response.data;
      },
      () => mockApiService.getRoomReservations(roomId, date)
    );
  }

  /// Création d'une salle (admin)
  async createRoom(roomData: CreateRoomFormData): Promise<ApiResponse> {
    return this.executeWithFallback(
      async () => {
        const response = await this.api.post('/salles', roomData);
        return response.data;
      },
      () => mockApiService.createRoom(roomData)
    );
  }

  /// Modification d'une salle (admin)
  async updateRoom(roomId: number, roomData: Partial<CreateRoomFormData>): Promise<ApiResponse> {
    return this.executeWithFallback(
      async () => {
        const response = await this.api.put(`/salles/${roomId}`, roomData);
        return response.data;
      },
      () => mockApiService.updateRoom(roomId, roomData)
    );
  }

  /// Mise hors service d'une salle (admin)
  async setRoomOutOfService(roomId: number): Promise<ApiResponse> {
    return this.executeWithFallback(
      async () => {
        const response = await this.api.post(`/salles/${roomId}/hors-service`);
        return response.data;
      },
      () => mockApiService.setRoomOutOfService(roomId)
    );
  }

  /// Remise en service d'une salle (admin)
  async setRoomInService(roomId: number): Promise<ApiResponse> {
    return this.executeWithFallback(
      async () => {
        const response = await this.api.post(`/salles/${roomId}/en-service`);
        return response.data;
      },
      () => mockApiService.setRoomInService(roomId)
    );
  }

  /// Suppression d'une salle (admin)
  async deleteRoom(roomId: number): Promise<ApiResponse> {
    return this.executeWithFallback(
      async () => {
        const response = await this.api.delete(`/salles/${roomId}`);
        return response.data;
      },
      () => mockApiService.deleteRoom(roomId)
    );
  }

  // ==================== ENDPOINTS DES RÉSERVATIONS ====================

  /// Création d'une réservation
  async createReservation(reservationData: CreateReservationFormData): Promise<ApiResponse> {
    return this.executeWithFallback(
      async () => {
        const response = await this.api.post('/reservations', reservationData);
        return response.data;
      },
      () => mockApiService.createReservation(reservationData)
    );
  }

  /// Récupération des réservations de l'utilisateur
  async getMyReservations(): Promise<ReservationsResponse> {
    return this.executeWithFallback(
      async () => {
        const response = await this.api.get<ReservationsResponse>('/reservations/mes-reservations');
        return response.data;
      },
      () => mockApiService.getMyReservations()
    );
  }

  /// Récupération de toutes les réservations (admin)
  async getAllReservations(): Promise<ReservationsResponse> {
    return this.executeWithFallback(
      async () => {
        const response = await this.api.get<ReservationsResponse>('/reservations/all');
        return response.data;
      },
      () => mockApiService.getAllReservations()
    );
  }

  /// Annulation d'une réservation
  async cancelReservation(reservationId: number): Promise<ApiResponse> {
    return this.executeWithFallback(
      async () => {
        const response = await this.api.delete(`/reservations/${reservationId}`);
        return response.data;
      },
      () => mockApiService.cancelReservation(reservationId)
    );
  }

  /// Création d'une réservation prioritaire (admin)
  async createPriorityReservation(reservationData: CreateReservationFormData): Promise<ApiResponse> {
    return this.executeWithFallback(
      async () => {
        const response = await this.api.post('/reservations/prioritaire', reservationData);
        return response.data;
      },
      () => mockApiService.createPriorityReservation(reservationData)
    );
  }

  /// Récupération des statistiques des réservations (admin)
  async getReservationStats(): Promise<StatsResponse> {
    return this.executeWithFallback(
      async () => {
        const response = await this.api.get<StatsResponse>('/reservations/stats');
        return response.data;
      },
      () => mockApiService.getReservationStats()
    );
  }

  // ==================== ENDPOINTS DES UTILISATEURS ====================

  /// Récupération de tous les utilisateurs (admin)
  async getUsers(): Promise<UsersResponse> {
    return this.executeWithFallback(
      async () => {
        const response = await this.api.get<UsersResponse>('/utilisateurs');
        return response.data;
      },
      () => mockApiService.getUsers()
    );
  }

  /// Récupération d'un utilisateur (admin)
  async getUser(userId: number): Promise<{ utilisateur: any }> {
    return this.executeWithFallback(
      async () => {
        const response = await this.api.get(`/utilisateurs/${userId}`);
        return response.data;
      },
      () => mockApiService.getUser(userId)
    );
  }

  /// Création d'un utilisateur (admin)
  async createUser(userData: CreateUserFormData): Promise<ApiResponse> {
    return this.executeWithFallback(
      async () => {
        const response = await this.api.post('/utilisateurs', userData);
        return response.data;
      },
      () => mockApiService.createUser(userData)
    );
  }

  /// Modification d'un utilisateur (admin)
  async updateUser(userId: number, userData: Partial<CreateUserFormData>): Promise<ApiResponse> {
    return this.executeWithFallback(
      async () => {
        const response = await this.api.put(`/utilisateurs/${userId}`, userData);
        return response.data;
      },
      () => mockApiService.updateUser(userId, userData)
    );
  }

  /// Suppression d'un utilisateur (admin)
  async deleteUser(userId: number): Promise<ApiResponse> {
    return this.executeWithFallback(
      async () => {
        const response = await this.api.delete(`/utilisateurs/${userId}`);
        return response.data;
      },
      () => mockApiService.deleteUser(userId)
    );
  }

  /// Récupération des statistiques des utilisateurs (admin)
  async getUserStats(): Promise<StatsResponse> {
    return this.executeWithFallback(
      async () => {
        const response = await this.api.get<StatsResponse>('/utilisateurs/stats/overview');
        return response.data;
      },
      () => mockApiService.getUserStats()
    );
  }

  // ==================== ENDPOINT DE SANTÉ ====================

  /// Vérification de l'état du serveur
  async healthCheck(): Promise<any> {
    return this.executeWithFallback(
      async () => {
        const response = await this.api.get('/health');
        return response.data;
      },
      () => mockApiService.healthCheck()
    );
  }

  // ==================== MÉTHODES UTILITAIRES ====================

  /// Retourne l'état de disponibilité du backend
  getBackendStatus(): { isAvailable: boolean; mode: 'api' | 'mock' } {
    return {
      isAvailable: this.isBackendAvailable,
      mode: this.isBackendAvailable ? 'api' : 'mock'
    };
  }

  /// Force une vérification de la santé du backend
  async forceBackendCheck(): Promise<void> {
    this.lastBackendCheck = 0; // Reset pour forcer la vérification
    await this.checkBackendHealth();
  }

  /// Nettoie les ressources
  destroy(): void {
    if (this.backendCheckInterval) {
      clearInterval(this.backendCheckInterval);
      this.backendCheckInterval = null;
    }
  }
}

// Instance singleton de l'API
export const apiService = new ApiService();
export default apiService;