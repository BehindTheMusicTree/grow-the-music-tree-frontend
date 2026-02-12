"use client";

import { useListFullGenrePlaylists } from "@hooks/useGenrePlaylist";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@components/ui/table";
import { Skeleton } from "@components/ui/skeleton";
import { Input } from "@components/ui/input";
import { useState, useMemo, ChangeEvent } from "react";

export default function GenrePlaylistsPage() {
  const { data, isPending, error } = useListFullGenrePlaylists("me");
  const [nameFilter, setNameFilter] = useState("");
  const [parentFilter, setParentFilter] = useState("");
  const [rootFilter, setRootFilter] = useState("");
  const [uuidFilter, setUuidFilter] = useState("");
  const filteredData = useMemo(() => {
    if (!data?.results) return [];
    return data.results.filter((criteriaPlaylist) => {
      const uuidMatch = criteriaPlaylist.uuid.toLowerCase().includes(uuidFilter.toLowerCase());
      const nameMatch = criteriaPlaylist.name.toLowerCase().includes(nameFilter.toLowerCase());
      const parentMatch = (criteriaPlaylist.parent?.name || "/").toLowerCase().includes(parentFilter.toLowerCase());
      const rootMatch = (criteriaPlaylist.root?.name || "").toLowerCase().includes(rootFilter.toLowerCase());
      return uuidMatch && nameMatch && parentMatch && rootMatch;
    });
  }, [data?.results, nameFilter, parentFilter, rootFilter, uuidFilter]);

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
              <TableHead>
                <div className="flex flex-col gap-2">
                  <span>UUID</span>
                  <Input
                    placeholder="Filter..."
                    value={uuidFilter}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setUuidFilter(e.target.value)}
                    className="h-8 mb-2"
                  />
                </div>
              </TableHead>
              <TableHead>
                <div className="flex flex-col gap-2">
                  <span>Name</span>
                  <Input
                    placeholder="Filter..."
                    value={nameFilter}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setNameFilter(e.target.value)}
                    className="h-8 mb-2"
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
                    className="h-8 mb-2"
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
                    className="h-8 mb-2"
                  />
                </div>
              </TableHead>
              <TableHead>Track Count</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isPending
              ? Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton className="h-4 w-[200px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[200px]" />
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
              : filteredData.map((criteriaPlaylist) => (
                  <TableRow key={criteriaPlaylist.uuid}>
                    <TableCell className="font-medium">{criteriaPlaylist.uuid}</TableCell>
                    <TableCell className="font-medium">{criteriaPlaylist.name}</TableCell>
                    <TableCell>{criteriaPlaylist.parent?.name || "/"}</TableCell>
                    <TableCell>{criteriaPlaylist.root?.name}</TableCell>
                    <TableCell>{criteriaPlaylist.uploadedTracksCount}</TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
