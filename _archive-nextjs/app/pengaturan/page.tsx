import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import DashboardNavbar from "@/components/DashboardNavbar";
import PengaturanClient from "./components/PengaturanClient";

export const dynamic = "force-dynamic";

export default async function PengaturanPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const userId = (session.user as { id: string }).id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      nama: true,
      nip: true,
      email: true,
      jabatan: true,
      unitKerja: true,
      fotoProfil: true,
      createdAt: true,
    },
  });

  if (!user) redirect("/login");

  return (
    <div className="min-h-screen flex flex-col bg-surface-background">
      <DashboardNavbar
        userName={session.user.name ?? ""}
        userJabatan={(session.user as { jabatan?: string }).jabatan}
        fotoProfil={(session.user as { fotoProfil?: string }).fotoProfil}
      />
      <main className="max-w-container-max mx-auto px-margin-lg py-gutter-lg w-full">
        <PengaturanClient user={user} />
      </main>
    </div>
  );
}
