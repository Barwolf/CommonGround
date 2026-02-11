import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  ScrollView, 
  SafeAreaView,
  Dimensions,
  Alert
} from 'react-native';

// 1. Web-compatible Slider and Lucide imports
import Slider from '@react-native-community/slider';
import { Leaf, Calendar } from 'lucide-react-native';

// 2. Import your new web-configured Firebase
import { auth, db } from '../../firebaseConfig'; 
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

// Add signInWithPopup and GoogleAuthProvider
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

import { updateGlobalActivityCounts } from '../utils/updateAggregates';

const { width } = Dimensions.get('window');

export default function Onboarding() {
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
      prev.includes(interest)
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    setLoading(true); // Start a loading spinner so they know it's working
    
    try {
      // 1. Trigger the Google Login
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      console.log("✅ Signed in as:", user.displayName);

      // Update the aggregate counts for the selected interests
      const userSnap = await getDoc(userRef);
      let oldInterests = [];
      
      if (userSnap.exists()) {
        const data = userSnap.data();
        oldInterests = data.interests || [];
      }

      const updatesForStats = {};

      // A. Find items to INCREMENT (+1)
      selectedInterests.forEach(interest => {
        if (!oldInterests.includes(interest)) {
          updatesForStats[interest] = 1;
        }
      });

      // B. Find items to DECREMENT (-1)
      oldInterests.forEach(interest => {
        if (!selectedInterests.includes(interest)) {
          updatesForStats[interest] = -1;
        }
      });

      // Update Global Stats (only if there are actual changes)
      if (Object.keys(updatesForStats).length > 0) {
        await updateGlobalActivityCounts(updatesForStats);
      }

      await setDoc(doc(db, "profiles", user.uid), {
        name: user.displayName,
        email: user.email,
        socialBattery,
        physicalEnergy,
        interests: selectedInterests,
        updatedAt: serverTimestamp(),
      });

      console.log("🔥 Profile auto-saved to Firestore!");
      Alert.alert("All set!", `Welcome ${user.displayName}, your profile is saved.`);
      
    } catch (error) {
      console.error("❌ Process failed:", error);
      Alert.alert("Error", "Something went wrong during sign-in or saving.");
    } finally {
      setLoading(false);
    }
  };

  const getSocialLabel = (value) => {
    if (value < 33) return 'Introverted/Solo';
    if (value > 66) return 'Extroverted/Group';
    return 'Flexible';
  };

  const getEnergyLabel = (value) => {
    if (value < 33) return 'Low Impact';
    if (value > 66) return 'High Intensity';
    return 'Moderate';
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTitleRow}>
            <Leaf color="#7A9B76" size={32} />
            <Text style={styles.title}>Common Ground</Text>
          </View>
          <Text style={styles.subtitle}>Find your people, your way</Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          
          {/* Social Battery */}
          <View style={styles.section}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Social Battery</Text>
              <View style={styles.badgeGreen}>
                <Text style={styles.badgeTextGreen}>{getSocialLabel(socialBattery)}</Text>
              </View>
            </View>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={100}
              value={socialBattery}
              onValueChange={v => setSocialBattery(Math.floor(v))}
              minimumTrackTintColor="#7A9B76"
              maximumTrackTintColor="#E8F0E7"
              thumbTintColor="#7A9B76"
            />
          </View>

          {/* Physical Energy */}
          <View style={styles.section}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Physical Energy</Text>
              <View style={styles.badgeBrown}>
                <Text style={styles.badgeTextBrown}>{getEnergyLabel(physicalEnergy)}</Text>
              </View>
            </View>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={100}
              value={physicalEnergy}
              onValueChange={v => setPhysicalEnergy(Math.floor(v))}
              minimumTrackTintColor="#8B7355"
              maximumTrackTintColor="#F0EBE4"
              thumbTintColor="#8B7355"
            />
          </View>

          {/* Interests */}
          <View style={styles.section}>
            <Text style={styles.label}>What sounds fun?</Text>
            <View style={styles.tagGrid}>
              {interests.map((interest) => (
                <TouchableOpacity
                  key={interest}
                  onPress={() => toggleInterest(interest)}
                  style={[
                    styles.tag,
                    selectedInterests.includes(interest) && styles.tagSelected
                  ]}
                >
                  <Text style={[
                    styles.tagText,
                    selectedInterests.includes(interest) && styles.tagTextSelected
                  ]}>
                    {interest}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

{/* Only show the button if they aren't logged in yet */}
{ !auth.currentUser ? (
  <TouchableOpacity 
    style={[styles.primaryButton, loading && { opacity: 0.7 }]} 
    onPress={handleGoogleSignIn}
    disabled={loading}
  >
    <Text style={styles.primaryButtonText}>
      {loading ? "Saving Profile..." : "Sign in with Google"}
    </Text>
  </TouchableOpacity>
) : (
  <View style={styles.section}>
    <Text style={styles.label}>✅ Profile Linked to {auth.currentUser.displayName}</Text>
  </View>
)}

          <TouchableOpacity>
            <Text style={styles.skipText}>Skip for now</Text>
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
  title: { fontSize: 28, fontWeight: 'bold', color: '#4A5D47' },
  subtitle: { color: '#8B7355', fontSize: 14 },
  card: { backgroundColor: '#FFF', borderRadius: 30, padding: 25, width: '100%', elevation: 3 },
  section: { marginBottom: 30 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  label: { fontSize: 15, fontWeight: 'bold', color: '#4A5D47' },
  badgeGreen: { backgroundColor: '#E8F0E7', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeTextGreen: { color: '#7A9B76', fontSize: 11, fontWeight: 'bold' },
  badgeBrown: { backgroundColor: '#F0EBE4', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeTextBrown: { color: '#8B7355', fontSize: 11, fontWeight: 'bold' },
  slider: { width: '100%', height: 40 },
  tagGrid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -5 },
  tag: { backgroundColor: '#F5F3EE', paddingHorizontal: 10, paddingVertical: 12, borderRadius: 15, margin: 5, width: (width - 120) / 3, alignItems: 'center' },
  tagSelected: { backgroundColor: '#7A9B76' },
  tagText: { fontSize: 12, color: '#4A5D47' },
  tagTextSelected: { color: '#FFF' },
  primaryButton: { backgroundColor: '#4A5D47', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 15, borderRadius: 20, gap: 10, marginBottom: 15 },
  primaryButtonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  skipText: { textAlign: 'center', color: '#8B7355' }
});