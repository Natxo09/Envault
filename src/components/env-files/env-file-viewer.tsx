import { X, Copy, Check } from "lucide-react";
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Kbd } from "@/components/ui/kbd";
import { toast } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";
import type { EnvFile } from "@/hooks/use-env-files";

interface EnvFileViewerProps {
  file: EnvFile | null;
  content: string | null;
  isLoading: boolean;
  onClose: () => void;
  onCopy?: () => void;
}

interface ParsedLine {
  type: "comment" | "empty" | "variable" | "invalid";
  raw: string;
  key?: string;
  value?: string;
}

function parseEnvContent(content: string): ParsedLine[] {
  return content.split("\n").map((line) => {
    const trimmed = line.trim();

    if (trimmed === "") {
      return { type: "empty", raw: line };
    }

    if (trimmed.startsWith("#")) {
      return { type: "comment", raw: line };
    }

    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      return {
        type: "variable",
        raw: line,
        key: match[1],
        value: match[2],
      };
    }

    return { type: "invalid", raw: line };
  });
}

export function EnvFileViewer({
  file,
  content,
  isLoading,
  onClose,
  onCopy,
}: EnvFileViewerProps) {
  const [copied, setCopied] = useState(false);

  const parsedLines = useMemo(() => {
    if (!content) return [];
    return parseEnvContent(content);
  }, [content]);

  const handleCopy = async () => {
    if (!content) return;

    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success("Copied to clipboard");
      onCopy?.();
    } catch (err) {
      console.error("Failed to copy:", err);
      toast.error("Failed to copy");
    }
  };

  if (!file) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="border rounded-lg bg-card">
        <div className="flex items-center justify-between px-3 py-2 border-b">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-6 w-6" />
        </div>
        <div className="p-3 space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-4 w-full" style={{ width: `${Math.random() * 40 + 60}%` }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="border rounded-lg bg-card overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b bg-muted/30">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{file.name}</span>
          {file.is_active && (
            <span className="text-xs text-green-600 dark:text-green-400 bg-green-500/10 px-1.5 py-0.5 rounded">
              active
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 gap-1.5"
            onClick={handleCopy}
            title="Copy to clipboard (⌘C)"
          >
            {copied ? (
              <Check className="size-3.5 text-green-500" />
            ) : (
              <Copy className="size-3.5" />
            )}
            <span className="flex items-center gap-0.5">
              <Kbd size="sm">⌘</Kbd>
              <Kbd size="sm">C</Kbd>
            </span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            onClick={onClose}
            title="Close"
          >
            <X className="size-3.5" />
          </Button>
        </div>
      </div>
      <div className="max-h-[300px] overflow-auto">
        <pre className="p-3 text-sm font-mono leading-relaxed">
          {parsedLines.map((line, index) => (
            <div key={index} className={cn(
              "min-h-[1.5em]",
              line.type === "comment" && "text-muted-foreground",
              line.type === "empty" && "h-[1.5em]"
            )}>
              {line.type === "variable" ? (
                <>
                  <span className="text-blue-600 dark:text-blue-400">{line.key}</span>
                  <span className="text-muted-foreground">=</span>
                  <span className="text-green-600 dark:text-green-400">{line.value}</span>
                </>
              ) : line.type === "comment" ? (
                <span>{line.raw}</span>
              ) : line.type === "empty" ? (
                <span>&nbsp;</span>
              ) : (
                <span>{line.raw}</span>
              )}
            </div>
          ))}
        </pre>
      </div>
      {file.modified_at && (
        <div className="px-3 py-1.5 border-t bg-muted/30">
          <span className="text-xs text-muted-foreground">
            Modified: {file.modified_at}
          </span>
        </div>
      )}
    </div>
  );
}
