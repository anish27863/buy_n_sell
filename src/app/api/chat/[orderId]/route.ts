import { NextResponse } from 'next/server';
import { db } from '@/db';
import { chatMessages, chatSessions, users, orders } from '@/db/schema';
import { eq, asc } from 'drizzle-orm';
import { getSession } from '@/lib/auth';

// GET: Fetch all messages for an order's chat session
export async function GET(request: Request, { params }: { params: Promise<{ orderId: string }> }) {
  try {
    const { orderId } = await params;
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const oid = parseInt(orderId);
    let [chatSession] = await db.select().from(chatSessions).where(eq(chatSessions.orderId, oid));
    if (!chatSession) {
      const [ns] = await db.insert(chatSessions).values({ orderId: oid, isActive: true }).returning();
      chatSession = ns;
    }

    const messages = await db
      .select({
        id: chatMessages.id,
        senderId: chatMessages.senderId,
        message: chatMessages.message,
        sentAt: chatMessages.sentAt,
        senderUsername: users.username,
        senderRole: users.role,
      })
      .from(chatMessages)
      .innerJoin(users, eq(chatMessages.senderId, users.id))
      .where(eq(chatMessages.sessionId, chatSession.id))
      .orderBy(asc(chatMessages.sentAt));

    const [order] = await db.select({ status: orders.status }).from(orders).where(eq(orders.id, oid));
    return NextResponse.json({ messages, sessionId: chatSession.id, orderStatus: order?.status ?? 'negotiating' });
  } catch (error: any) {
    console.error('Chat fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}

// POST: Send a new message
export async function POST(request: Request, { params }: { params: Promise<{ orderId: string }> }) {
  try {
    const { orderId } = await params;
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const oid = parseInt(orderId);

    // Block messages on delivered orders
    const [order] = await db.select({ status: orders.status }).from(orders).where(eq(orders.id, oid));
    if (order?.status === 'delivered') {
      return NextResponse.json({ error: 'This order has been delivered. The chat is now closed.' }, { status: 403 });
    }

    let [chatSession] = await db.select().from(chatSessions).where(eq(chatSessions.orderId, oid));
    if (!chatSession) {
      const [ns] = await db.insert(chatSessions).values({ orderId: oid, isActive: true }).returning();
      chatSession = ns;
    }

    const { message } = await request.json();
    if (!message || !message.trim()) {
      return NextResponse.json({ error: 'Message cannot be empty' }, { status: 400 });
    }

    const [newMsg] = await db.insert(chatMessages).values({
      sessionId: chatSession.id,
      senderId: session.id,
      message: message.trim(),
    }).returning();

    return NextResponse.json({ success: true, message: newMsg });
  } catch (error: any) {
    console.error('Chat send error:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
