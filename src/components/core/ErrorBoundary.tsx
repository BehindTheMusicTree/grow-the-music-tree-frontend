"use client";

import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
  onError?: (error: Error) => void;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.log("ErrorBoundary componentDidCatch", error);
    if (this.props.onError) {
      console.log("ErrorBoundary onError", this.props.onError);
      this.props.onError(error);
    }
  }

  render() {
    return this.props.children;
  }
}
