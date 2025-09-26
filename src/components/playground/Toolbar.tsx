"use client";

import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ToolbarProps {
  onRun: () => void;
}

export default function Toolbar({ onRun }: ToolbarProps) {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-b bg-card">
      <h1 className="text-xl font-headline font-bold text-primary">JS Playground</h1>
      <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
        <Button onClick={onRun} className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-accent-foreground">
          <Play />
          <span>Run</span>
        </Button>
      </div>
    </div>
  );
}
