"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";

type UserData = {
  id: string;
  nama: string;
  nip: string;
  email: string;
  jabatan: string | null;
  unitKerja: string | null;
  fotoProfil: string | null;
  createdAt: Date;
};

const TABS = [
  { key: "profil", label: "Profil", icon: "person" },
  { key: "keamanan", label: "Keamanan", icon: "lock" },
];

export default function PengaturanClient({ user }: { user: UserData }) {
  const { update } = useSession();
  const [tab, setTab] = useState("profil");

  const [nama, setNama] = useState(user.nama);
  const [email, setEmail] = useState(user.email);
  const [jabatan, setJabatan] = useState(user.jabatan ?? "");
  const [unitKerja, setUnitKerja] = useState(user.unitKerja ?? "");
  const [fotoProfil, setFotoProfil] = useState(user.fotoProfil);
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [profileMessage, setProfileMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [passwordMessage, setPasswordMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  async function handleProfileSubmit(e: React.FormEvent) {
    e.preventDefault();
    setProfileMessage(null);
    setProfileLoading(true);

    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nama,
          email,
          jabatan: jabatan || null,
          unitKerja: unitKerja || null,
          fotoProfil: fotoPreview || fotoProfil,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setProfileMessage({ type: "error", text: data.error });
        return;
      }

      setFotoProfil(data.fotoProfil);
      setFotoPreview(null);
      setFotoFile(null);

      await update({
        name: data.nama,
        email: data.email,
        jabatan: data.jabatan,
        unitKerja: data.unitKerja,
        fotoProfil: data.fotoProfil ? `/api/user/foto?id=${data.id}&v=${Date.now()}` : null,
      });

      setProfileMessage({ type: "success", text: "Profil berhasil diperbarui" });
    } catch {
      setProfileMessage({ type: "error", text: "Terjadi kesalahan. Coba lagi." });
    } finally {
      setProfileLoading(false);
    }
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPasswordMessage(null);
    setPasswordLoading(true);

    try {
      const res = await fetch("/api/user/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setPasswordMessage({ type: "error", text: data.error });
        return;
      }

      setPasswordMessage({ type: "success", text: "Password berhasil diubah" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      setPasswordMessage({ type: "error", text: "Terjadi kesalahan. Coba lagi." });
    } finally {
      setPasswordLoading(false);
    }
  }

  function handleFotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setProfileMessage({ type: "error", text: "Ukuran foto maksimal 2MB" });
      return;
    }

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setProfileMessage({ type: "error", text: "Format foto harus JPG, PNG, atau WebP" });
      return;
    }

    setFotoFile(file);

    const reader = new FileReader();
    reader.onload = (e) => {
      setFotoPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  }

  function handleRemoveFoto() {
    setFotoFile(null);
    setFotoPreview(null);
    setFotoProfil(null);
  }

  const createdAt = new Date(user.createdAt);
  const formattedDate = createdAt.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="flex flex-col gap-gutter-lg">
      <div className="flex items-center gap-2 mb-1">
        <span className="material-symbols-outlined text-primary text-[28px]">
          settings
        </span>
        <h1 className="font-headline-lg text-headline-lg text-on-surface">
          Pengaturan Akun
        </h1>
      </div>

      <div className="bg-surface-container-lowest rounded-xl border border-surface-border overflow-hidden">
        <div className="flex border-b border-surface-border">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={
                tab === t.key
                  ? "flex items-center gap-2 px-5 py-3 font-label-md text-label-md text-primary border-b-2 border-primary font-bold bg-surface-container"
                  : "flex items-center gap-2 px-5 py-3 font-label-md text-label-md text-on-surface-variant hover:bg-surface-container-low transition-colors"
              }
            >
              <span className="material-symbols-outlined text-[18px]">
                {t.icon}
              </span>
              {t.label}
            </button>
          ))}
        </div>

        <div className="p-gutter-lg">
          {tab === "profil" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter-lg">
              <div className="lg:col-span-2">
                <form onSubmit={handleProfileSubmit} className="space-y-gutter-md">
                  <div className="flex items-center gap-gutter-lg">
                    <div className="relative w-20 h-20 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container font-bold text-2xl overflow-hidden shrink-0">
                      {(fotoPreview || fotoProfil) ? (
                        <img
                          src={fotoPreview || fotoProfil!}
                          alt="Foto profil"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        nama?.[0]?.toUpperCase()
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 border border-surface-border rounded-lg text-body-md text-primary hover:bg-surface-container-low transition-colors">
                        <span className="material-symbols-outlined text-[18px]">photo_camera</span>
                        Unggah Foto
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          onChange={handleFotoChange}
                          className="hidden"
                        />
                      </label>
                      {(fotoPreview || fotoProfil) && (
                        <button
                          type="button"
                          onClick={handleRemoveFoto}
                          className="inline-flex items-center gap-2 px-4 py-2 text-body-md text-error hover:bg-error-container/30 rounded-lg transition-colors"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                          Hapus Foto
                        </button>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block font-label-md text-label-md text-on-surface-variant mb-1">
                      Nama Lengkap
                    </label>
                    <input
                      type="text"
                      value={nama}
                      onChange={(e) => setNama(e.target.value)}
                      className="w-full px-4 py-2.5 border border-surface-border rounded-lg bg-surface-container-low text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-label-md text-label-md text-on-surface-variant mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-2.5 border border-surface-border rounded-lg bg-surface-container-low text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-gutter-md">
                    <div>
                      <label className="block font-label-md text-label-md text-on-surface-variant mb-1">
                        Jabatan
                      </label>
                      <input
                        type="text"
                        value={jabatan}
                        onChange={(e) => setJabatan(e.target.value)}
                        className="w-full px-4 py-2.5 border border-surface-border rounded-lg bg-surface-container-low text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block font-label-md text-label-md text-on-surface-variant mb-1">
                        Unit Kerja
                      </label>
                      <input
                        type="text"
                        value={unitKerja}
                        onChange={(e) => setUnitKerja(e.target.value)}
                        className="w-full px-4 py-2.5 border border-surface-border rounded-lg bg-surface-container-low text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                  </div>

                  {profileMessage && (
                    <div
                      className={
                        profileMessage.type === "success"
                          ? "bg-tertiary-container text-on-tertiary-fixed px-4 py-3 rounded-lg font-body-md"
                          : "bg-error-container text-on-error-container px-4 py-3 rounded-lg font-body-md"
                      }
                    >
                      <span className="material-symbols-outlined text-[16px] align-text-bottom mr-1">
                        {profileMessage.type === "success" ? "check_circle" : "error"}
                      </span>
                      {profileMessage.text}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={profileLoading}
                    className="bg-primary text-on-primary px-6 py-2.5 rounded-lg font-label-md text-label-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {profileLoading ? "Menyimpan..." : "Simpan Perubahan"}
                  </button>
                </form>
              </div>

              <div className="bg-surface-container rounded-xl p-gutter-lg">
                <h3 className="font-title-lg text-title-lg text-on-surface mb-gutter-md">
                  Informasi Akun
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-label-sm text-on-surface-variant uppercase tracking-wider">
                      NIP
                    </p>
                    <p className="font-body-lg text-body-lg text-on-surface font-medium">
                      {user.nip}
                    </p>
                  </div>
                  <div>
                    <p className="text-label-sm text-on-surface-variant uppercase tracking-wider">
                      Tanggal Daftar
                    </p>
                    <p className="font-body-lg text-body-lg text-on-surface">
                      {formattedDate}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === "keamanan" && (
            <div className="max-w-lg">
              <form onSubmit={handlePasswordSubmit} className="space-y-gutter-md">
                <div>
                  <label className="block font-label-md text-label-md text-on-surface-variant mb-1">
                    Password Saat Ini
                  </label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-4 py-2.5 border border-surface-border rounded-lg bg-surface-container-low text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block font-label-md text-label-md text-on-surface-variant mb-1">
                    Password Baru
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-2.5 border border-surface-border rounded-lg bg-surface-container-low text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                    minLength={8}
                  />
                  <p className="text-label-sm text-on-surface-variant mt-1">
                    Minimal 8 karakter
                  </p>
                </div>

                <div>
                  <label className="block font-label-md text-label-md text-on-surface-variant mb-1">
                    Konfirmasi Password Baru
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-2.5 border border-surface-border rounded-lg bg-surface-container-low text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                    minLength={8}
                  />
                </div>

                {passwordMessage && (
                  <div
                    className={
                      passwordMessage.type === "success"
                        ? "bg-tertiary-container text-on-tertiary-fixed px-4 py-3 rounded-lg font-body-md"
                        : "bg-error-container text-on-error-container px-4 py-3 rounded-lg font-body-md"
                    }
                  >
                    <span className="material-symbols-outlined text-[16px] align-text-bottom mr-1">
                      {passwordMessage.type === "success" ? "check_circle" : "error"}
                    </span>
                    {passwordMessage.text}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="bg-primary text-on-primary px-6 py-2.5 rounded-lg font-label-md text-label-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {passwordLoading ? "Menyimpan..." : "Ubah Password"}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
