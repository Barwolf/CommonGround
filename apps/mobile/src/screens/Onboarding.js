import React, { useState } from 'react';
import { 
  StyleSheet, Text, View, TouchableOpacity, 
  TextInput, ActivityIndicator, Alert 
} from 'react-native';
import Slider from '@react-native-community/slider';

// 1. Modular Imports (The 2026 Standard)
import { getAuth, createUserWithEmailAndPassword } from '@react-native-firebase/auth';
import { getFirestore, doc, setDoc, serverTimestamp } from '@react-native-firebase/firestore';

export default function Onboarding({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [socialBattery, setSocialBattery] = useState(50);
  const [physicalEnergy, setPhysicalEnergy] = useState(50);
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    if (!email || !password) {
      Alert.alert("Missing Info", "Please provide an email and password.");
      return;
    }

    setLoading(true);

    // 2. Initialize the specific service instances
    const auth = getAuth(); 
    const db = getFirestore();

    try {
      // 3. Create account
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;

      // 4. Save Personal Model to Firestore
      await setDoc(doc(db, "users", uid), {
        socialBattery: socialBattery,
        physicalEnergy: physicalEnergy,
        lastUpdated: serverTimestamp(),
      });

      console.log("🚀 Everything saved successfully!");
    } catch (error) {
      console.error("Signup Error:", error.message);
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Common Ground 🌿</Text>
      
      <View style={styles.inputGroup}>
        <TextInput 
          style={styles.input} placeholder="Email"
          value={email} onChangeText={setEmail} autoCapitalize="none"
        />
        <TextInput 
          style={styles.input} placeholder="Password"
          value={password} onChangeText={setPassword} secureTextEntry
        />
      </View>

      <View style={styles.sliderContainer}>
        <Text style={styles.label}>Social Battery: {socialBattery}%</Text>
        <Slider
          style={styles.slider} minimumValue={0} maximumValue={100} step={10}
          value={socialBattery} onValueChange={setSocialBattery}
          minimumTrackTintColor="#2D5A27" 
        />
      </View>

      <View style={styles.sliderContainer}>
        <Text style={styles.label}>Physical Energy: {physicalEnergy}%</Text>
        <Slider
          style={styles.slider} minimumValue={0} maximumValue={100} step={10}
          value={physicalEnergy} onValueChange={setPhysicalEnergy}
          minimumTrackTintColor="#2D5A27"
        />
      </View>

      <TouchableOpacity 
        style={[styles.button, loading && { opacity: 0.7 }]} 
        onPress={handleSignUp}
        disabled={loading}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Join the Community</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9F7F2', padding: 25, justifyContent: 'center' },
  title: { fontSize: 32, fontWeight: 'bold', color: '#2D5A27', textAlign: 'center', marginBottom: 40 },
  inputGroup: { marginBottom: 20 },
  input: { backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 10, borderWidth: 1, borderColor: '#DDD' },
  sliderContainer: { marginBottom: 25 },
  label: { fontSize: 18, fontWeight: '600' },
  slider: { width: '100%', height: 40 },
  button: { backgroundColor: '#2D5A27', padding: 18, borderRadius: 12, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});