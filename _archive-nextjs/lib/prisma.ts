import { PrismaClient } from "@prisma/client";

// Mencegah terlalu banyak koneksi Prisma saat hot-reload di development.
// Wajib dipakai di Next.js App Router.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
