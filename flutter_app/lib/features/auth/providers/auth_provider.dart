import 'package:flutter/material.dart';
import '../../../core/models/user_model.dart';
import '../../../core/services/auth_service.dart';
import '../../../core/exceptions/api_exception.dart';

/// Provider d'authentification avec gestion robuste des erreurs
/// Compatible 100% avec l'API backend Node.js/Express
class AuthProvider extends ChangeNotifier {
  final AuthService _authService;
  
  User? _user;
  bool _isLoading = false;
  String? _error;
  bool _isInitialized = false;

  AuthProvider(this._authService) {
    _initialize();
  }

  // Getters
  User? get user => _user;
  bool get isLoading => _isLoading;
  String? get error => _error;
  bool get isAuthenticated => _user != null;
  bool get isInitialized => _isInitialized;
  bool get isAdmin => _user?.isAdmin ?? false;
  bool get isUser => _user?.isUser ?? false;

  /// Initialisation avec gestion robuste des erreurs
  Future<void> _initialize() async {
    _setLoading(true);
    try {
      await _authService.initializeAuth();
      _user = await _authService.getCurrentUser();
      
      // Si on a un utilisateur, vérifier que la session est toujours valide
      if (_user != null) {
        try {
          _user = await _authService.refreshUserData();
        } catch (e) {
          // Si erreur, la session a expiré - nettoyer
          await logout();
        }
      }
    } catch (e) {
      _setError('Erreur d\'initialisation: ${e.toString()}');
      // En cas d'erreur d'initialisation, nettoyer
      await _authService.logout();
    } finally {
      _isInitialized = true;
      _setLoading(false);
    }
  }

  /// Connexion avec gestion d'erreurs robuste
  Future<bool> login(String email, String password) async {
    _setLoading(true);
    _clearError();
    
    try {
      // Validation côté client
      if (email.trim().isEmpty || password.isEmpty) {
        _setError('Email et mot de passe requis');
        return false;
      }

      if (!_isValidEmail(email)) {
        _setError('Format d\'email invalide');
        return false;
      }

      if (password.length < 6) {
        _setError('Le mot de passe doit contenir au moins 6 caractères');
        return false;
      }

      // Tentative de connexion
      _user = await _authService.login(email.trim(), password);
      notifyListeners();
      return true;
      
    } on ApiException catch (e) {
      _setError(e.userFriendlyMessage);
      return false;
    } catch (e) {
      _setError('Erreur de connexion: ${e.toString()}');
      return false;
    } finally {
      _setLoading(false);
    }
  }

  /// Déconnexion avec nettoyage complet
  Future<void> logout() async {
    _setLoading(true);
    try {
      await _authService.logout();
      _user = null;
      _clearError();
      notifyListeners();
    } catch (e) {
      _setError('Erreur de déconnexion: ${e.toString()}');
      // Même en cas d'erreur, nettoyer l'état local
      _user = null;
      notifyListeners();
    } finally {
      _setLoading(false);
    }
  }

  /// Changement de mot de passe avec validation
  Future<bool> changePassword(String oldPassword, String newPassword) async {
    _setLoading(true);
    _clearError();
    
    try {
      // Validation côté client
      if (oldPassword.isEmpty || newPassword.isEmpty) {
        _setError('Ancien et nouveau mot de passe requis');
        return false;
      }

      if (newPassword.length < 6) {
        _setError('Le nouveau mot de passe doit contenir au moins 6 caractères');
        return false;
      }

      if (oldPassword == newPassword) {
        _setError('Le nouveau mot de passe doit être différent de l\'ancien');
        return false;
      }

      await _authService.changePassword(oldPassword, newPassword);
      return true;
      
    } on ApiException catch (e) {
      _setError(e.userFriendlyMessage);
      return false;
    } catch (e) {
      _setError('Erreur lors du changement de mot de passe: ${e.toString()}');
      return false;
    } finally {
      _setLoading(false);
    }
  }

  /// Actualisation des données utilisateur
  Future<void> refreshUser() async {
    if (_user == null) return;
    
    try {
      _user = await _authService.refreshUserData();
      notifyListeners();
    } catch (e) {
      // Si erreur, probablement session expirée
      await logout();
    }
  }

  /// Vérification de la validité de la session
  Future<bool> checkSession() async {
    if (_user == null) return false;
    
    try {
      return await _authService.isTokenValid();
    } catch (e) {
      return false;
    }
  }

  /// Validation d'email côté client
  bool _isValidEmail(String email) {
    return RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$').hasMatch(email);
  }

  void _setLoading(bool loading) {
    _isLoading = loading;
    notifyListeners();
  }

  void _setError(String error) {
    _error = error;
    notifyListeners();
  }

  void _clearError() {
    _error = null;
    notifyListeners();
  }

  void clearError() {
    _clearError();
  }

  /// Nettoyage des ressources
  @override
  void dispose() {
    super.dispose();
  }
}