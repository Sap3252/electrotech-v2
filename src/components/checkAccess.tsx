"use client";

export default function CheckAccess({ allowed, grupos, children }: any) {
  if (!grupos) return null;

  const visible = grupos.some((g: string) => allowed.includes(g));

  if (!visible) return null;

  return <>{children}</>;
}

