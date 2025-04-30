"use client";

import { useListFullGenrePlaylists } from "@hooks/useGenrePlaylist";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@components/ui/table";
import { Skeleton } from "@components/ui/skeleton";
import { Input } from "@components/ui/input";
import { useState, useMemo, ChangeEvent } from "react";

export default function GenrePlaylistsPage() {
  const { data, isLoading, error } = useListFullGenrePlaylists();
  const [nameFilter, setNameFilter] = useState("");
  const [trackCountFilter, setTrackCountFilter] = useState("");

  const filteredData = useMemo(() => {
    if (!data?.results) return [];
    return data.results.filter((playlist) => {
      const nameMatch = playlist.name.toLowerCase().includes(nameFilter.toLowerCase());
      const trackCountMatch =
        trackCountFilter === "" || playlist.uploadedTracksCount.toString().includes(trackCountFilter);
      return nameMatch && trackCountMatch;
    });
  }, [data?.results, nameFilter, trackCountFilter]);

  if (error) {
    return <div>Error loading genre playlists</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Genre Playlists</h1>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <Input
          placeholder="Filter by name..."
          value={nameFilter}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setNameFilter(e.target.value)}
          className="w-full"
        />
        <Input
          placeholder="Filter by track count..."
          value={trackCountFilter}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setTrackCountFilter(e.target.value)}
          className="w-full"
        />
      </div>
      <div className="rounded-md border max-h-[calc(100vh-200px)] overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>UUID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Criteria</TableHead>
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
              : filteredData.map((playlist) => (
                  <TableRow key={playlist.uuid}>
                    <TableCell className="font-medium">{playlist.uuid}</TableCell>
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
