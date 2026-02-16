import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  ScrollView, 
  SafeAreaView,
  ActivityIndicator,
  Alert
} from 'react-native';

import Slider from '@react-native-community/slider';
import { Leaf, CheckCircle2, LogOut } from 'lucide-react-native';
import { auth, db } from '../../firebaseConfig'; 
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { signOut } from 'firebase/auth';

// 1. Import your transaction utility
import { updateGlobalActivityCounts } from '../utils/updateAggregates';

export default function Onboarding({ onComplete }) {  
  const [socialBattery, setSocialBattery] = useState(50);
  const [physicalEnergy, setPhysicalEnergy] = useState(50);
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [loading, setLoading] = useState(false);

  const interests = [
    'Hiking', 'Board Games', 'Live Music', 'Yoga', 'Coffee Chats',
    'Rock Climbing', 'Book Clubs', 'Cooking', 'Art Galleries',
    'Running', 'Meditation', 'Dancing'
  ];

  const toggleInterest = (interest) => {
    setSelectedInterests(prev =>
      prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]
    );
  };

  const handleSaveAndContinue = async () => {
    if (!auth.currentUser) return;

    setLoading(true);
    try {
      const user = auth.currentUser;
      
      // 2. Prepare the aggregate data for a NEW user
      const activityChanges = {};
      selectedInterests.forEach(interest => {
        activityChanges[interest] = 1; 
      });

      // 3. Fire the Global Update (The Transaction)
      // We send the current values as the 'delta' because they started at 0
      await updateGlobalActivityCounts({
        activityChanges,
        socialDelta: socialBattery,
        physicalDelta: physicalEnergy,
        userCountDelta: 1 
      });

      // 4. Save the User Profile to Firestore
      await setDoc(doc(db, "profiles", user.uid), {
        name: user.displayName,
        email: user.email,
        socialBattery,
        physicalEnergy,
        interests: selectedInterests,
        onboarded: true, // Marker for App.js routing
        updatedAt: serverTimestamp(),
      }, { merge: true });

      console.log("🔥 Onboarding Complete.");

      // 5. Trigger the screen swap in App.js
      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      console.error("❌ Onboarding failed:", error);
      Alert.alert("Error", "Check your Firestore rules or internet connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.header}>
          <View style={styles.headerTitleRow}>
            <Leaf color="#7A9B76" size={32} />
            <Text style={styles.title}>Common Ground</Text>
          </View>
          <Text style={styles.subtitle}>Welcome, {auth.currentUser?.displayName?.split(' ')[0] || 'Friend'}!</Text>
        </View>

        <View style={styles.card}>
          
          <View style={styles.section}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Social Battery</Text>
              <Text style={styles.valueLabel}>{socialBattery}%</Text>
            </View>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={100}
              value={socialBattery}
              onValueChange={v => setSocialBattery(Math.floor(v))}
              minimumTrackTintColor="#7A9B76"
              thumbTintColor="#7A9B76"
            />
          </View>

          <View style={styles.section}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Physical Energy</Text>
              <Text style={styles.valueLabel}>{physicalEnergy}%</Text>
            </View>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={100}
              value={physicalEnergy}
              onValueChange={v => setPhysicalEnergy(Math.floor(v))}
              minimumTrackTintColor="#8B7355"
              thumbTintColor="#8B7355"
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Pick your interests</Text>
            <View style={styles.tagGrid}>
              {interests.map((interest) => (
                <TouchableOpacity
                  key={interest}
                  onPress={() => toggleInterest(interest)}
                  style={[styles.tag, selectedInterests.includes(interest) && styles.tagSelected]}
                >
                  <Text style={[styles.tagText, selectedInterests.includes(interest) && styles.tagTextSelected]}>
                    {interest}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity 
            style={[styles.continueButton, loading && { opacity: 0.7 }]} 
            onPress={handleSaveAndContinue}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#FFF" /> : (
              <>
                <CheckCircle2 color="#FFF" size={20} />
                <Text style={styles.primaryButtonText}>Continue to Dashboard</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.signOutButton} onPress={() => signOut(auth)}>
            <LogOut color="#8B7355" size={16} />
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F3EE' },
  scrollContent: { padding: 20, alignItems: 'center', paddingBottom: 40 },
  header: { alignItems: 'center', marginBottom: 30, marginTop: 20 },
  headerTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#4A5D47' },
  subtitle: { color: '#8B7355', fontSize: 16, marginTop: 5 },
  card: { backgroundColor: '#FFF', borderRadius: 30, padding: 25, width: '100%', maxWidth: 500, elevation: 3 },
  section: { marginBottom: 25 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  label: { fontSize: 16, fontWeight: 'bold', color: '#4A5D47' },
  valueLabel: { color: '#8B7355', fontWeight: 'bold' },
  slider: { width: '100%', height: 40 },
  tagGrid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 10 },
  tag: { backgroundColor: '#F5F3EE', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, margin: 4 },
  tagSelected: { backgroundColor: '#7A9B76' },
  tagText: { color: '#4A5D47', fontSize: 13 },
  tagTextSelected: { color: '#FFF', fontWeight: 'bold' },
  continueButton: { backgroundColor: '#4A5D47', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, borderRadius: 20, gap: 10, marginTop: 10 },
  primaryButtonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  signOutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 20, gap: 8 },
  signOutText: { color: '#8B7355', fontSize: 14, fontWeight: '500', textDecorationLine: 'underline' },
});