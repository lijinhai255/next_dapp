import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    id: string;
    walletAddress?: string;
  }

  interface User {
    id: string;
    walletAddress?: string;
  }
}