import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/constants/app_constants.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/models/room_model.dart';
import '../providers/room_provider.dart';
import '../../../shared/widgets/loading_overlay.dart';

class RoomsScreen extends StatefulWidget {
  const RoomsScreen({super.key});

  @override
  State<RoomsScreen> createState() => _RoomsScreenState();
}

class _RoomsScreenState extends State<RoomsScreen> {
  String _selectedFilter = 'all';

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  void _loadData() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<RoomProvider>().loadRooms();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Salles de réunion'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _loadData,
          ),
        ],
      ),
      body: Consumer<RoomProvider>(
        builder: (context, provider, _) {
          return LoadingOverlay(
            isLoading: provider.isLoading,
            child: Column(
              children: [
                // Filtres
                _buildFilters(),
                
                // Liste des salles
                Expanded(
                  child: _buildRoomsList(provider),
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildFilters() {
    return Container(
      padding: const EdgeInsets.all(AppConstants.defaultPadding),
      child: Row(
        children: [
          Text(
            'Filtrer par:',
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: [
                  _buildFilterChip('Toutes', 'all'),
                  const SizedBox(width: 8),
                  _buildFilterChip('Disponibles', 'disponible'),
                  const SizedBox(width: 8),
                  _buildFilterChip('Hors service', 'hors_service'),
                  const SizedBox(width: 8),
                  _buildFilterChip('Maintenance', 'maintenance'),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFilterChip(String label, String value) {
    final isSelected = _selectedFilter == value;
    
    return FilterChip(
      label: Text(label),
      selected: isSelected,
      onSelected: (selected) {
        setState(() {
          _selectedFilter = value;
        });
      },
      selectedColor: AppTheme.primaryColor.withOpacity(0.2),
      checkmarkColor: AppTheme.primaryColor,
    );
  }

  Widget _buildRoomsList(RoomProvider provider) {
    List<Room> rooms;
    
    switch (_selectedFilter) {
      case 'disponible':
        rooms = provider.getRoomsByStatus('disponible');
        break;
      case 'hors_service':
        rooms = provider.getRoomsByStatus('hors_service');
        break;
      case 'maintenance':
        rooms = provider.getRoomsByStatus('maintenance');
        break;
      default:
        rooms = provider.rooms;
    }

    if (rooms.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.meeting_room_outlined,
              size: 64,
              color: AppTheme.textTertiary,
            ),
            const SizedBox(height: 16),
            Text(
              'Aucune salle trouvée',
              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                color: AppTheme.textSecondary,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Essayez un autre filtre',
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                color: AppTheme.textTertiary,
              ),
            ),
          ],
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: _loadData,
      child: ListView.builder(
        padding: const EdgeInsets.all(AppConstants.defaultPadding),
        itemCount: rooms.length,
        itemBuilder: (context, index) {
          final room = rooms[index];
          return _buildRoomCard(room);
        },
      ),
    );
  }

  Widget _buildRoomCard(Room room) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // En-tête avec nom et statut
            Row(
              children: [
                Expanded(
                  child: Text(
                    room.nom,
                    style: Theme.of(context).textTheme.titleLarge?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
                _buildStatusChip(room),
              ],
            ),
            
            const SizedBox(height: 12),
            
            // Informations de la salle
            Row(
              children: [
                Icon(
                  Icons.people,
                  size: 16,
                  color: AppTheme.textSecondary,
                ),
                const SizedBox(width: 8),
                Text(
                  '${room.capacite} places',
                  style: Theme.of(context).textTheme.bodyMedium,
                ),
              ],
            ),
            
            if (room.description != null && room.description!.isNotEmpty) ...[
              const SizedBox(height: 8),
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Icon(
                    Icons.description,
                    size: 16,
                    color: AppTheme.textSecondary,
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      room.description!,
                      style: Theme.of(context).textTheme.bodyMedium,
                    ),
                  ),
                ],
              ),
            ],
            
            // Indicateur visuel de capacité
            const SizedBox(height: 12),
            _buildCapacityIndicator(room.capacite),
          ],
        ),
      ),
    );
  }

  Widget _buildStatusChip(Room room) {
    Color color;
    String label;
    IconData icon;

    switch (room.statut) {
      case 'disponible':
        color = AppTheme.successColor;
        label = 'Disponible';
        icon = Icons.check_circle;
        break;
      case 'hors_service':
        color = AppTheme.errorColor;
        label = 'Hors service';
        icon = Icons.cancel;
        break;
      case 'maintenance':
        color = AppTheme.warningColor;
        label = 'Maintenance';
        icon = Icons.build;
        break;
      default:
        color = AppTheme.textSecondary;
        label = room.statusDisplayName;
        icon = Icons.info;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            icon,
            size: 14,
            color: color,
          ),
          const SizedBox(width: 4),
          Text(
            label,
            style: TextStyle(
              color: color,
              fontSize: 12,
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCapacityIndicator(int capacity) {
    Color color;
    String label;
    
    if (capacity <= 5) {
      color = AppTheme.warningColor;
      label = 'Petite salle';
    } else if (capacity <= 15) {
      color = AppTheme.primaryColor;
      label = 'Salle moyenne';
    } else {
      color = AppTheme.successColor;
      label = 'Grande salle';
    }

    return Row(
      children: [
        Container(
          width: 12,
          height: 12,
          decoration: BoxDecoration(
            color: color,
            shape: BoxShape.circle,
          ),
        ),
        const SizedBox(width: 8),
        Text(
          label,
          style: Theme.of(context).textTheme.bodySmall?.copyWith(
            color: color,
            fontWeight: FontWeight.w500,
          ),
        ),
        const Spacer(),
        // Barre de capacité visuelle
        Container(
          width: 100,
          height: 4,
          decoration: BoxDecoration(
            color: Colors.grey[300],
            borderRadius: BorderRadius.circular(2),
          ),
          child: FractionallySizedBox(
            alignment: Alignment.centerLeft,
            widthFactor: (capacity / 30).clamp(0.0, 1.0),
            child: Container(
              decoration: BoxDecoration(
                color: color,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),
        ),
      ],
    );
  }
}