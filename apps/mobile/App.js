import auth from '@react-native-firebase/auth';
import { useState, useEffect } from 'react';

// Screens
import Onboarding from './src/screens/Onboarding';
import Dashboard from './src/screens/Dashboard';


export default function App() {
  const [user, setUser] = useState();

  useEffect(() => {
    // This "reflex" triggers whenever someone logs in or out
    const subscriber = auth().onAuthStateChanged((user) => {
      setUser(user); 
    });
    return subscriber; // Unsubscribe on unmount
  }, []);

  if (!user) return <Onboarding />;
  return <Dashboard user={user} />;
}
