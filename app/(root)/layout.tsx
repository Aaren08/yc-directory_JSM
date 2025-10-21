import Navbar from "../../components/Navbar";
import { Suspense } from "react";

const layout = ({ children }: Readonly<{ children: React.ReactNode }>) => {
  return (
    <main className="font-work-sans">
      <Suspense
        fallback={
          <div className="p-4 text-sm text-gray-500">Loading navbar...</div>
        }
      >
        <Navbar />
      </Suspense>
      {children}
    </main>
  );
};

export default layout;
