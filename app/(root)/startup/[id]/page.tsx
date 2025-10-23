import { formatDate } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import markdownit from "markdown-it";
import { Suspense, use } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { getStartup } from "./getStartup";
import { getParams } from "./getParams";
import { client } from "@/sanity/lib/client";
import { PLAYLIST_BY_SLUG_QUERY } from "@/sanity/lib/queries";
import View from "@/components/View";
import StartupPlaylists from "@/components/StartupPlaylists";

const md = markdownit();

const Page = ({ params }: { params: Promise<{ id: string }> }) => {
  const id = use(getParams(params));

  // start independent fetches in parallel
  const startupPromise = getStartup(id);
  const playlistPromise = client.fetch(PLAYLIST_BY_SLUG_QUERY, {
    slug: "startup-of-the-day",
  });

  const post = use(startupPromise);
  if (!post) {
    return notFound();
  }

  const playlistResult = use(playlistPromise);
  const { select: editorPosts } = playlistResult ?? { select: [] };

  const parsedContent = md.render(post?.pitch || "");
  return (
    <>
      <section className="pink_container !min-h-[230px]">
        <p className="tag tag-tri">{formatDate(post?._createdAt)}</p>
        <h1 className="heading">{post.title}</h1>
        <p className="sub-heading !max-w-5xl">{post.description}</p>
      </section>

      <section className="section_container">
        <img
          src={post.image}
          alt="thumbnail"
          className="w-full h-auto rounded-xl"
        />
        <div className="space-y-5 mt-10 max-w-4xl mx-auto">
          {/* AUTHOR DETAILS */}
          <div className="flex-between gap-5">
            <Link
              href={`/user/${post.author?._id}`}
              className="flex items-center gap-2 mb-3"
            >
              <Image
                src={
                  post.author?.image ??
                  "https://media.istockphoto.com/id/1337144146/vector/default-avatar-profile-icon-vector.jpg?s=612x612&w=0&k=20&c=BIbFwuv7FxTWvh5S3vB6bkT0Qv8Vn8N5Ffseq84ClGI="
                }
                alt={post.author?.name ?? "avatar"}
                width={64}
                height={64}
                className="rounded-full drop-shadow-lg"
              />

              <div className="">
                <p className="text-20-medium">{post.author?.name}</p>
                <p className="text-16-medium !text-black-300">
                  @{post.author?.username}
                </p>
              </div>
            </Link>
            <p className="category-tag">{post.category}</p>
          </div>

          {/* PITCH DETAILS */}
          <h3 className="text-30-bold">Pitch Details</h3>
          {parsedContent ? (
            <article
              className="prose max-w-4xl font-work-sans break-all"
              dangerouslySetInnerHTML={{ __html: parsedContent }}
            />
          ) : (
            <p className="no-result">No details provided</p>
          )}
        </div>

        <hr className="divider" />

        {/* EDITOR SELECTED STARTUPS */}
        <StartupPlaylists editorPosts={editorPosts} />
      </section>

      {/* PPR STRATEGY */}
      <Suspense fallback={<Skeleton className="view_skeleton" />}>
        <View id={id} />
      </Suspense>
    </>
  );
};

export default Page;
