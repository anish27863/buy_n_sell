'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

type Message = {
  id: number;
  senderId: number;
  message: string;
  sentAt: string;
  senderUsername: string;
  senderRole: 'customer' | 'seller' | 'admin';
};

export function ChatBox({ orderId, currentUserId }: { orderId: number; currentUserId: number }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/chat/${orderId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    // Poll every 3 seconds for new messages
    pollRef.current = setInterval(fetchMessages, 3000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [orderId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || sending) return;

    setSending(true);
    try {
      const res = await fetch(`/api/chat/${orderId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      });
      if (res.ok) {
        setInput('');
        await fetchMessages();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to send message');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center text-[var(--color-text-muted)] italic">
        Loading chat...
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-[var(--color-text-muted)] italic py-12">
            No messages yet. Start negotiating!
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderId === currentUserId;
            const isSeller = msg.senderRole === 'seller';
            
            return (
              <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                {/* Sender Label */}
                <div className={`text-[10px] uppercase tracking-widest mb-1 px-1 flex items-center gap-1.5 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                  <span className="font-bold text-[var(--color-text-primary)]">
                    {isMe ? 'You' : msg.senderUsername}
                  </span>
                  <span className={`px-1.5 py-0.5 rounded-sm text-[8px] border ${
                    isSeller 
                      ? 'border-[var(--color-accent)] text-[var(--color-accent)] bg-[var(--color-accent)]/5' 
                      : 'border-[var(--color-text-muted)] text-[var(--color-text-muted)] bg-[var(--color-bg-tertiary)]'
                  }`}>
                    {isSeller ? 'MERCHANT' : 'BUYER'}
                  </span>
                </div>

                {/* Message Bubble */}
                <div className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                  isMe
                    ? 'bg-[var(--color-accent)] text-white rounded-tr-sm shadow-lg shadow-[var(--color-accent-muted)]'
                    : 'bg-[var(--color-surface)] text-[var(--color-text-primary)] border border-[var(--color-border)] rounded-tl-sm'
                } ${!isMe && isSeller ? 'border-l-4 border-l-[var(--color-accent)]' : ''}`}>
                  <p className="whitespace-pre-wrap">{msg.message}</p>
                  <div className={`text-[10px] mt-1 ${isMe ? 'text-white/60' : 'text-[var(--color-text-muted)]'}`}>
                    {new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="border-t border-[var(--color-border)] px-6 py-4 flex gap-3">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 bg-transparent"
        />
        <Button type="submit" disabled={sending || !input.trim()} className="px-6 font-serif italic">
          {sending ? '...' : 'Send'}
        </Button>
      </form>
    </div>
  );
}
