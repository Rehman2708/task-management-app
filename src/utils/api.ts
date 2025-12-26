export const BASE_URL = __DEV__
  ? "http://192.168.0.100:8000"
  : "https://task-management-be-pt1y.onrender.com";

// async function req(path: string, opts: RequestInit = {}) {
//   const res = await fetch(`${BASE_URL}${path}`, {
//     headers: { "Content-Type": "application/json", ...(opts.headers || {}) },
//     ...opts,
//   });
//   if (!res.ok) {
//     const t = await res.text();
//     throw new Error(t || "Request failed");
//   }
//   return res.json();
// }
