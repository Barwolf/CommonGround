import React from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  SafeAreaView, 
  Image, 
  TouchableOpacity 
} from 'react-native';
import { Leaf, Sun, MapPin, Zap, Users } from 'lucide-react-native';
import { auth } from '../../firebaseConfig';

export default function Dashboard({ profile }) {
  // Get initials for the avatar
  const initials = auth.currentUser?.displayName
    ? auth.currentUser.displayName.split(' ').map(n => n[0]).join('').toUpperCase()
    : 'JD';

  const activities = [
    {
      id: 1,
      name: 'Morning Hike at Eagle Peak',
      image: 'https://images.unsplash.com/photo-1689774034137-d1c0adf0c029?auto=format&fit=crop&q=80&w=400',
      distance: 2.3,
      socialLevel: 'small-group',
      physicalLevel: 'high'
    },
    {
      id: 2,
      name: 'Sunset Yoga in the Park',
      image: 'https://images.unsplash.com/photo-1758274525981-05497b2c5b97?auto=format&fit=crop&q=80&w=400',
      distance: 1.5,
      socialLevel: 'group',
      physicalLevel: 'low'
    },
    {
      id: 3,
      name: 'Coffee & Conversation',
      image: 'https://images.unsplash.com/photo-1689075326462-581d7705c0ef?auto=format&fit=crop&q=80&w=400',
      distance: 0.8,
      socialLevel: 'solo',
      physicalLevel: 'low'
    }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTitleRow}>
            <Leaf color="#7A9B76" size={28} />
            <Text style={styles.title}>Common Ground</Text>
          </View>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
        </View>

        {/* Touch Grass Card */}
        <View style={styles.promoCard}>
          <View style={styles.iconCircle}>
            <Sun color="#FFF" size={24} />
          </View>
          <View style={styles.promoTextContainer}>
            <Text style={styles.promoTitle}>Touch Grass</Text>
            <Text style={styles.promoSubtitle}>
              Your social battery is at {profile?.socialBattery || 50}%. Time to recharge.
            </Text>
          </View>
        </View>

        {/* Recommended Section */}
        <Text style={styles.sectionHeader}>Recommended for Your Battery</Text>
        
        {activities.map((activity) => (
          <TouchableOpacity key={activity.id} style={styles.activityCard}>
            <Image source={{ uri: activity.image }} style={styles.cardImage} />
            <View style={styles.cardDetails}>
              <Text style={styles.cardName}>{activity.name}</Text>
              <View style={styles.cardMeta}>
                <View style={styles.metaItem}>
                  <MapPin size={14} color="#8B7355" />
                  <Text style={styles.metaText}>{activity.distance} miles</Text>
                </View>
                <View style={styles.metaItem}>
                  <Users size={14} color="#8B7355" />
                  <Text style={styles.metaText}>{activity.socialLevel}</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F3EE' },
  scrollContent: { padding: 20 },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 25, 
    marginTop: 10 
  },
  headerTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#4A5D47' },
  avatar: { 
    width: 40, 
    height: 40, 
    backgroundColor: '#E8F0E7', 
    borderRadius: 20, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  avatarText: { color: '#4A5D47', fontSize: 14, fontWeight: 'bold' },
  promoCard: { 
    backgroundColor: '#7A9B76', 
    borderRadius: 24, 
    padding: 20, 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  iconCircle: { 
    backgroundColor: 'rgba(255,255,255,0.2)', 
    padding: 10, 
    borderRadius: 20, 
    marginRight: 15 
  },
  promoTextContainer: { flex: 1 },
  promoTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  promoSubtitle: { color: 'rgba(255,255,255,0.9)', fontSize: 14 },
  sectionHeader: { fontSize: 18, fontWeight: 'bold', color: '#4A5D47', marginBottom: 15 },
  activityCard: { 
    backgroundColor: '#FFF', 
    borderRadius: 20, 
    marginBottom: 15, 
    overflow: 'hidden',
    elevation: 2 
  },
  cardImage: { width: '100%', height: 150 },
  cardDetails: { padding: 15 },
  cardName: { fontSize: 16, fontWeight: 'bold', color: '#4A5D47', marginBottom: 8 },
  cardMeta: { flexDirection: 'row', gap: 15 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 12, color: '#8B7355' }
});