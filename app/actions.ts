"use server";

import { signIn, signOut } from "@/auth";

export async function handleSignOut() {
  await signOut({ redirectTo: "/" });
}

export async function handleSignIn(provider: string) {
  await signIn(provider);
}