import Link from "next/link";
import Image from "next/image";
import { auth, signOut } from "@/auth";
import { WalletConnect } from "./WalletConnect";
import { WalletAuthButton } from "./WalletAuthButton";

export default async function Navbar() {
  const session = await auth();
  console.log("session", session);
  return (
    <header className="px-5 py-3 bg-white shadow-sm font-work-sans">
      <nav className="flex justify-between items-center">
        <Link href="/">
          <Image src="/logo.png" alt="Logo" width={120} height={30} />
        </Link>
        <div className="flex items-center gap-5 text-black">
          {session?.user ? (
            <>
              <Link href="/startup/ai" className="text-gray-600">
                <span>AI</span>
              </Link>
              <Link href="/startup/create" className="text-gray-600">
                <span>Create</span>
              </Link>
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
              >
                <button type="submit" className="text-gray-600">
                  退出登录
                </button>
              </form>
              {/* <WalletConnect /> */}
              <WalletAuthButton />
            </>
          ) : (
            <>
              <WalletConnect />
              <WalletAuthButton />
            </>
          )}
        </div>
      </nav>
    </header>
  );
}