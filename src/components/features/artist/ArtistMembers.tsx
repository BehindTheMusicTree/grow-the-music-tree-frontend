import type { ArtistMembership } from "@schemas/api/artist";
import { PanelSection } from "@behindthemusictree/ui";
import { formatYears } from "./formatYears";
import { renderArtistLink } from "./renderArtistLink";

function MembershipList({ title, memberships }: { title: string; memberships: ArtistMembership[] }) {
  if (memberships.length === 0) return null;
  return (
    <div className="mt-2.5 first:mt-0">
      <h4 className="text-xs font-medium text-[var(--color-text-muted)]">{title}</h4>
      <ul className="mt-0.5">
        {memberships.map((membership, index) => {
          const details = [
            formatYears(membership.beginYear, membership.endYear, membership.ended),
            ...membership.roles,
          ];
          const detailsText = details.filter(Boolean).join(" · ");
          return (
            // A member can have several periods in the same group.
            <li key={`${membership.artist.uuid}-${index}`} className="truncate py-0.5" title={detailsText || undefined}>
              <span className="font-medium text-[var(--color-text)]">{renderArtistLink(membership.artist)}</span>
              {detailsText && <span className="text-[var(--color-text-muted)]"> — {detailsText}</span>}
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
    <PanelSection title={title}>
      <MembershipList title="Current" memberships={memberships.filter(isCurrent)} />
      <MembershipList title="Past" memberships={memberships.filter((membership) => !isCurrent(membership))} />
    </PanelSection>
  );
}
