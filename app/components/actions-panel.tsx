import React from "react";
import { useEffect } from "react";

type ActionsPanelProps = {};

export default React.memo(function ActionsPanel({}: ActionsPanelProps) {
  useEffect(() => {
    console.log(`Rendering Action Panel`);
  });
  return (
    <div className="w-64 bg-card border border-border rounded-lg p-4">
      <h2 className="text-lg font-semibold mb-4 text-card-foreground">
        Actions
      </h2>
      <div className="space-y-2 text-sm text-muted-foreground">
        <div>
          <span className="font-medium text-card-foreground">Arrow Keys:</span>{" "}
          focus cells
        </div>
        <div>
          <span className="font-medium text-card-foreground">X Key:</span>{" "}
          select cells
        </div>
        <div>
          <span className="font-medium text-card-foreground">
            Shift + Arrow Keys:
          </span>{" "}
          Bulk select cells
        </div>
        <div>
          <span className="font-medium text-card-foreground">Space:</span>{" "}
          scrape quote using Puppeteer
        </div>
        <div>
          <span className="font-medium text-card-foreground">Esc:</span> clear
          selected cells
        </div>
        <div>
          <span className="font-medium text-card-foreground">Ctrl + A:</span>{" "}
          select all cells
        </div>
        <div className="mt-3 pt-2 border-t border-border">
          <p className="text-xs">
            <span className="font-medium text-card-foreground">Note:</span> Each
            fetch uses Puppeteer to scrape live quotes from quotes.toscrape.com.
            The browser launches, navigates, and extracts real data!
          </p>
        </div>
      </div>
    </div>
  );
});
