import NextAuth from 'next-auth';
import { DrizzleAdapter } from '@auth/drizzle-adapter';
import { db } from '@/lib/db';
import * as schema from '@/lib/db/schema'; // 👈 Ajoute cette ligne
import { authConfig } from './auth.config';

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: schema.users, // 👈 Corrige ici
    accountsTable: schema.accounts,
    sessionsTable: schema.sessions,
    verificationTokensTable: schema.verificationTokens,
  }),
  session: { strategy: 'jwt' },
  secret: process.env.NEXTAUTH_SECRET,
  ...authConfig,
});
