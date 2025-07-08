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
  ChangePasswordFormData,
  User,
  Room,
  Reservation
} from '@/types';

// Import des données statiques
import usersData from '@/data/users.json';
import roomsData from '@/data/rooms.json';
import reservationsData from '@/data/reservations.json';
import statsData from '@/data/stats.json';
import authData from '@/data/auth.json';

/// Service API Mock pour les tests sans backend
/// Simule parfaitement l'API backend avec données statiques
class MockApiService {
  private currentUser: User | null = null;
  private currentToken: string | null = null;
  private users: User[] = [...usersData.users];
  private rooms: Room[] = [...roomsData.salles];
  private reservations: Reservation[] = [...reservationsData.reservations];

  /// Simule un délai réseau réaliste
  private async delay(ms: number = 500): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /// Génère un ID unique pour les nouvelles entités
  private generateId(collection: any[]): number {
    return Math.max(...collection.map(item => item.id), 0) + 1;
  }

  /// Vérifie l'authentification
  private checkAuth(): void {
    if (!this.currentToken || !this.currentUser) {
      throw new Error('Session expirée. Veuillez vous reconnecter.');
    }
  }

  /// Vérifie les permissions admin
  private checkAdmin(): void {
    this.checkAuth();
    if (this.currentUser?.role !== 'admin') {
      throw new Error('Accès réservé aux administrateurs');
    }
  }

  // ==================== ENDPOINTS D'AUTHENTIFICATION ====================

  async login(credentials: LoginFormData): Promise<LoginResponse> {
    await this.delay(800);

    const { email, mot_de_passe } = credentials;
    const account = authData.test_accounts[email as keyof typeof authData.test_accounts];

    if (!account || account.password !== mot_de_passe) {
      throw new Error('Email ou mot de passe incorrect');
    }

    this.currentUser = account.user;
    this.currentToken = account.token;

    return {
      message: 'Connexion réussie',
      token: account.token,
      user: account.user
    };
  }

  async getProfile(): Promise<{ user: User }> {
    await this.delay(300);
    this.checkAuth();

    return {
      user: this.currentUser!
    };
  }

  async changePassword(data: ChangePasswordFormData): Promise<ApiResponse> {
    await this.delay(600);
    this.checkAuth();

    // Simulation de validation
    if (data.ancien_mot_de_passe === data.nouveau_mot_de_passe) {
      throw new Error('Le nouveau mot de passe doit être différent de l\'ancien');
    }

    return {
      message: 'Mot de passe modifié avec succès'
    };
  }

  // ==================== ENDPOINTS DES SALLES ====================

  async getRooms(): Promise<RoomsResponse> {
    await this.delay(400);
    this.checkAuth();

    return {
      salles: this.rooms
    };
  }

  async getAvailableRooms(date: string, startTime: string, endTime: string): Promise<AvailableRoomsResponse> {
    await this.delay(600);
    this.checkAuth();

    // Filtrer les salles disponibles (pas de conflit de réservation)
    const conflictingRoomIds = this.reservations
      .filter(r => 
        r.date === date && 
        r.statut === 'active' &&
        this.isTimeConflict(r.heure_debut, r.heure_fin, startTime, endTime)
      )
      .map(r => r.salle_id);

    const availableRooms = this.rooms.filter(room => 
      room.statut === 'disponible' && 
      !conflictingRoomIds.includes(room.id)
    );

    return {
      salles_libres: availableRooms,
      periode: {
        date,
        heure_debut: startTime,
        heure_fin: endTime
      }
    };
  }

  private isTimeConflict(start1: string, end1: string, start2: string, end2: string): boolean {
    return (start1 < end2 && end1 > start2) ||
           (start1 < end2 && end1 > end2) ||
           (start1 >= start2 && start1 < end2);
  }

  async getRoomReservations(roomId: number, date: string): Promise<any> {
    await this.delay(400);
    this.checkAuth();

    const room = this.rooms.find(r => r.id === roomId);
    if (!room) {
      throw new Error('Salle non trouvée');
    }

    const roomReservations = this.reservations.filter(r => 
      r.salle_id === roomId && 
      r.date === date && 
      r.statut === 'active'
    );

    return {
      salle: { nom: room.nom },
      date,
      reservations: roomReservations
    };
  }

