export function backendOrigin() {
  const raw = process.env.BACKEND_API_URL || "http://127.0.0.1:4000";
  const url = new URL(raw);
  if (
    !["http:", "https:"].includes(url.protocol) ||
    url.pathname !== "/" ||
    url.username ||
    url.password ||
    url.search ||
    url.hash
  )
    throw new Error("BACKEND_API_URL must be an HTTP origin.");
  return url.origin;
}
