"use client";

import { signOut } from "next-auth/react";

export default function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="flex items-center gap-2 px-4 py-2 bg-error text-on-error rounded-lg hover:opacity-90 transition-opacity font-label-md text-label-md"
    >
      <span className="material-symbols-outlined text-[18px]">logout</span>
      Keluar
    </button>
  );
}
