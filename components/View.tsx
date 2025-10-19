import { client } from "@/sanity/lib/client";
import Ping from "./Ping";
import { STARTUP_VIEWS_QUERY } from "@/sanity/lib/queries";
import { formatNumber } from "@/lib/utils";

const View = async ({ id }: { id: string }) => {
  const { views: totalViews } = await client
    .withConfig({ useCdn: false })
    .fetch<{ _id: string; views: number }>(STARTUP_VIEWS_QUERY, { id });

  return (
    <div className="view-container">
      <div className="absolute -top-2 -right-2">
        <Ping />
      </div>

      <p className="view-text">
        <span className="font-black">{formatNumber(totalViews)}</span>
      </p>
    </div>
  );
};

export default View;
