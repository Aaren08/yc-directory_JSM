import { formatDate } from "@/lib/utils";
import { EyeIcon, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "./ui/button";
import { StartupTypeCard } from "@/sanity/types/startup";

const StartupCard = ({ post }: { post: StartupTypeCard }) => {
  const {
    _createdAt,
    views,
    author,
    _id,
    description,
    image,
    category,
    title,
  } = post;

  return (
    <li className="startup-card group">
      <div className="flex-between">
        <p className="startup_card_date">{formatDate(_createdAt)}</p>
        {/* VIEWS */}
        <div className="flex gap-1.5">
          <EyeIcon className="size-6 text-primary" />
          <span className="text-16-medium">{views}</span>
        </div>
      </div>

      {/* NAME & TITLE */}
      <div className="flex-between mt-5 gap-5">
        <div className="flex-1">
          <Link href={`/user/${author?._id}`}>
            <p className="text-16-medium line-clamp-1">{author?.name}</p>
          </Link>
          <Link href={`/startup/${_id}`}>
            <h3 className="text-26-semibold line-clamp-1">{title}</h3>
          </Link>
        </div>
        <Link href={`/user/${author?._id}`}>
          <Image
            src={"https://placehold.co/600x400"}
            alt={"placeholder"}
            width={48}
            height={48}
            className="rounded-full"
          />
        </Link>
      </div>

      {/* STARTUP DETAILS */}
      <Link href={`/startup/${_id}`}>
        <p className="startup-card_desc">{description}</p>
        <Image
          src={
            image ||
            "https://png.pngtree.com/element_our/20190530/ourmid/pngtree-white-spot-float-image_1256405.jpg"
          }
          alt={"placeholder"}
          width={500}
          height={164}
          className="startup-card_img"
        />
      </Link>

      {/* CARD FOOTER */}
      <div className="flex-between gap-3 mt-5">
        <Link href={`/?query=${category?.toLowerCase()}`}>
          <p className="text-16-medium">{category}</p>
        </Link>
        <Button
          className="startup-card_btn group/details transform transition-all duration-300 hover:scale-[1.03]"
          asChild
        >
          <Link href={`/startup/${_id}`} className="flex items-center gap-1">
            Details
            <ChevronRight className="-mx-1.5 transition-transform duration-300 group-hover/details:translate-x-1" />
          </Link>
        </Button>
      </div>
    </li>
  );
};

export default StartupCard;
