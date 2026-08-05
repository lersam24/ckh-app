import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nip: "",
    nama: "",
    email: "",
    password: "",
    jabatan: "",
    unitKerja: "",
  });
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await register(form);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Registrasi gagal, coba lagi.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthLayout>
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <div className="flex flex-col items-center text-center mb-6">
          <h1 className="text-xl font-bold text-slate-900">Buat Akun CKH</h1>
          <p className="text-xs text-blue-600 font-medium mt-1">
            APLIKASI CATATAN KINERJA HARIAN
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <Field label="NIP" value={form.nip} onChange={update("nip")} required />
          <Field label="Nama Lengkap" value={form.nama} onChange={update("nama")} required />
          <Field label="Email" type="email" value={form.email} onChange={update("email")} required />
          <Field
            label="Password"
            type="password"
            value={form.password}
            onChange={update("password")}
            required
          />
          <Field label="Jabatan" value={form.jabatan} onChange={update("jabatan")} />
          <Field label="Unit Kerja" value={form.unitKerja} onChange={update("unitKerja")} />

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-lg bg-blue-700 hover:bg-blue-800 disabled:opacity-60 text-white font-medium py-2.5 transition mt-2"
          >
            {isLoading ? "Memproses..." : "Daftar"}
          </button>
        </form>

        <p className="text-center text-sm text-slate-600 mt-5">
          Sudah punya akun?{" "}
          <Link to="/login" className="text-blue-600 font-medium hover:underline">
            Login
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}

function Field({ label, value, onChange, type = "text", required = false }) {
  return (
    <div>
      <label className="block text-sm text-slate-700 mb-1">{label}</label>
      <input
        type={type}
        required={required}
        value={value}
        onChange={onChange}
        className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}
