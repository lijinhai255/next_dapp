import { NextRequest, NextResponse } from "next/server";
import { writeClient } from "@/sanity/lib/write-client";

export async function GET(
  request: NextRequest,
  { params }: { params: { address: string } }
) {
  try {
    const walletAddress = params.address;
    
    if (!walletAddress) {
      return NextResponse.json(
        { error: "缺少钱包地址" },
        { status: 400 }
      );
    }
    
    // 使用GROQ查询通过钱包地址查找用户
    const query = `*[_type == "author" && walletAddress == $walletAddress][0]`;
    const user = await writeClient.fetch(query, { walletAddress });
    console.log("查询用户结果:", user);
    
    // 如果用户不存在，返回空对象而不是404错误
    // 这样前端可以处理新用户的情况
    if (!user) {
      return NextResponse.json({ 
        success: true, 
        user: null
      });
    }
    
    return NextResponse.json({ 
      success: true, 
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        image: user.image,
        bio: user.bio,
        walletAddress: user.walletAddress
      }
    });
  } catch (error) {
    console.error("获取用户信息失败:", error);
    return NextResponse.json(
      { error: "获取用户信息失败" },
      { status: 500 }
    );
  }
}