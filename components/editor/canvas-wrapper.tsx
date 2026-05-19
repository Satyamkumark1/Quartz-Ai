"use client";

import React, { Component, ReactNode } from "react";
import { ClientSideSuspense } from "@liveblocks/react";
import { CanvasFlow } from "./canvas-flow";
import { Loader2, AlertCircle } from "lucide-react";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error): ErrorBoundaryState {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

export function CanvasWrapper() {
  return (
    <ErrorBoundary fallback={<CanvasError />}>
      <ClientSideSuspense fallback={<CanvasLoading />}>
        <CanvasFlow />
      </ClientSideSuspense>
    </ErrorBoundary>
  );
}

function CanvasLoading() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-[#0f0f11] text-zinc-400">
      <Loader2 className="h-6 w-6 animate-spin mb-4 text-cyan-500" />
      <p className="text-sm">Connecting to workspace...</p>
    </div>
  );
}

function CanvasError() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-[#0f0f11] text-red-400">
      <AlertCircle className="h-8 w-8 mb-4" />
      <h3 className="text-lg font-medium text-zinc-100">Connection Error</h3>
      <p className="text-sm mt-2 text-zinc-400 max-w-sm text-center">
        Failed to connect to the Liveblocks room. Please try refreshing the page.
      </p>
    </div>
  );
}
