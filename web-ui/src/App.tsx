import React, { useState, useEffect } from 'react';
import { MessageList } from './components/MessageList';
import { MessageInput } from './components/MessageInput';
import { ConnectionStatus } from './components/ConnectionStatus';
import { useChatStore } from './store/chatStore';
import { WebSocketClient } from './lib/websocket-client';
import { WebSocketMessage } from './types';

const App = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [pairingCode, setPairingCode] = useState('');
  const [accessToken, setAccessToken] = useState('');
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

  const handleMessageSend = (content: string) => {
    if (wsClient && accessToken) {
      // Add user message to UI immediately
      const userMessage = {
        id: Date.now().toString(),
        content,
        sender: 'user' as const,
        timestamp: new Date(),
      };
      addMessage(userMessage);
      
      // Send to gateway
      wsClient.sendUserMessage(content, accessToken);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm py-4 px-6">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900">NullClaw Web UI</h1>
          <ConnectionStatus isConnected={isConnected} />
        </div>
      </header>

      {/* Pairing Section - Only shown if not connected */}
      {!accessToken && (
        <div className="bg-blue-50 p-4 border-b">
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

      {/* Main Content */}
      <main className="flex-1 flex flex-col max-w-4xl mx-auto w-full">
        <MessageList messages={messages} />
        {accessToken && (
          <MessageInput onSendMessage={handleMessageSend} disabled={!isConnected} />
        )}
      </main>
    </div>
  );
};

export default App;