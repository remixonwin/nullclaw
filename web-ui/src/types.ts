export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

export interface ToolCall {
  id: string;
  name: string;
  arguments: any;
  timestamp: Date;
}

export interface ToolResult {
  id: string;
  tool_call_id: string;
  result: any;
  success: boolean;
  error?: string;
  timestamp: Date;
}

export interface ApprovalRequest {
  id: string;
  action: string;
  reason?: string;
  timestamp: Date;
}

export interface WebSocketMessage {
  v: number;
  type: string;
  session_id: string;
  agent_id?: string;
  request_id?: string;
  payload?: any;
  access_token?: string;
  auth_token?: string;
}

export interface PairingRequest {
  v: 1;
  type: 'pairing_request';
  session_id: string;
  payload: {
    pairing_code: string;
    client_pub?: string;
    client_public_key?: string;
  };
}

export interface PairingResult {
  v: 1;
  type: 'pairing_result';
  session_id: string;
  agent_id: string;
  request_id?: string;
  payload: {
    ok: boolean;
    client_id: string;
    access_token: string;
    token_type: string;
    expires_in: number;
    set_cookie?: string;
    e2e_required: boolean;
    e2e?: {
      alg: string;
      agent_pub: string;
    };
  };
}

export interface UserMessage {
  v: 1;
  type: 'user_message';
  session_id: string;
  payload: {
    content: string;
    sender_id?: string;
    access_token?: string;
    auth_token?: string;
    e2e?: {
      alg: string;
      nonce: string;
      ciphertext: string;
    };
  };
}

export interface AssistantChunk {
  v: 1;
  type: 'assistant_chunk';
  session_id: string;
  agent_id?: string;
  request_id?: string;
  payload: {
    content: string;
    e2e?: {
      alg: string;
      nonce: string;
      ciphertext: string;
    };
  };
}

export interface AssistantFinal {
  v: 1;
  type: 'assistant_final';
  session_id: string;
  agent_id?: string;
  request_id?: string;
  payload: {
    content: string;
    e2e?: {
      alg: string;
      nonce: string;
      ciphertext: string;
    };
  };
}

export interface ToolCallMessage {
  v: 1;
  type: 'tool_call';
  session_id: string;
  agent_id?: string;
  request_id?: string;
  payload: {
    name: string;
    arguments: any;
  };
}

export interface ToolResultMessage {
  v: 1;
  type: 'tool_result';
  session_id: string;
  agent_id?: string;
  request_id?: string;
  payload: {
    ok: boolean;
    result?: any;
    error?: string;
  };
}

export interface ApprovalRequestMessage {
  v: 1;
  type: 'approval_request';
  session_id: string;
  agent_id?: string;
  request_id?: string;
  payload: {
    action: string;
    reason?: string;
  };
}

export interface ApprovalResponseMessage {
  v: 1;
  type: 'approval_response';
  session_id: string;
  agent_id?: string;
  request_id?: string;
  payload: {
    approved: boolean;
    reason?: string;
  };
}

export interface ErrorMessage {
  v: 1;
  type: 'error';
  session_id: string;
  agent_id?: string;
  request_id?: string;
  payload: {
    code?: string;
    message: string;
  };
}