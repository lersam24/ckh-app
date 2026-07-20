import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import DashboardNavbar from "@/components/DashboardNavbar";

export default async function ImportSKPPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <DashboardNavbar
        userName={session.user.name ?? ""}
        userJabatan={(session.user as { jabatan?: string }).jabatan}
      />
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-8">
        <h1 className="text-xl font-bold text-slate-900 mb-6">Import SKP Tahunan</h1>

        <div className="bg-white rounded-xl border border-dashed border-slate-300 p-10 text-center">
          <p className="text-sm text-slate-500">
            Fitur Import SKP Tahunan dari KipApp belum tersedia.
          </p>
          <p className="text-xs text-slate-400 mt-2">
            Fitur ini akan memungkinkan import data RK Utama dari aplikasi KipApp secara otomatis.
          </p>
          <a
            href="/setup-triwulan"
            className="inline-block mt-4 text-sm px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 transition"
          >
            Kembali ke Setup Triwulan
          </a>
        </div>
      </main>
    </div>
  );
}
