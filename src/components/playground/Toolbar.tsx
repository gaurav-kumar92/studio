"use client";

import { useEffect } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { Play, Sparkles, Loader2 } from "lucide-react";
import { generateCodeAction, type GenerateCodeState } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface ToolbarProps {
  onRun: () => void;
  onGeneratedCode: (code: string) => void;
}

const initialState: GenerateCodeState = {
  code: null,
  error: null,
};

function GenerateButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} variant="outline">
      {pending ? (
        <Loader2 className="animate-spin" />
      ) : (
        <Sparkles className="text-yellow-400" />
      )}
      <span>Generate with AI</span>
    </Button>
  );
}

export default function Toolbar({ onRun, onGeneratedCode }: ToolbarProps) {
  const [state, formAction] = useFormState(generateCodeAction, initialState);
  const { toast } = useToast();

  useEffect(() => {
    if (state.error) {
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: state.error,
      });
    }
    if (state.code) {
      onGeneratedCode(state.code);
      toast({
        title: "Code Generated!",
        description: "The AI-generated code has been added to the editor.",
      });
    }
  }, [state, onGeneratedCode, toast]);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-b bg-card">
      <h1 className="text-xl font-headline font-bold text-primary">JS Playground</h1>
      <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
        <form action={formAction} className="flex items-center gap-2 w-full sm:w-[350px]">
          <Input
            name="prompt"
            placeholder="e.g., a simple calculator"
            className="font-body"
          />
          <GenerateButton />
        </form>
        <Button onClick={onRun} className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-accent-foreground">
          <Play />
          <span>Run</span>
        </Button>
      </div>
    </div>
  );
}
