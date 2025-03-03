'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function DebugPage() {
  const [result, setResult] = useState<any>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testCreateLobby = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Using the current create-game endpoint instead of the deprecated create-lobby
      const response = await fetch('/api/create-game', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ hostName: 'Test Host' }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        setError(data.error || 'Unknown error');
      } else {
        setResult(data);
      }
    } catch (err) {
      setError(`Client error: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  const checkDebugInfo = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/debug');
      const data = await response.json();
      
      if (!response.ok) {
        setError(data.error || 'Unknown error');
      } else {
        setDebugInfo(data);
      }
    } catch (err) {
      setError(`Client error: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Debug Page</h1>
      
      <Tabs defaultValue="create">
        <TabsList className="mb-4">
          <TabsTrigger value="create">Test Create</TabsTrigger>
          <TabsTrigger value="debug">Debug Info</TabsTrigger>
        </TabsList>
        
        <TabsContent value="create">
          <Card>
            <CardHeader>
              <CardTitle>Test Create Game</CardTitle>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={testCreateLobby} 
                disabled={loading}
              >
                {loading ? 'Testing...' : 'Test Creation'}
              </Button>
              
              {error && (
                <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                  <p className="font-bold">Error:</p>
                  <p>{error}</p>
                </div>
              )}
              
              {result && (
                <div className="mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
                  <p className="font-bold">Success:</p>
                  <pre className="mt-2 whitespace-pre-wrap">{JSON.stringify(result, null, 2)}</pre>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="debug">
          <Card>
            <CardHeader>
              <CardTitle>Database Debug Info</CardTitle>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={checkDebugInfo} 
                disabled={loading}
              >
                {loading ? 'Checking...' : 'Check DB Status'}
              </Button>
              
              {debugInfo && (
                <div className="mt-4">
                  <h3 className="font-bold mb-2">Connection Test:</h3>
                  <div className={`p-2 rounded ${debugInfo.connectionTest?.success ? 'bg-green-100' : 'bg-red-100'}`}>
                    {debugInfo.connectionTest?.success ? '✓ Connected' : `✗ Failed: ${debugInfo.connectionTest?.error}`}
                  </div>
                  
                  <h3 className="font-bold mt-4 mb-2">Tables:</h3>
                  <div className="grid gap-2">
                    {Object.entries(debugInfo.tables || {}).map(([table, info]: [string, any]) => (
                      <div 
                        key={table}
                        className={`p-2 rounded ${info.exists ? 'bg-green-100' : 'bg-red-100'}`}
                      >
                        <span className="font-medium">{table}:</span> {info.exists ? '✓ Exists' : `✗ Missing - ${info.error}`}
                      </div>
                    ))}
                  </div>
                  
                  <h3 className="font-bold mt-4 mb-2">Environment:</h3>
                  <div className="grid gap-2">
                    {Object.entries(debugInfo.env || {}).map(([key, value]: [string, any]) => (
                      <div 
                        key={key}
                        className={`p-2 rounded ${value.includes('✓') ? 'bg-green-100' : 'bg-red-100'}`}
                      >
                        <span className="font-medium">{key}:</span> {value}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}