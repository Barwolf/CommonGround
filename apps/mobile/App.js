import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { auth, db } from './firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

// Screens
import AuthScreen from './src/screens/AuthScreen';
import Onboarding from './src/screens/Onboarding';
import Dashboard from './src/screens/Dashboard';
import ActivityDetail from './src/screens/ActivityDetail'; 

const Stack = createNativeStackNavigator();

export default function App() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (uid) => {
    const docRef = doc(db, "profiles", uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      setProfile(docSnap.data());
    } else {
      setProfile(null);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        setUser(authUser);
        await fetchProfile(authUser.uid);
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  if (loading) return null;

  // --- NAVIGATION FLOWS ---

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          // 1. Auth Flow
          <Stack.Screen name="Auth" component={AuthScreen} />
        ) : !profile ? (
          // 2. Onboarding Flow
          <Stack.Screen name="Onboarding">
            {(props) => <Onboarding {...props} onComplete={() => fetchProfile(user.uid)} />}
          </Stack.Screen>
        ) : (
          // 3. Main App Flow
          <>
            <Stack.Screen name="Home">
              {(props) => <Dashboard {...props} profile={profile} />}
            </Stack.Screen>
            <Stack.Screen 
              name="Details" 
              component={ActivityDetail} 
              options={{ animation: 'slide_from_bottom' }} // Optional: cool transition
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}