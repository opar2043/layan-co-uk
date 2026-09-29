"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import toast from "react-hot-toast";
import auth from "./firebase.config";
import api, { setAuthState } from "@/lib/axios";
import API from "@/lib/endpoints";
import { AuthContext } from "./useAuth";

const TOKEN_KEY = "layan_token";
const ROLE_KEY = "layan_role";
const EMAIL_KEY = "layan_email";

/** Reads the backend JWT session from localStorage. SSR-safe. */
function readBackendSession() {
  if (typeof window === "undefined") return null;
  const token = window.localStorage.getItem(TOKEN_KEY);
  const role = window.localStorage.getItem(ROLE_KEY);
  if (!token || !role) return null;
  return { token, role, email: window.localStorage.getItem(EMAIL_KEY) };
}

function writeBackendSession({ token, role, email }) {
  window.localStorage.setItem(TOKEN_KEY, token);
  window.localStorage.setItem(ROLE_KEY, role);
  if (email) window.localStorage.setItem(EMAIL_KEY, email);
  else window.localStorage.removeItem(EMAIL_KEY);
}

function clearBackendSession() {
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(ROLE_KEY);
  window.localStorage.removeItem(EMAIL_KEY);
}

/**
 * Unifies the backend's two auth systems into one context.
 *
 * Customers authenticate with Firebase. The backend has no customer login of its
 * own — it trusts an `x-firebase-uid` header and provisions the profile through
 * `POST /users/sync`, which returns the full Layan user document.
 *
 * Owner / staff / admin authenticate against `POST /auth/login`, which returns
 * only `{ token, role, businessId }` — no profile. The profile comes from a
 * follow-up `GET /auth/me`, which returns `{ role, profile, businessId? }`.
 * That second call is what every dashboard renders from.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [businessId, setBusinessId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // ------------------------------------------------------------- customers

  /**
   * Pushes the Firebase user into the backend and adopts the returned Layan
   * profile. The backend upserts, so first login and later logins are the same
   * call — `name`/`email` only matter the first time round.
   */
  const syncCustomer = useCallback(async (firebaseUser) => {
    setAuthState({ firebaseUid: firebaseUser.uid, token: null, role: "customer" });
    try {
      // Answers `{ user }` — 201 on first sync, 200 afterwards.
      const result = await api.post(API.userSync, {
        name: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "Customer",
        email: firebaseUser.email,
      });
      const profile = result?.user ?? result;
      setUser(profile);
      setRole("customer");
      setBusinessId(null);
      return profile;
    } catch (error) {
      setAuthState({});
      setUser(null);
      setRole(null);
      setBusinessId(null);
      toast.error(error.message || "Could not sync your Layan profile");
      throw error;
    }
  }, []);

  // ------------------------------------------------- backend (owner/staff/admin)

  /**
   * Hydrates the owner/staff/admin profile. Called after login and on every mount
   * so a stale or revoked JWT is discovered immediately.
   */
  const hydrateBackend = useCallback(async ({ role: expectedRole } = {}) => {
    const session = readBackendSession();
    if (!session) return null;

    setAuthState({ token: session.token, role: session.role });
    const me = await api.get(API.me);
    const actualRole = me?.role ?? session.role;

    setUser(me?.profile ?? null);
    setRole(actualRole);
    setBusinessId(me?.businessId ?? null);

    // The stored role no longer matches the token. Trust the token, fix storage.
    if (actualRole !== session.role) {
      writeBackendSession({
        token: session.token,
        role: actualRole,
        email: session.email,
      });
    }
    if (expectedRole && actualRole !== expectedRole) {
      throw new Error(
        `This account is registered as "${actualRole}", not "${expectedRole}". Pick the matching tab.`
      );
    }
    return me;
  }, []);

  useEffect(() => {
    let cancelled = false;

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          // A live Firebase session is the strongest signal — it wins.
          await syncCustomer(firebaseUser);
        } else {
          const session = readBackendSession();
          if (session) {
            try {
              await hydrateBackend();
            } catch (error) {
              if (error.status === 401 || error.status === 403) {
                // Expired or revoked — drop it silently, the user is simply logged out.
                clearBackendSession();
                setAuthState({});
              } else if (!cancelled) {
                toast.error(error.message || "Could not load your account");
              }
            }
          } else {
            setAuthState({});
            setUser(null);
            setRole(null);
            setBusinessId(null);
          }
        }
      } catch {
        /* syncCustomer already toasted */
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [syncCustomer, hydrateBackend]);

  // ------------------------------------------------------------- public API

  /** Firebase email/password sign-in for customers. */
  const loginCustomer = useCallback((email, password) => {
    // onAuthStateChanged performs the profile sync; returning the credential lets
    // the form drop its pending state once Firebase has accepted the password.
    return signInWithEmailAndPassword(auth, email, password);
  }, []);

  /** Firebase Google sign-in for customers. */
  const loginCustomerWithGoogle = useCallback(() => {
    return signInWithPopup(auth, new GoogleAuthProvider());
  }, []);

  /** Firebase customer registration. The profile sync happens automatically. */
  const registerCustomer = useCallback(async ({ name, email, password }) => {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    if (name) await updateProfile(credential.user, { displayName: name });
    return credential.user;
  }, []);

  /**
   * Backend login for owner / staff / admin.
   *
   * `POST /auth/login` answers `{ token, role, businessId }`. The role it echoes
   * back is checked against the tab the user picked, because the backend searches
   * a single collection per role and would otherwise hand out a token for an
   * account under a different tab.
   */
  const loginBackend = useCallback(
    async (selectedRole, { email, password }) => {
      const result = await api.post(API.login, { email, password, role: selectedRole });

      if (result?.role !== selectedRole) {
        throw new Error(
          `This account is registered as "${result?.role}", not "${selectedRole}". Pick the matching tab.`
        );
      }
      if (!result?.token) {
        throw new Error("The server did not return a token. Check the API is running.");
      }

      writeBackendSession({ token: result.token, role: result.role, email });
      setAuthState({ token: result.token, role: result.role });
      setBusinessId(result.businessId ?? null);

      // Swap the token in for the real profile before any dashboard renders.
      try {
        await hydrateBackend({ role: selectedRole });
      } catch (error) {
        clearBackendSession();
        setAuthState({});
        throw error;
      }
      return result;
    },
    [hydrateBackend]
  );

  /**
   * Owner registration. `POST /auth/register/owner` answers
   * `{ token, role, business }` and the new business starts life as
   * `verificationStatus: pending`, so it will not appear in public search until an
   * admin approves it.
   */
  const registerOwner = useCallback(async (payload) => {
    const result = await api.post(API.registerOwner, payload);
    if (result?.token) {
      writeBackendSession({ token: result.token, role: result.role, email: payload.email });
      setAuthState({ token: result.token, role: result.role });
      setUser(result.business ?? null);
      setRole("owner");
      setBusinessId(result.business?._id ?? null);
    }
    return result;
  }, []);

  /** Signs out of whichever system is active. Safe to call when already signed out. */
  const logout = useCallback(async () => {
    try {
      await signOut(auth);
    } catch {
      /* Firebase may already be out; the local clear below is what matters */
    }
    clearBackendSession();
    setAuthState({});
    setUser(null);
    setRole(null);
    setBusinessId(null);
    toast.success("Signed out");
  }, []);

  /** Re-reads the profile from the backend after a mutation changes it. */
  const refresh = useCallback(async () => {
    if (auth.currentUser) return syncCustomer(auth.currentUser);
    return hydrateBackend();
  }, [syncCustomer, hydrateBackend]);

  const value = useMemo(
    () => ({
      user,
      role,
      businessId,
      isLoading,
      isAuthenticated: Boolean(user && role),
      isCustomer: role === "customer",
      loginCustomer,
      loginCustomerWithGoogle,
      registerCustomer,
      loginBackend,
      registerOwner,
      logout,
      refresh,
    }),
    [
      user,
      role,
      businessId,
      isLoading,
      loginCustomer,
      loginCustomerWithGoogle,
      registerCustomer,
      loginBackend,
      registerOwner,
      logout,
      refresh,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthProvider;
