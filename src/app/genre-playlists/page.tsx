"use client";

import { useListAllGenrePlaylists } from "@hooks/useGenrePlaylist";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@components/ui/table";
import { Skeleton } from "@components/ui/skeleton";

export default function GenrePlaylistsPage() {
  const { data, isLoading, error } = useListAllGenrePlaylists();

  if (error) {
    return <div>Error loading genre playlists</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Genre Playlists</h1>
      <div className="rounded-md border max-h-[calc(100vh-200px)] overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Parent</TableHead>
              <TableHead>Root</TableHead>
              <TableHead>Track Count</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton className="h-4 w-[200px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[300px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[100px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[100px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[50px]" />
                    </TableCell>
                  </TableRow>
                ))
              : data?.results.map((playlist) => (
                  <TableRow key={playlist.uuid}>
                    <TableCell className="font-medium">{playlist.name}</TableCell>
                    <TableCell>{playlist.criteria.name}</TableCell>
                    <TableCell>{playlist.parent?.name || "/"}</TableCell>
                    <TableCell>{playlist.root?.name}</TableCell>
                    <TableCell>{playlist.uploadedTracksCount}</TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
