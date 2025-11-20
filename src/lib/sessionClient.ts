"use client";

// Decodificar JWT manualmente (sin verificar firma)
export async function getSessionClient() {
  const token = getCookie("session");
  if (!token) return null;

  try {
    // JWT tiene 3 partes: header.payload.signature
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    // Decodificar la parte del payload (base64url)
    const payload = parts[1];
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    
    return decoded || null;
  } catch {
    return null;
  }
}

function getCookie(name: string) {
  if (typeof document === "undefined") return null;

  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? decodeURIComponent(match[2]) : null;
}
