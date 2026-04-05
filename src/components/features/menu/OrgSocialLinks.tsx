"use client";

import {
  BTMT_ICON_LINK_DARK_CLASS,
  EmailSocialLink,
  GithubSocialLink,
  LinkedInSocialLink,
  MastodonSocialLink,
} from "@behindthemusictree/assets/components";

interface OrgSocialLinksProps {
  variant?: "default" | "header";
}

export default function OrgSocialLinks({ variant = "default" }: OrgSocialLinksProps) {
  const appVersion = process.env.NEXT_PUBLIC_APP_VERSION;
  const isHeader = variant === "header";

  const links = (
    <>
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
    </>
  );

  if (isHeader) {
    return (
      <div className="mx-0 flex flex-nowrap items-center justify-end gap-0.5">
        {links}
        {appVersion ? (
          <span className="ml-1 hidden text-[10px] leading-tight text-gray-500 tabular-nums md:inline">
            v{appVersion}
          </span>
        ) : null}
      </div>
    );
  }

  return (
    <div className="mx-1 border-t border-white/10 pt-2">
      <div className="flex flex-wrap items-center justify-center gap-1">{links}</div>
      {appVersion ? (
        <p className="mt-2 w-full text-center text-xs text-gray-500 tabular-nums">v{appVersion}</p>
      ) : null}
    </div>
  );
}
