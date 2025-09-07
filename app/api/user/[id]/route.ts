import { NextRequest, NextResponse } from "next/server";
import { client } from "@/sanity/lib/client";
import { AUTHOR_BY_ID_QUERY } from "@/sanity/lib/queries";

// 修改：params 现在是一个 Promise
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // 修改：等待 params Promise 解析
  const resolvedParams = await params;
  const id = resolvedParams.id;

  try {
    const user = await client.fetch(AUTHOR_BY_ID_QUERY, { id });

    if (!user) {
      return NextResponse.json(
        { error: "用户不存在" },
        { status: 404 }
      );
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("获取用户信息失败:", error);
    return NextResponse.json(
      { error: "获取用户信息失败" },
      { status: 500 }
    );
  }
}