import { ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
  type?: "login" | "register";
}

export default function AuthLayout({ children, type = "login" }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header BPS */}
      <header className="bg-gradient-to-r from-sky-500 to-cyan-400 py-4 shadow-md relative z-20">
        <div className="flex items-center justify-center gap-3">
          <img
            src="/header-login-page-removebg-preview.png"
            alt="Header login page"
            className="h-10 w-auto object-contain"
          />
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center bg-[radial-gradient(ellipse_at_center,_#cef7f8_10%,_#5cd6d9_100%)] relative overflow-hidden px-4 py-12 md:py-16">
        {/* Inner layout wrapper to bound absolute children */}
        <div className="relative w-full max-w-6xl mx-auto min-h-[550px] flex items-center justify-center">
          
          {type === "login" ? (
            <>
              {/* Element 3: Top-Left (Man typing on PC) */}
              <div className="absolute left-[0%] top-[0%] w-[260px] xl:w-[280px] hidden lg:block select-none pointer-events-none drop-shadow-[0_20px_25px_rgba(0,0,0,0.15)] animate-float-slow">
                <img
                  src="/element-login-page (3).png"
                  alt="Element Top Left"
                  className="w-full h-auto object-contain"
                />
              </div>

              {/* Element 2: Bottom-Left (Woman working on Laptop) */}
              <div className="absolute left-[0%] bottom-[0%] w-[260px] xl:w-[280px] hidden lg:block select-none pointer-events-none drop-shadow-[0_20px_25px_rgba(0,0,0,0.15)] animate-float-medium">
                <img
                  src="/element-login-page (2).png"
                  alt="Element Bottom Left"
                  className="w-full h-auto object-contain"
                />
              </div>

              {/* Element 1: Middle-Right (Man working at PC monitor) */}
              <div className="absolute right-[0%] top-[15%] w-[300px] xl:w-[320px] hidden lg:block select-none pointer-events-none drop-shadow-[0_20px_25px_rgba(0,0,0,0.15)] animate-float-fast">
                <img
                  src="/element-login-page (1).png"
                  alt="Element Right"
                  className="w-full h-auto object-contain"
                />
              </div>
            </>
          ) : (
            <>
              {/* Register Left (Man standing with tablet) */}
              <div className="absolute left-[0%] top-[10%] w-[300px] xl:w-[320px] hidden lg:block select-none pointer-events-none drop-shadow-[0_20px_25px_rgba(0,0,0,0.15)] animate-float-slow">
                <img
                  src="/element-register-page-left.png"
                  alt="Element Left"
                  className="w-full h-auto object-contain"
                />
              </div>

              {/* Register Right (Woman sitting with laptop) */}
              <div className="absolute right-[0%] top-[20%] w-[300px] xl:w-[320px] hidden lg:block select-none pointer-events-none drop-shadow-[0_20px_25px_rgba(0,0,0,0.15)] animate-float-medium">
                <img
                  src="/element-register-page-right.png"
                  alt="Element Right"
                  className="w-full h-auto object-contain"
                />
              </div>
            </>
          )}

          {/* Central Auth Form Card */}
          <div className="relative z-10 w-full flex justify-center">
            {children}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-100 py-4 text-center text-xs text-slate-500 relative z-20">
        © 2024 Aplikasi CKH. All rights reserved. &middot;{" "}
        <span className="font-semibold text-slate-700">Aplikasi CKH PUSDIKLAT BPS</span> &middot;{" "}
        <a href="#" className="hover:underline text-slate-500">Privacy</a> &middot;{" "}
        <a href="#" className="hover:underline text-slate-500">Terms</a>
      </footer>
    </div>
  );
}
