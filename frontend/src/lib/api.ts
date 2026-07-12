/**
 * @module apiFetch
 * @description Helper client wrapper around native fetch to call backend endpoints.
 *              Automatically includes JWT auth headers from localStorage.
 */

const BASE_URL = ""; // Rewritten to http://localhost:3001 via Next.js rewrites

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  // Only access localStorage on client side
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const headers = new Headers(options.headers);

  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const normalizedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;

  const res = await fetch(`${BASE_URL}/api${normalizedEndpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    let errorMessage = `HTTP error! Status: ${res.status}`;
    try {
      const errorData = await res.json();
      errorMessage = errorData.message || errorMessage;
    } catch (e) {
      // Response is not JSON, ignore
    }
    throw new Error(errorMessage);
  }

  if (res.status === 204) {
    return null;
  }

  try {
    return await res.json();
  } catch (e) {
    return null;
  }
}
