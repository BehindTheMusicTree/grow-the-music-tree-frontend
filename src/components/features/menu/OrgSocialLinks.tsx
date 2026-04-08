"use client";

import {
  BTMT_ICON_LINK_CLASS,
  EmailSocialLink,
  GithubSocialLink,
  LinkedInSocialLink,
  MastodonSocialLink,
} from "@behindthemusictree/assets/components";

export default function OrgSocialLinks() {
  const appVersion = process.env.NEXT_PUBLIC_APP_VERSION;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex flex-wrap items-center justify-center gap-2">
        <GithubSocialLink className={BTMT_ICON_LINK_CLASS} iconClassName="h-6 w-6 shrink-0" />
        <LinkedInSocialLink className={BTMT_ICON_LINK_CLASS} iconClassName="h-6 w-6 shrink-0" />
        <MastodonSocialLink className={BTMT_ICON_LINK_CLASS} iconClassName="h-6 w-6 shrink-0" />
        <EmailSocialLink className={BTMT_ICON_LINK_CLASS} iconClassName="h-6 w-6 shrink-0" />
      </div>
      {appVersion ? (
        <p className="text-center text-xs text-gray-500 tabular-nums">v{appVersion}</p>
      ) : null}
    </div>
  );
}
