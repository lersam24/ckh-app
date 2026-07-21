import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import DashboardNavbar from "@/components/DashboardNavbar";
import ImportClient from "./components/ImportClient";
import { getCurrentTriwulan } from "@/lib/current-triwulan";

export default async function ImportSKPPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const current = getCurrentTriwulan();

  return (
    <div className="min-h-screen flex flex-col bg-surface-background">
      <DashboardNavbar
        userName={session.user.name ?? ""}
        userJabatan={(session.user as { jabatan?: string }).jabatan}
      />
      <main className="max-w-container-max mx-auto px-margin-lg py-gutter-lg w-full">
        <h1 className="font-headline-lg text-headline-lg text-on-surface mb-6">
          Import SKP Tahunan
        </h1>
        <ImportClient tahun={current.tahun} triwulan={current.triwulan} />
      </main>
    </div>
  );
}
