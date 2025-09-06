import Link from "next/link";
import Image from "next/image";
import { auth, signOut, signIn } from "@/auth";

export default async function Navbar() {
  const session = await auth();
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
                <button type="submit">Sign out</button>
              </form>
              <Link href={`/user/${session?.id}`}>
                <span>{session?.user?.name}</span>
              </Link>
            </>
          ) : (
            <>
              <form
                action={async () => {
                  "use server";
                  await signIn("github");
                }}
              >
                <button type="submit">Login </button>
              </form>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
