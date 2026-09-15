"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";
import { ErrorCode } from "@behindthemusictree/app-kit/transport";
import InternalErrorPopup from "@components/ui/popup/child/InternalErrorPopup";

export default function AppError({ error }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return <InternalErrorPopup errorCode={ErrorCode.CLIENT_INTERNAL_ERROR} />;
}
