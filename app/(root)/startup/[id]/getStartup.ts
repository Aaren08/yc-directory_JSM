"use cache";

import { client } from "@/sanity/lib/client";
import { STARTUP_BY_ID_QUERY } from "@/sanity/lib/queries";
import { cache } from "react";

// Cached data-fetcher
export const getStartup = cache(async (id: string) => {
  if (!id) throw new Error("Missing startup id");
  const post = await client.fetch(STARTUP_BY_ID_QUERY, { id });
  return post;
});
