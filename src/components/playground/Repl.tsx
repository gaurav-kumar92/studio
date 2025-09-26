"use client";

import { useEffect, useRef, type Dispatch, type SetStateAction } from "react";
import { Terminal, ChevronRight, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { Output } from "./types";

interface ReplProps {
  runId: number;
  code: string;
  output: Output[];
  setOutput: Dispatch<SetStateAction<Output[]>>;
  onClear: () => void;
}

const executionScript = `
  const post = (type, message) => window.parent.postMessage({ source: 'repl', type, message }, '*');

  // Override console methods
  const consoleMethods = {
    log: 'log',
    error: 'error',
    warn: 'log', // Treat warnings as logs for display
    info: 'log',
    debug: 'log',
  };

  for (const method in consoleMethods) {
    const original = console[method];
    console[method] = (...args) => {
      const formattedArgs = args.map(arg => {
        if (arg instanceof Error) return arg.stack;
        if (typeof arg === 'object' && arg !== null) {
          try {
            return JSON.stringify(arg, null, 2);
          } catch {
            return 'Unserializable Object';
          }
        }
        return String(arg);
      });
      post(consoleMethods[method], formattedArgs);
      original.apply(console, args);
    };
  }

  // Catch uncaught errors
  window.addEventListener('error', (event) => {
    post('error', [event.message]);
  });
  window.addEventListener('unhandledrejection', (event) => {
    post('error', [event.reason.message || 'Unhandled promise rejection']);
  });
`;

export default function Repl({ runId, code, output, setOutput, onClear }: ReplProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (
        event.origin === window.location.origin &&
        event.data.source === "repl"
      ) {
        setOutput((prev) => [...prev, { type: event.data.type, message: event.data.message }]);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [setOutput]);

  useEffect(() => {
    if (runId > 0 && iframeRef.current) {
      const iframe = iframeRef.current;
      const html = `
        <html>
          <head>
            <script>${executionScript}</script>
          </head>
          <body>
            <script>
              try {
                ${code}
              } catch (e) {
                console.error(e);
              }
            </script>
          </body>
        </html>
      `;
      iframe.srcdoc = html;
    }
  }, [runId, code]);

  return (
    <Card className="h-full flex flex-col font-code shadow-md">
      <CardHeader className="flex flex-row items-center justify-between py-3 px-4 border-b">
        <CardTitle className="text-lg font-headline font-semibold flex items-center gap-2">
          <Terminal className="size-5" />
          Output
        </CardTitle>
        <Button variant="ghost" size="icon" onClick={onClear} aria-label="Clear output">
          <Trash2 className="size-4" />
        </Button>
      </CardHeader>
      <CardContent className="p-0 flex-grow min-h-0">
        <ScrollArea className="h-full">
          <div className="p-4 text-sm">
            {output.length === 0 && (
              <p className="text-muted-foreground">Click "Run" to see the output.</p>
            )}
            {output.map((line, index) => (
              <div
                key={index}
                className={cn(
                  "flex items-start gap-2 border-b border-border/20 py-2",
                  line.type === "error" && "text-red-500"
                )}
              >
                <ChevronRight className="size-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                <pre className="flex-1 whitespace-pre-wrap break-words">{line.message.join(" ")}</pre>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
      <iframe ref={iframeRef} sandbox="allow-scripts" className="hidden" />
    </Card>
  );
}
