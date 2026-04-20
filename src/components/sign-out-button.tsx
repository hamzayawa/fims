"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { useState } from "react";

export function SignOutButton() {
  const router = useRouter();
  const [isSignOut, setIsSignOut] = useState(false);

  const handleSignOut = async () => {
    setIsSignOut(true);
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/login");
          router.refresh();
        },
      },
    });
  };

  return (
    <button
      onClick={handleSignOut}
      disabled={isSignOut}
      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-400 hover:text-white hover:bg-red-500/20 transition-all font-medium text-sm w-full"
    >
      <LogOut className="w-4 h-4" />
      {isSignOut ? "Signing out..." : "Sign Out"}
    </button>
  );
}
