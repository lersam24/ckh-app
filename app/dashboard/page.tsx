import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { getCurrentTriwulan } from "@/lib/current-triwulan";
import DashboardNavbar from "@/components/DashboardNavbar";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const userId = (session.user as { id: string }).id;
  const current = getCurrentTriwulan();

  const setup = await prisma.setupTriwulan.findUnique({
    where: {
      userId_tahun_triwulan: {
        userId,
        tahun: current.tahun,
        triwulan: current.triwulan,
      },
    },
    include: {
      rencanaKinerjas: {
        include: { ikis: true },
      },
    },
  });

  const totalRK = setup?.rencanaKinerjas.length ?? 0;
  const rkUtama = setup?.rencanaKinerjas.filter((rk) => rk.jenis === "UTAMA").length ?? 0;
  const rkTambahan = setup?.rencanaKinerjas.filter((rk) => rk.jenis === "TAMBAHAN").length ?? 0;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <DashboardNavbar
        userName={session.user.name ?? ""}
        userJabatan={(session.user as { jabatan?: string }).jabatan}
      />
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-8">
        <h1 className="text-xl font-bold text-slate-900 mb-6">Dashboard</h1>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <p className="text-sm text-slate-500">Total Rencana Kinerja</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{totalRK}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <p className="text-sm text-slate-500">RK Utama (Import)</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">{rkUtama}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <p className="text-sm text-slate-500">RK Tambahan (Manual)</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{rkTambahan}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-base font-semibold text-slate-800 mb-3">
            Triwulan Aktif: TW{current.triwulan} {current.tahun}
          </h2>
          <p className="text-sm text-slate-500 mb-4">
            Kelola rencana kinerja harian Anda pada periode triwulan ini.
          </p>
          <a
            href="/setup-triwulan"
            className="inline-block text-sm px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
          >
            Buka Setup Triwulan
          </a>
        </div>
      </main>
    </div>
  );
}
