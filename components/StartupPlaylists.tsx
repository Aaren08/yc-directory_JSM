import { StartupTypeCard } from "@/sanity/types/startup";
import StartupCard from "@/components/StartupCard";

type Props = {
  editorPosts?: StartupTypeCard[];
};

const StartupPlaylists = ({ editorPosts = [] }: Props) => {
  return (
    <>
      {editorPosts?.length > 0 && (
        <div className="max-w-4xl mx-auto">
          <p className="text-30-semibold">Startup of the Day</p>
          <ul className="mt-7 card_grid-sm">
            {editorPosts.map((post: StartupTypeCard, index: number) => (
              <StartupCard key={index} post={post} />
            ))}
          </ul>
        </div>
      )}
    </>
  );
};

export default StartupPlaylists;
