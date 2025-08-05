import { db } from './index';
import { users, conversations, messages, usageLogs, type NewUser, type NewConversation, type NewMessage, type NewUsageLog } from './schema';
import { eq, desc, and, gte, sql } from 'drizzle-orm';

// === USER QUERIES ===

export async function createUser(userData: Omit<NewUser, 'id' | 'createdAt' | 'updatedAt'>) {
  const [user] = await db.insert(users).values(userData).returning();
  return user;
}

export async function getUserByEmail(email: string) {
  const [user] = await db.select().from(users).where(eq(users.email, email));
  return user;
}

export async function getUserById(id: string) {
  const [user] = await db.select().from(users).where(eq(users.id, id));
  return user;
}

// === CONVERSATION QUERIES ===

export async function createConversation(conversationData: Omit<NewConversation, 'id' | 'createdAt' | 'updatedAt'>) {
  const [conversation] = await db.insert(conversations).values(conversationData).returning();
  return conversation;
}

export async function getUserConversations(userId: string, limit = 50) {
  return await db
    .select()
    .from(conversations)
    .where(and(eq(conversations.userId, userId), eq(conversations.isArchived, false)))
    .orderBy(desc(conversations.updatedAt))
    .limit(limit);
}

export async function getConversationById(id: string) {
  const [conversation] = await db.select().from(conversations).where(eq(conversations.id, id));
  return conversation;
}

export async function updateConversationTitle(id: string, title: string) {
  const [updated] = await db
    .update(conversations)
    .set({ title, updatedAt: new Date() })
    .where(eq(conversations.id, id))
    .returning();
  return updated;
}

// === MESSAGE QUERIES ===

export async function createMessage(messageData: Omit<NewMessage, 'id' | 'createdAt'>) {
  const [message] = await db.insert(messages).values(messageData).returning();
  
  // Mettre à jour la conversation avec updatedAt
  await db
    .update(conversations)
    .set({ updatedAt: new Date() })
    .where(eq(conversations.id, messageData.conversationId));
  
  return message;
}

export async function getConversationMessages(conversationId: string, limit = 100) {
  return await db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, conversationId))
    .orderBy(messages.createdAt)
    .limit(limit);
}

// === USAGE LOG QUERIES ===

export async function createUsageLog(usageData: Omit<NewUsageLog, 'id' | 'createdAt'>) {
  const [log] = await db.insert(usageLogs).values(usageData).returning();
  return log;
}

export async function getUserUsageStats(userId: string, modelId?: string, timeRange = '24h') {
  const timeFilter = (() => {
    const now = new Date();
    switch (timeRange) {
      case '1h':
        return new Date(now.getTime() - 60 * 60 * 1000);
      case '24h':
        return new Date(now.getTime() - 24 * 60 * 60 * 1000);
      case '7d':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case '30d':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      default:
        return new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }
  })();

  const conditions = [
    eq(usageLogs.userId, userId),
    gte(usageLogs.createdAt, timeFilter)
  ];

  if (modelId) {
    conditions.push(eq(usageLogs.modelId, modelId));
  }

  const [stats] = await db
    .select({
      totalRequests: sql<number>`cast(sum(${usageLogs.requestCount}) as int)`,
      totalTokens: sql<number>`cast(sum(${usageLogs.tokensUsed}) as int)`,
      successRate: sql<number>`cast(avg(case when ${usageLogs.success} then 1.0 else 0.0 end) * 100 as decimal(5,2))`,
    })
    .from(usageLogs)
    .where(and(...conditions));

  return {
    totalRequests: stats?.totalRequests || 0,
    totalTokens: stats?.totalTokens || 0,
    successRate: stats?.successRate || 0,
  };
}

// === QUOTA QUERIES ===

export async function checkUserQuotas(userId: string, modelId: string) {
  const user = await getUserById(userId);
  if (!user) return null;

  // Récupérer l'usage des dernières 24h et 1 minute
  const [dailyStats, minuteStats] = await Promise.all([
    getUserUsageStats(userId, modelId, '24h'),
    getUserUsageStats(userId, modelId, '1h')
  ]);

  // Utiliser les quotas custom de l'utilisateur ou les défauts
  const defaultQuotas = {
    rpm: 20,
    rpd: 1000,
    tpm: 100000,
    tpd: 1000000,
  };

  const quotas = user.customQuotas?.[modelId] || defaultQuotas;

  return {
    quotas,
    usage: {
      daily: dailyStats,
      hourly: minuteStats,
    },
    isWithinLimits: {
      rpm: minuteStats.totalRequests < quotas.rpm,
      rpd: dailyStats.totalRequests < quotas.rpd,
      tpm: minuteStats.totalTokens < quotas.tpm,
      tpd: dailyStats.totalTokens < quotas.tpd,
    }
  };
}