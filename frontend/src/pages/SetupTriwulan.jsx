import { useEffect, useState } from "react";
import api from "../api/client";

export default function SetupTriwulan() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({ tahun: new Date().getFullYear(), triwulan: 1 });

  async function loadData() {
    setLoading(true);
    try {
      const res = await api.get("/api/setup-triwulan");
      setList(res.data);
    } catch (err) {
      setError("Gagal memuat data setup triwulan.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleCreate(e) {
    e.preventDefault();
    setError(null);
    try {
      await api.post("/api/setup-triwulan", form);
      loadData();
    } catch (err) {
      setError(err.response?.data?.error || "Gagal membuat setup triwulan.");
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-1">Setup Triwulan</h1>
      <p className="text-sm text-slate-500 mb-6">
        Kelola Rencana Kinerja (RK) dan IKI per triwulan
      </p>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-600">
          {error}
        </div>
      )}

      <form
        onSubmit={handleCreate}
        className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6 flex items-end gap-4"
      >
        <div>
          <label className="block text-sm text-slate-700 mb-1">Tahun</label>
          <input
            type="number"
            value={form.tahun}
            onChange={(e) => setForm((f) => ({ ...f, tahun: Number(e.target.value) }))}
            className="w-32 rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm text-slate-700 mb-1">Triwulan</label>
          <select
            value={form.triwulan}
            onChange={(e) => setForm((f) => ({ ...f, triwulan: Number(e.target.value) }))}
            className="w-32 rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            {[1, 2, 3, 4].map((t) => (
              <option key={t} value={t}>
                Triwulan {t}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-sm font-medium px-4 py-2 transition"
        >
          Buat Setup
        </button>
      </form>

      <div className="grid gap-4">
        {loading && <p className="text-slate-400 text-sm">Memuat...</p>}
        {!loading && list.length === 0 && (
          <p className="text-slate-400 text-sm">Belum ada setup triwulan.</p>
        )}
        {list.map((item) => (
          <div key={item.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <h3 className="font-semibold text-slate-800 mb-2">
              Tahun {item.tahun} - Triwulan {item.triwulan}
            </h3>
            {item.rencanaKinerjas?.length ? (
              <ul className="text-sm text-slate-600 space-y-1 list-disc pl-5">
                {item.rencanaKinerjas.map((rk) => (
                  <li key={rk.id}>
                    [{rk.jenis}] {rk.deskripsi}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-400">Belum ada Rencana Kinerja.</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
