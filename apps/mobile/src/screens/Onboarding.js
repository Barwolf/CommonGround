import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  ScrollView, 
  SafeAreaView,
  Dimensions,
  ActivityIndicator,
  Alert
} from 'react-native';

import Slider from '@react-native-community/slider';
import { Leaf, CheckCircle2, LogOut } from 'lucide-react-native';
import { auth, db } from '../../firebaseConfig'; 
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { signOut } from 'firebase/auth';

// Your aggregation utility
import { updateGlobalActivityCounts } from '../utils/updateAggregates';

const { width } = Dimensions.get('window');

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
    const user = auth.currentUser;
    if (!user) return;

    setLoading(true);

    try {
      const userRef = doc(db, "profiles", user.uid);
      
      // 1. Fetch existing data to calculate the "Delta"
      const userSnap = await getDoc(userRef);
      
      let oldInterests = [];
      let oldSocial = 0;
      let oldPhysical = 0;
      let isNewUser = true;

      if (userSnap.exists()) {
        const data = userSnap.data();
        oldInterests = data.interests || [];
        oldSocial = data.socialBattery || 0; 
        oldPhysical = data.physicalEnergy || 0;
        isNewUser = false;
      }

      // 2. Calculate changes for interests (+1 for new, -1 for removed)
      const updatesForStats = {};
      selectedInterests.forEach(interest => {
        if (!oldInterests.includes(interest)) updatesForStats[interest] = 1;
      });
      oldInterests.forEach(interest => {
        if (!selectedInterests.includes(interest)) updatesForStats[interest] = -1;
      });

      // 3. Calculate value differences for sliders
      const socialDelta = socialBattery - oldSocial;
      const physicalDelta = physicalEnergy - oldPhysical;
      const userCountDelta = isNewUser ? 1 : 0;

      // 4. Update Global Aggregates safely via your Transaction utility
      await updateGlobalActivityCounts({
        activityChanges: updatesForStats,
        socialDelta,
        physicalDelta,
        userCountDelta
      });

      // 5. Prepare the new profile data
      const newProfileData = {
        name: user.displayName,
        email: user.email,
        socialBattery,
        physicalEnergy,
        interests: selectedInterests,
        updatedAt: serverTimestamp(),
      };

      // 6. Save to Firestore and move to Dashboard
      await setDoc(userRef, newProfileData, { merge: true });

      console.log("🔥 Profile and global stats synced.");

      if (onComplete) {
        onComplete(newProfileData);
      }
    } catch (error) {
      console.error("❌ Process failed:", error);
      Alert.alert("Error", "Something went wrong during saving.");
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
          
          {/* Social Battery Section */}
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

          {/* Physical Energy Section */}
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

          {/* Interests Grid */}
          <View style={styles.section}>
            <Text style={styles.label}>Interests</Text>
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

          {/* Action Button */}
          <TouchableOpacity 
            style={[styles.continueButton, loading && { opacity: 0.7 }]} 
            onPress={handleSaveAndContinue}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#FFF" /> : (
              <>
                <CheckCircle2 color="#FFF" size={20} />
                <Text style={styles.primaryButtonText}>Finish & Continue</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.signOutButton} onPress={() => signOut(auth)}>
            <LogOut color="#8B7355" size={16} />
            <Text style={styles.signOutText}>Not you? Sign Out</Text>
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