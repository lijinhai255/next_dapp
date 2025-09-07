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
                        console.log("缺少凭据");
                        return null;
                    }

                    let siweMessage;
                    try {
                        // 解析消息对象
                        siweMessage = new SiweMessage(JSON.parse(credentials.message));
                    } catch (error) {
                        console.error("SIWE消息解析错误:", error);
                        return null;
                    }
                    // 验证签名
                    let result;
                    try {
                        result = await siweMessage.verify({
                            signature: credentials.signature,
                        });
                    } catch (error) {
                        console.error("SIWE验证错误:", error);
                        return null;
                    }
                    if (!result.success) {
                        console.error("签名验证失败:", result.error);
                        return null;
                    }

                    // 获取钱包地址
                    const walletAddress = siweMessage.address;
                    // 从 Sanity 查询用户
                    const existingUser = await client
                        .withConfig({ useCdn: false })
                        .fetch(AUTHOR_BY_WALLET_ADDRESS_QUERY, {
                            walletAddress,
                        });
                    if (!existingUser) {
                        const shortAddress = `${walletAddress.substring(0, 6)}...${walletAddress.substring(38)}`;
                        // 生成随机头像URL (使用Gravatar或其他服务)
                        const defaultImage = `https://avatars.dicebear.com/api/identicon/${walletAddress}.svg`;

                        const newUser = await writeClient.create({
                            _type: "author",
                            walletAddress,
        name: `User ${shortAddress}`,
        username: walletAddress.toLowerCase(),
        image: defaultImage, // 设置默认头像
        bio: "Web3用户", // 设置默认简介
        _createdAt: new Date().toISOString(),
    });

                        console.log(`创建了新用户: ${newUser._id} 钱包地址: ${walletAddress}`);

                        return {
                            id: newUser._id,
                            name: newUser.name,
                            walletAddress,
        image: defaultImage,
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
    debug: process.env.NODE_ENV === "development",
});