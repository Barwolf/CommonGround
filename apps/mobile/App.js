import React, { useEffect, useState } from 'react';
import { auth, db } from './firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import Onboarding from './src/screens/Onboarding';
import Dashboard from './src/screens/Dashboard';

export default function App() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        const docRef = doc(db, "profiles", authUser.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setProfile(docSnap.data());
        }
        setUser(authUser);
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const handleOnboardingComplete = (newProfile) => {
    setProfile(newProfile);
  };

  if (loading) return null; 

  return user && profile ? (
    <Dashboard profile={profile} /> 
  ) : (
    <Onboarding onComplete={handleOnboardingComplete} />
  );
}