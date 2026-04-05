"use client";

import {
  BTMT_ICON_LINK_DARK_CLASS,
  EmailSocialLink,
  GithubSocialLink,
  LinkedInSocialLink,
  MastodonSocialLink,
} from "@behindthemusictree/assets/components";

export default function OrgSocialLinks() {
  const appVersion = process.env.NEXT_PUBLIC_APP_VERSION;

  return (
    <div className="mx-1 border-t border-white/10 pt-2">
      <div className="flex flex-wrap items-center justify-center gap-1">
        <GithubSocialLink
          className={BTMT_ICON_LINK_DARK_CLASS}
          iconClassName="h-5 w-5 shrink-0"
        />
        <LinkedInSocialLink
          className={BTMT_ICON_LINK_DARK_CLASS}
          iconClassName="h-5 w-5 shrink-0"
        />
        <MastodonSocialLink
          className={BTMT_ICON_LINK_DARK_CLASS}
          iconClassName="h-5 w-5 shrink-0"
        />
        <EmailSocialLink
          className={BTMT_ICON_LINK_DARK_CLASS}
          iconClassName="h-5 w-5 shrink-0"
        />
      </div>
      {appVersion ? (
        <p className="mt-2 w-full text-center text-xs text-gray-500 tabular-nums">
          v{appVersion}
        </p>
      ) : null}
    </div>
  );
}
