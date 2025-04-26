"use client";

import { Component, ErrorInfo, ReactNode } from "react";
import { usePopup } from "@contexts/PopupContext";
import InternalErrorPopup from "@components/ui/popup/child/InternalErrorPopup";
import { ErrorCode } from "@app-types/app-errors/app-error-codes";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return <InternalErrorPopup errorCode={ErrorCode.CLIENT_INTERNAL_ERROR} />;
    }

    return this.props.children;
  }
}
