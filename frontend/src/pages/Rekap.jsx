import { useState } from "react";
import api from "../api/client";

export default function Rekap() {
  const [tanggal, setTanggal] = useState(new Date().toISOString().slice(0, 10));
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleFilter(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/api/capaian-harian", { params: { tanggal } });
      setData(res.data);
    } catch (err) {
      setError("Gagal memuat rekap.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-1">Rekap Kinerja</h1>
      <p className="text-sm text-slate-500 mb-6">Lihat rekap capaian harian per tanggal</p>

      <form onSubmit={handleFilter} className="flex items-end gap-4 mb-6">
        <div>
          <label className="block text-sm text-slate-700 mb-1">Tanggal</label>
          <input
            type="date"
            value={tanggal}
            onChange={(e) => setTanggal(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <button
          type="submit"
          className="rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-sm font-medium px-4 py-2 transition"
        >
          Tampilkan
        </button>
      </form>

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600 text-left">
            <tr>
              <th className="px-4 py-3">Jam</th>
              <th className="px-4 py-3">Rencana Kinerja</th>
              <th className="px-4 py-3">Kegiatan</th>
              <th className="px-4 py-3">Progress</th>
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
            {!loading && data.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-slate-400">
                  Tidak ada data untuk tanggal ini.
                </td>
              </tr>
            )}
            {data.map((item) => (
              <tr key={item.id}>
                <td className="px-4 py-3 whitespace-nowrap text-slate-600">
                  {item.jamMulai?.slice(11, 16)} - {item.jamSelesai?.slice(11, 16)}
                </td>
                <td className="px-4 py-3 text-slate-600">{item.rencanaKinerja?.deskripsi}</td>
                <td className="px-4 py-3 text-slate-800">{item.deskripsiKegiatan}</td>
                <td className="px-4 py-3 text-slate-600">{item.progress}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
