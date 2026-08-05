import { useState } from "react";
import api, { API_URL } from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function Pengaturan() {
  const { user, setUser } = useAuth();
  const [profile, setProfile] = useState({
    nama: user?.nama || "",
    jabatan: user?.jabatan || "",
    unitKerja: user?.unitKerja || "",
  });
  const [passwordForm, setPasswordForm] = useState({ oldPassword: "", newPassword: "" });
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  async function handleProfileSubmit(e) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    try {
      const res = await api.patch("/api/user/profile", profile);
      setUser((u) => ({ ...u, ...res.data }));
      setMessage("Profil berhasil diperbarui.");
    } catch (err) {
      setError(err.response?.data?.error || "Gagal memperbarui profil.");
    }
  }

  async function handlePasswordSubmit(e) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    try {
      await api.patch("/api/user/password", passwordForm);
      setPasswordForm({ oldPassword: "", newPassword: "" });
      setMessage("Password berhasil diubah.");
    } catch (err) {
      setError(err.response?.data?.error || "Gagal mengubah password.");
    }
  }

  async function handleFotoChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setMessage(null);
    const formData = new FormData();
    formData.append("foto", file);
    try {
      const res = await api.post("/api/user/foto", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setUser((u) => ({ ...u, fotoProfil: res.data.fotoProfil }));
      setMessage("Foto profil berhasil diperbarui.");
    } catch (err) {
      setError(err.response?.data?.error || "Gagal upload foto.");
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 mb-1">Pengaturan</h1>
        <p className="text-sm text-slate-500">Kelola profil dan keamanan akun Anda</p>
      </div>

      {message && (
        <div className="rounded-lg bg-green-50 border border-green-200 px-3 py-2 text-sm text-green-700">
          {message}
        </div>
      )}
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="font-semibold text-slate-800 mb-4">Foto Profil</h2>
        <div className="flex items-center gap-4">
          <img
            src={user?.fotoProfil ? `${API_URL}${user.fotoProfil}` : "https://placehold.co/64x64"}
            alt="Foto profil"
            className="h-16 w-16 rounded-full object-cover border border-slate-200"
          />
          <input type="file" accept="image/*" onChange={handleFotoChange} className="text-sm" />
        </div>
      </div>

      <form
        onSubmit={handleProfileSubmit}
        className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4"
      >
        <h2 className="font-semibold text-slate-800">Data Diri</h2>
        <div>
          <label className="block text-sm text-slate-700 mb-1">Nama</label>
          <input
            value={profile.nama}
            onChange={(e) => setProfile((p) => ({ ...p, nama: e.target.value }))}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm text-slate-700 mb-1">Jabatan</label>
          <input
            value={profile.jabatan}
            onChange={(e) => setProfile((p) => ({ ...p, jabatan: e.target.value }))}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm text-slate-700 mb-1">Unit Kerja</label>
          <input
            value={profile.unitKerja}
            onChange={(e) => setProfile((p) => ({ ...p, unitKerja: e.target.value }))}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <button className="rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-sm font-medium px-4 py-2 transition">
          Simpan Profil
        </button>
      </form>

      <form
        onSubmit={handlePasswordSubmit}
        className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4"
      >
        <h2 className="font-semibold text-slate-800">Ubah Password</h2>
        <div>
          <label className="block text-sm text-slate-700 mb-1">Password Lama</label>
          <input
            type="password"
            value={passwordForm.oldPassword}
            onChange={(e) => setPasswordForm((p) => ({ ...p, oldPassword: e.target.value }))}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm text-slate-700 mb-1">Password Baru</label>
          <input
            type="password"
            value={passwordForm.newPassword}
            onChange={(e) => setPasswordForm((p) => ({ ...p, newPassword: e.target.value }))}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <button className="rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-sm font-medium px-4 py-2 transition">
          Ubah Password
        </button>
      </form>
    </div>
  );
}
