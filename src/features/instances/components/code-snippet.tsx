"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

interface CodeSnippetProps {
  snippets: { language: string; code: string }[];
}

export function CodeSnippet({ snippets }: CodeSnippetProps) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState(snippets[0]?.language || "");

  const handleCopy = () => {
    const snippet = snippets.find((s) => s.language === activeTab);
    if (snippet) {
      navigator.clipboard.writeText(snippet.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="rounded-xl border border-border overflow-hidden bg-card">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/50">
          <TabsList className="bg-transparent h-auto p-0 gap-1">
            {snippets.map((s) => (
              <TabsTrigger
                key={s.language}
                value={s.language}
                className="rounded-md px-3 py-1.5 text-xs font-medium"
              >
                {s.language}
              </TabsTrigger>
            ))}
          </TabsList>
          <Button variant="ghost" size="sm" onClick={handleCopy} className="h-8 gap-1.5 text-xs text-muted-foreground">
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copied!" : "Copy"}
          </Button>
        </div>
        {snippets.map((s) => (
          <TabsContent key={s.language} value={s.language} className="m-0">
            <pre className="p-4 overflow-x-auto text-sm leading-relaxed font-mono text-foreground bg-muted/30">
              <code>{s.code}</code>
            </pre>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
