import axios from "axios";
import API from "./endpoints";

/**
 * The current credential, held in a module-level variable so the Axios
 * interceptors can read it without importing React or creating a cycle.
 *
 * `AuthProvider` pushes into this on every auth state change. Exactly one of
 * `firebaseUid` / `token` is set at a time — that is what the backend expects:
 * customers send x-firebase-uid, owner/staff/admin send a bearer token.
 */
export const authState = {
  firebaseUid: null,
  token: null,
  role: null,
};

/** Called by AuthProvider. Never call this from a component. */
export function setAuthState({ firebaseUid = null, token = null, role = null } = {}) {
  authState.firebaseUid = firebaseUid;
  authState.token = token;
  authState.role = role;
}

const api = axios.create({
  baseURL: API.registerOwner.replace("/auth/register/owner", ""),
  timeout: 20_000,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  if (authState.firebaseUid) {
    config.headers["x-firebase-uid"] = authState.firebaseUid;
  }
  if (authState.token) {
    config.headers.Authorization = `Bearer ${authState.token}`;
  }
  return config;
});

/**
 * Unwraps the backend's `{ success, message, data }` envelope so hooks receive
 * `data` directly, and normalises every failure to `{ status, message }` for
 * consistent toasts. Raw Axios errors never reach a component.
 */
api.interceptors.response.use(
  (response) => {
    const body = response.data;
    // File uploads and any non-enveloped response pass straight through.
    if (body && typeof body === "object" && "success" in body && "data" in body) {
      if (body.success === false) {
        return Promise.reject(
          Object.assign(new Error(body.message || "Request failed"), {
            status: response.status,
            body: body.errors,
          })
        );
      }
      return body.data;
    }
    return body;
  },
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      return Promise.reject(
        Object.assign(new Error(data?.message || `Request failed (${status})`), {
          status,
          body: data?.errors,
        })
      );
    }
    if (error.request) {
      return Promise.reject(
        Object.assign(
          new Error(
            `Cannot reach the Layan API at ${api.defaults.baseURL}. Is the backend running?`
          ),
          { status: 0 }
        )
      );
    }
    return Promise.reject(Object.assign(new Error(error.message || "Network error"), { status: 0 }));
  }
);

export default api;
