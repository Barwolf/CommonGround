import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { ShieldCheck } from 'lucide-react-native';
import { auth, db } from '../../firebaseConfig';
import { signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { setGlobalAuthError } from './AuthScreen';

// 1. Export a tracker so App.js knows an admin login is happening
export const adminAuthTracker = { isChecking: false };

export default function AdminAuthScreen({ navigation }) {
  const [loading, setLoading] = useState(false);

  const handleAdminAuth = async () => {
    setLoading(true);
    adminAuthTracker.isChecking = true; // Flag the start of an admin login
    
    const provider = new GoogleAuthProvider();
    
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const userDocRef = doc(db, 'profiles', user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists() || userDoc.data().isAdmin !== true) {
        setGlobalAuthError("Authorized\nPersonnel Only");
        await signOut(auth); 
        
        navigation.navigate('Auth');
      }
      
    } catch (error) {
      console.error("Admin Auth Error:", error);
      setGlobalAuthError("Login\nFailed");
      await signOut(auth);
      navigation.navigate('Auth');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <ShieldCheck color="#8B7355" size={80} />
        <Text style={styles.title}>Admin Portal</Text>
      </View>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.primaryButton, loading && { opacity: 0.7 }]} 
          onPress={handleAdminAuth}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.primaryButtonText}>Admin Login with Google</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Auth')} style={styles.backButton}>
           <Text style={styles.backText}>Return to User Login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F3EE', alignItems: 'center', justifyContent: 'space-around', paddingHorizontal: 30 },
  logoContainer: { alignItems: 'center', marginTop: 60 },
  title: { fontSize: 36, fontWeight: 'bold', color: '#8B7355', marginTop: 15, letterSpacing: -1 },
  subtitle: { fontSize: 16, color: '#C0B7A6', marginTop: 5 },
  buttonContainer: { width: '100%', alignItems: 'center', marginBottom: 40 },
  primaryButton: { width: '100%', backgroundColor: '#8B7355', padding: 18, borderRadius: 20, alignItems: 'center', justifyContent: 'center', elevation: 4 },
  primaryButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  backButton: { marginTop: 20 },
  backText: { color: '#8B7355', textDecorationLine: 'underline' }
});