import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import DashboardNavbar from "@/components/DashboardNavbar";

export default async function ImportSKPPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  return (
    <div className="min-h-screen flex flex-col bg-surface-background">
      <DashboardNavbar
        userName={session.user.name ?? ""}
        userJabatan={(session.user as { jabatan?: string }).jabatan}
      />
      <main className="max-w-container-max mx-auto px-margin-lg py-gutter-lg w-full">
        <h1 className="font-headline-lg text-headline-lg text-on-surface mb-6">Import SKP Tahunan</h1>

        <div className="bg-surface-container-lowest rounded-xl border border-dashed border-outline-variant p-10 text-center">
          <p className="text-body-md text-on-surface-variant">
            Fitur Import SKP Tahunan dari KipApp belum tersedia.
          </p>
          <p className="font-body-md text-sm text-text-secondary mt-2">
            Fitur ini akan memungkinkan import data RK Utama dari aplikasi KipApp secara otomatis.
          </p>
          <a
            href="/setup-triwulan"
            className="inline-block mt-4 font-label-md text-label-md px-4 py-2 rounded-lg border border-outline-variant text-primary hover:bg-surface-container-low transition-colors"
          >
            Kembali ke Setup Triwulan
          </a>
        </div>
      </main>
    </div>
  );
}
