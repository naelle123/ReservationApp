import { create } from 'zustand';
import { Room, Reservation, User, StatsResponse, AppState } from '@/types';
import { apiService } from '@/lib/api';

interface AppStore extends AppState {
  // Actions pour les réservations
  loadMyReservations: () => Promise<void>;
  loadAllReservations: () => Promise<void>;
  createReservation: (data: any) => Promise<boolean>;
  cancelReservation: (id: number) => Promise<boolean>;
  getReservationStats: () => Promise<StatsResponse | null>;

  // Actions pour les salles
  loadRooms: () => Promise<void>;
  loadAvailableRooms: (date: string, startTime: string, endTime: string) => Promise<void>;
  createRoom: (data: any) => Promise<boolean>;
  updateRoom: (id: number, data: any) => Promise<boolean>;
  setRoomOutOfService: (id: number) => Promise<boolean>;
  setRoomInService: (id: number) => Promise<boolean>;
  deleteRoom: (id: number) => Promise<boolean>;

  // Actions pour les utilisateurs
  loadUsers: () => Promise<void>;
  createUser: (data: any) => Promise<boolean>;
  updateUser: (id: number, data: any) => Promise<boolean>;
  deleteUser: (id: number) => Promise<boolean>;
  getUserStats: () => Promise<StatsResponse | null>;

