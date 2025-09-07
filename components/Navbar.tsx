import Link from "next/link";
import Image from "next/image";
import { WalletConnect } from "./WalletConnect";

export default async function Navbar() {
  return (
    <header className="px-5 py-3 bg-white shadow-sm font-work-sans">
      <nav className="flex justify-between items-center">
        <Link href="/">
          <Image src="/logo.png" alt="Logo" width={120} height={30} />
        </Link>
        <div className="flex items-center gap-5 text-black">
          <>
            <Link href="/startup/ai" className="text-gray-600">
              <span>AI</span>
            </Link>
            <Link href="/startup/create" className="text-gray-600">
              <span>Create</span>
            </Link>
            <Link href="/profile" className="text-gray-600">
              <span>profile</span>
            </Link>

            <WalletConnect />
          </>
        </div>
      </nav>
    </header>
  );
}