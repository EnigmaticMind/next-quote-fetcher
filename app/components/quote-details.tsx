import React from "react";
import { useEffect } from "react";

interface QuoteDetailsProps {
  cellContent: any;
}

export default React.memo(function QuoteDetails({
  cellContent,
}: QuoteDetailsProps) {
  useEffect(() => {
    console.log("Rendering Quote Details");
    console.log(cellContent);
  });

  return (
    <div className="w-64 bg-white border border-border rounded-lg p-4 flex-shrink-0 self-start">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-foreground">Details</h2>
        {cellContent && (
          <svg
            className="w-4 h-4 text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
        )}
      </div>

      {cellContent ? (
        <div className="space-y-3">
          <div>
            <h3 className="text-sm font-medium text-foreground mb-2">
              Full Quote:
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {cellContent?.text}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-foreground mb-1">
              Author:
            </h3>
            <p className="text-sm text-muted-foreground">
              {cellContent?.author}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-foreground mb-1">Tags:</h3>
            <div className="flex flex-wrap gap-1">
              {cellContent?.tags?.map((tag: string, index: number) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-md"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <p className="text-muted-foreground text-sm">
          {cellContent !== null
            ? "Cell is empty"
            : "Press space to activate keyboard navigation"}
        </p>
      )}
    </div>
  );
});
