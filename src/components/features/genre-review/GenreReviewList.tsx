"use client";

import { useRouter } from "next/navigation";
import { Button } from "@behindthemusictree/ui";
import { usePopup } from "@behindthemusictree/app-kit/popup";
import { useUpdateGenre } from "@behindthemusictree/app-kit/genre-tree";
import GenreRenamePopup from "@components/ui/popup/child/GenreRenamePopup";
import type { ConflictingGenre } from "@lib/genre-name-conflicts";
import { getGrowBackendBaseUrl } from "@lib/site-urls";

export default function GenreReviewList({ genres }: { genres: ConflictingGenre[] }) {
  const router = useRouter();
  const { mutate, formErrors } = useUpdateGenre("reference", getGrowBackendBaseUrl);
  const { showPopup, hidePopup } = usePopup();

  const showRenamePopup = (genre: ConflictingGenre) =>
    showPopup(
      <GenreRenamePopup
        genre={genre}
        onSubmit={({ name }) =>
          mutate(
            { uuid: genre.uuid, data: { name } },
            {
              onSuccess: () => {
                hidePopup();
                router.refresh();
              },
            },
          )
        }
        onClose={hidePopup}
        formErrors={formErrors}
      />,
    );

  return (
    <table className="text-left">
      <thead>
        <tr>
          <th className="pr-6">Name</th>
          <th className="pr-6">Parent</th>
          <th />
        </tr>
      </thead>
      <tbody>
        {genres.map((genre) => (
          <tr key={genre.uuid}>
            <td className="pr-6 py-1">{genre.name}</td>
            <td className="pr-6 py-1">{genre.parent?.name ?? "—"}</td>
            <td className="py-1">
              <Button onClick={() => showRenamePopup(genre)}>Rename</Button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
