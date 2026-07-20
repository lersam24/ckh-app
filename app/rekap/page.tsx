import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import DashboardNavbar from "@/components/DashboardNavbar";

export default async function RekapPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <DashboardNavbar
        userName={session.user.name ?? ""}
        userJabatan={(session.user as { jabatan?: string }).jabatan}
      />
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-8">
        <h1 className="text-xl font-bold text-slate-900 mb-6">Rekap & Export</h1>

        <div className="bg-white rounded-xl border border-dashed border-slate-300 p-10 text-center">
          <p className="text-sm text-slate-500">
            Halaman Rekap & Export belum tersedia.
          </p>
          <p className="text-xs text-slate-400 mt-2">
            Fitur ini akan segera dibuat untuk menampilkan ringkasan capaian kinerja harian dan export ke PDF/Excel.
          </p>
        </div>
      </main>
    </div>
  );
}
