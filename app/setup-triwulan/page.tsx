import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { getCurrentTriwulan, getPreviousTriwulan } from "@/lib/current-triwulan";
import DashboardNavbar from "@/components/DashboardNavbar";
import SetupTriwulanClient from "@/components/setup-triwulan/SetupTriwulanClient";

// Halaman ini berisi data spesifik per-user (RK, IKI).
// Wajib selalu dynamic agar tidak pernah tersaji dari cache lintas akun.
export const dynamic = "force-dynamic";

export default async function SetupTriwulanPage({
  searchParams,
}: {
  searchParams: Promise<{ tahun?: string; triwulan?: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const userId = (session.user as { id: string }).id;
  const params = await searchParams;
  const current = getCurrentTriwulan();
  const tahun = params.tahun ? parseInt(params.tahun) : current.tahun;
  const triwulan = params.triwulan ? parseInt(params.triwulan) : current.triwulan;

  let setup = await prisma.setupTriwulan.findUnique({
    where: { userId_tahun_triwulan: { userId, tahun, triwulan } },
    include: {
      rencanaKinerjas: {
        include: { ikis: true },
        orderBy: { urutan: "asc" },
      },
    },
  });

  if (!setup) {
    setup = await prisma.setupTriwulan.create({
      data: { userId, tahun, triwulan },
      include: {
        rencanaKinerjas: {
          include: { ikis: true },
          orderBy: { urutan: "asc" },
        },
      },
    });
  }

  const prev = getPreviousTriwulan(tahun, triwulan);
  const previousSetup = await prisma.setupTriwulan.findUnique({
    where: {
      userId_tahun_triwulan: {
        userId,
        tahun: prev.tahun,
        triwulan: prev.triwulan,
      },
    },
    include: { rencanaKinerjas: true },
  });

  return (
    <div className="min-h-screen flex flex-col bg-surface-background">
      <DashboardNavbar
        userName={session.user.name ?? ""}
        userJabatan={(session.user as { jabatan?: string }).jabatan}
      />
      <SetupTriwulanClient
        setup={setup}
        tahun={tahun}
        triwulan={triwulan}
        canCopyFromPrevious={
          setup.rencanaKinerjas.length === 0 &&
          (previousSetup?.rencanaKinerjas.length ?? 0) > 0
        }
      />
    </div>
  );
}