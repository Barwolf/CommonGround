import React, { useEffect, useState } from 'react';
import { auth, db } from './firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

// Your screen imports
import AuthScreen from './src/screens/AuthScreen';
import Onboarding from './src/screens/Onboarding';
import Dashboard from './src/screens/Dashboard';

export default function App() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // This function fetches the profile and updates the state
const fetchProfile = async (uid) => {
    console.log("🔍 Checking Firestore for UID:", uid); // Add this
    const docRef = doc(db, "profiles", uid);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      console.log("✅ Profile found:", docSnap.data()); // Add this
      setProfile(docSnap.data());
    } else {
      console.log("❌ No profile found in Firestore."); // Add this
      setProfile(null);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        setUser(authUser);
        await fetchProfile(authUser.uid); // Check on load
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  if (loading) return null;

  // 1. If not logged in -> AuthScreen
  if (!user) return <AuthScreen />;

  // 2. If logged in but NO profile -> Onboarding
  // We pass fetchProfile so that when 'Continue' is clicked, it re-runs the check
  if (user && !profile) {
    return <Onboarding onComplete={() => fetchProfile(user.uid)} />;
  }

  // 3. If logged in AND has profile -> Dashboard
  return <Dashboard profile={profile} />;
}