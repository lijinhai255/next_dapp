import { NextRequest, NextResponse } from "next/server";
import { writeClient } from "@/sanity/lib/write-client";

export async function POST(req: NextRequest) {
    try {
        const { name, username, email, image, bio, walletAddress } = await req.json();
        
        if (!walletAddress) {
            return NextResponse.json(
                { error: "缺少钱包地址" },
                { status: 400 }
            );
        }
        
        console.log("更新用户信息:", { name, username, email, walletAddress });
        
        // 首先查找用户
        const query = `*[_type == "author" && walletAddress == $walletAddress][0]`;
        const existingUser = await writeClient.fetch(query, { walletAddress });
        
        let updatedUser;
        
        if (existingUser) {
            console.log("更新现有用户:", existingUser._id);
            // 更新现有用户
            updatedUser = await writeClient.patch(existingUser._id)
                .set({
                    name: name || undefined,
                    username: username || undefined,
                    email: email || undefined,
                    image: image || undefined,
                    bio: bio || undefined,
                    walletAddress, // 确保钱包地址被保存
                    _updatedAt: new Date().toISOString()
                })
                .commit();
        } else {
            console.log("创建新用户");
            // 创建新用户
            updatedUser = await writeClient.create({
                _type: "author", // 使用 author 类型
                name,
                username,
                email,
                image,
                bio,
                walletAddress,
                _createdAt: new Date().toISOString(),
                _updatedAt: new Date().toISOString()
            });
            console.log("新用户已创建:", updatedUser._id);
        }
        
        return NextResponse.json({ 
            success: true, 
            user: {
                id: updatedUser._id,
                name: updatedUser.name,
                username: updatedUser.username,
                email: updatedUser.email,
                image: updatedUser.image,
                bio: updatedUser.bio,
                walletAddress: updatedUser.walletAddress
            }
        });
    } catch (error) {
        console.error("更新用户信息失败:", error);
        return NextResponse.json(
            { error: "更新用户信息失败", details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}