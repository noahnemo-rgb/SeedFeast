"use client";

import { useEffect } from "react";
import useAuth from "@/utils/useAuth";

export default function LogoutPage() {
  const { signOut } = useAuth();

  useEffect(() => {
    const logout = async () => {
      await signOut({
        callbackUrl: "/account/signin",
        redirect: true,
      });
    };
    logout();
  }, [signOut]);

  return (
    <div className="min-h-screen bg-[#F8F8F8] flex items-center justify-center">
      <p className="text-[#8C8C8C]">Signing out...</p>
    </div>
  );
}
