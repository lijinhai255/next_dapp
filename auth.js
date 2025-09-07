import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { AUTHOR_BY_WALLET_ADDRESS_QUERY } from "@/sanity/lib/queries";
import { client } from "@/sanity/lib/client";
import { writeClient } from "@/sanity/lib/write-client";
import { SiweMessage } from "siwe";

export const { handlers, auth, signIn, signOut } = NextAuth({
    providers: [],

    debug: process.env.NODE_ENV === "development",
});