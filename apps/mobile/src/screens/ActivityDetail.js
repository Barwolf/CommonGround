import React from 'react';
import { View, Text, Image, ScrollView, StyleSheet, TouchableOpacity, Dimensions, Linking } from 'react-native';
import { ArrowLeft, CalendarPlus } from 'lucide-react-native';
import Map from '../components/Map'; 
// Import everything from your unified utils file
import { getDisplayCategories, calculateVibeMatch } from '../utils/recommendations';

const { width } = Dimensions.get('window');

export default function ActivityDetail({ route, navigation }) {
  const { activity, profile } = route.params;

  // Use the centralized utility functions
  const categories = getDisplayCategories(activity.tags);
  const vibeMatch = calculateVibeMatch(profile, activity);
  
  // Quick logic for social labels
  const socialLevel = activity.sociability < 4 ? 'solo' : activity.sociability < 7 ? 'small-group' : 'group';

  const handleAddToCalendar = async () => {
    const title = encodeURIComponent(`Common Ground: ${activity.name}`);
    const location = encodeURIComponent(activity.address);
    const details = encodeURIComponent(
      `Ready to touch grass?\n\nVibe Match: ${vibeMatch}%\nAddress: ${activity.address}\n\nCategories: ${categories.join(', ')}`
    );
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&location=${location}&details=${details}`;
    
    try {
      await Linking.openURL(url);
    } catch (err) {
      console.error("Calendar Link Error:", err);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F5F3EE' }}>
      <ScrollView bounces={false} contentContainerStyle={{ paddingBottom: 120 }}>
        
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: `https://picsum.photos/seed/${activity.geohash}/1200/800` }} 
            style={styles.headerImage} 
            resizeMode="cover" 
          />
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <ArrowLeft size={20} color="#4A5D47" />
          </TouchableOpacity>
        </View>

        <View style={styles.contentWrapper}>
          <View style={styles.mainCard}>
            
            <Text style={styles.title}>{activity.name}</Text>
            
            <View style={styles.tagRow}>
              {categories.map((cat, i) => (
                <View key={i} style={styles.tag}>
                  <Text style={styles.tagText}>{cat}</Text>
                </View>
              ))}
            </View>

            <View style={styles.vibeSection}>
              <View style={styles.vibeHeader}>
                <Text style={styles.sectionTitle}>Vibe Match</Text>
                <Text style={[styles.vibeScoreText, { color: vibeMatch > 70 ? '#7A9B76' : '#8B7355' }]}>
                  {vibeMatch}%
                </Text>
              </View>
              <View style={styles.vibeBarBackground}>
                <View style={[styles.vibeBarFill, { width: `${vibeMatch}%` }]} />
              </View>
            </View>

            <View style={styles.grid}>
               <View style={styles.gridItem}>
                 <Text style={styles.labelText}>📍 Location</Text>
                 <Text style={styles.valueText} numberOfLines={1}>{activity.address.split(',')[0]}</Text>
               </View>
               <View style={styles.gridItem}>
                 <Text style={styles.labelText}>⚡ Social</Text>
                 <Text style={styles.valueText}>{socialLevel}</Text>
               </View>
            </View>
            
            <View style={styles.grid}>
               <View style={styles.gridItem}>
                 <Text style={styles.labelText}>💰 Price Level</Text>
                 <Text style={styles.valueText}>
                   {activity.price_level === "PRICE_UNKNOWN" ? "Free/Unknown" : activity.price_level}
                 </Text>
               </View>
               <View style={styles.gridItem}>
                 <Text style={styles.labelText}>🏃 Physicality</Text>
                 <Text style={styles.valueText}>{activity.physicality}/10</Text>
               </View>
            </View>

            <View style={styles.mapContainer}>
              <Map activity={activity} />
            </View>

          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.calendarButton} onPress={handleAddToCalendar}>
          <CalendarPlus size={20} color="#FFF" />
          <Text style={styles.calendarButtonText}>Add to Calendar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  imageContainer: { width, height: 300 },
  headerImage: { width: '100%', height: '100%' },
  backButton: { position: 'absolute', top: 50, left: 20, backgroundColor: 'white', padding: 10, borderRadius: 25, zIndex: 10, elevation: 5 },
  contentWrapper: { paddingHorizontal: 20, marginTop: -40 },
  mainCard: { backgroundColor: 'white', borderRadius: 30, padding: 25, elevation: 5, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 15 },
  title: { fontSize: 26, fontWeight: '700', color: '#4A5D47', marginBottom: 12 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 },
  tag: { backgroundColor: '#E8F0E7', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  tagText: { color: '#7A9B76', fontSize: 12, fontWeight: '700' },
  vibeSection: { marginBottom: 25 },
  vibeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#4A5D47' },
  vibeScoreText: { fontSize: 20, fontWeight: '800' },
  vibeBarBackground: { height: 10, backgroundColor: '#F0EBE4', borderRadius: 5, overflow: 'hidden' },
  vibeBarFill: { height: '100%', backgroundColor: '#7A9B76', borderRadius: 5 },
  grid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  gridItem: { width: '48%' },
  labelText: { color: '#8B7355', fontSize: 12, marginBottom: 4, fontWeight: '600', textTransform: 'uppercase' },
  valueText: { color: '#4A5D47', fontWeight: '700', fontSize: 15 },
  mapContainer: { height: 220, width: '100%', marginTop: 10, borderRadius: 20, overflow: 'hidden', backgroundColor: '#F5F3EE' },
  footer: { position: 'absolute', bottom: 0, width: '100%', padding: 25, backgroundColor: 'white', borderTopWidth: 1, borderTopColor: '#EEE' },
  calendarButton: { backgroundColor: '#7A9B76', paddingVertical: 18, borderRadius: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12 },
  calendarButtonText: { color: 'white', fontWeight: '700', fontSize: 16 }
});