  // Actions utilitaires
  clearError: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAppStore = create<AppStore>((set, get) => ({
  // État initial
  reservations: [],
  rooms: [],
  users: [],
  availableRooms: [],
  stats: null,
  isLoading: false,
  error: null,

  // Actions pour les réservations
  loadMyReservations: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiService.getMyReservations();
      set({ 
        reservations: response.reservations,
        isLoading: false 
      });
    } catch (error: any) {
      set({ 
        error: error.message,
        isLoading: false 
      });
    }
  },

  loadAllReservations: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiService.getAllReservations();
      set({ 
        reservations: response.reservations,
        isLoading: false 
      });
    } catch (error: any) {
      set({ 
        error: error.message,
        isLoading: false 
      });
    }
  },

  createReservation: async (data: any): Promise<boolean> => {
    set({ isLoading: true, error: null });
    try {
      await apiService.createReservation(data);
      // Recharger les réservations
      await get().loadMyReservations();
      return true;
    } catch (error: any) {
      set({ 
        error: error.message,
        isLoading: false 
      });
      return false;
    }
  },

  cancelReservation: async (id: number): Promise<boolean> => {
    set({ isLoading: true, error: null });
    try {
      await apiService.cancelReservation(id);
      // Mettre à jour localement
      const { reservations } = get();
      const updatedReservations = reservations.map(r => 
        r.id === id ? { ...r, statut: 'annulee' as const } : r
      );
      set({ 
        reservations: updatedReservations,
        isLoading: false 
      });
      return true;
    } catch (error: any) {
      set({ 
        error: error.message,
        isLoading: false 
      });
      return false;
    }
  },

  getReservationStats: async (): Promise<StatsResponse | null> => {
    set({ isLoading: true, error: null });
    try {
      const stats = await apiService.getReservationStats();
      set({ 
        stats,
        isLoading: false 
      });
      return stats;
    } catch (error: any) {
      set({ 
        error: error.message,
        isLoading: false 
      });
      return null;
    }
  },

  // Actions pour les salles
  loadRooms: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiService.getRooms();
      set({ 
        rooms: response.salles,
        isLoading: false 
      });
    } catch (error: any) {
      set({ 
        error: error.message,
        isLoading: false 
      });
    }
  },

  loadAvailableRooms: async (date: string, startTime: string, endTime: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiService.getAvailableRooms(date, startTime, endTime);
      set({ 
        availableRooms: response.salles_libres,
        isLoading: false 
      });
    } catch (error: any) {
      set({ 
        error: error.message,
        isLoading: false 
      });
    }
  },

  createRoom: async (data: any): Promise<boolean> => {
    set({ isLoading: true, error: null });
    try {
      await apiService.createRoom(data);
      await get().loadRooms();
      return true;
    } catch (error: any) {
      set({ 
        error: error.message,
        isLoading: false 
      });
      return false;
    }
  },

  updateRoom: async (id: number, data: any): Promise<boolean> => {
    set({ isLoading: true, error: null });
    try {
      await apiService.updateRoom(id, data);
      await get().loadRooms();
      return true;
    } catch (error: any) {
      set({ 
        error: error.message,
        isLoading: false 
      });
      return false;
    }
  },

  setRoomOutOfService: async (id: number): Promise<boolean> => {
    set({ isLoading: true, error: null });
    try {
      await apiService.setRoomOutOfService(id);
      // Mettre à jour localement
      const { rooms } = get();
      const updatedRooms = rooms.map(r => 
        r.id === id ? { ...r, statut: 'hors_service' as const } : r
      );
      set({ 
        rooms: updatedRooms,
        isLoading: false 
      });
      return true;
    } catch (error: any) {
      set({ 
        error: error.message,
        isLoading: false 
      });
      return false;
    }
  },

  setRoomInService: async (id: number): Promise<boolean> => {
    set({ isLoading: true, error: null });
    try {
      await apiService.setRoomInService(id);
      // Mettre à jour localement
      const { rooms } = get();
      const updatedRooms = rooms.map(r => 
        r.id === id ? { ...r, statut: 'disponible' as const } : r
      );
      set({ 
        rooms: updatedRooms,
        isLoading: false 
      });
      return true;
    } catch (error: any) {
      set({ 
        error: error.message,
        isLoading: false 
      });
      return false;
    }
  },

  deleteRoom: async (id: number): Promise<boolean> => {
    set({ isLoading: true, error: null });
    try {
      await apiService.deleteRoom(id);
      // Supprimer localement
      const { rooms } = get();
      const updatedRooms = rooms.filter(r => r.id !== id);
      set({ 
        rooms: updatedRooms,
        isLoading: false 
      });
      return true;
    } catch (error: any) {
      set({ 
        error: error.message,
        isLoading: false 
      });
      return false;
    }
  },

  // Actions pour les utilisateurs
  loadUsers: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiService.getUsers();
      set({ 
        users: response.utilisateurs,
        isLoading: false 
      });
    } catch (error: any) {
      set({ 
        error: error.message,
        isLoading: false 
      });
    }
  },

  createUser: async (data: any): Promise<boolean> => {
    set({ isLoading: true, error: null });
    try {
      await apiService.createUser(data);
      await get().loadUsers();
      return true;
    } catch (error: any) {
      set({ 
        error: error.message,
        isLoading: false 
      });
      return false;
    }
  },

  updateUser: async (id: number, data: any): Promise<boolean> => {
    set({ isLoading: true, error: null });
    try {
      await apiService.updateUser(id, data);
      await get().loadUsers();
      return true;
    } catch (error: any) {
      set({ 
        error: error.message,
        isLoading: false 
      });
      return false;
    }
  },

  deleteUser: async (id: number): Promise<boolean> => {
    set({ isLoading: true, error: null });
    try {
      await apiService.deleteUser(id);
      // Supprimer localement
      const { users } = get();
      const updatedUsers = users.filter(u => u.id !== id);
      set({ 
        users: updatedUsers,
        isLoading: false 
      });
      return true;
    } catch (error: any) {
      set({ 
        error: error.message,
        isLoading: false 
      });
      return false;
    }
  },

  getUserStats: async (): Promise<StatsResponse | null> => {
    set({ isLoading: true, error: null });
    try {
      const stats = await apiService.getUserStats();
      set({ 
        stats,
        isLoading: false 
      });
      return stats;
    } catch (error: any) {
      set({ 
        error: error.message,
        isLoading: false 
      });
      return null;
    }
  },

  // Actions utilitaires
  clearError: () => set({ error: null }),
  setLoading: (loading: boolean) => set({ isLoading: loading }),
}));