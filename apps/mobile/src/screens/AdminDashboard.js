import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, SafeAreaView } from 'react-native';
import { Shield, LogOut } from 'lucide-react-native';
import { auth, db } from '../../firebaseConfig';
import { signOut } from 'firebase/auth';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';

export default function AdminDashboard({ navigation }) {
  const [stats, setStats] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const statsRef = doc(db, 'stats', 'global_activity_counts');
      const statsSnap = await getDoc(statsRef);
      
      let flattenedStats = [];
      if (statsSnap.exists()) {
        const data = statsSnap.data();
        
        Object.entries(data).forEach(([key, value]) => {
          if (typeof value === 'object' && value !== null) {
            Object.entries(value).forEach(([subKey, subValue]) => {
              flattenedStats.push({ label: `${key} → ${subKey}`, value: subValue });
            });
          } else {
            flattenedStats.push({ label: key, value: value });
          }
        });
        
        flattenedStats.sort((a, b) => a.label.localeCompare(b.label));
      }
      setStats(flattenedStats);

      const profilesRef = collection(db, 'profiles');
      const q = query(profilesRef, where("isAdmin", "==", true));
      const adminSnap = await getDocs(q);
      
      const adminList = adminSnap.docs.map(doc => doc.data());
      setAdmins(adminList);

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
  };

  if (loading) return <ActivityIndicator color="#8B7355" style={{ flex: 1, backgroundColor: '#F5F3EE' }} />;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <Shield size={28} color="#8B7355" />
          <Text style={styles.headerBrand}>Global Stats</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleSignOut}>
          <LogOut size={20} color="#FF4444" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Global Stats Table */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Aggregated Data</Text>
          <View style={styles.tableHeader}>
            <Text style={styles.tableHeaderText}>Metric</Text>
            <Text style={styles.tableHeaderText}>Value</Text>
          </View>
          {stats.map((stat, index) => (
            <View key={index} style={[styles.tableRow, index % 2 === 0 && styles.tableRowAlt]}>
              <Text style={styles.tableCellLabel}>{stat.label}</Text>
              <Text style={styles.tableCellValue}>{stat.value}</Text>
            </View>
          ))}
          {stats.length === 0 && <Text style={styles.emptyText}>No stats found.</Text>}
        </View>

        {/* Admins List */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Authorized Admins</Text>
          {admins.map((admin, index) => (
            <View key={index} style={styles.adminRow}>
              <Text style={styles.adminName}>{admin.name || 'Unnamed Admin'}</Text>
              <Text style={styles.adminEmail}>{admin.email}</Text>
            </View>
          ))}
          {admins.length === 0 && <Text style={styles.emptyText}>No admins found.</Text>}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F3EE' },
  header: { backgroundColor: '#FFF', padding: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', elevation: 2 },
  headerTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerBrand: { fontSize: 24, color: '#8B7355', fontWeight: 'bold' },
  logoutButton: { padding: 8 },
  scrollContent: { padding: 20 },
  card: { backgroundColor: '#FFF', borderRadius: 20, padding: 20, marginBottom: 20, elevation: 3 },
  cardTitle: { fontSize: 18, color: '#4A5D47', fontWeight: 'bold', marginBottom: 15 },
  tableHeader: { flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 2, borderBottomColor: '#E8F0E7', paddingBottom: 10, marginBottom: 5 },
  tableHeaderText: { fontWeight: 'bold', color: '#8B7355' },
  tableRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F5F3EE' },
  tableRowAlt: { backgroundColor: '#FAFAFA' },
  tableCellLabel: { color: '#6B7F68', flex: 2 },
  tableCellValue: { color: '#4A5D47', fontWeight: 'bold', flex: 1, textAlign: 'right' },
  adminRow: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F5F3EE' },
  adminName: { fontSize: 16, fontWeight: '600', color: '#4A5D47' },
  adminEmail: { fontSize: 14, color: '#8B7355', marginTop: 2 },
  emptyText: { color: '#C0B7A6', fontStyle: 'italic', textAlign: 'center', padding: 20 }
});