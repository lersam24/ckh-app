import { useEffect, useState } from "react";
import api from "../api/client";

export default function Dashboard() {
  const [rencanaKinerjas, setRencanaKinerjas] = useState([]);
  const [capaianList, setCapaianList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const today = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState({
    rencanaKinerjaId: "",
    tanggal: today,
    jamMulai: "08:00",
    jamSelesai: "09:00",
    deskripsiKegiatan: "",
    progress: 0,
    capaian: "",
  });

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const [rkRes, capaianRes] = await Promise.all([
        api.get("/api/rencana-kinerja"),
        api.get("/api/capaian-harian", { params: { tanggal: today } }),
      ]);
      setRencanaKinerjas(rkRes.data);
      setCapaianList(capaianRes.data);
    } catch (err) {
      setError("Gagal memuat data. Pastikan backend berjalan.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await api.post("/api/capaian-harian", form);
      setShowForm(false);
      setForm((f) => ({ ...f, deskripsiKegiatan: "", capaian: "", progress: 0 }));
      loadData();
    } catch (err) {
      setError(err.response?.data?.error || "Gagal menyimpan capaian harian.");
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-500">Catatan kinerja harian Anda hari ini</p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-sm font-medium px-4 py-2 transition"
        >
          {showForm ? "Tutup Form" : "+ Tambah Capaian"}
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-600">
          {error}
        </div>
      )}

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6 space-y-4"
        >
          <div>
            <label className="block text-sm text-slate-700 mb-1">Rencana Kinerja</label>
            <select
              required
              value={form.rencanaKinerjaId}
              onChange={update("rencanaKinerjaId")}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="">-- Pilih Rencana Kinerja --</option>
              {rencanaKinerjas.map((rk) => (
                <option key={rk.id} value={rk.id}>
                  [{rk.jenis}] {rk.deskripsi}
                </option>
              ))}
            </select>
            {rencanaKinerjas.length === 0 && (
              <p className="text-xs text-amber-600 mt-1">
                Belum ada Rencana Kinerja. Buat dulu lewat halaman Setup Triwulan.
              </p>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-slate-700 mb-1">Tanggal</label>
              <input
                type="date"
                required
                value={form.tanggal}
                onChange={update("tanggal")}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-700 mb-1">Jam Mulai</label>
              <input
                type="time"
                required
                value={form.jamMulai}
                onChange={update("jamMulai")}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-700 mb-1">Jam Selesai</label>
              <input
                type="time"
                required
                value={form.jamSelesai}
                onChange={update("jamSelesai")}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-slate-700 mb-1">Deskripsi Kegiatan</label>
            <textarea
              required
              rows={3}
              value={form.deskripsiKegiatan}
              onChange={update("deskripsiKegiatan")}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-700 mb-1">Progress (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={form.progress}
                onChange={update("progress")}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-700 mb-1">Capaian</label>
              <input
                type="text"
                value={form.capaian}
                onChange={update("capaian")}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            className="rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-sm font-medium px-4 py-2 transition"
          >
            Simpan
          </button>
        </form>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600 text-left">
            <tr>
              <th className="px-4 py-3">Jam</th>
              <th className="px-4 py-3">Kegiatan</th>
              <th className="px-4 py-3">Progress</th>
              <th className="px-4 py-3">Capaian</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-slate-400">
                  Memuat...
                </td>
              </tr>
            )}
            {!loading && capaianList.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-slate-400">
                  Belum ada catatan hari ini.
                </td>
              </tr>
            )}
            {capaianList.map((item) => (
              <tr key={item.id}>
                <td className="px-4 py-3 whitespace-nowrap text-slate-600">
                  {item.jamMulai?.slice(11, 16)} - {item.jamSelesai?.slice(11, 16)}
                </td>
                <td className="px-4 py-3 text-slate-800">{item.deskripsiKegiatan}</td>
                <td className="px-4 py-3 text-slate-600">{item.progress}%</td>
                <td className="px-4 py-3 text-slate-600">{item.capaian}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
