import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Email atau password salah.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthLayout>
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="h-16 w-16 mb-3 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xl">
            CKH
          </div>
          <h1 className="text-xl font-bold text-slate-900">CKH APP</h1>
          <p className="text-xs text-blue-600 font-medium mt-1 leading-relaxed">
            APLIKASI CATATAN KINERJA HARIAN
            <br />
            BADAN PUSAT STATISTIK
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm text-slate-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              placeholder="nama@bps.go.id"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm text-slate-700 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-slate-300 pr-16 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute inset-y-0 right-3 text-xs text-slate-400"
              >
                {showPassword ? "Sembunyikan" : "Tampilkan"}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-lg bg-blue-700 hover:bg-blue-800 disabled:opacity-60 text-white font-medium py-2.5 transition"
          >
            {isLoading ? "Memproses..." : "Login"}
          </button>
        </form>

        <p className="text-center text-sm text-slate-600 mt-5">
          Belum Punya Akun?{" "}
          <Link to="/register" className="text-blue-600 font-medium hover:underline">
            Registrasi
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
