import React, { useState, useEffect } from 'react';
import { Navigation } from './components/Navigation';
import { ChatPage } from './pages/ChatPage';
import { AgentsPage } from './pages/AgentsPage';
import { ChannelsPage } from './pages/ChannelsPage';
import { SkillsPage } from './pages/SkillsPage';
import { CronPage } from './pages/CronPage';
import { HardwarePage } from './pages/HardwarePage';
import { MemoryPage } from './pages/MemoryPage';
import { WorkspacePage } from './pages/WorkspacePage';
import { ConfigPage } from './pages/ConfigPage';
import { StatusPage } from './pages/StatusPage';
import { ToolsPage } from './pages/ToolsPage';
import { useChatStore } from './store/chatStore';
import { WebSocketClient } from './lib/websocket-client';
import { WebSocketMessage } from './types';

const App = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [pairingCode, setPairingCode] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [activeTab, setActiveTab] = useState('chat');
  const { messages, addMessage } = useChatStore();
  
  const [wsClient, setWsClient] = useState<WebSocketClient | null>(null);

  useEffect(() => {
    // Initialize WebSocket connection
    const client = new WebSocketClient({
      url: 'ws://localhost:32123/ws', // Default URL, should come from config
      onOpen: (event) => {
        console.log('Connected to NullClaw gateway');
        setIsConnected(true);
      },
      onClose: (event) => {
        console.log('Disconnected from NullClaw gateway');
        setIsConnected(false);
      },
      onError: (error) => {
        console.error('WebSocket error:', error);
        setIsConnected(false);
      },
      onMessage: (message: WebSocketMessage) => {
        // Handle different message types according to WebChannel spec
        switch (message.type) {
          case 'assistant_chunk':
          case 'assistant_final':
            if (message.payload?.content) {
              const assistantMessage = {
                id: message.request_id || Date.now().toString(),
                content: message.payload.content,
                sender: 'assistant' as const,
                timestamp: new Date(),
              };
              addMessage(assistantMessage);
            }
            break;
          case 'pairing_result':
            if (message.payload?.ok && message.payload?.access_token) {
              setAccessToken(message.payload.access_token);
              console.log('Successfully paired with NullClaw gateway');
            } else {
              console.error('Pairing failed:', message.payload?.message);
            }
            break;
          case 'tool_call':
            // Handle tool calls from the assistant
            console.log('Tool call received:', message.payload);
            break;
          case 'tool_result':
            // Handle tool results
            console.log('Tool result received:', message.payload);
            break;
          case 'error':
            console.error('Error from gateway:', message.payload?.message);
            break;
          default:
            console.log('Received message:', message);
        }
      }
    });
    
    setWsClient(client);

    // Cleanup on unmount
    return () => {
      if (client) {
        client.disconnect();
      }
    };
  }, [addMessage]);

  const handlePairing = () => {
    if (wsClient && pairingCode) {
      wsClient.sendPairingRequest(pairingCode);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navigation */}
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
      
      {/* Main Content */}
      <main className="flex-1 flex flex-col max-w-6xl mx-auto w-full">
        {activeTab === 'chat' && (
          <ChatPage wsClient={wsClient} isConnected={isConnected} accessToken={accessToken} />
        )}
        {activeTab === 'agents' && <AgentsPage />}
        {activeTab === 'channels' && <ChannelsPage />}
        {activeTab === 'skills' && <SkillsPage />}
        {activeTab === 'cron' && <CronPage />}
        {activeTab === 'hardware' && <HardwarePage />}
        {activeTab === 'memory' && <MemoryPage />}
        {activeTab === 'workspace' && <WorkspacePage />}
        {activeTab === 'config' && <ConfigPage />}
        {activeTab === 'status' && <StatusPage />}
        {activeTab === 'tools' && <ToolsPage />}
      </main>

      {/* Pairing Section - Only shown if not connected and on chat page */}
      {!accessToken && activeTab === 'chat' && (
        <div className="bg-blue-50 p-4 border-t">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-lg font-medium text-blue-900 mb-2">Connect to NullClaw</h2>
            <div className="flex gap-2">
              <input
                type="text"
                value={pairingCode}
                onChange={(e) => setPairingCode(e.target.value)}
                placeholder="Enter pairing code"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handlePairing}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Connect
              </button>
            </div>
            <p className="mt-2 text-sm text-blue-700">
              Get the pairing code by running <code className="bg-blue-100 px-1 rounded">nullclaw gateway</code> in your terminal
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;