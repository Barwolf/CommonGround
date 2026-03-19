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
import AdminDashboard from './src/screens/AdminDashboard';
import AdminAuthScreen, { adminAuthTracker } from './src/screens/AdminAuthScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdminSession, setIsAdminSession] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        const docRef = doc(db, "profiles", authUser.uid);
        const docSnap = await getDoc(docRef);
        const profileData = docSnap.exists() ? docSnap.data() : null;

        if (adminAuthTracker.isChecking && !profileData?.isAdmin) {
          return; 
        }

        setIsAdminSession(adminAuthTracker.isChecking);

        if (adminAuthTracker.isChecking) {
          adminAuthTracker.isChecking = false;
        }

        setProfile(profileData);
        setUser(authUser);
      } else {
        setUser(null);
        setProfile(null);
        setIsAdminSession(false); 
        adminAuthTracker.isChecking = false;
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  if (loading) return null;

  const showAdminDashboard = !!profile?.isAdmin && isAdminSession;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <>
            <Stack.Screen name="Auth" component={AuthScreen} />
            <Stack.Screen name="AdminAuth" component={AdminAuthScreen} />
          </>
        ) : showAdminDashboard ? (
          <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
        ) : !profile?.onboarded ? (
          <Stack.Screen name="Onboarding">
            {(props) => <Onboarding {...props} onComplete={async () => {
               const docRef = doc(db, "profiles", user.uid);
               const docSnap = await getDoc(docRef);
               setProfile(docSnap.data());
            }} />}
          </Stack.Screen>
        ) : (
          <>
            <Stack.Screen name="Home">
              {(props) => <Dashboard {...props} profile={profile} />}
            </Stack.Screen>
            <Stack.Screen 
              name="Details" 
              component={ActivityDetail} 
              options={{ animation: 'slide_from_bottom' }} 
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}