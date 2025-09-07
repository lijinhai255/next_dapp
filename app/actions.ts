"use server";

import { signIn, signOut } from "@/auth";
import { writeClient } from "@/sanity/lib/write-client";

export async function handleSignOut() {
  await signOut({ redirectTo: "/" });
}

export async function handleSignIn(provider: string) {
  await signIn(provider);
}

export async function incrementViewCount(id: string, currentViews: number) {
  try {
    await writeClient
      .patch(id)
      .set({ views: (currentViews || 0) + 1 })
      .commit();
    return { success: true };
  } catch (error) {
    console.error('Error incrementing view count:', error);
    return { success: false, error };
  }
}