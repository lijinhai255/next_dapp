"use client";

import { useState, useEffect } from "react";
import {
  useWriteContract,
  useWaitForTransactionReceipt,
  useAccount,
  useBalance,
  useWatchContractEvent,
} from "wagmi";
import { parseEther } from "viem";
import { MTK_CONTRACT_ADDRESS } from "@/wagmi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// 扩展 ERC20 ABI，包含 transfer 函数和 Transfer 事件
const erc20ABI = [
  {
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    name: "transfer",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "from", type: "address" },
      { indexed: true, name: "to", type: "address" },
      { indexed: false, name: "value", type: "uint256" },
    ],
    name: "Transfer",
    type: "event",
  },
];

interface SendMIKTransactionProps {
  recipientAddress: string;
  startupName: string;
}

const SendMIKTransaction = ({
  recipientAddress,
  startupName,
}: SendMIKTransactionProps) => {
  const [amount, setAmount] = useState("");
  const { address: userAddress } = useAccount();
  const [shouldRefreshBalance, setShouldRefreshBalance] = useState(false);

  const {
    writeContract,
    data: hash,
    isPending: isWritePending,
    isError: isWriteError,
    error: writeError,
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isSuccess } =
    useWaitForTransactionReceipt({
      hash,
    });

  // 获取余额并提供刷新方法
  const { refetch: refetchBalance } = useBalance({
    address: userAddress,
    token: MTK_CONTRACT_ADDRESS,
  });

  // 检查当前地址和接收地址是否相同
  const isSameAddress =
    userAddress?.toLowerCase() === recipientAddress?.toLowerCase();

  // 监听 Transfer 事件
  useWatchContractEvent({
    address: MTK_CONTRACT_ADDRESS,
    abi: erc20ABI,
    eventName: 'Transfer',
    onLogs(logs) {
      // 检查事件是否与当前用户相关
      const relevantEvents = logs.filter(log => {
        const { from, to } = log.args;
        return (from === userAddress || to === userAddress);
      });
      
      if (relevantEvents.length > 0) {
        console.log("检测到与用户相关的 Transfer 事件:", relevantEvents);
        setShouldRefreshBalance(true);
      }
    },
  });

  // 当需要刷新余额时执行
  useEffect(() => {
    if (shouldRefreshBalance) {
      console.log("正在刷新 MTK 余额...");
      refetchBalance();
      setShouldRefreshBalance(false);
    }
  }, [shouldRefreshBalance, refetchBalance]);

  // 交易成功后也触发余额刷新
  useEffect(() => {
    if (isSuccess) {
      // 延迟一小段时间后刷新余额，确保链上数据已更新
      const timer = setTimeout(() => {
        refetchBalance();
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [isSuccess, refetchBalance]);

  const handleSendMIK = () => {
    if (!amount || isNaN(Number(amount)) || isSameAddress) return;

    writeContract({
      address: MTK_CONTRACT_ADDRESS,
      abi: erc20ABI,
      functionName: "transfer",
      args: [recipientAddress, parseEther(amount)],
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-200 dark:border-gray-700 mt-6">
      <h3 className="text-xl font-bold mb-4">Support this Startup with MIK</h3>

      <div className="flex flex-col space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Amount of MIK
          </label>
          <Input
            type="text"
            placeholder="Enter MIK amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full"
          />
        </div>

        <Button
          onClick={handleSendMIK}
          disabled={isWritePending || isConfirming || !amount || isSameAddress}
          className="w-full text-white"
        >
          {isWritePending || isConfirming
            ? "Processing..."
            : isSameAddress
              ? "Cannot send to your own address"
              : `Send MIK to ${startupName}`}
        </Button>

        {isSameAddress && (
          <p className="text-amber-500 text-sm">
            You cannot send MIK to your own address.
          </p>
        )}

        {isWriteError && (
          <p className="text-red-500 text-sm">Error: {writeError?.message}</p>
        )}

        {isSuccess && (
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <p className="text-green-600 dark:text-green-400">
              Transaction successful! You sent {amount} MIK.
            </p>
            <a
              href={`https://etherscan.io/tx/${hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 underline text-sm"
            >
              View on Etherscan
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default SendMIKTransaction;