import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';

// 2026 MODULAR SDK
import { getAuth, createUserWithEmailAndPassword } from '@react-native-firebase/auth';
import { getFirestore, doc, setDoc, addDoc, serverTimestamp, collection } from '@react-native-firebase/firestore';

export default function Onboarding() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
  const testConnection = async () => {
    try {
      const db = getFirestore();
      await addDoc(collection(db, "profiles"), { time: new Date() });
      console.log("🚀 CLOUD CONNECTION VERIFIED!");
    } catch (e) {
      console.log("❌ CLOUD FAILED:", e.message);
    }
  };
  testConnection();
}, []);

  const handleSignUp = async () => {
    if (!email || !password) return Alert.alert("Error", "Enter email/pass");

    setLoading(true);
    const auth = getAuth();
    const db = getFirestore();

    try {
      // 1. Create the User
      console.log("Creating user...");
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;
      console.log("✅ User Created! UID:", uid);

      // 2. The Push with a Timeout
      console.log("⏳ Attempting push to 'profiles'...");
      
      const pushPromise = setDoc(doc(db, "profiles", uid), {
        email: email,
        status: "Active",
        lastUpdated: serverTimestamp(),
      });

      // If the server doesn't respond in 5s, we catch it
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Server Timeout: Check your Internet/Rules")), 5000)
      );

      await Promise.race([pushPromise, timeoutPromise]);

      console.log("🔥 SUCCESS: Document is in Firestore!");
      Alert.alert("Success!", "Account created and data pushed.");

    } catch (error) {
      console.log("❌ ERROR:", error.code || "TIMEOUT", error.message);
      Alert.alert("Fail", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Common Ground Onboarding 🌿</Text>
      <TextInput 
        style={styles.input} placeholder="Email"
        onChangeText={setEmail} autoCapitalize="none"
      />
      <TextInput 
        style={styles.input} placeholder="Password"
        onChangeText={setPassword} secureTextEntry
      />
      <TouchableOpacity 
        style={[styles.button, loading && { opacity: 0.5 }]} 
        onPress={handleSignUp} 
        disabled={loading}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Join Community</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 30, justifyContent: 'center', backgroundColor: '#F9F7F2' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', color: '#2D5A27' },
  input: { backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 10, borderWidth: 1, borderColor: '#DDD' },
  button: { backgroundColor: '#2D5A27', padding: 15, borderRadius: 10, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold' }
});