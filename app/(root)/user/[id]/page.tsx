import { auth } from "@/auth";
import { StartupCardSkeleton } from "@/components/StartupCard";
import StartupList from "@/components/StartupList";
import { client } from "@/sanity/lib/client";
import { AUTHOR_BY_ID_QUERY } from "@/sanity/lib/queries";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Suspense } from "react";

const Page = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const session = await auth();

  const user = await client.fetch(AUTHOR_BY_ID_QUERY, { id });
  if (!user) {
    return notFound();
  }
  return (
    <>
      <section className="profile_container">
        {/* USER CARD */}
        <div className="profile_card">
          <div className="profile_title">
            <h3 className="text-24-black uppercase text-center line-clamp-1">
              {user.name}
            </h3>
          </div>
          <Image
            src={user.image}
            alt={user.name || "User Image"}
            width={150}
            height={150}
            className="profile_image"
          />
          <p className="text-30-extrabold mt-7 text-center">
            @{user?.username}
          </p>
          <p className="mt-1 text-center text-14-semibold text-amber-50">
            {user?.bio}
          </p>
        </div>

        {/* STARTUPS */}
        <div className="flex-1 flex flex-col gap-5 lg:-mt-5">
          <p className="text-30-bold">
            {session?.user?.id === id ? "Your" : "All"} Startups
          </p>
          {/* STARTUP LIST */}
          <ul className="card_grid-sm">
            <Suspense fallback={<StartupCardSkeleton />}>
              <StartupList id={id} />
            </Suspense>
          </ul>
        </div>
      </section>
    </>
  );
};

export default Page;
