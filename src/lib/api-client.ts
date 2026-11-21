/**
 * API Client connector for Jersey Fit Storefront.
 * Communicates with the Jersey Fit Backend RPC endpoint.
 */

const API_BASE_URL =
  typeof window !== "undefined"
    ? ((window as any).__JF_API_URL__ ||
       (import.meta as any).env?.VITE_API_URL ||
       "http://localhost:3001")
    : "http://localhost:3001";

export async function callBackendApi<T = any>(
  action: string,
  params?: any,
  token?: string
): Promise<T> {
  let authToken = token;
  if (!authToken && typeof window !== "undefined") {
    try {
      const sessionStr = window.localStorage.getItem("jf_session");
      if (sessionStr) {
        const parsed = JSON.parse(sessionStr);
        authToken = parsed.token;
      }
    } catch {
      // ignore
    }
  }

  const response = await fetch(`${API_BASE_URL}/api/rpc`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    },
    body: JSON.stringify({ action, params }),
  });

  if (!response.ok) {
    const errorBody = await response
      .json()
      .catch(() => ({ message: "Unknown server error" }));
    throw new Error(errorBody.message || `Request failed with status ${response.status}`);
  }

  return (await response.json()) as T;
}
