import React, { useState } from 'react';
import { View, Text, Image, ScrollView, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { ArrowLeft, UserCircle } from 'lucide-react-native';
import Map from '../components/Map'; 

const { width } = Dimensions.get('window');

export default function ActivityDetail({ route, navigation }) {
  const { activity } = route.params;
  const [isJoined, setIsJoined] = useState(false);

  const socialLevel = activity.sociability < 4 ? 'solo' : activity.sociability < 7 ? 'small-group' : 'group';

  return (
    <View style={{ flex: 1, backgroundColor: '#F5F3EE' }}>
      <ScrollView bounces={false} contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: `https://picsum.photos/seed/${activity.geohash}/600/400` }} style={styles.headerImage} />
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <ArrowLeft size={20} color="#4A5D47" />
          </TouchableOpacity>
        </View>

        <View style={styles.contentWrapper}>
          <View style={styles.mainCard}>
            <Text style={styles.title}>{activity.name}</Text>
            
            <View style={styles.tagRow}>
              {activity.tags.map((tag, i) => (
                <View key={i} style={styles.tag}>
                  <Text style={styles.tagText}>{tag.replace('_', ' ')}</Text>
                </View>
              ))}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>About</Text>
              <Text style={styles.description}>
                Matched at {Math.round(activity.vibeScore)}%. Located at {activity.address}.
              </Text>
            </View>

            <View style={styles.grid}>
               <View style={styles.gridItem}>
                 <Text style={styles.labelText}>📍 Location</Text>
                 <Text style={styles.valueText}>{activity.address.split(',')[0]}</Text>
               </View>
               <View style={styles.gridItem}>
                 <Text style={styles.labelText}>⚡ Social</Text>
                 <Text style={styles.valueText}>{socialLevel}</Text>
               </View>
            </View>

            {/* MAP EMBED SECTION */}
            <View style={styles.mapContainer}>
              <Map activity={activity} />
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  imageContainer: { width, height: 280 },
  headerImage: { width: '100%', height: '100%' },
  backButton: { position: 'absolute', top: 50, left: 20, backgroundColor: 'white', padding: 10, borderRadius: 25, zIndex: 10 },
  contentWrapper: { paddingHorizontal: 20, marginTop: -30 },
  mainCard: { backgroundColor: 'white', borderRadius: 30, padding: 25, elevation: 5, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10 },
  title: { fontSize: 24, fontWeight: '700', color: '#4A5D47', marginBottom: 10 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  tag: { backgroundColor: '#E8F0E7', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  tagText: { color: '#7A9B76', fontSize: 12, fontWeight: '600' },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#4A5D47', marginBottom: 5 },
  description: { color: '#6B7F68', lineHeight: 20 },
  grid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  gridItem: { width: '48%' },
  labelText: { color: '#8B7355', fontSize: 12, marginBottom: 4 },
  valueText: { color: '#4A5D47', fontWeight: '600' },
  mapContainer: { height: 200, width: '100%', marginVertical: 20, borderRadius: 15, overflow: 'hidden' },
  organizerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingTop: 15, borderTopWidth: 1, borderTopColor: '#EEE' },
  organizerName: { fontWeight: '600', color: '#4A5D47' },
  footer: { position: 'absolute', bottom: 0, width: '100%', padding: 20, backgroundColor: 'white', borderTopWidth: 1, borderTopColor: '#EEE' },
  joinButton: { backgroundColor: '#7A9B76', paddingVertical: 16, borderRadius: 16, alignItems: 'center' }
});