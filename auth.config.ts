import { NextAuthConfig } from 'next-auth';
import Google from 'next-auth/providers/google';
import GitHub from 'next-auth/providers/github';
import Credentials from 'next-auth/providers/credentials';

export const authConfig = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    Credentials({
      id: 'demo',
      name: 'Demo Mode',
      credentials: {},
      async authorize() {
        // Mode démo - retourne un utilisateur fictif
        return {
          id: 'demo-user',
          email: 'demo@synapticagent.dev',
          name: 'Demo User',
          image: null,
        };
      },
    }),
  ],
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isAuthPage = nextUrl.pathname.startsWith('/auth');
      
      // Si connecté et sur page auth, rediriger vers l'app
      if (isLoggedIn && isAuthPage) {
        return Response.redirect(new URL('/', nextUrl));
      }
      
      // Si pas connecté et pas sur page auth, rediriger vers signin
      if (!isLoggedIn && !isAuthPage) {
        return Response.redirect(new URL('/auth/signin', nextUrl));
      }
      
      return true;
    },
    session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }
      return session;
    },
    jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
      }
      return token;
    },
  },
} satisfies NextAuthConfig;