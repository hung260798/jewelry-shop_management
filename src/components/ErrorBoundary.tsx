/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { Component } from "react";

export default class ErrorBoundary extends Component<
  {
    fallback: JSX.Element;
    children: JSX.Element;
  },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error: unknown, info: unknown) {
    console.error(error);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}
