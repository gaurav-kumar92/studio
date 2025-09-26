"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import Toolbar from "@/components/playground/Toolbar";
import { type Output } from "@/components/playground/types";

const Editor = dynamic(() => import("@/components/playground/Editor"), {
  ssr: false,
  loading: () => <Skeleton className="w-full h-full" />,
});

const Repl = dynamic(() => import("@/components/playground/Repl"), {
  ssr: false,
  loading: () => <Skeleton className="w-full h-full" />,
});

const initialCode = `// Welcome to JS Playground!
// Type your JavaScript code here and click "Run".

function greet(name) {
  return \`Hello, \${name}!\`;
}

console.log(greet('Developer'));
`;

export default function Home() {
  const [code, setCode] = useState<string>(initialCode);
  const [output, setOutput] = useState<Output[]>([]);
  const [runId, setRunId] = useState(0);

  const handleRunCode = () => {
    setOutput([]);
    setRunId((prev) => prev + 1);
  };

  const handleClearOutput = () => {
    setOutput([]);
  };

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <Toolbar onRun={handleRunCode} />
      
      <main className="flex-grow flex flex-col md:flex-row gap-4 p-4 pt-2 overflow-hidden">
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex-grow rounded-lg overflow-hidden shadow-md border border-card bg-card">
            <Editor value={code} onChange={setCode} />
          </div>
        </div>
        <div className="flex-1 flex flex-col min-h-0">
          <Repl
            runId={runId}
            code={code}
            output={output}
            setOutput={setOutput}
            onClear={handleClearOutput}
          />
        </div>
      </main>
    </div>
  );
}
