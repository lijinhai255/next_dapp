"use client";

import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface UserProfileEditProps {
  initialData: {
    name?: string;
    username?: string;
    email?: string;
    image?: string;
    bio?: string;
  };
  onSuccess?: () => void;
  walletAddress?: string; // 添加钱包地址作为属性
}

export function UserProfileEdit({
  initialData,
  onSuccess,
  walletAddress,
}: UserProfileEditProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: initialData.name || "",
    username: initialData.username || "",
    email: initialData.email || "",
    image: initialData.image || "",
    bio: initialData.bio || "",
    walletAddress: walletAddress || "", // 使用传入的钱包地址
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log("提交表单数据:", { ...formData, walletAddress });

      const response = await fetch("/api/user/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          walletAddress, // 确保钱包地址被包含在请求中
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "更新失败");
      }

      toast({
        title: "个人信息已更新",
        description: "您的个人资料已成功更新",
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("更新失败:", error);
      toast({
        title: "更新失败",
        description:
          error instanceof Error ? error.message : "无法更新个人资料",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-1">
          名称
        </label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="您的名称"
        />
      </div>

      <div>
        <label htmlFor="username" className="block text-sm font-medium mb-1">
          用户名
        </label>
        <Input
          id="username"
          name="username"
          value={formData.username}
          onChange={handleChange}
          placeholder="用户名"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-1">
          邮箱
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="您的邮箱"
        />
      </div>

      <div>
        <label htmlFor="image" className="block text-sm font-medium mb-1">
          头像URL
        </label>
        <Input
          id="image"
          name="image"
          value={formData.image}
          onChange={handleChange}
          placeholder="头像图片URL"
        />
      </div>

      <div>
        <label htmlFor="bio" className="block text-sm font-medium mb-1">
          个人简介
        </label>
        <Textarea
          id="bio"
          name="bio"
          value={formData.bio}
          onChange={handleChange}
          placeholder="关于您自己的简短介绍"
          rows={3}
        />
      </div>

      {/* 隐藏的钱包地址字段 */}
      <input type="hidden" name="walletAddress" value={walletAddress} />

      <Button
        type="submit"
        disabled={isLoading}
        className="bg-primary hover:bg-primary/90 text-white font-medium py-2 px-4 rounded-md shadow-100 hover:shadow-200 transition-all"
      >
        {isLoading ? "更新中..." : "保存更改"}
      </Button>
    </form>
  );
}
