# 🏢 Meeting Room Booking - Frontend Next.js

Application Next.js complète de réservation de salles de réunion, 100% compatible avec le backend Node.js/Express.

## 🚀 Fonctionnalités

### 👤 Interface Utilisateur
- ✅ Authentification sécurisée avec JWT
- ✅ Dashboard personnalisé avec statistiques
- ✅ Réservation de salles avec calendrier interactif
- ✅ Gestion des réservations (création, annulation)
- ✅ Consultation des salles disponibles
- ✅ Profil utilisateur et changement de mot de passe

### 👨‍💼 Interface Administrateur
- ✅ Tableau de bord admin avec métriques
- ✅ Gestion complète des utilisateurs (CRUD)
- ✅ Gestion des salles (CRUD, mise hors service)
- ✅ Vue sur toutes les réservations
- ✅ Réservations prioritaires
- ✅ Statistiques avancées

## 🛠️ Technologies

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Forms**: React Hook Form
- **Animations**: Framer Motion
- **Icons**: Heroicons
- **Notifications**: React Hot Toast
- **Date Handling**: date-fns

## 📦 Installation

### Prérequis
- Node.js (v18 ou supérieur)
- Backend API démarré sur `http://localhost:3000`

### 1. Installation des dépendances
```bash
cd vnext
npm install
```

### 2. Configuration de l'environnement
Copiez le fichier `.env.example` vers `.env.local` :

```bash
cp .env.example .env.local
```

Modifiez le fichier `.env.local` :
```env
# URL de l'API backend
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# Nom de l'application
NEXT_PUBLIC_APP_NAME=Meeting Room Booking
NEXT_PUBLIC_APP_VERSION=1.0.0

# Environnement
NODE_ENV=development
```

### 3. Démarrage de l'application

#### Mode développement
```bash
npm run dev
```

#### Mode production
```bash
npm run build
npm start
```

L'application sera disponible sur `http://localhost:3001`

## 🔐 Authentification

### Comptes par défaut
- **Admin**: `admin@example.com` / `admin123`
- **Utilisateur**: `user@example.com` / `user123`

### Gestion des tokens
- Stockage sécurisé dans localStorage
- Refresh automatique des données utilisateur
- Déconnexion automatique en cas de token expiré
- Middleware de protection des routes

## 🎨 Interface Utilisateur

### Design System
- **Couleurs**: Palette professionnelle avec primary, success, warning, error
- **Typography**: Police Inter pour une lisibilité optimale
- **Composants**: Système de composants réutilisables
- **Animations**: Micro-interactions avec Framer Motion
- **Responsive**: Design adaptatif mobile-first

### Composants Principaux
- `Button`: Boutons avec variants et états de chargement
- `Input`: Champs de saisie avec validation
- `Card`: Cartes avec effets hover
- `LoadingOverlay`: Overlay de chargement
- `Navbar`: Navigation responsive

## 📱 Pages et Fonctionnalités

### 🔐 Page de Connexion (`/login`)
- Formulaire de connexion avec validation
- Comptes de test intégrés
- Gestion d'erreurs en temps réel
- Redirection automatique selon le rôle

### 🏠 Dashboard (`/dashboard`)
- Vue d'ensemble personnalisée
- Actions rapides
- Prochaines réservations
- Statistiques personnelles

### 📅 Réservations (`/reservations`)
- Liste des réservations avec filtres
- Création de nouvelles réservations
- Annulation de réservations
- Calendrier interactif

### 🏢 Salles (`/rooms`)
- Catalogue des salles disponibles
- Filtres par statut et capacité
- Recherche de disponibilité
- Détails des équipements

### 👤 Profil (`/profile`)
- Informations personnelles
- Changement de mot de passe
- Historique des réservations

### 👨‍💼 Administration (`/admin/*`)
- Dashboard admin avec métriques
- Gestion des utilisateurs
- Gestion des salles
- Vue globale des réservations

## 🔄 Gestion d'État

