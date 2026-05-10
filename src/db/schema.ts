import { pgTable, serial, varchar, text, timestamp, boolean, integer, numeric, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const roleEnum = pgEnum('role', ['customer', 'seller', 'admin']);
export const approvalStatusEnum = pgEnum('approval_status', ['pending', 'approved', 'rejected']);
export const orderStatusEnum = pgEnum('order_status', ['negotiating', 'confirmed', 'delivered']);

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: varchar('username', { length: 50 }).unique().notNull(),
  passwordHash: text('password_hash').notNull(),
  role: roleEnum('role').notNull(),
  isBanned: boolean('is_banned').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

export const sellerProfiles = pgTable('seller_profiles', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  shopName: varchar('shop_name', { length: 100 }).notNull(),
  description: text('description'),
  approvalStatus: approvalStatusEnum('approval_status').default('pending'),
  avgRating: numeric('avg_rating', { precision: 3, scale: 2 }).default('0'),
  totalReviews: integer('total_reviews').default(0),
  createdAt: timestamp('created_at').defaultNow(),
});

export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  sellerId: integer('seller_id').references(() => sellerProfiles.id).notNull(),
  title: varchar('title', { length: 200 }).notNull(),
  description: text('description'),
  category: varchar('category', { length: 100 }).notNull(),
  mrp: numeric('mrp', { precision: 10, scale: 2 }).notNull(),
  quantityAvailable: integer('quantity_available').notNull().default(0),
  quantityFrozen: integer('quantity_frozen').default(0),
  images: text('images').array(),
  tags: text('tags').array(),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

export const cartItems = pgTable('cart_items', {
  id: serial('id').primaryKey(),
  customerId: integer('customer_id').references(() => users.id).notNull(),
  productId: integer('product_id').references(() => products.id).notNull(),
  quantity: integer('quantity').notNull().default(1),
  addedAt: timestamp('added_at').defaultNow(),
});

export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  customerId: integer('customer_id').references(() => users.id).notNull(),
  sellerId: integer('seller_id').references(() => sellerProfiles.id).notNull(),
  productId: integer('product_id').references(() => products.id).notNull(),
  quantity: integer('quantity').notNull(),
  agreedPrice: numeric('agreed_price', { precision: 10, scale: 2 }),
  status: orderStatusEnum('status').default('negotiating'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const chatSessions = pgTable('chat_sessions', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id').references(() => orders.id).unique().notNull(),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

export const chatMessages = pgTable('chat_messages', {
  id: serial('id').primaryKey(),
  sessionId: integer('session_id').references(() => chatSessions.id).notNull(),
  senderId: integer('sender_id').references(() => users.id).notNull(),
  message: text('message').notNull(),
  sentAt: timestamp('sent_at').defaultNow(),
});

export const sellerReviews = pgTable('seller_reviews', {
  id: serial('id').primaryKey(),
  reviewerId: integer('reviewer_id').references(() => users.id).notNull(),
  sellerId: integer('seller_id').references(() => sellerProfiles.id).notNull(),
  rating: integer('rating').notNull(), // should check 1-5 in application level or trigger
  comment: text('comment'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const productReviews = pgTable('product_reviews', {
  id: serial('id').primaryKey(),
  reviewerId: integer('reviewer_id').references(() => users.id).notNull(),
  productId: integer('product_id').references(() => products.id).notNull(),
  rating: integer('rating').notNull(),
  comment: text('comment'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const wantPosts = pgTable('want_posts', {
  id: serial('id').primaryKey(),
  customerId: integer('customer_id').references(() => users.id).notNull(),
  title: varchar('title', { length: 200 }).notNull(),
  description: text('description'),
  budget: numeric('budget', { precision: 10, scale: 2 }),
  category: varchar('category', { length: 100 }),
  isOpen: boolean('is_open').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

export const wantPostReplies = pgTable('want_post_replies', {
  id: serial('id').primaryKey(),
  postId: integer('post_id').references(() => wantPosts.id).notNull(),
  sellerId: integer('seller_id').references(() => sellerProfiles.id).notNull(),
  message: text('message').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});
