import React, { useState, useCallback } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Leaf, LogIn, Shield } from 'lucide-react-native'; 
import { auth } from '../../firebaseConfig';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { useFocusEffect } from '@react-navigation/native'; // NEW IMPORT

export let globalAuthError = null;
export const setGlobalAuthError = (msg) => { globalAuthError = msg; };

export default function AuthScreen({ navigation }) {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  useFocusEffect(
    useCallback(() => {
      if (globalAuthError) {
        setErrorMessage(globalAuthError);
        setGlobalAuthError(null);
      }
    }, [])
  );

  const handleGoogleAuth = async () => {
    setLoading(true);
    setErrorMessage(null);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Google Auth Error:", error);
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Leaf color="#7A9B76" size={80} />
        <Text style={styles.title}>Common Ground</Text>
        <Text style={styles.subtitle}>Find your people, your way.</Text>
      </View>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.primaryButton, loading && { opacity: 0.7 }]} 
          onPress={handleGoogleAuth}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <>
              <LogIn color="#FFF" size={20} />
              <Text style={styles.primaryButtonText}>Continue with Google</Text>
            </>
          )}
        </TouchableOpacity>

        <Text style={styles.footerText}>
          By continuing, you agree to touch grass.
        </Text>
      </View>

      {/* Floating Admin Section */}
      <View style={styles.adminContainer}>
        <TouchableOpacity 
          style={styles.adminButton}
          onPress={() => navigation.navigate('AdminAuth')}
          activeOpacity={0.8}
        >
          <Shield color="#8B7355" size={24} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F5F3EE', 
    alignItems: 'center', 
    justifyContent: 'space-around', 
    paddingHorizontal: 30 
  },
  logoContainer: { 
    alignItems: 'center',
    marginTop: 60 
  },
  title: { 
    fontSize: 42, 
    fontWeight: 'bold', 
    color: '#4A5D47', 
    marginTop: 15,
    letterSpacing: -1 
  },
  subtitle: { 
    fontSize: 18, 
    color: '#8B7355', 
    marginTop: 5 
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 40
  },
  primaryButton: { 
    width: '100%', 
    backgroundColor: '#4A5D47', 
    flexDirection: 'row',
    padding: 18, 
    borderRadius: 20, 
    alignItems: 'center', 
    justifyContent: 'center',
    gap: 12,
    elevation: 4, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.15, 
    shadowRadius: 12 
  },
  primaryButtonText: { 
    color: '#FFF', 
    fontWeight: 'bold', 
    fontSize: 16 
  },
  footerText: { 
    color: '#C0B7A6', 
    fontSize: 12, 
    textAlign: 'center',
    marginTop: 20
  },
  // Container to hold the text and button together
  adminContainer: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  adminWarningText: {
    color: '#FF4444', // Red warning color
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'right',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  adminButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E8F0E7', 
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  }
});