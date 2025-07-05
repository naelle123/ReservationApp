import '../models/user_model.dart';
import 'api_service.dart';
import 'storage_service.dart';

/// Service d'authentification gérant la connexion, déconnexion et persistance
/// Compatible 100% avec l'API backend Node.js/Express
class AuthService {
  final ApiService _apiService;
  final StorageService _storageService;

  AuthService(this._apiService, this._storageService);

  /// Connexion utilisateur avec persistance des données
  /// Compatible avec la réponse du backend: { token, user, message }
  Future<User> login(String email, String password) async {
    try {
      final response = await _apiService.login(email, password);
      
      // Vérifier que la réponse contient les données attendues
      if (!response.containsKey('token') || !response.containsKey('user')) {
        throw Exception('Réponse de connexion invalide du serveur');
      }
      
      final token = response['token'] as String;
      final userData = response['user'] as Map<String, dynamic>;
      final user = User.fromJson(userData);
      
      // Sauvegarder le token et les données utilisateur de manière sécurisée
      await _storageService.saveToken(token);
      await _storageService.saveUser(user);
      
      // Configurer le token pour les futures requêtes API
      _apiService.setAuthToken(token);
      
      return user;
    } catch (e) {
      // Nettoyer en cas d'erreur
      await _storageService.deleteToken();
      await _storageService.deleteUser();
      _apiService.clearAuthToken();
      rethrow;
    }
  }

  /// Déconnexion avec nettoyage des données locales
  Future<void> logout() async {
    try {
      // Supprimer toutes les données locales
      await _storageService.clearAll();
      
      // Supprimer le token de l'API service
      _apiService.clearAuthToken();
    } catch (e) {
      // Même en cas d'erreur, nettoyer les données locales
      await _storageService.clearAll();
      _apiService.clearAuthToken();
    }
  }

  /// Récupération de l'utilisateur actuellement connecté
  Future<User?> getCurrentUser() async {
    try {
      return await _storageService.getUser();
    } catch (e) {
      // En cas d'erreur, nettoyer les données corrompues
      await _storageService.deleteUser();
      return null;
    }
  }

  /// Vérification de l'état de connexion
  Future<bool> isLoggedIn() async {
    try {
      final token = await _storageService.getToken();
      final user = await _storageService.getUser();
      return token != null && user != null;
    } catch (e) {
      return false;
    }
  }

  /// Initialisation de l'authentification au démarrage de l'app
  Future<void> initializeAuth() async {
    try {
      final token = await _storageService.getToken();
      if (token != null) {
        _apiService.setAuthToken(token);
      }
    } catch (e) {
      // En cas d'erreur, nettoyer les données
      await logout();
    }
  }

  /// Actualisation des données utilisateur depuis le serveur
  /// Compatible avec la réponse du backend: { user }
  Future<User> refreshUserData() async {
    try {
      final response = await _apiService.getProfile();
      
      if (!response.containsKey('user')) {
        throw Exception('Réponse de profil invalide du serveur');
      }
      
      final userData = response['user'] as Map<String, dynamic>;
      final user = User.fromJson(userData);
      
      // Mettre à jour les données utilisateur stockées
      await _storageService.saveUser(user);
      
      return user;
    } catch (e) {
      // En cas d'erreur (token expiré, etc.), déconnecter
      await logout();
      rethrow;
    }
  }

  /// Changement de mot de passe
  Future<void> changePassword(String oldPassword, String newPassword) async {
    await _apiService.changePassword(oldPassword, newPassword);
  }

  /// Vérification de la validité du token
  Future<bool> isTokenValid() async {
    try {
      await _apiService.getProfile();
      return true;
    } catch (e) {
      return false;
    }
  }
}