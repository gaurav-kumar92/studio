"use client";

import { Editor as MonacoEditor } from "@monaco-editor/react";
import { Skeleton } from "@/components/ui/skeleton";

interface EditorProps {
  value: string;
  onChange: (value: string | undefined) => void;
}

export default function Editor({ value, onChange }: EditorProps) {
  return (
    <MonacoEditor
      height="100%"
      language="javascript"
      theme="vs-dark"
      value={value}
      onChange={onChange}
      loading={<Skeleton className="w-full h-full" />}
      options={{
        fontFamily: "'Source Code Pro', monospace",
        fontSize: 14,
        minimap: {
          enabled: false,
        },
        contextmenu: false,
        scrollBeyondLastLine: false,
        automaticLayout: true,
        wordWrap: "on",
      }}
    />
  );
}
