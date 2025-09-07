"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { MTK_CONTRACT_ADDRESS } from "@/wagmi";
import { formatEther } from "viem";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

// 定义交易记录的类型
interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  timestamp: number;
  blockNumber: number;
  isReceived: boolean;
}

// 格式化地址显示
const formatAddress = (address: string): string => {
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
};

// 格式化时间戳
const formatTimestamp = (timestamp: number): string => {
  return new Date(timestamp * 1000).toLocaleString();
};

// Etherscan API Key - 理想情况下应该存储在环境变量中
const ETHERSCAN_API_KEY = "YOUR_ETHERSCAN_API_KEY"; // 请替换为您的 API 密钥
const ETHERSCAN_API_URL = "https://api.etherscan.io/api";

export default function TransactionHistory() {
  const { address } = useAccount();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // 获取交易历史
  const fetchTransactionHistory = async () => {
    if (!address) return;

    setLoading(true);

    try {
      // 获取与 MTK 代币相关的交易
      const response = await fetch(
        `${ETHERSCAN_API_URL}?module=account&action=tokentx&contractaddress=${MTK_CONTRACT_ADDRESS}&address=${address}&sort=desc&apikey=${ETHERSCAN_API_KEY}`
      );

      const data = await response.json();

      if (data.status === "1" && Array.isArray(data.result)) {
        // 处理交易数据
        const processedTransactions = data.result.map((tx: any) => ({
          hash: tx.hash,
          from: tx.from,
          to: tx.to,
          value: tx.value,
          timestamp: parseInt(tx.timeStamp),
          blockNumber: parseInt(tx.blockNumber),
          isReceived: tx.to.toLowerCase() === address.toLowerCase(),
        }));

        setTransactions(processedTransactions);
      } else {
        console.error("获取交易历史失败:", data.message);
        setTransactions([]);
      }
    } catch (error) {
      console.error("获取交易历史失败:", error);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  // 当地址变化时获取交易历史
  useEffect(() => {
    if (address) {
      fetchTransactionHistory();
    }
  }, [address]);

  // 根据当前选项卡筛选交易
  const filteredTransactions = transactions.filter((tx) => {
    if (activeTab === "all") return true;
    if (activeTab === "sent") return !tx.isReceived;
    if (activeTab === "received") return tx.isReceived;
    return true;
  });

  // 计算分页
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const currentTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // 处理页面变化
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // 格式化代币值，将字符串转换为 bigint
  const formatTokenValue = (value: string): string => {
    try {
      // 将字符串转换为 bigint，然后使用 formatEther
      return formatEther(BigInt(value));
    } catch (error) {
      console.error("格式化代币值失败:", error);
      return "0";
    }
  };

  if (!address) {
    return <div className="text-center p-4">请连接钱包以查看交易历史</div>;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-200 dark:border-gray-700 mt-6">
      <h3 className="text-xl font-bold mb-4">MTK 交易历史</h3>

      <Tabs
        defaultValue="all"
        value={activeTab}
        onValueChange={setActiveTab}
        className="mb-4"
      >
        <TabsList>
          <TabsTrigger value="all">全部</TabsTrigger>
          <TabsTrigger value="sent">发送</TabsTrigger>
          <TabsTrigger value="received">接收</TabsTrigger>
        </TabsList>
      </Tabs>

      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      ) : transactions.length === 0 ? (
        <div className="text-center p-8 text-gray-500">没有找到交易记录</div>
      ) : (
        <>
          <div className="space-y-3">
            {currentTransactions.map((tx) => (
              <Card key={tx.hash} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-block w-2 h-2 rounded-full ${
                            tx.isReceived ? "bg-green-500" : "bg-blue-500"
                          }`}
                        ></span>
                        <span className="font-medium">
                          {tx.isReceived ? "接收" : "发送"}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        {formatTimestamp(tx.timestamp)}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-medium">
                        {tx.isReceived ? "+" : "-"}
                        {formatTokenValue(tx.value)} MTK
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        {tx.isReceived
                          ? `从 ${formatAddress(tx.from)}`
                          : `至 ${formatAddress(tx.to)}`}
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    <a
                      href={`https://etherscan.io/tx/${tx.hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      查看交易详情
                    </a>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {totalPages > 1 && (
            <Pagination className="mt-4">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() =>
                      handlePageChange(Math.max(1, currentPage - 1))
                    }
                    className={
                      currentPage === 1
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>

                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  // 显示当前页附近的页码
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <PaginationItem key={i}>
                      <PaginationLink
                        onClick={() => handlePageChange(pageNum)}
                        isActive={currentPage === pageNum}
                      >
                        {pageNum}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}

                {totalPages > 5 && currentPage < totalPages - 2 && (
                  <>
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationLink
                        onClick={() => handlePageChange(totalPages)}
                      >
                        {totalPages}
                      </PaginationLink>
                    </PaginationItem>
                  </>
                )}

                <PaginationItem>
                  <PaginationNext
                    onClick={() =>
                      handlePageChange(Math.min(totalPages, currentPage + 1))
                    }
                    className={
                      currentPage === totalPages
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}

          <div className="mt-4 text-right">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchTransactionHistory}
            >
              刷新交易记录
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
