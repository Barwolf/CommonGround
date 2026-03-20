import React from 'react';
import { View, StyleSheet } from 'react-native';

export default function Map({ activity }) {
  // We use the latitude and longitude from your dummy data
  const mapUrl = `https://maps.google.com/maps?q=${activity.lat},${activity.lng}&z=15&output=embed`;

  return (
    <View style={styles.container}>
      <iframe
        title="map"
        width="100%"
        height="100%"
        style={{ border: 0, borderRadius: 15 }}
        src={mapUrl}
        allowFullScreen
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
    borderRadius: 15,
    backgroundColor: '#E8F0E7',
  },
});