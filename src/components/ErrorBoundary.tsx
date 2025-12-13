/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";

interface Props {
  fallback: JSX.Element;
  children: JSX.Element;
}

export default class ErrorBoundary extends React.Component<Props> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  state: Readonly<{ hasError: boolean }> = { hasError: false };
  static getDerivedStateFromError() {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error: unknown, info: unknown) {
    console.error(error);
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return this.props.fallback;
    }

    return this.props.children;
  }
}
