import { auth } from "@/lib/auth";

export async function requireAuth(requiredRole?: "admin") {
  const session = await auth();

  if (!session?.user) {
    return { error: "Unauthorized", status: 401, session: null };
  }

  if (requiredRole === "admin" && session.user.role !== "admin") {
    return { error: "Forbidden", status: 403, session: null };
  }

  return { error: null, status: 200, session };
}
