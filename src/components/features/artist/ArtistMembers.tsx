import type { ArtistMembership } from "@schemas/api/artist";
import ArtistSection from "./ArtistSection";
import { formatYears } from "./formatYears";
import { renderArtistLink } from "./renderArtistLink";

function MembershipList({ title, memberships }: { title: string; memberships: ArtistMembership[] }) {
  if (memberships.length === 0) return null;
  return (
    <div className="flex flex-col gap-1">
      <h3 className="text-sm font-medium uppercase tracking-wide text-gray-500">{title}</h3>
      <ul className="flex flex-col gap-1">
        {memberships.map((membership, index) => {
          const details = [
            formatYears(membership.beginYear, membership.endYear, membership.ended),
            ...membership.roles,
          ];
          const detailsText = details.filter(Boolean).join(" · ");
          return (
            // A member can have several periods in the same group.
            <li key={`${membership.artist.uuid}-${index}`}>
              <span className="font-medium text-gray-900">{renderArtistLink(membership.artist)}</span>
              {detailsText && <span className="text-gray-600"> — {detailsText}</span>}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default function ArtistMembers({ title, memberships }: { title: string; memberships: ArtistMembership[] }) {
  if (memberships.length === 0) return null;
  const isCurrent = (membership: ArtistMembership) => !membership.ended && membership.endYear === null;

  return (
    <ArtistSection title={title}>
      <MembershipList title="Current" memberships={memberships.filter(isCurrent)} />
      <MembershipList title="Past" memberships={memberships.filter((membership) => !isCurrent(membership))} />
    </ArtistSection>
  );
}
