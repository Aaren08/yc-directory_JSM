import type { Slug, Author, Startup } from "@/sanity.types";

export type AuthorCard = {
  _id: string;
  name?: string | null;
  image?: string | null;
  bio?: string | null;
};

export type StartupTypeCard = {
  _id: string;
  _createdAt: string;
  title?: string | null;
  slug?: Slug | null;
  category?: string | null;
  description?: string | null;
  image?: string | null;
  author?: AuthorCard | null;
  views?: number | null;
};

export type StartupTypeCardOnly = Omit<Startup, "author"> & {
  author?: Author | null;
  _rev?: string;
  _type?: string;
  _updatedAt?: string;
};
