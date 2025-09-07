"use client";

import { useState } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther } from "viem";
import { MTK_CONTRACT_ADDRESS } from "@/wagmi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// 简化版的 ERC20 ABI，只包含 transfer 函数
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

  const handleSendMIK = () => {
    if (!amount || isNaN(Number(amount))) return;

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
          disabled={isWritePending || isConfirming || !amount}
          className="w-full text-white"
        >
          {isWritePending || isConfirming
            ? "Processing..."
            : `Send MIK to ${startupName}`}
        </Button>

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
