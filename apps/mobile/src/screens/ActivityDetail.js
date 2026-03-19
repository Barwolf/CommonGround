import React, { useState } from 'react';
import { View, Text, Image, ScrollView, StyleSheet, TouchableOpacity, Dimensions, Linking } from 'react-native';
import { ArrowLeft, MapPin, Clock, Users, User, Zap, Wind, Flame, UserCircle, CalendarPlus } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function ActivityDetail({ route, navigation }) {
  const { activity } = route.params;
  const [isJoined, setIsJoined] = useState(false);

  const physicalLevel = activity.physicality < 4 ? 'low' : activity.physicality < 8 ? 'moderate' : 'high';
  const socialLevel = activity.sociability < 4 ? 'solo' : activity.sociability < 7 ? 'small-group' : 'group';

  const handleAddToCalendar = async () => {
    const title = encodeURIComponent(`Common Ground: ${activity.name}`);
    const location = encodeURIComponent(activity.address);

    const descriptionText = `Ready to touch grass?\n\nTags: ${activity.tags?.map(t => t.replace('_', ' ')).join(', ') || 'N/A'}\nVibe Match: ${Math.round(activity.vibeScore)}%\n\nView more in the Common Ground app!`;
    const details = encodeURIComponent(descriptionText);

    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&location=${location}&details=${details}`;

    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        console.warn("Cannot open the calendar URL.");
      }
    } catch (error) {
      console.error("An error occurred trying to open the calendar", error);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F5F3EE' }}>
      <ScrollView bounces={false}>
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
                <View key={i} style={styles.tag}><Text style={styles.tagText}>{tag.replace('_', ' ')}</Text></View>
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

            <View style={styles.organizerRow}>
              <UserCircle size={24} color="#7A9B76" />
              <View><Text style={styles.organizerName}>Verified Destination</Text></View>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.calendarButton} 
          onPress={handleAddToCalendar}
        >
          <CalendarPlus size={24} color="#8B7355" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.joinButton, isJoined && { backgroundColor: '#E8F0E7' }]}
          onPress={() => setIsJoined(!isJoined)}
        >
          <Text style={{ color: isJoined ? '#7A9B76' : 'white', fontWeight: '700' }}>
            {isJoined ? 'Joined ✓' : 'Join Activity'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  imageContainer: { width, height: 280 },
  headerImage: { width: '100%', height: '100%' },
  backButton: { position: 'absolute', top: 50, left: 20, backgroundColor: 'white', padding: 10, borderRadius: 25 },
  contentWrapper: { paddingHorizontal: 20, marginTop: -30 },
  mainCard: { backgroundColor: 'white', borderRadius: 30, padding: 25, elevation: 5 },
  title: { fontSize: 24, fontWeight: '700', color: '#4A5D47', marginBottom: 10 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  tag: { backgroundColor: '#E8F0E7', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  tagText: { color: '#7A9B76', fontSize: 12 },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#4A5D47', marginBottom: 5 },
  description: { color: '#6B7F68', lineHeight: 20 },
  grid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  gridItem: { width: '48%' },
  labelText: { color: '#8B7355', fontSize: 12, marginBottom: 4 },
  valueText: { color: '#4A5D47', fontWeight: '600' },
  organizerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingTop: 15, borderTopWidth: 1, borderTopColor: '#EEE' },
  organizerName: { fontWeight: '600', color: '#4A5D47' },
  
  footer: { 
    padding: 20, 
    backgroundColor: 'white',
    flexDirection: 'row',
    gap: 12 
  },
  calendarButton: {
    backgroundColor: '#F0EBE4',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center'
  },
  joinButton: { 
    flex: 1,
    backgroundColor: '#7A9B76', 
    paddingVertical: 16, 
    borderRadius: 16, 
    alignItems: 'center',
    justifyContent: 'center'
  }
});