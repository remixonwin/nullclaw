import { Message, ToolCall, ToolResult, ApprovalRequest, WebSocketMessage, PairingRequest, UserMessage, AssistantChunk, AssistantFinal, ToolCallMessage, ToolResultMessage, ApprovalRequestMessage, ApprovalResponseMessage, ErrorMessage } from '../types';

interface WebSocketClientOptions {
  url: string;
  onMessage?: (message: WebSocketMessage) => void;
  onError?: (error: Event) => void;
  onClose?: (event: CloseEvent) => void;
  onOpen?: (event: Event) => void;
}

export class WebSocketClient {
  private ws: WebSocket | null = null;
  private options: WebSocketClientOptions;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 3000;
  private sessionId: string;

  constructor(options: WebSocketClientOptions) {
    this.options = options;
    this.sessionId = this.generateSessionId();
    this.connect();
  }

  private generateSessionId(): string {
    return 'session_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  public connect(): void {
    try {
      this.ws = new WebSocket(this.options.url);

      this.ws.onopen = (event) => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
        if (this.options.onOpen) {
          this.options.onOpen(event);
        }
      };

      this.ws.onmessage = (event) => {
        try {
          const data: WebSocketMessage = JSON.parse(event.data);
          if (this.options.onMessage) {
            this.options.onMessage(data);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        if (this.options.onError) {
          this.options.onError(error);
        }
      };

      this.ws.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        if (this.options.onClose) {
          this.options.onClose(event);
        }

        // Attempt to reconnect if not a clean close
        if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
          setTimeout(() => {
            this.connect();
          }, this.reconnectInterval);
        }
      };
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
    }
  }

  public send(message: WebSocketMessage): boolean {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
      return true;
    } else {
      console.warn('WebSocket not connected, cannot send message');
      return false;
    }
  }

  public sendPairingRequest(pairingCode: string, clientPub?: string): boolean {
    const message: PairingRequest = {
      v: 1,
      type: 'pairing_request',
      session_id: this.sessionId,
      payload: {
        pairing_code: pairingCode,
        client_pub: clientPub
      }
    };
    return this.send(message);
  }

  public sendUserMessage(content: string, accessToken?: string, senderId?: string): boolean {
    const message: UserMessage = {
      v: 1,
      type: 'user_message',
      session_id: this.sessionId,
      payload: {
        content,
        sender_id: senderId,
        access_token: accessToken
      }
    };
    return this.send(message);
  }

  public sendApprovalResponse(approvalId: string, approved: boolean, reason?: string): boolean {
    const message: ApprovalResponseMessage = {
      v: 1,
      type: 'approval_response',
      session_id: this.sessionId,
      request_id: approvalId,
      payload: {
        approved,
        reason
      }
    };
    return this.send(message);
  }

  public disconnect(): void {
    if (this.ws) {
      this.ws.close(1000, 'Client initiated disconnect');
      this.ws = null;
    }
  }

  public isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  public getSessionId(): string {
    return this.sessionId;
  }
}