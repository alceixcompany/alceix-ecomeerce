"use client";
import Image, { type ImageProps } from "next/image";
import { useState } from "react";
import "@/components/ui/skeleton.css";
export function ProgressiveImage({
  onLoad,
  onError,
  alt,
  className = "",
  ...props
}: ImageProps) {
  const [settledSource, setSettledSource] = useState<ImageProps["src"]>();
  return (
    <Image
      {...props}
      alt={alt}
      className={`progressive-image ${className}`}
      data-pending={settledSource !== props.src}
      onLoad={(event) => {
        setSettledSource(props.src);
        onLoad?.(event);
      }}
      onError={(event) => {
        setSettledSource(props.src);
        onError?.(event);
      }}
    />
  );
}
