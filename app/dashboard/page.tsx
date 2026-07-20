import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { getCurrentTriwulan, TRIWULAN_LABEL } from "@/lib/current-triwulan";
import DashboardNavbar from "@/components/DashboardNavbar";
import LogoutButton from "@/components/LogoutButton";

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

  const today = new Date();
  const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  const months = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember",
  ];
  const dateString = `${days[today.getDay()]}, ${today.getDate()} ${months[today.getMonth()]} ${today.getFullYear()}`;
  const triwulanLabel = `${TRIWULAN_LABEL[current.triwulan]} ${current.tahun}`;

  return (
    <div className="min-h-screen flex flex-col bg-surface-background">
      <DashboardNavbar
        userName={session.user.name ?? ""}
        userJabatan={(session.user as { jabatan?: string }).jabatan}
      />
      <main className="max-w-container-max mx-auto px-margin-lg py-gutter-lg w-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-margin-lg gap-gutter-md">
          <div>
            <h1 className="font-headline-lg text-headline-lg text-on-surface mb-1">
              Dashboard Kinerja
            </h1>
            <div className="flex items-center gap-2 text-on-surface-variant">
              <span className="material-symbols-outlined text-[18px]">calendar_today</span>
              <span className="font-body-md">{dateString}</span>
              <span className="mx-2 opacity-30">•</span>
              <span className="bg-primary-fixed text-on-primary-fixed-variant px-3 py-0.5 rounded-full font-label-md text-label-md">
                {triwulanLabel}
              </span>
            </div>
          </div>
          <div className="flex gap-gutter-sm">
            <a
              href="/setup-triwulan"
              className="flex items-center gap-2 px-4 py-2 border border-outline-variant text-primary rounded-lg hover:bg-surface-container-low transition-colors font-label-md text-label-md"
            >
              <span className="material-symbols-outlined text-[18px]">settings_input_component</span>
              Setup TW
            </a>
            <a
              href="/rekap"
              className="flex items-center gap-2 px-4 py-2 border border-outline-variant text-primary rounded-lg hover:bg-surface-container-low transition-colors font-label-md text-label-md"
            >
              <span className="material-symbols-outlined text-[18px]">summarize</span>
              Rekap
            </a>
            <LogoutButton />
          </div>
        </div>

        <div className="grid grid-cols-12 gap-gutter-lg">
          <div className="col-span-12 lg:col-span-8">
            <div className="bg-surface-container-lowest rounded-xl border border-surface-border overflow-hidden">
              <div className="p-gutter-lg border-b border-surface-border bg-surface-container-low flex justify-between items-center">
                <h2 className="font-title-lg text-title-lg text-on-surface">Kegiatan Hari Ini</h2>
                <span className="text-label-md text-on-surface-variant font-medium">
                  {totalRK} Rencana Kinerja
                </span>
              </div>
              <div className="p-gutter-lg flex flex-col gap-gutter-lg">
                {setup?.rencanaKinerjas.slice(0, 3).map((rk, idx) => (
                  <div
                    key={rk.id}
                    className="activity-card bg-surface-container-lowest border border-surface-border rounded-lg p-gutter-md"
                  >
                    <div className="flex flex-col md:flex-row gap-gutter-md justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span
                            className="material-symbols-outlined text-primary text-[18px]"
                            style={{ fontVariationSettings: "'FILL' 1" }}
                          >
                            push_pin
                          </span>
                          <span className="font-label-md text-label-md text-on-surface-variant tracking-wider uppercase">
                            RK #{idx + 1}
                          </span>
                        </div>
                        <h3 className="font-headline-sm text-headline-sm text-on-surface mb-1 truncate">
                          {rk.deskripsi}
                        </h3>
                        <p className="text-on-surface-variant font-body-md mb-4">
                          {rk.jenis === "UTAMA" ? "Rencana Kinerja Utama" : "Rencana Kinerja Tambahan"}
                        </p>
                        <div className="mb-4">
                          <div className="flex justify-between items-end mb-1.5">
                            <span className="text-label-md text-on-surface-variant">Status</span>
                            <span className="text-label-md font-bold text-primary">Aktif</span>
                          </div>
                          <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                            <div className="bg-primary h-full rounded-full" style={{ width: "60%" }} />
                          </div>
                        </div>
                        {rk.ikis.length > 0 && (
                          <div className="flex items-center gap-1 text-primary font-body-md text-sm truncate max-w-xs">
                            <span className="material-symbols-outlined text-[16px]">checklist</span>
                            <span>{rk.ikis.length} IKI terdaftar</span>
                          </div>
                        )}
                      </div>
                      <div className="flex md:flex-col gap-2 justify-end shrink-0">
                        <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-3 py-2 border border-outline-variant rounded-lg hover:bg-surface-container text-on-surface-variant transition-colors text-label-md">
                          <span className="material-symbols-outlined text-[18px]">content_paste</span>
                          Salin
                        </button>
                        <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-3 py-2 border border-outline-variant rounded-lg hover:bg-surface-container text-on-surface-variant transition-colors text-label-md">
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                          Edit
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                <a
                  href="/setup-triwulan"
                  className="group flex flex-col items-center justify-center gap-gutter-sm p-margin-lg border-2 border-dashed border-outline-variant rounded-xl hover:border-primary hover:bg-surface-container-low transition-all"
                >
                  <div className="w-12 h-12 rounded-full bg-primary-fixed flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined font-bold text-[32px]">add</span>
                  </div>
                  <span className="font-title-lg text-title-lg text-primary">
                    Tambah Kegiatan Hari Ini
                  </span>
                  <span className="text-label-md text-on-surface-variant">
                    Klik untuk mencatat aktifitas baru Anda
                  </span>
                </a>
              </div>
            </div>
          </div>

          <div className="col-span-12 lg:col-span-4 flex flex-col gap-gutter-lg">
            <div className="bg-surface-container-lowest rounded-xl border border-surface-border p-gutter-lg">
              <h3 className="font-title-lg text-title-lg text-on-surface mb-gutter-md">
                Ringkasan TW{current.triwulan}
              </h3>
              <div className="space-y-gutter-md">
                <div className="flex items-center justify-between p-3 bg-surface-container rounded-lg">
                  <div>
                    <div className="text-label-md text-on-surface-variant uppercase">Target Capaian</div>
                    <div className="font-headline-sm text-headline-sm text-on-surface">85%</div>
                  </div>
                  <span className="material-symbols-outlined text-primary text-[32px] opacity-40">ads_click</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-tertiary-container text-on-tertiary rounded-lg">
                  <div>
                    <div className="text-label-md opacity-80 uppercase">Realisasi Saat Ini</div>
                    <div className="font-headline-sm text-headline-sm">72.4%</div>
                  </div>
                  <span className="material-symbols-outlined text-[32px] opacity-40">trending_up</span>
                </div>
              </div>
            </div>

            <div className="relative bg-primary-container rounded-xl overflow-hidden min-h-[240px] flex items-end p-gutter-lg">
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              <div className="relative z-10 text-white">
                <span className="font-label-md text-label-md bg-white/20 backdrop-blur-md px-2 py-0.5 rounded mb-2 inline-block">
                  Saran Produktif
                </span>
                <p className="font-body-lg text-body-lg italic">
                  &ldquo;Kedisiplinan adalah jembatan antara tujuan dan pencapaian.&rdquo;
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <a
        href="/setup-triwulan"
        className="fixed bottom-6 right-6 w-14 h-14 bg-primary text-on-primary rounded-full shadow-lg flex items-center justify-center md:hidden active:scale-90 transition-transform"
      >
        <span className="material-symbols-outlined font-bold">add</span>
      </a>
    </div>
  );
}
