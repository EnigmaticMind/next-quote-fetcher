"use client";

import React from "react";
import { useEffect } from "react";

interface QuoteCellProps {
  index: number;
  isFocused: boolean;
  isSelected: boolean;
  isLoading: boolean;
  loadingMessage?: string;
  content: any;
}

export default React.memo(function QuoteCell({
  index,
  isFocused,
  isSelected,
  isLoading,
  loadingMessage,
  content,
}: QuoteCellProps) {
  useEffect(() => {
    console.log(`Render Quote Cell ${index}`);
    console.log(`Content: ${content}`);
  });

  const truncateQuote = (quoteObj: any) => {
    const words = quoteObj.text.split(" ");
    const firstWords = words.slice(0, Math.min(5, Math.max(3, words.length)));
    return `${firstWords.join(" ")}..."`;
  };

  return (
    <div
      className={`w-52 h-16 bg-card border border-border rounded-lg flex items-center justify-center text-card-foreground font-medium transition-colors ${
        isFocused ? "ring-2 ring-primary bg-accent text-accent-foreground" : ""
      } ${isSelected ? "bg-primary text-primary-foreground" : ""}`}
    >
      {isLoading ? (
        <span className="text-sm text-muted-foreground animate-pulse">
          {loadingMessage || "Loading..."}
        </span>
      ) : content ? (
        <span className="italic text-sm px-2 text-center">
          {truncateQuote(content)}
        </span>
      ) : (
        "Empty"
      )}
    </div>
  );
});
