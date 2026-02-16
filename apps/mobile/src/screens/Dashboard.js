import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import { getRecommendations } from '../utils/recommendations';

export default function Dashboard({ profile }) {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile) {
      loadPlaces();
    }
  }, [profile]);

  const loadPlaces = async () => {
    try {
      const data = await getRecommendations(profile);
      setPlaces(data);
    } catch (err) {
      console.log("Failed to load recommendations");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <ActivityIndicator color="#7A9B76" style={{marginTop: 50}} />;

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#4A5D47' }}>
        Recommended for You
      </Text>
      
      <FlatList
        data={places}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={{ padding: 15, backgroundColor: '#FFF', borderRadius: 15, marginVertical: 8 }}>
            <Text style={{ fontWeight: 'bold' }}>{item.name}</Text>
            <Text style={{ color: '#8B7355' }}>Match Score: {Math.round(item.score * 100)}%</Text>
          </View>
        )}
      />
    </View>
  );
}