### Zustand Stores
- **AuthStore**: Authentification et données utilisateur
- **AppStore**: Données applicatives (réservations, salles, utilisateurs)

### Persistance
- Token et données utilisateur persistés
- Synchronisation automatique avec le backend
- Gestion des erreurs et retry automatique

## 🌐 API Integration

### Service API (`/lib/api.ts`)
- Client Axios configuré avec intercepteurs
- Gestion centralisée des erreurs
- Authentification automatique
- Timeout et retry configurables

### Endpoints Supportés
```typescript
// Authentification
POST /auth/login
GET  /auth/me
PUT  /auth/change-password

// Salles
GET  /salles
GET  /salles/libres
POST /salles (admin)
PUT  /salles/:id (admin)

// Réservations
POST /reservations
GET  /reservations/mes-reservations
GET  /reservations/all (admin)
DELETE /reservations/:id

// Utilisateurs (admin)
GET  /utilisateurs
POST /utilisateurs
PUT  /utilisateurs/:id
DELETE /utilisateurs/:id
```

## 🎯 Fonctionnalités Avancées

### Validation des Formulaires
- Validation en temps réel avec React Hook Form
- Messages d'erreur contextuels
- Validation côté client et serveur

### Gestion des Erreurs
- Intercepteurs Axios pour les erreurs HTTP
- Messages utilisateur appropriés
- Fallbacks et retry automatique

### Performance
- Lazy loading des composants
- Optimisation des re-renders
- Mise en cache des données

### Accessibilité
- Navigation au clavier
- Lecteurs d'écran supportés
- Contrastes respectés

## 🧪 Scripts Disponibles

```bash
# Développement
npm run dev

# Build de production
npm run build

# Démarrage en production
npm start

# Linting
npm run lint

# Type checking
npm run type-check
```

## 📁 Structure du Projet

```
vnext/
├── src/
│   ├── app/                 # Pages Next.js (App Router)
│   │   ├── login/          # Page de connexion
│   │   ├── dashboard/      # Dashboard principal
│   │   ├── reservations/   # Gestion des réservations
│   │   ├── rooms/          # Catalogue des salles
│   │   ├── profile/        # Profil utilisateur
│   │   └── admin/          # Interface admin
│   ├── components/         # Composants réutilisables
│   │   ├── ui/            # Composants UI de base
│   │   └── layout/        # Composants de layout
│   ├── lib/               # Utilitaires et configuration
│   │   ├── api.ts         # Service API
│   │   └── constants.ts   # Constantes
│   ├── store/             # Gestion d'état Zustand
│   │   ├── auth.ts        # Store d'authentification
│   │   └── app.ts         # Store applicatif
│   └── types/             # Types TypeScript
├── public/                # Assets statiques
├── tailwind.config.js     # Configuration Tailwind
├── next.config.js         # Configuration Next.js
└── package.json           # Dépendances
```

## 🔧 Configuration

### Tailwind CSS
Configuration personnalisée avec :
- Palette de couleurs professionnelle
- Composants utilitaires
- Animations personnalisées
- Responsive design

### TypeScript
- Configuration stricte
- Types personnalisés pour l'API
- Intellisense complet

### Next.js
- App Router pour les performances
- Middleware pour la protection des routes
- Optimisations automatiques

## 🚨 Dépannage

### Problèmes courants

1. **Erreur de connexion à l'API**
   - Vérifiez que le backend est démarré
   - Vérifiez l'URL dans `.env.local`

2. **Token non persisté**
   - Vérifiez le localStorage du navigateur
   - Effacez le cache si nécessaire

3. **Erreurs de build**
   - Vérifiez les types TypeScript
   - Lancez `npm run type-check`

### Logs de développement
Les erreurs sont affichées dans la console du navigateur et le terminal.

## 🤝 Contribution

1. Fork le projet
2. Créez une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 📄 Licence

Ce projet est sous licence MIT.

---

**Frontend Next.js développé avec ❤️ pour une expérience utilisateur exceptionnelle**