  async createRoom(roomData: CreateRoomFormData): Promise<ApiResponse> {
    await this.delay(700);
    this.checkAdmin();

    // Vérifier que le nom n'existe pas déjà
    if (this.rooms.some(r => r.nom === roomData.nom)) {
      throw new Error('Une salle avec ce nom existe déjà');
    }

    const newRoom: Room = {
      id: this.generateId(this.rooms),
      nom: roomData.nom,
      capacite: roomData.capacite,
      statut: 'disponible',
      description: roomData.description,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    this.rooms.push(newRoom);

    return {
      message: 'Salle créée avec succès',
      data: newRoom
    };
  }

  async updateRoom(roomId: number, roomData: Partial<CreateRoomFormData>): Promise<ApiResponse> {
    await this.delay(600);
    this.checkAdmin();

    const roomIndex = this.rooms.findIndex(r => r.id === roomId);
    if (roomIndex === -1) {
      throw new Error('Salle non trouvée');
    }

    // Vérifier que le nom n'est pas déjà utilisé par une autre salle
    if (roomData.nom && this.rooms.some(r => r.nom === roomData.nom && r.id !== roomId)) {
      throw new Error('Une autre salle utilise déjà ce nom');
    }

    this.rooms[roomIndex] = {
      ...this.rooms[roomIndex],
      ...roomData,
      updated_at: new Date().toISOString()
    };

    return {
      message: 'Salle modifiée avec succès',
      data: this.rooms[roomIndex]
    };
  }

  async setRoomOutOfService(roomId: number): Promise<ApiResponse> {
    await this.delay(800);
    this.checkAdmin();

    const roomIndex = this.rooms.findIndex(r => r.id === roomId);
    if (roomIndex === -1) {
      throw new Error('Salle non trouvée');
    }

    this.rooms[roomIndex].statut = 'hors_service';
    this.rooms[roomIndex].updated_at = new Date().toISOString();

    // Annuler les réservations futures
    const cancelledCount = this.reservations.filter(r => 
      r.salle_id === roomId && 
      r.statut === 'active' && 
      new Date(r.date) >= new Date()
    ).length;

    this.reservations = this.reservations.map(r => 
      r.salle_id === roomId && r.statut === 'active' && new Date(r.date) >= new Date()
        ? { ...r, statut: 'annulee' as const, updated_at: new Date().toISOString() }
        : r
    );

    return {
      message: 'Salle mise hors service avec succès',
      data: { reservations_annulees: cancelledCount }
    };
  }

  async setRoomInService(roomId: number): Promise<ApiResponse> {
    await this.delay(500);
    this.checkAdmin();

    const roomIndex = this.rooms.findIndex(r => r.id === roomId);
    if (roomIndex === -1) {
      throw new Error('Salle non trouvée');
    }

    this.rooms[roomIndex].statut = 'disponible';
    this.rooms[roomIndex].updated_at = new Date().toISOString();

    return {
      message: 'Salle remise en service avec succès'
    };
  }

  async deleteRoom(roomId: number): Promise<ApiResponse> {
    await this.delay(600);
    this.checkAdmin();

    const roomIndex = this.rooms.findIndex(r => r.id === roomId);
    if (roomIndex === -1) {
      throw new Error('Salle non trouvée');
    }

    // Vérifier s'il y a des réservations futures
    const futureReservations = this.reservations.filter(r => 
      r.salle_id === roomId && 
      r.statut === 'active' && 
      new Date(r.date) >= new Date()
    );

    if (futureReservations.length > 0) {
      throw new Error('Impossible de supprimer une salle avec des réservations futures actives');
    }

    this.rooms.splice(roomIndex, 1);

    return {
      message: 'Salle supprimée avec succès'
    };
  }

  // ==================== ENDPOINTS DES RÉSERVATIONS ====================

  async createReservation(reservationData: CreateReservationFormData): Promise<ApiResponse> {
    await this.delay(800);
    this.checkAuth();

    // Vérifier que la salle existe et est disponible
    const room = this.rooms.find(r => r.id === reservationData.salle_id);
    if (!room) {
      throw new Error('Salle non trouvée');
    }

    if (room.statut !== 'disponible') {
      throw new Error('Salle non disponible');
    }

    // Vérifier les conflits
    const hasConflict = this.reservations.some(r => 
      r.salle_id === reservationData.salle_id &&
      r.date === reservationData.date &&
      r.statut === 'active' &&
      this.isTimeConflict(r.heure_debut, r.heure_fin, reservationData.heure_debut, reservationData.heure_fin)
    );

    if (hasConflict) {
      throw new Error('Créneau déjà réservé');
    }

    const newReservation: Reservation = {
      id: this.generateId(this.reservations),
      utilisateur_id: this.currentUser!.id,
      salle_id: reservationData.salle_id,
      date: reservationData.date,
      heure_debut: reservationData.heure_debut,
      heure_fin: reservationData.heure_fin,
      statut: 'active',
      motif: reservationData.motif,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      utilisateur_nom: this.currentUser!.nom,
      utilisateur_email: this.currentUser!.email,
      utilisateur_telephone: this.currentUser!.telephone,
      salle_nom: room.nom,
      salle_capacite: room.capacite
    };

    this.reservations.push(newReservation);

    return {
      message: 'Réservation créée avec succès',
      data: newReservation
    };
  }

  async getMyReservations(): Promise<ReservationsResponse> {
    await this.delay(500);
    this.checkAuth();

    const myReservations = this.reservations.filter(r => 
      r.utilisateur_id === this.currentUser!.id
    );

    return {
      reservations: myReservations
    };
  }

  async getAllReservations(): Promise<ReservationsResponse> {
    await this.delay(600);
    this.checkAdmin();

    return {
      reservations: this.reservations
    };
  }

  async cancelReservation(reservationId: number): Promise<ApiResponse> {
    await this.delay(500);
    this.checkAuth();

    const reservationIndex = this.reservations.findIndex(r => r.id === reservationId);
    if (reservationIndex === -1) {
      throw new Error('Réservation non trouvée');
    }

    const reservation = this.reservations[reservationIndex];

    // Vérifier les permissions
    if (this.currentUser!.role !== 'admin' && reservation.utilisateur_id !== this.currentUser!.id) {
      throw new Error('Accès non autorisé');
    }

    if (reservation.statut !== 'active') {
      throw new Error('Cette réservation ne peut pas être annulée');
    }

    this.reservations[reservationIndex] = {
      ...reservation,
      statut: 'annulee',
      updated_at: new Date().toISOString()
    };

    return {
      message: 'Réservation annulée avec succès'
    };
  }

  async createPriorityReservation(reservationData: CreateReservationFormData): Promise<ApiResponse> {
    await this.delay(900);
    this.checkAdmin();

    // Annuler les réservations en conflit
    const conflictingReservations = this.reservations.filter(r => 
      r.salle_id === reservationData.salle_id &&
      r.date === reservationData.date &&
      r.statut === 'active' &&
      this.isTimeConflict(r.heure_debut, r.heure_fin, reservationData.heure_debut, reservationData.heure_fin)
    );

    conflictingReservations.forEach(conflict => {
      const index = this.reservations.findIndex(r => r.id === conflict.id);
      if (index !== -1) {
        this.reservations[index] = {
          ...this.reservations[index],
          statut: 'annulee',
          updated_at: new Date().toISOString()
        };
      }
    });

    // Créer la réservation prioritaire
    const room = this.rooms.find(r => r.id === reservationData.salle_id)!;
    const newReservation: Reservation = {
      id: this.generateId(this.reservations),
      utilisateur_id: this.currentUser!.id,
      salle_id: reservationData.salle_id,
      date: reservationData.date,
      heure_debut: reservationData.heure_debut,
      heure_fin: reservationData.heure_fin,
      statut: 'active',
      motif: reservationData.motif,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      utilisateur_nom: this.currentUser!.nom,
      utilisateur_email: this.currentUser!.email,
      utilisateur_telephone: this.currentUser!.telephone,
      salle_nom: room.nom,
      salle_capacite: room.capacite
    };

    this.reservations.push(newReservation);

    return {
      message: 'Réservation prioritaire créée avec succès',
      data: {
        reservation: newReservation,
        reservations_annulees: conflictingReservations.length
      }
    };
  }

  async getReservationStats(): Promise<StatsResponse> {
    await this.delay(400);
    this.checkAdmin();

    return statsData.reservation_stats;
  }

  // ==================== ENDPOINTS DES UTILISATEURS ====================

  async getUsers(): Promise<UsersResponse> {
    await this.delay(500);
    this.checkAdmin();

    return {
      utilisateurs: this.users
    };
  }

  async getUser(userId: number): Promise<{ utilisateur: User }> {
    await this.delay(300);
    this.checkAdmin();

    const user = this.users.find(u => u.id === userId);
    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }

    return {
      utilisateur: user
    };
  }

