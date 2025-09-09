"use client";

import { useState, useEffect } from "react";

import ActionsPanel from "./components/actions-panel";
import QuoteCell from "./components/quote-cell";
import QuoteDetails from "./components/quote-details";
import Toast from "./components/toast";
import { useSearchParams } from "next/navigation";

// Cache
const quotesCache: Map<number, Promise<Map<number, Quote>>> = new Map();

// Max Pages
const maxPages = 10;
// Max Items Per Page
const maxItemsPerPage = 10;

interface Quote {
  text: string;
  author: string;
  tags: string[];
}

export default function Home() {
  const searchParams = useSearchParams();
  // Toggle artificial delay in fetching quotes
  const TOGGLE_DELAY = searchParams.get("delay") === "false" ? false : true;

  const [toast, setToast] = useState<string | null>(null);
  const [focusedCell, setFocusedCell] = useState<number | null>(null);
  const [selectedCells, setSelectedCells] = useState<Set<number>>(new Set());
  const [selectionStart, setSelectionStart] = useState<number | null>(null);
  const [cellContent, setCellContent] = useState<{ [key: number]: any }>({});
  const [loadingCells, setLoadingCells] = useState<Set<number>>(new Set());
  const [loadingMessages, setLoadingMessages] = useState<{
    [key: number]: string;
  }>({});

  const getRandomQuote = async () => {
    const randomPg = Math.floor(Math.random() * maxPages) + 1;
    const randomIndex = Math.floor(Math.random() * maxItemsPerPage);

    try {
      if (quotesCache.get(randomPg)) {
        console.log(`Returning cached quote ${randomPg} ${randomIndex}`);
      } else {
        const url = `/api/quotes/?page=${randomPg}`;

        console.log(`Fetching quote ${randomIndex} from page ${randomPg}`);

        // Add promise onto the stack in case multiple calls to the set page occur
        quotesCache.set(
          randomPg,
          new Promise(async (resolve, reject) => {
            const res = await fetch(url);
            if (!res.ok) {
              console.log(`HTTP error ${res.status}: ${res.statusText}`);
              quotesCache.delete(randomPg);
              const err =
                "Problem retrieving quotes make sure the remote server is running and hit space again";
              setToast(err);
              reject();
              return { error: err };
            }

            const pgMap: Map<number, Quote> = new Map();

            const data = await res.json();
            data.forEach((quote: Quote, i: number) => {
              console.log("");
              console.log(quote);
              pgMap.set(i, quote);
            });

            resolve(pgMap);
          })
        );
      }

      const pgPromise = await quotesCache.get(randomPg);

      return pgPromise?.get(randomIndex);
    } catch (err: any) {
      console.error("** Fetch Failed:", err?.message);
      return { error: err?.message };
    }
  };

  const startLoadingSequence = async (cellIndex: number) => {
    const messages = [
      "Starting fetch...",
      "Logging in...",
      `Browsing to page ${Math.floor(Math.random() * 10) + 1}...`,
      "Selecting random quote...",
      "Selected.",
    ];

    setLoadingCells((prev) => new Set([...prev, cellIndex]));

    for (let i = 0; i < messages.length; i++) {
      setLoadingMessages((prev) => ({ ...prev, [cellIndex]: messages[i] }));
      const randomDelay = TOGGLE_DELAY
        ? Math.floor(Math.random() * (2400 - 1200 + 1)) + 1200
        : 0;
      await new Promise((resolve) => setTimeout(resolve, randomDelay));
    }

    try {
      const rndQuote = await getRandomQuote();
      console.log(`::Quote::`);
      console.log(rndQuote);
      if (rndQuote) {
        console.log("text" in rndQuote);
      }

      // Set the final quote
      setCellContent((prev) => ({
        ...prev,
        [cellIndex]: rndQuote && "text" in rndQuote ? rndQuote : null,
      }));

      // Clean up loading state
      setLoadingCells((prev) => {
        const newSet = new Set(prev);
        newSet.delete(cellIndex);
        return newSet;
      });
      setLoadingMessages((prev) => {
        const newMessages = { ...prev };
        delete newMessages[cellIndex];
        return newMessages;
      });
    } catch (err: any) {
      console.error("Random quote failure:", err?.message);
    }
  };

  useEffect(() => {
    console.log("-- Rendeirng welcome component");
    const handleKeyDown = (e: KeyboardEvent) => {
      if (focusedCell === null) {
        e.preventDefault();
        setFocusedCell(0);
        return;
      }

      const currentRow = Math.floor(focusedCell / 3);
      const currentCol = focusedCell % 3;

      const selectPath = (start: number, end: number) => {
        const newSet = new Set(selectedCells);
        newSet.add(end);
        setSelectedCells(newSet);
      };

      switch (e.key) {
        case "ArrowUp":
          e.preventDefault();
          if (currentRow > 0) {
            const newFocus = focusedCell - 3;
            setFocusedCell(newFocus);
            if (e.shiftKey) {
              if (selectionStart === null) {
                setSelectionStart(focusedCell);
                setSelectedCells(new Set([focusedCell]));
              }
              selectPath(selectionStart!, newFocus);
            } else {
              setSelectionStart(null);
            }
          }
          break;
        case "ArrowDown":
          e.preventDefault();
          if (currentRow < 99) {
            const newFocus = focusedCell + 3;
            setFocusedCell(newFocus);
            if (e.shiftKey) {
              if (selectionStart === null) {
                setSelectionStart(focusedCell);
                setSelectedCells(new Set([focusedCell]));
              }
              selectPath(selectionStart!, newFocus);
            } else {
              setSelectionStart(null);
            }
          }
          break;
        case "ArrowLeft":
          e.preventDefault();
          if (currentCol > 0) {
            const newFocus = focusedCell - 1;
            setFocusedCell(newFocus);
            if (e.shiftKey) {
              if (selectionStart === null) {
                setSelectionStart(focusedCell);
                setSelectedCells(new Set([focusedCell]));
              }
              selectPath(selectionStart!, newFocus);
            } else {
              setSelectionStart(null);
            }
          }
          break;
        case "ArrowRight":
          e.preventDefault();
          if (currentCol < 2) {
            const newFocus = focusedCell + 1;
            setFocusedCell(newFocus);
            if (e.shiftKey) {
              if (selectionStart === null) {
                setSelectionStart(focusedCell);
                setSelectedCells(new Set([focusedCell]));
              }
              selectPath(selectionStart!, newFocus);
            } else {
              setSelectionStart(null);
            }
          }
          break;
        case "x":
        case "X":
          e.preventDefault();
          setSelectedCells((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(focusedCell)) {
              newSet.delete(focusedCell);
            } else {
              newSet.add(focusedCell);
            }
            return newSet;
          });
          setSelectionStart(null);
          break;
        case " ":
          e.preventDefault();
          if (selectedCells.size > 0) {
            selectedCells.forEach((cellIndex) => {
              if (!loadingCells.has(cellIndex)) {
                startLoadingSequence(cellIndex);
              }
            });
          } else if (focusedCell !== null) {
            if (!loadingCells.has(focusedCell)) {
              startLoadingSequence(focusedCell);
            }
          }
          break;
        case "Escape":
          e.preventDefault();
          setSelectedCells(new Set());
          setSelectionStart(null);
          break;
        case "a":
        case "A":
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            const allCells = new Set(Array.from({ length: 300 }, (_, i) => i));
            setSelectedCells(allCells);
            setSelectionStart(null);
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [focusedCell, selectionStart, selectedCells, cellContent, loadingCells]);

  return (
    <main className="min-h-screen p-8 bg-background">
      <div className="mx-auto w-fit">
        <h1 className="text-3xl font-bold text-center mb-8 text-foreground">
          Live Quote Scraper
        </h1>

        <div className="flex gap-8 items-start">
          {/* Left section - Actions */}
          <ActionsPanel />

          {/* Center section - Grid */}
          <div className="grid grid-cols-3 gap-2 flex-shrink-0">
            {Array.from({ length: 300 }, (_, i) => (
              <QuoteCell
                key={i}
                index={i}
                isFocused={focusedCell === i}
                isSelected={selectedCells.has(i)}
                isLoading={loadingCells.has(i)}
                loadingMessage={loadingMessages[i]}
                content={cellContent[i]}
              />
            ))}
          </div>

          {/* Right section - Details */}
          <QuoteDetails
            cellContent={focusedCell === null ? null : cellContent[focusedCell]}
          />
        </div>
      </div>
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </main>
  );
}
