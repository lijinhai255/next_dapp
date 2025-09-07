import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { AUTHOR_BY_WALLET_ADDRESS_QUERY } from "@/sanity/lib/queries";
import { client } from "@/sanity/lib/client";
import { writeClient } from "@/sanity/lib/write-client";
import { SiweMessage } from "siwe";

export const { handlers, auth, signIn, signOut } = NextAuth({
    providers: [
        CredentialsProvider({
            name: "Ethereum",
            credentials: {
                message: {
                    label: "Message",
                    type: "text",
                },
                signature: {
                    label: "Signature",
                    type: "text",
                },
            },
            async authorize(credentials) {
                try {
                    if (!credentials?.message || !credentials?.signature) {
                        return null;
                    }

                    // 验证签名
                    const siwe = new SiweMessage(JSON.parse(credentials.message));
                    const result = await siwe.verify({
                        signature: credentials.signature,
                    });

                    if (!result.success) {
                        return null;
                    }

                    // 获取钱包地址
                    const walletAddress = siwe.address;

                    // 从 Sanity 查询用户
                    const existingUser = await client
                        .withConfig({ useCdn: false })
                        .fetch(AUTHOR_BY_WALLET_ADDRESS_QUERY, {
                            walletAddress,
                        });

                    // 如果用户不存在，创建新用户
                    if (!existingUser) {
                        const newUser = await writeClient.create({
                            _type: "author",
                            walletAddress,
                            name: `User ${walletAddress.substring(0, 6)}...${walletAddress.substring(38)}`,
                            username: walletAddress.toLowerCase(),
                            image: "", // 可以设置默认头像
                            bio: "",
                        });

                        return {
                            id: newUser._id,
                            name: newUser.name,
                            walletAddress,
                        };
                    }

                    return {
                        id: existingUser._id,
                        name: existingUser.name,
                        walletAddress,
                    };
                } catch (error) {
                    console.error("认证错误:", error);
                    return null;
                }
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.walletAddress = user.walletAddress;
            }
            return token;
        },
        async session({ session, token }) {
            Object.assign(session, {
                id: token.id,
                walletAddress: token.walletAddress
            });
            return session;
        },
    },
});