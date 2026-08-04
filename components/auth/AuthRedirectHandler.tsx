"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AuthRedirectHandler() {
  const sessionData = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!sessionData?.data) return;

    const role = (sessionData.data.user as any)?.role;
    if (role === "ADMIN") {
      router.push("/admin");
    } else {
      router.push("/dashboard");
    }
  }, [router, sessionData]);

  return null;
}
