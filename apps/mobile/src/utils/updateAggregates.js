import { doc, setDoc, increment } from 'firebase/firestore';
import { db } from '../../firebaseConfig'; 

export const updateGlobalActivityCounts = async (userChanges) => {
  const statsRef = doc(db, 'stats', 'global_activity_counts');
  const updates = {};

  Object.keys(userChanges).forEach((activity) => {
      const changeAmount = userChanges[activity];

      const cleanKey = activity.replace(/\s+/g, '').replace(/^(.)/, (c) => c.toLowerCase());
      
      updates[`aggregatedActivities.${cleanKey}`] = increment(changeAmount);
  });

  await setDoc(statsRef, updates, { merge: true });
};