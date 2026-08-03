"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../lib/auth-context";

export default function AccueilPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) return;
    router.replace(user.role === "ADMIN" ? "/cotisations" : "/mes-cotisations");
  }, [user, router]);

  return null;
}