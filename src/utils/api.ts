// export const BASE_URL = "https://task-management-be-pt1y.onrender.com";
export const BASE_URL = "http://localhost:8000";

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
