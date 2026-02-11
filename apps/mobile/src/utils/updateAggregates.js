import { doc, runTransaction } from 'firebase/firestore';
import { db } from '../../firebaseConfig'; 

export const updateGlobalActivityCounts = async ({ 
  activityChanges, 
  socialDelta, 
  physicalDelta, 
  userCountDelta 
}) => {
  const statsRef = doc(db, 'stats', 'global_activity_counts');

  try {
    await runTransaction(db, async (transaction) => {
      const statsDoc = await transaction.get(statsRef);
      const currentData = statsDoc.exists() ? statsDoc.data() : {};
      
      const currentActivities = currentData.aggregatedActivities || {};
      const updatedActivities = { ...currentActivities };

      if (activityChanges) {
          Object.keys(activityChanges).forEach((activity) => {
              const change = activityChanges[activity];
              const cleanKey = activity.replace(/\s+/g, '').replace(/^(.)/, (c) => c.toLowerCase());
              
              const currentCount = updatedActivities[cleanKey] || 0;
              const newTotal = currentCount + change;
              updatedActivities[cleanKey] = newTotal < 0 ? 0 : newTotal;
          });
      }

      const currentSocialSum = currentData.socialSum || 0;
      const currentPhysicalSum = currentData.physicalSum || 0;
      const currentUserCount = currentData.totalUsers || 0;

      let newSocialSum = currentSocialSum + socialDelta;
      let newPhysicalSum = currentPhysicalSum + physicalDelta;
      let newUserCount = currentUserCount + userCountDelta;

      if (newUserCount <= 0) {
        newUserCount = 0;
        newSocialSum = 0;
        newPhysicalSum = 0;
      } 
      else {
        if (newSocialSum < 0) newSocialSum = 0;
        if (newPhysicalSum < 0) newPhysicalSum = 0;
      }

      const avgSocial = newUserCount > 0 ? (newSocialSum / newUserCount) : 0;
      const avgPhysical = newUserCount > 0 ? (newPhysicalSum / newUserCount) : 0;

      transaction.set(statsRef, { 
        aggregatedActivities: updatedActivities,
        socialSum: newSocialSum,
        physicalSum: newPhysicalSum,
        totalUsers: newUserCount,
        averageSocial: Math.round(avgSocial),
        averagePhysical: Math.round(avgPhysical)
      }, { merge: true });
    });
    console.log("Global stats updated safely.");
  } catch (e) {
    console.error("Transaction failed: ", e);
  }
};