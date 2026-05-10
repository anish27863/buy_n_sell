'use client';

import { useState, useEffect } from 'react';
import { getPusherClient } from '@/lib/pusher';

export type Message = {
  id: number;
  senderId: number;
  message: string;
  sentAt: string;
};

export function useChat(sessionId: number) {
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    // Scaffold: In real app, fetch initial messages here via API
    const pusher = getPusherClient();
    const channelName = `private-chat-${sessionId}`;
    
    // Note: private channels require auth endpoint setup for Pusher. 
    // We are using a generic subscription for the scaffold.
    const channel = pusher.subscribe(channelName);
    
    channel.bind('new-message', (data: Message) => {
      setMessages(prev => [...prev, data]);
    });

    return () => {
      pusher.unsubscribe(channelName);
    };
  }, [sessionId]);

  return { messages, setMessages };
}
