import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function getCurrentProfile() {
  const cookieStore = await cookies();
  const profileId = cookieStore.get("profile_session")?.value;

  if (!profileId) return null;

  try {
    const profile = await prisma.profile.findUnique({
      where: { id: profileId },
    });
    return profile;
  } catch (error) {
    return null;
  }
}

export async function requireAdmin() {
  const profile = await getCurrentProfile();
  if (profile?.role !== "admin") {
    throw new Error("Unauthorized");
  }
  return profile;
}

export async function requireUser() {
  const profile = await getCurrentProfile();
  if (!profile) {
    throw new Error("Unauthenticated");
  }
  return profile;
}
