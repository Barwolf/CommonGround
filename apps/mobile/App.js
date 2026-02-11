import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
// IMPORTANT: Use the web SDK import for onAuthStateChanged
import { onAuthStateChanged } from 'firebase/auth'; 
import { auth } from './firebaseConfig'; 
import Onboarding from './src/screens/Onboarding';

export default function App() {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    // This listener is safe because it only runs after the component is ready
    const unsubscribe = onAuthStateChanged(auth, (authUser) => {
      setUser(authUser);
      if (initializing) setInitializing(false);
    });

    return unsubscribe; // cleanup
  }, []);

  if (initializing) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#7A9B76" />
      </View>
    );
  }

  return <Onboarding />;
}