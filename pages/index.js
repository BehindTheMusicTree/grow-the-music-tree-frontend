import { useEffect } from "react";
import { useRouter } from "next/router";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    router.push("/genre-playlists");
  }, [router]);

  return (
    <div className="flex justify-center items-center h-full">
      <p>Redirecting to genre playlists...</p>
    </div>
  );
}