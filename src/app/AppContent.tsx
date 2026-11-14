"use client";

import { useEffect, ReactNode } from "react";
import { usePopup, useConnectivityErrorPopup } from "@behindthemusictree/app-kit/popup";
import { usePlayer } from "@behindthemusictree/app-kit/player";
import { initSentry } from "@lib/sentry";
import { cn } from "@lib/utils";
import { UserMenu } from "@components/features/menu/UserMenu";

import InternalErrorPopup from "@components/ui/popup/child/InternalErrorPopup";

import NavButtons from "@components/features/menu/NavButtons";
import Player from "@components/features/player/Player";

import NetworkErrorPopup from "@components/ui/popup/child/NetworkErrorPopup";

import { PlayerPanelProvider } from "@contexts/PlayerPanelProvider";
import { GenreTreeViewModeProvider } from "@contexts/GenreTreeViewModeProvider";
import { NightModeProvider } from "@contexts/NightModeProvider";

export default function AppContent({ children }: { children: ReactNode }) {
  const { playerTrackObject } = usePlayer();
  const { activePopup } = usePopup();

  useEffect(() => {
    initSentry();
  }, []);

  useEffect(() => {}, [playerTrackObject]);

  useConnectivityErrorPopup({
    isAccountPage: false,
    routeRequiresAuth: false,
    routeRequiresSpotify: false,
    renderers: {
      renderAuthPopup: () => null,
      renderSpotifyOnlyAuthPopup: () => null,
      renderInternalErrorPopup: (errorCode) => <InternalErrorPopup errorCode={errorCode} />,
      renderSpotifyAuthErrorPopup: () => null,
      renderGoogleAuthErrorPopup: () => null,
      renderNetworkErrorPopup: (errorCode) => <NetworkErrorPopup errorCode={errorCode} />,
    },
  });

  return (
    <PlayerPanelProvider>
    <GenreTreeViewModeProvider>
    <NightModeProvider>
      <div className="h-screen [--mobile-nav-h:4rem] md:[--mobile-nav-h:0rem] phone-landscape:![--mobile-nav-h:4rem]">
        <div className="fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+var(--mobile-nav-h))] top-0 flex">
          <div
            className={cn(
              "group relative flex min-h-0 w-full flex-grow",
              "phone-landscape:[&_[data-detail-panel]]:!left-0 phone-landscape:[&_[data-detail-panel]]:!right-auto phone-landscape:[&_[data-detail-panel]]:!w-1/2 phone-landscape:[&_[data-detail-panel]]:!top-auto phone-landscape:[&_[data-detail-panel]]:!bottom-0 phone-landscape:[&_[data-detail-panel]]:!pb-0 phone-landscape:[&_[data-detail-panel]]:!h-1/2 phone-landscape:[&_[data-detail-panel]:has([aria-label='Resize_panel'][aria-expanded=true])]:!h-full phone-landscape:[&_[data-detail-panel][data-expanded=true]]:!h-full phone-landscape:[&_[data-detail-panel]_[aria-label='Resize_panel']]:!flex phone-landscape:[&_[data-detail-panel][data-collapsed=true]]:!translate-x-0 phone-landscape:[&_[data-detail-panel][data-collapsed=true]]:!translate-y-full",

              activePopup && "pointer-events-none blur-sm",
            )}
          >
            <NavButtons />
            <div className="absolute top-[max(0.25rem,env(safe-area-inset-top))] right-1 z-50 group-has-[[data-search-account]]:max-md:hidden">
              <UserMenu />
            </div>
            <div className="flex min-h-0 w-full flex-grow">
              <div className="flex min-h-0 w-full flex-grow flex-col">{children}</div>
            </div>
            {activePopup && (
              <div className="absolute top-0 right-0 bottom-0 left-0 z-40 pointer-events-none bg-black/10" aria-hidden />
            )}
          </div>
        </div>

        <Player className={activePopup ? "blur-sm pointer-events-none" : undefined} />
        {activePopup}
      </div>
    </NightModeProvider>
    </GenreTreeViewModeProvider>
    </PlayerPanelProvider>
  );
}