  async createUser(userData: CreateUserFormData): Promise<ApiResponse> {
    await this.delay(700);
    this.checkAdmin();

    // Vérifier que l'email n'existe pas déjà
    if (this.users.some(u => u.email === userData.email)) {
      throw new Error('Un utilisateur avec cet email existe déjà');
    }

    const newUser: User = {
      id: this.generateId(this.users),
      nom: userData.nom,
      email: userData.email,
      role: userData.role,
      telephone: userData.telephone,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    this.users.push(newUser);

    return {
      message: 'Utilisateur créé avec succès',
      data: newUser
    };
  }

  async updateUser(userId: number, userData: Partial<CreateUserFormData>): Promise<ApiResponse> {
    await this.delay(600);
    this.checkAdmin();

    const userIndex = this.users.findIndex(u => u.id === userId);
    if (userIndex === -1) {
      throw new Error('Utilisateur non trouvé');
    }

    // Vérifier que l'email n'est pas déjà utilisé par un autre utilisateur
    if (userData.email && this.users.some(u => u.email === userData.email && u.id !== userId)) {
      throw new Error('Un autre utilisateur utilise déjà cet email');
    }

    this.users[userIndex] = {
      ...this.users[userIndex],
      ...userData,
      updated_at: new Date().toISOString()
    };

    return {
      message: 'Utilisateur modifié avec succès',
      data: this.users[userIndex]
    };
  }

  async deleteUser(userId: number): Promise<ApiResponse> {
    await this.delay(600);
    this.checkAdmin();

    const userIndex = this.users.findIndex(u => u.id === userId);
    if (userIndex === -1) {
      throw new Error('Utilisateur non trouvé');
    }

    const user = this.users[userIndex];

    // Empêcher la suppression du dernier admin
    if (user.role === 'admin') {
      const adminCount = this.users.filter(u => u.role === 'admin').length;
      if (adminCount <= 1) {
        throw new Error('Impossible de supprimer le dernier administrateur');
      }
    }

    // Vérifier s'il y a des réservations futures
    const futureReservations = this.reservations.filter(r => 
      r.utilisateur_id === userId && 
      r.statut === 'active' && 
      new Date(r.date) >= new Date()
    );

    if (futureReservations.length > 0) {
      throw new Error('Impossible de supprimer un utilisateur avec des réservations futures actives');
    }

    this.users.splice(userIndex, 1);

    return {
      message: 'Utilisateur supprimé avec succès'
    };
  }

  async getUserStats(): Promise<StatsResponse> {
    await this.delay(400);
    this.checkAdmin();

    return statsData.user_stats;
  }

  // ==================== ENDPOINT DE SANTÉ ====================

  async healthCheck(): Promise<any> {
    await this.delay(200);

    return {
      status: 'OK',
      message: 'API Mock fonctionnelle',
      timestamp: new Date().toISOString(),
      mode: 'mock'
    };
  }

  // ==================== MÉTHODES UTILITAIRES ====================

  setAuthToken(token: string): void {
    this.currentToken = token;
    // Retrouver l'utilisateur associé au token
    for (const [email, account] of Object.entries(authData.test_accounts)) {
      if (account.token === token) {
        this.currentUser = account.user;
        break;
      }
    }
  }

  clearAuth(): void {
    this.currentToken = null;
    this.currentUser = null;
  }
}

// Instance singleton de l'API Mock
export const mockApiService = new MockApiService();
export default mockApiService;