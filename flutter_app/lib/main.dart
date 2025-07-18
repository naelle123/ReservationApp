import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/date_symbol_data_local.dart';

import 'core/theme/app_theme.dart';
import 'core/constants/app_constants.dart';
import 'core/services/api_service.dart';
import 'core/services/auth_service.dart';
import 'core/services/storage_service.dart';
import 'core/router/app_router.dart';
import 'features/auth/providers/auth_provider.dart';
import 'features/reservations/providers/reservation_provider.dart';
import 'features/rooms/providers/room_provider.dart';
import 'features/users/providers/user_provider.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Configuration de l'orientation (portrait uniquement)
  await SystemChrome.setPreferredOrientations([
    DeviceOrientation.portraitUp,
    DeviceOrientation.portraitDown,
  ]);
  
  // Configuration de la barre de statut pour un look professionnel
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.dark,
      statusBarBrightness: Brightness.light,
      systemNavigationBarColor: Colors.white,
      systemNavigationBarIconBrightness: Brightness.dark,
    ),
  );
  
  // Initialisation de la localisation française
  await initializeDateFormatting('fr_FR', null);
  
  // Initialisation des services avec gestion d'erreurs
  try {
    final storageService = StorageService();
    await storageService.init();
    
    final apiService = ApiService();
    final authService = AuthService(apiService, storageService);
    
    runApp(MeetingRoomApp(
      authService: authService,
      apiService: apiService,
      storageService: storageService,
    ));
  } catch (e) {
    // En cas d'erreur critique, afficher un écran d'erreur
    runApp(ErrorApp(error: e.toString()));
  }
}

/// Application principale avec configuration robuste des providers
/// Compatible 100% avec l'API backend Node.js/Express
class MeetingRoomApp extends StatelessWidget {
  final AuthService authService;
  final ApiService apiService;
  final StorageService storageService;

  const MeetingRoomApp({
    super.key,
    required this.authService,
    required this.apiService,
    required this.storageService,
  });

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        // Provider d'authentification (principal)
        ChangeNotifierProvider(
          create: (_) => AuthProvider(authService),
        ),
        // Provider de gestion des réservations
        ChangeNotifierProvider(
          create: (_) => ReservationProvider(apiService),
        ),
        // Provider de gestion des salles
        ChangeNotifierProvider(
          create: (_) => RoomProvider(apiService),
        ),
        // Provider de gestion des utilisateurs (admin)
        ChangeNotifierProvider(
          create: (_) => UserProvider(apiService),
        ),
      ],
      child: Consumer<AuthProvider>(
        builder: (context, authProvider, _) {
          final router = AppRouter.createRouter(authProvider);
          
          return MaterialApp.router(
            title: AppConstants.appName,
            debugShowCheckedModeBanner: false,
            
            // Configuration du thème avec Google Fonts
            theme: AppTheme.lightTheme.copyWith(
              textTheme: GoogleFonts.interTextTheme(
                AppTheme.lightTheme.textTheme,
              ),
            ),
            darkTheme: AppTheme.darkTheme.copyWith(
              textTheme: GoogleFonts.interTextTheme(
                AppTheme.darkTheme.textTheme,
              ),
            ),
            themeMode: ThemeMode.light,
            
            // Configuration du routeur
            routerConfig: router,
            
            // Configuration globale pour éviter le scaling automatique
            builder: (context, child) {
              return MediaQuery(
                data: MediaQuery.of(context).copyWith(
                  textScaler: const TextScaler.linear(1.0),
                ),
                child: child!,
              );
            },
            
            // Support de la localisation française
            locale: const Locale('fr', 'FR'),
            supportedLocales: const [
              Locale('fr', 'FR'),
              Locale('en', 'US'),
            ],
          );
        },
      ),
    );
  }
}

/// Application d'erreur en cas de problème critique
class ErrorApp extends StatelessWidget {
  final String error;

  const ErrorApp({super.key, required this.error});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Erreur - ${AppConstants.appName}',
      home: Scaffold(
        backgroundColor: Colors.red[50],
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(
                  Icons.error_outline,
                  size: 64,
                  color: Colors.red[600],
                ),
                const SizedBox(height: 24),
                Text(
                  'Erreur d\'initialisation',
                  style: TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                    color: Colors.red[800],
                  ),
                ),
                const SizedBox(height: 16),
                Text(
                  'Une erreur s\'est produite lors du démarrage de l\'application.',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 16,
                    color: Colors.red[700],
                  ),
                ),
                const SizedBox(height: 24),
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.red[100],
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: Colors.red[300]!),
                  ),
                  child: Text(
                    error,
                    style: TextStyle(
                      fontSize: 12,
                      color: Colors.red[800],
                      fontFamily: 'monospace',
                    ),
                  ),
                ),
                const SizedBox(height: 24),
                ElevatedButton(
                  onPressed: () {
                    // Redémarrer l'application
                    SystemNavigator.pop();
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.red[600],
                    foregroundColor: Colors.white,
                  ),
                  child: const Text('Redémarrer'),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}