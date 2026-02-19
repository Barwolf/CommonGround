import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { MapPin, Users, User, Zap, Wind, Flame } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

const ActivityCard = (props) => {
  const navigation = useNavigation();
  const { name, geohash, distanceInM, physicality, sociability } = props;

  const physicalLevel = physicality < 4 ? 'low' : physicality < 8 ? 'moderate' : 'high';
  const socialLevel = sociability < 4 ? 'solo' : sociability < 7 ? 'small-group' : 'group';
  const distanceMiles = (distanceInM / 1609).toFixed(1);

  return (
    <TouchableOpacity 
      activeOpacity={0.9}
      onPress={() => navigation.navigate('Details', { activity: props })}
      style={styles.card}
    >
      <Image 
        source={{ uri: `https://picsum.photos/seed/${geohash}/400/200` }} 
        style={styles.cardImage} 
      />
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{name}</Text>
        <View style={styles.cardFooter}>
          <View style={styles.locationRow}>
            <MapPin size={16} color="#8B7355" />
            <Text style={styles.distanceText}>{distanceMiles} mi</Text>
          </View>
          <View style={styles.iconRow}>
             <View style={[styles.iconCircle, { backgroundColor: '#E8F0E7' }]}>
                {socialLevel === 'solo' ? <User size={14} color="#7A9B76" /> : <Users size={14} color="#7A9B76" />}
             </View>
             <View style={[styles.iconCircle, { backgroundColor: '#F0EBE4' }]}>
                {physicalLevel === 'high' ? <Flame size={14} color="#8B7355" /> : <Zap size={14} color="#8B7355" />}
             </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: { backgroundColor: '#FFF', borderRadius: 20, marginBottom: 20, overflow: 'hidden', elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  cardImage: { width: '100%', height: 160 },
  cardContent: { padding: 16 },
  cardTitle: { fontSize: 18, color: '#4A5D47', fontWeight: '600', marginBottom: 12 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  distanceText: { color: '#8B7355', fontSize: 14 },
  iconRow: { flexDirection: 'row', gap: 8 },
  iconCircle: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
});

export default ActivityCard;