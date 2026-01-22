import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';

// This will be native for iOS and Android
// https://docs.expo.dev/versions/latest/sdk/slider/
// Should I use this or make a custom one?
import Slider from '@react-native-community/slider';

export default function Onboarding({ navigation }) {
  const [socialBattery, setSocialBattery] = useState(50);
  const [physicalEnergy, setPhysicalEnergy] = useState(50);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Common Ground 🌿</Text>
      <Text style={styles.subtitle}>Find your people, your way.</Text>

      {/* Social Battery Slider */}
      <View style={styles.sliderContainer}>
        <Text style={styles.label}>Social Battery: {socialBattery}%</Text>
        <Text style={styles.description}>
          {socialBattery < 30 ? "Feeling a bit introverted" : socialBattery > 70 ? "Ready for a Crowd!" : "Balanced"}
        </Text>
        <Slider
          style={{ width: '100%', height: 40 }}
          minimumValue={0}
          maximumValue={100}
          step={10}
          value={socialBattery}
          onValueChange={setSocialBattery}
          minimumTrackTintColor="#2D5A27" 
        />
      </View>

      {/* Physical Energy Slider */}
      <View style={styles.sliderContainer}>
        <Text style={styles.label}>Physical Energy: {physicalEnergy}%</Text>
        <Text style={styles.description}>
          {physicalEnergy < 30 ? "Feeling a bit tired" : physicalEnergy > 70 ? "Ready to go!" : "Balanced"}
        </Text>
        <Slider
          style={{ width: '100%', height: 40 }}
          minimumValue={0}
          maximumValue={100}
          step={10}
          value={physicalEnergy}
          onValueChange={setPhysicalEnergy}
          minimumTrackTintColor="#2D5A27"
        />
      </View>

      <TouchableOpacity 
        style={styles.button} 
        onPress={() => alert('Preferences Saved!')}
      >
        <Text style={styles.buttonText}>Start Touching Grass</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9F7F2', padding: 20, justifyContent: 'center' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#2D5A27', marginBottom: 10, textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#666', marginBottom: 40, textAlign: 'center' },
  sliderContainer: { marginBottom: 30 },
  label: { fontSize: 18, fontWeight: '600', marginBottom: 5 },
  description: { fontSize: 14, color: '#888', marginBottom: 10 },
  button: { backgroundColor: '#2D5A27', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 20 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});