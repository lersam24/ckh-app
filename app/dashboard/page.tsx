import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { getCurrentTriwulan, TRIWULAN_LABEL } from "@/lib/current-triwulan";
import DashboardNavbar from "@/components/DashboardNavbar";
import LogoutButton from "@/components/LogoutButton";
import DashboardClient from "./components/DashboardClient";

function getTriwulanDateRange(tahun: number, triwulan: number) {
  const startMonth = (triwulan - 1) * 3;
  const start = new Date(tahun, startMonth, 1);
  const end = new Date(tahun, startMonth + 3, 0, 23, 59, 59, 999);
  return { start, end };
}

function countWeekdays(start: Date, end: Date) {
  let count = 0;
  const d = new Date(start);
  while (d <= end) {
    const day = d.getDay();
    if (day !== 0 && day !== 6) count++;
    d.setDate(d.getDate() + 1);
  }
  return count;
}

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
        orderBy: { urutan: "asc" },
      },
    },
  });

  const allRks = setup?.rencanaKinerjas ?? [];

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const capaianHariIni = await prisma.capaianHarian.findMany({
    where: {
      userId,
      tanggal: { gte: today, lt: tomorrow },
    },
    include: {
      rencanaKinerja: {
        select: { id: true, deskripsi: true, jenis: true },
      },
    },
    orderBy: { jamMulai: "asc" },
  });

  const rkIds = allRks.map((rk) => rk.id);

  const capaianPerRk =
    rkIds.length > 0
      ? await prisma.capaianHarian.groupBy({
          by: ["rencanaKinerjaId"],
          where: {
            userId,
            rencanaKinerjaId: { in: rkIds },
          },
          _avg: { progress: true },
          _count: { id: true },
        })
      : [];

  const capaianMap = new Map(
    capaianPerRk.map((c) => [
      c.rencanaKinerjaId,
      {
        progressRataRata: Math.round(c._avg.progress ?? 0),
        totalCapaian: c._count.id,
      },
    ])
  );

  const rkList = allRks.map((rk) => ({
    id: rk.id,
    deskripsi: rk.deskripsi,
    jenis: rk.jenis as "UTAMA" | "TAMBAHAN",
    dariImport: rk.dariImport,
    urutan: rk.urutan,
    ikis: rk.ikis,
    progressRataRata: capaianMap.get(rk.id)?.progressRataRata ?? 0,
    totalCapaian: capaianMap.get(rk.id)?.totalCapaian ?? 0,
  }));

  const { start: twStart, end: twEnd } = getTriwulanDateRange(
    current.tahun,
    current.triwulan
  );

  const totalHariKerja = countWeekdays(twStart, twEnd);

  const hariAktifResult = await prisma.capaianHarian.groupBy({
    by: ["tanggal"],
    where: {
      userId,
      tanggal: { gte: twStart, lte: twEnd },
    },
  });
  const totalHariAktif = hariAktifResult.length;

  const rataRataProgress =
    rkList.length > 0
      ? Math.round(
          rkList.reduce((sum, rk) => sum + rk.progressRataRata, 0) /
            rkList.length
        )
      : 0;

  const days = [
    "Minggu",
    "Senin",
    "Selasa",
    "Rabu",
    "Kamis",
    "Jumat",
    "Sabtu",
  ];
  const months = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];
  const dateString = `${days[today.getDay()]}, ${today.getDate()} ${months[today.getMonth()]} ${today.getFullYear()}`;
  const triwulanLabel = `${TRIWULAN_LABEL[current.triwulan]} ${current.tahun}`;
  const tanggalDefault = today.toISOString().slice(0, 10);

  const persentaseHariAktif =
    totalHariKerja > 0
      ? Math.round((totalHariAktif / totalHariKerja) * 100)
      : 0;

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
              <span className="material-symbols-outlined text-[18px]">
                calendar_today
              </span>
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
              <span className="material-symbols-outlined text-[18px]">
                settings_input_component
              </span>
              Setup TW
            </a>
            <a
              href="/rekap"
              className="flex items-center gap-2 px-4 py-2 border border-outline-variant text-primary rounded-lg hover:bg-surface-container-low transition-colors font-label-md text-label-md"
            >
              <span className="material-symbols-outlined text-[18px]">
                summarize
              </span>
              Rekap
            </a>
            <LogoutButton />
          </div>
        </div>

        <div className="grid grid-cols-12 gap-gutter-lg">
          <div className="col-span-12 lg:col-span-8">
            <DashboardClient
              rkList={rkList}
              capaianHariIni={capaianHariIni.map((c) => ({
                ...c,
                tanggal: c.tanggal.toISOString(),
                jamMulai: c.jamMulai.toISOString(),
                jamSelesai: c.jamSelesai.toISOString(),
              }))}
              tanggalDefault={tanggalDefault}
              totalHariAktif={totalHariAktif}
              totalHariKerja={totalHariKerja}
              rataRataProgress={rataRataProgress}
            />
          </div>

          <div className="col-span-12 lg:col-span-4 flex flex-col gap-gutter-lg">
            <div className="bg-surface-container-lowest rounded-xl border border-surface-border p-gutter-lg">
              <h3 className="font-title-lg text-title-lg text-on-surface mb-gutter-md">
                Ringkasan TW{current.triwulan}
              </h3>
              <div className="space-y-gutter-md">
                <div className="flex items-center justify-between p-3 bg-surface-container rounded-lg">
                  <div>
                    <div className="text-label-md text-on-surface-variant uppercase">
                      Hari Aktif
                    </div>
                    <div className="font-headline-sm text-headline-sm text-on-surface">
                      {totalHariAktif} / {totalHariKerja} hari
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-primary text-[32px] opacity-40">
                    calendar_month
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-surface-container rounded-lg">
                  <div>
                    <div className="text-label-md text-on-surface-variant uppercase">
                      Persentase Hari
                    </div>
                    <div className="font-headline-sm text-headline-sm text-on-surface">
                      {persentaseHariAktif}%
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-primary text-[32px] opacity-40">
                    ads_click
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-tertiary-container text-on-tertiary rounded-lg">
                  <div>
                    <div className="text-label-md opacity-80 uppercase">
                      Rata-rata Progress
                    </div>
                    <div className="font-headline-sm text-headline-sm">
                      {rataRataProgress}%
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-[32px] opacity-40">
                    trending_up
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-surface-container rounded-lg">
                  <div>
                    <div className="text-label-md text-on-surface-variant uppercase">
                      Total RK
                    </div>
                    <div className="font-headline-sm text-headline-sm text-on-surface">
                      {allRks.length} RK
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-primary text-[32px] opacity-40">
                    assignment
                  </span>
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
                  &ldquo;Kedisiplinan adalah jembatan antara tujuan dan
                  pencapaian.&rdquo;
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
