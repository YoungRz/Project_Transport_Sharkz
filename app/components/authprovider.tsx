"use client";

import { createContext, useCallback, useContext, useMemo, useSyncExternalStore } from "react";
import type { ReactNode } from "react";
import { api, loadSession, parseSession, readSessionRaw, saveSession, subscribeSession } from "../lib/api";
import type { User } from "../lib/api";

interface AuthValue {
  user: User | null;
  ready: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
  updateUser: (patch: Partial<User>) => void;
}

const AuthContext = createContext<AuthValue | null>(null);

const noopSubscribe = () => () => {};

export function AuthProvider({ children }: { children: ReactNode }) {
  const raw = useSyncExternalStore(subscribeSession, readSessionRaw, () => null);
  // false saat render di server dan hidrasi pertama, true setelahnya
  const ready = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const user = useMemo(() => parseSession(raw)?.user ?? null, [raw]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await api<{ token: string; user: User }>("/auth/login", {
      method: "POST",
      body: { email, password },
    });
    saveSession({ token: res.token, user: res.user });
    return res.user;
  }, []);

  const logout = useCallback(() => saveSession(null), []);

  const updateUser = useCallback((patch: Partial<User>) => {
    const session = loadSession();
    if (session) saveSession({ token: session.token, user: { ...session.user, ...patch } });
  }, []);

  const value = useMemo(
    () => ({ user, ready, login, logout, updateUser }),
    [user, ready, login, logout, updateUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth harus dipakai di dalam AuthProvider");
  return ctx;
}