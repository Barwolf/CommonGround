import React from 'react';
import { View, Text, Image, ScrollView, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { ArrowLeft, CalendarPlus } from 'lucide-react-native';
import Map from '../components/Map'; 
import { getDisplayCategories, getCategoryImage } from '../utils/recommendations';

export default function ActivityDetail({ route, navigation }) {
  const { activity } = route.params;

  // Use backend score directly (0-100)
  const displayScore = Math.round(activity.vibeScore || 0);
  const categories = getDisplayCategories(activity.tags);
  const categoryImage = getCategoryImage(activity.tags);

  const handleAddToCalendar = async () => {
    const title = encodeURIComponent(`Common Ground: ${activity.name}`);
    const location = encodeURIComponent(activity.address);
    const details = encodeURIComponent(`Match: ${displayScore}%\nAddress: ${activity.address}`);
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&location=${location}&details=${details}`;
    try { await Linking.openURL(url); } catch (err) { console.error(err); }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F5F3EE' }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: categoryImage }} 
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
                <View key={i} style={styles.tag}><Text style={styles.tagText}>{cat}</Text></View>
              ))}
            </View>

            <View style={styles.vibeSection}>
              <View style={styles.vibeHeader}>
                <Text style={styles.sectionTitle}>Vibe Match</Text>
                <Text style={[styles.vibeScoreText, { color: displayScore > 70 ? '#7A9B76' : '#8B7355' }]}>
                   {displayScore}%
                </Text>
              </View>
              <View style={styles.vibeBarBackground}>
                <View style={[styles.vibeBarFill, { width: `${displayScore}%` }]} />
              </View>
            </View>

            <View style={styles.grid}>
               <View style={styles.gridItem}>
                 <Text style={styles.labelText}>📍 Location</Text>
                 {/* Wraps automatically */}
                 <Text style={styles.valueText}>{activity.address}</Text>
               </View>
               <View style={styles.gridItem}>
                 <Text style={styles.labelText}>⚡ Social</Text>
                 <Text style={styles.valueText}>{activity.sociability}/10</Text>
               </View>
            </View>
            
            <View style={styles.grid}>
               <View style={styles.gridItem}>
                 <Text style={styles.labelText}>💰 Price</Text>
                 <Text style={styles.valueText}>{activity.price_level === "PRICE_UNKNOWN" ? "Free/Unknown" : activity.price_level}</Text>
               </View>
               <View style={styles.gridItem}>
                 <Text style={styles.labelText}>🏃 Physical</Text>
                 <Text style={styles.valueText}>{activity.physicality}/10</Text>
               </View>
            </View>

            <View style={styles.mapContainer}><Map activity={activity} /></View>
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
  imageContainer: { width: '100%', height: 350 },
  headerImage: { width: '100%', height: '100%' },
  backButton: { position: 'absolute', top: 50, left: 20, backgroundColor: 'white', padding: 10, borderRadius: 25, zIndex: 10 },
  contentWrapper: { paddingHorizontal: 20, marginTop: -60, maxWidth: 800, alignSelf: 'center', width: '100%' },
  mainCard: { backgroundColor: 'white', borderRadius: 30, padding: 25, elevation: 5, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 15 },
  title: { fontSize: 28, fontWeight: '800', color: '#4A5D47', marginBottom: 12 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 },
  tag: { backgroundColor: '#E8F0E7', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  tagText: { color: '#7A9B76', fontSize: 12, fontWeight: '700' },
  vibeSection: { marginBottom: 25 },
  vibeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#4A5D47' },
  vibeScoreText: { fontSize: 22, fontWeight: '800' },
  vibeBarBackground: { height: 10, backgroundColor: '#F0EBE4', borderRadius: 5, overflow: 'hidden' },
  vibeBarFill: { height: '100%', backgroundColor: '#7A9B76', borderRadius: 5 },
  grid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  gridItem: { width: '48%' },
  labelText: { color: '#8B7355', fontSize: 12, marginBottom: 4, fontWeight: '600', textTransform: 'uppercase' },
  valueText: { color: '#4A5D47', fontWeight: '700', fontSize: 15, lineHeight: 22 },
  mapContainer: { height: 250, width: '100%', marginTop: 10, borderRadius: 20, overflow: 'hidden', backgroundColor: '#F5F3EE' },
  footer: { position: 'absolute', bottom: 0, width: '100%', padding: 25, backgroundColor: 'white', borderTopWidth: 1, borderTopColor: '#EEE' },
  calendarButton: { backgroundColor: '#7A9B76', paddingVertical: 18, borderRadius: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12 },
  calendarButtonText: { color: 'white', fontWeight: '700', fontSize: 16 }
});