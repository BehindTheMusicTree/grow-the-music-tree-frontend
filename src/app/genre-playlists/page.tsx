"use client";

import { useListFullGenrePlaylists } from "@hooks/useGenrePlaylist";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@components/ui/table";
import { Skeleton } from "@components/ui/skeleton";
import { Input } from "@components/ui/input";
import { useState, useMemo, ChangeEvent } from "react";

export default function GenrePlaylistsPage() {
  const { data, isLoading, error } = useListFullGenrePlaylists();
  const [nameFilter, setNameFilter] = useState("");
  const [criteriaFilter, setCriteriaFilter] = useState("");
  const [parentFilter, setParentFilter] = useState("");
  const [rootFilter, setRootFilter] = useState("");

  const filteredData = useMemo(() => {
    if (!data?.results) return [];
    return data.results.filter((playlist) => {
      const nameMatch = playlist.name.toLowerCase().includes(nameFilter.toLowerCase());
      const criteriaMatch = playlist.criteria.name.toLowerCase().includes(criteriaFilter.toLowerCase());
      const parentMatch = (playlist.parent?.name || "/").toLowerCase().includes(parentFilter.toLowerCase());
      const rootMatch = (playlist.root?.name || "").toLowerCase().includes(rootFilter.toLowerCase());
      return nameMatch && criteriaMatch && parentMatch && rootMatch;
    });
  }, [data?.results, nameFilter, criteriaFilter, parentFilter, rootFilter]);

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
              <TableHead>UUID</TableHead>
              <TableHead>
                <div className="flex flex-col gap-2">
                  <span>Name</span>
                  <Input
                    placeholder="Filter..."
                    value={nameFilter}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setNameFilter(e.target.value)}
                    className="h-8"
                  />
                </div>
              </TableHead>
              <TableHead>
                <div className="flex flex-col gap-2">
                  <span>Criteria</span>
                  <Input
                    placeholder="Filter..."
                    value={criteriaFilter}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setCriteriaFilter(e.target.value)}
                    className="h-8"
                  />
                </div>
              </TableHead>
              <TableHead>
                <div className="flex flex-col gap-2">
                  <span>Parent</span>
                  <Input
                    placeholder="Filter..."
                    value={parentFilter}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setParentFilter(e.target.value)}
                    className="h-8"
                  />
                </div>
              </TableHead>
              <TableHead>
                <div className="flex flex-col gap-2">
                  <span>Root</span>
                  <Input
                    placeholder="Filter..."
                    value={rootFilter}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setRootFilter(e.target.value)}
                    className="h-8"
                  />
                </div>
              </TableHead>
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
