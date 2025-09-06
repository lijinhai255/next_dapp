import { auth } from "@/auth";
import StartupFrom from "@/components/StartupFrom";
import { redirect } from "next/navigation";

const createPage = async () => {
  const session = await auth();
  if (!session) redirect("/");
  return (
    <>
      <section className="pink_container !min-h-[230px]">
        <h1 className="heading"> Submint Your Startup Pitch </h1>
      </section>
      <StartupFrom />
    </>
  );
};
export default createPage;
