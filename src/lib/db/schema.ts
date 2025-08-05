import { pgTable, text, timestamp, integer, uuid, boolean, json, index, primaryKey } from 'drizzle-orm/pg-core';
import { relations, sql } from 'drizzle-orm';
import type { AdapterAccount } from '@auth/core/adapters';

// Table des utilisateurs
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').unique().notNull(),
  emailVerified: timestamp('email_verified').default(sql`NULL`),  // Ajouté ici
  name: text('name'),
  image: text('image'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  customQuotas: json('custom_quotas').$type<Record<string, {
    rpm: number;
    rpd: number;
    tpm: number;
    tpd: number;
  }>>(),
  isActive: boolean('is_active').default(true).notNull(),
}, (table) => ({
  emailIdx: index('email_idx').on(table.email),
}));


// Table des conversations
export const conversations = pgTable('conversations', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  title: text('title').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  isArchived: boolean('is_archived').default(false).notNull(),
}, (table) => ({
  userIdIdx: index('user_id_idx').on(table.userId),
  createdAtIdx: index('created_at_idx').on(table.createdAt),
}));

// Table des messages
export const messages = pgTable('messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  conversationId: uuid('conversation_id').references(() => conversations.id, { onDelete: 'cascade' }).notNull(),
  role: text('role', { enum: ['user', 'assistant', 'system'] }).notNull(),
  content: text('content').notNull(),
  agentName: text('agent_name'), // quel agent a répondu
  toolUsed: text('tool_used'), // quel outil a été utilisé
  createdAt: timestamp('created_at').defaultNow().notNull(),
  // Métadonnées pour analytics
  metadata: json('metadata').$type<{
    tokensUsed?: number;
    modelId?: string;
    responseTime?: number;
    error?: string;
  }>(),
}, (table) => ({
  conversationIdIdx: index('conversation_id_idx').on(table.conversationId),
  createdAtIdx: index('messages_created_at_idx').on(table.createdAt),
}));

// Table des logs d'usage (pour les quotas)
export const usageLogs = pgTable('usage_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  modelId: text('model_id').notNull(),
  tokensUsed: integer('tokens_used').notNull(),
  requestCount: integer('request_count').default(1).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  // Métadonnées additionnelles
  endpoint: text('endpoint'), // /api/chat, etc.
  agentUsed: text('agent_used'), // calculator, weather, etc.
  success: boolean('success').default(true).notNull(),
}, (table) => ({
  userModelIdx: index('user_model_idx').on(table.userId, table.modelId),
  createdAtIdx: index('usage_created_at_idx').on(table.createdAt),
}));

// Relations Drizzle (supprimée, remplacée par usersNextAuthRelations plus bas)

export const conversationsRelations = relations(conversations, ({ one, many }) => ({
  user: one(users, {
    fields: [conversations.userId],
    references: [users.id],
  }),
  messages: many(messages),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  conversation: one(conversations, {
    fields: [messages.conversationId],
    references: [conversations.id],
  }),
}));

export const usageLogsRelations = relations(usageLogs, ({ one }) => ({
  user: one(users, {
    fields: [usageLogs.userId],
    references: [users.id],
  }),
}));

// Tables NextAuth.js pour l'authentification
export const accounts = pgTable('account', {
  userId: uuid('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: text('type').$type<AdapterAccount['type']>().notNull(),
  provider: text('provider').notNull(),
  providerAccountId: text('providerAccountId').notNull(),
  refresh_token: text('refresh_token'),
  access_token: text('access_token'),
  expires_at: integer('expires_at'),
  token_type: text('token_type'),
  scope: text('scope'),
  id_token: text('id_token'),
  session_state: text('session_state'),
}, (account) => ({
  compoundKey: primaryKey({
    columns: [account.provider, account.providerAccountId],
  }),
  userIdIdx: index('account_user_id_idx').on(account.userId),
}));

export const sessions = pgTable('session', {
  sessionToken: text('sessionToken').primaryKey(),
  userId: uuid('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  expires: timestamp('expires', { mode: 'date' }).notNull(),
}, (table) => ({
  userIdIdx: index('session_user_id_idx').on(table.userId),
}));

export const verificationTokens = pgTable('verificationToken', {
  identifier: text('identifier').notNull(),
  token: text('token').notNull(),
  expires: timestamp('expires', { mode: 'date' }).notNull(),
}, (verificationToken) => ({
  compoundKey: primaryKey({
    columns: [verificationToken.identifier, verificationToken.token],
  }),
}));

// Relations NextAuth
export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

// Relations complètes pour users (incluant NextAuth)
export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
  conversations: many(conversations),
  usageLogs: many(usageLogs),
}));

// Types pour TypeScript
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Conversation = typeof conversations.$inferSelect;
export type NewConversation = typeof conversations.$inferInsert;
export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;
export type UsageLog = typeof usageLogs.$inferSelect;
export type NewUsageLog = typeof usageLogs.$inferInsert;

// Types NextAuth
export type Account = typeof accounts.$inferSelect;
export type NewAccount = typeof accounts.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
export type VerificationToken = typeof verificationTokens.$inferSelect;
export type NewVerificationToken = typeof verificationTokens.$inferInsert;