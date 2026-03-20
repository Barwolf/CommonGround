import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { MapPin, Users, User, Zap, Flame } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { getDisplayCategories } from '../utils/recommendations';

const ActivityCard = (props) => {
  const navigation = useNavigation();
  const { name, geohash, distanceInM, physicality, sociability, tags, vibeScore } = props;

  // No math needed—just clean up the decimal if it has one
  const displayScore = Math.round(vibeScore || 0);
  
  const categories = getDisplayCategories(tags);
  const primaryCategory = categories[0] || "Destination";
  const distanceMiles = (distanceInM / 1609).toFixed(1);

  return (
    <TouchableOpacity 
      activeOpacity={0.9}
      onPress={() => navigation.navigate('Details', { activity: props })}
      style={styles.card}
    >
      <Image 
        source={{ uri: `https://picsum.photos/seed/${geohash}/800/400` }} 
        style={styles.cardImage} 
        resizeMode="cover" 
      />
      
      <View style={styles.cardContent}>
        <View style={styles.badgeRow}>
          <View style={[styles.vibeBadge, { backgroundColor: displayScore > 70 ? '#7A9B76' : '#C5A880' }]}>
            <Text style={styles.vibeText}>{displayScore}% Match</Text>
          </View>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{primaryCategory}</Text>
          </View>
        </View>

        <Text style={styles.cardTitle} numberOfLines={1}>{name}</Text>
        
        <View style={styles.cardFooter}>
          <View style={styles.locationRow}>
            <MapPin size={14} color="#8B7355" />
            <Text style={styles.distanceText}>{distanceMiles} mi away</Text>
          </View>

          <View style={styles.iconRow}>
             <View style={[styles.iconCircle, { backgroundColor: '#E8F0E7' }]}>
                {sociability < 5 ? <User size={14} color="#7A9B76" /> : <Users size={14} color="#7A9B76" />}
             </View>
             <View style={[styles.iconCircle, { backgroundColor: '#F0EBE4' }]}>
                {physicality > 6 ? <Flame size={14} color="#8B7355" /> : <Zap size={14} color="#8B7355" />}
             </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: { backgroundColor: '#FFF', borderRadius: 24, marginBottom: 20, overflow: 'hidden', elevation: 4, shadowColor: '#4A5D47', shadowOpacity: 0.1, shadowRadius: 10 },
  cardImage: { width: '100%', height: 160 },
  cardContent: { padding: 18 },
  badgeRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  vibeBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  vibeText: { color: 'white', fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
  categoryBadge: { backgroundColor: '#F5F3EE', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: '#E8F0E7' },
  categoryText: { color: '#8B7355', fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  cardTitle: { fontSize: 20, color: '#4A5D47', fontWeight: '700', marginBottom: 12 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  distanceText: { color: '#8B7355', fontSize: 13, fontWeight: '500' },
  iconRow: { flexDirection: 'row', gap: 8 },
  iconCircle: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
});

export default ActivityCard;