import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

const LOCKOUT_THRESHOLD = 5;
const LOCKOUT_DURATION_MS = 5 * 60 * 1000;

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60,
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        identifier: { label: "NIP atau Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.identifier || !credentials?.password) {
          throw new Error("INVALID_INPUT");
        }

        const user = await prisma.user.findFirst({
          where: {
            OR: [
              { nip: credentials.identifier },
              { email: credentials.identifier },
            ],
          },
        });

        if (!user) {
          throw new Error("INVALID_CREDENTIALS");
        }

        if (user.lockedUntil && user.lockedUntil > new Date()) {
          throw new Error("LOCKED");
        }

        const isValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );

        if (!isValid) {
          const attempts = user.failedAttempts + 1;
          const shouldLock = attempts >= LOCKOUT_THRESHOLD;

          await prisma.user.update({
            where: { id: user.id },
            data: {
              failedAttempts: shouldLock ? 0 : attempts,
              lockedUntil: shouldLock
                ? new Date(Date.now() + LOCKOUT_DURATION_MS)
                : null,
            },
          });

          throw new Error(shouldLock ? "LOCKED" : "INVALID_CREDENTIALS");
        }

        await prisma.user.update({
          where: { id: user.id },
          data: { failedAttempts: 0, lockedUntil: null },
        });

        return {
          id: user.id,
          name: user.nama,
          email: user.email,
          nip: user.nip,
          jabatan: user.jabatan ?? undefined,
          unitKerja: user.unitKerja ?? undefined,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        // @ts-expect-error - field custom dari authorize()
        token.nip = user.nip;
        // @ts-expect-error - field custom dari authorize()
        token.jabatan = user.jabatan;
        // @ts-expect-error - field custom dari authorize()
        token.unitKerja = user.unitKerja;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string }).id = token.id as string;
        (session.user as { nip?: string }).nip = token.nip as string;
        (session.user as { jabatan?: string }).jabatan =
          token.jabatan as string;
        (session.user as { unitKerja?: string }).unitKerja =
          token.unitKerja as string;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };