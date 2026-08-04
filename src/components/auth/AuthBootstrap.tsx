"use client";

import { useEffect } from "react";
import { useAuthStore } from "../../store/authStore";

export default function AuthBootstrap() {
  const hydrate = useAuthStore((state) => state.hydrate);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  return null;
}
