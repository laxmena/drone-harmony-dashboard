import { useEffect, useState } from 'react';
import { getCollection, getDocument } from '../lib/firebase/firestore';

interface DataType {
  id: string;
  // Add other fields based on your Firestore document structure
  [key: string]: any;
}

export function ExampleComponent() {
  const [data, setData] = useState<DataType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Replace 'your-collection-name' with your actual collection name
        const collectionData = await getCollection('your-collection-name');
        setData(collectionData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Your Data</h2>
      <ul>
        {data.map((item) => (
          <li key={item.id}>
            {/* Display your data fields here */}
            {JSON.stringify(item)}
          </li>
        ))}
      </ul>
    </div>
  );
} 