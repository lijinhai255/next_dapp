"use client";

import { Button } from "@/components/ui/button";
import { useAccount, useSignMessage } from "wagmi";
import { getCsrfToken, signIn } from "next-auth/react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export function WalletAuthButton() {
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleLogin = async () => {
    if (!address || !isConnected) {
      toast({
        title: "请先连接钱包",
        description: "您需要先连接钱包才能登录",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);

      // 获取CSRF令牌
      const csrfToken = await getCsrfToken();
      if (!csrfToken) {
        throw new Error("无法获取CSRF令牌");
      }

      // 创建日期时间字符串
      const now = new Date();
      const issuedAt = now.toISOString();

      // 手动创建SIWE消息字符串，遵循EIP-4361格式
      const domain = window.location.host;
      const origin = window.location.origin;
      const statement = "登录到应用程序";
      const version = "1";
      const chainId = 1;

      // 直接构建符合EIP-4361标准的消息
      const messageToSign =
        `${domain} 想要您签名以验证您的身份\n\n` +
        `${statement}\n\n` +
        `URI: ${origin}\n` +
        `版本: ${version}\n` +
        `链ID: ${chainId}\n` +
        `随机数: ${csrfToken}\n` +
        `发布时间: ${issuedAt}`;

      console.log("Message to sign:", messageToSign);

      // 请求用户签名
      const signature = await signMessageAsync({
        message: messageToSign,
      });

      // 发送签名到NextAuth进行验证
      const response = await signIn("credentials", {
        address: address,
        message: messageToSign,
        signature,
        redirect: false,
      });

      if (response?.error) {
        toast({
          title: "登录失败",
          description: response.error,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "登录成功",
        description: "您已成功登录",
      });

      // 刷新页面或重定向
      window.location.reload();
    } catch (error) {
      console.error("登录错误:", error);
      toast({
        title: "登录失败",
        description:
          error instanceof Error ? error.message : "签名过程中出现错误",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleLogin}
      disabled={!isConnected || isLoading}
      className="ml-2 text-white"
    >
      {isLoading ? "登录中..." : "钱包登录"}
    </Button>
  );
}