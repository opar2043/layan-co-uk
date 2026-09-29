"use client";

import { createContext, useContext } from "react";
import useAuth from "./useAuth";

export const AuthContext = createContext(null);

/**
 * Accessor hook. Always use this instead of importing AuthContext directly so a
 * missing provider produces one clear message instead of a null-deref.
 */
export default function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return context;
}
