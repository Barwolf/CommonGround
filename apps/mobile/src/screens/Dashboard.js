import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, TouchableOpacity, SafeAreaView, Modal } from 'react-native';
import { Leaf, LogOut } from 'lucide-react-native';
import { getAuth, signOut } from 'firebase/auth';
import { getRecommendations } from '../utils/recommendations';
import ActivityCard from '../components/ActivityCard';

export default function Dashboard({ profile }) {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [menuVisible, setMenuVisible] = useState(false);
  const auth = getAuth();

  useEffect(() => { if (profile) loadPlaces(); }, [profile]);

  const loadPlaces = async () => {
    try {
      const data = await getRecommendations(profile);
      setPlaces(data);
    } catch (err) { console.error(err); } 
    finally { setLoading(false); }
  };

  if (loading) return <ActivityIndicator color="#7A9B76" style={{ flex: 1 }} />;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <Leaf size={28} color="#7A9B76" />
          <Text style={styles.headerBrand}>Common Ground</Text>
        </View>
        <TouchableOpacity style={styles.profileCircle} onPress={() => setMenuVisible(true)}>
          <Text style={styles.profileInitials}>{profile?.email?.substring(0, 2).toUpperCase()}</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={menuVisible} transparent animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setMenuVisible(false)}>
          <View style={styles.dropdown}>
            <TouchableOpacity style={styles.logoutButton} onPress={() => signOut(auth)}>
              <LogOut size={18} color="#FF4444" />
              <Text style={styles.logoutText}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <FlatList
        data={places}
        keyExtractor={(item) => item.geohash}
        renderItem={({ item }) => <ActivityCard {...item} />}
        contentContainerStyle={{ padding: 20 }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F3EE' },
  header: { backgroundColor: '#FFF', padding: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', elevation: 2 },
  headerTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerBrand: { fontSize: 24, color: '#4A5D47', fontWeight: '500' },
  profileCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#E8F0E7', alignItems: 'center', justifyContent: 'center' },
  profileInitials: { color: '#4A5D47', fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.1)' },
  dropdown: { position: 'absolute', top: 90, right: 20, backgroundColor: 'white', padding: 15, borderRadius: 12, elevation: 5 },
  logoutButton: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoutText: { color: '#FF4444', fontWeight: '600' }
});