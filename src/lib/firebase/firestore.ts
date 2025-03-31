import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  DocumentData,
  QueryConstraint
} from 'firebase/firestore';
import { db } from './config';

// Get a single document by ID
export const getDocument = async (collectionName: string, docId: string) => {
  try {
    const docRef = doc(db, collectionName, docId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
  } catch (error) {
    console.error('Error getting document:', error);
    throw error;
  }
};

// Get all documents from a collection
export const getCollection = async (collectionName: string) => {
  try {
    const querySnapshot = await getDocs(collection(db, collectionName));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting collection:', error);
    throw error;
  }
};

// Get documents with query constraints
export const getCollectionWithQuery = async (
  collectionName: string,
  constraints: QueryConstraint[]
) => {
  try {
    const collectionRef = collection(db, collectionName);
    const q = query(collectionRef, ...constraints);
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting collection with query:', error);
    throw error;
  }
};

// Example usage:
// const users = await getCollection('users');
// const user = await getDocument('users', 'userId123');
// const filteredUsers = await getCollectionWithQuery('users', [
//   where('age', '>', 18),
//   where('city', '==', 'New York')
// ]); 