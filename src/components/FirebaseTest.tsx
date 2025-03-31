import { useEffect, useState } from 'react';
import { getCollection } from '../lib/firebase/firestore';

export function FirebaseTest() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState<string>('');
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    const testConnection = async () => {
      try {
        // Try to fetch data from a collection
        // Replace 'test-collection' with an actual collection name from your database
        const result = await getCollection('test-collection');
        setData(result);
        setStatus('success');
        setMessage('Successfully connected to Firebase!');
      } catch (error) {
        console.error('Firebase connection error:', error);
        setStatus('error');
        setMessage(`Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    };

    testConnection();
  }, []);

  return (
    <div className="p-4 border rounded-lg shadow-sm">
      <h2 className="text-xl font-bold mb-4">Firebase Connection Test</h2>
      
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${
            status === 'loading' ? 'bg-yellow-400' :
            status === 'success' ? 'bg-green-500' :
            'bg-red-500'
          }`} />
          <span className="font-medium">
            {status === 'loading' ? 'Testing connection...' :
             status === 'success' ? 'Connected' :
             'Connection failed'}
          </span>
        </div>

        {message && (
          <p className={`text-sm ${
            status === 'success' ? 'text-green-600' :
            status === 'error' ? 'text-red-600' :
            'text-gray-600'
          }`}>
            {message}
          </p>
        )}

        {status === 'success' && data.length > 0 && (
          <div className="mt-4">
            <h3 className="font-medium mb-2">Sample Data:</h3>
            <pre className="bg-gray-50 p-2 rounded text-sm overflow-auto">
              {JSON.stringify(data[0], null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
} 