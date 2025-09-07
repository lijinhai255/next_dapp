"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import { MTK_CONTRACT_ADDRESS } from "../wagmi";
import { useBalance, useReadContract } from "wagmi";
import { erc20Abi } from "viem";

import { useState, useEffect } from "react";

// 创建一个单独的组件来处理代币余额显示
function TokenBalanceDisplay({
  account,
  connected,
}: {
  account: { address?: `0x${string}` } | null;
  connected: boolean;
}) {
  const mik_address = MTK_CONTRACT_ADDRESS as `0x${string}`;
  const [mtkBalance, setMtkBalance] = useState("0");
  const [tokenSymbol, setTokenSymbol] = useState("MTK");

  // 获取代币符号
  const { data: symbolData } = useReadContract({
    address: mik_address,
    abi: erc20Abi,
    functionName: "symbol",
    query: {
      enabled: connected && !!account,
    },
  });

  // 获取代币余额
  const { data: balanceData } = useBalance({
    address: account?.address,
    token: mik_address,
    query: {
      enabled: connected && !!account?.address,
    },
  });

  // 更新代币符号
  useEffect(() => {
    if (symbolData) {
      setTokenSymbol(symbolData);
    }
  }, [symbolData]);

  // 更新代币余额
  useEffect(() => {
    if (balanceData) {
      setMtkBalance(balanceData.formatted);
      console.log("MTK Balance:", balanceData.formatted);
    }
  }, [balanceData]);

  if (!connected || !account) {
    return null;
  }

  return (
    <div className="text-sm mt-2">
      MTK 余额: {mtkBalance} {tokenSymbol}
    </div>
  );
}

export function WalletConnect() {
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        // 注意: 如果您的应用使用服务器端渲染，这一步很重要
        const ready = mounted && authenticationStatus !== "loading";
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus || authenticationStatus === "authenticated");

        // 如果组件未准备好，显示骨架屏
        if (!ready) {
          return <Skeleton className="h-10 w-32" />;
        }

        return (
          <div>
            {(() => {
              if (!connected) {
                return (
                  <Button
                    onClick={openConnectModal}
                    type="button"
                    className="text-white"
                  >
                    连接钱包
                  </Button>
                );
              }

              if (chain.unsupported) {
                return (
                  <Button
                    onClick={openChainModal}
                    type="button"
                    variant="destructive"
                  >
                    错误网络
                  </Button>
                );
              }

              return (
                <div className="flex items-center gap-2">
                  <Button
                    onClick={openChainModal}
                    type="button"
                    variant="outline"
                    className="flex items-center gap-1"
                  >
                    {chain.hasIcon && (
                      <div
                        style={{
                          background: chain.iconBackground,
                          width: 16,
                          height: 16,
                          borderRadius: 999,
                          overflow: "hidden",
                        }}
                      >
                        {chain.iconUrl && (
                          <Image
                            alt={chain.name ?? "Chain icon"}
                            src={chain.iconUrl}
                            width="16"
                            height="16"
                          />
                        )}
                      </div>
                    )}
                    {chain.name}
                  </Button>

                  <Button
                    onClick={openAccountModal}
                    type="button"
                    variant="outline"
                  >
                    {account.displayName}
                  </Button>

                  {/* 使用单独的组件来处理代币余额显示 */}
                  <TokenBalanceDisplay
                    account={account}
                    connected={connected}
                  />
                </div>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}
