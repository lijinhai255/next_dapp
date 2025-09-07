"use client";

import { Button } from "@/components/ui/button";
import { useAccount, useSignMessage } from "wagmi";
import { SiweMessage } from "siwe";
import { signIn } from "next-auth/react";
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

      // 创建随机nonce
      const nonce = Math.floor(Math.random() * 1000000).toString();
      // 创建SIWE消息
      const message = new SiweMessage({
        domain: window.location.host,
        address,
        statement: "登录到应用程序",
        uri: window.location.origin,
        version: "1",
        chainId: 1, // 根据您的应用调整
        nonce,
      });

      // 获取要签名的消息
      const messageToSign = message.prepareMessage();

      // 请求用户签名
      const signature = await signMessageAsync({ message: messageToSign });

      // 发送签名到NextAuth进行验证
      const response = await signIn("credentials", {
        message: JSON.stringify(message),
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

      // 刷新页面
      window.location.reload();
    } catch (error) {
      console.error("登录错误:", error);
      toast({
        title: "登录失败",
        description: "签名过程中出现错误",
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
