"use client";

import { useState } from "react";
import { Shield, Sparkles, Loader2, CheckCircle2, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { aiPermissionAnalysis } from "@/ai/flows/ai-permission-analysis-flow";
import type { ProjectFile } from "./FileUploader";
import { PERMISSIONS } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface PermissionAnalystProps {
  files: ProjectFile[];
  selectedPerms: Set<string>;
  onSelectPerm: (id: string) => void;
  onSetPerms: (ids: string[]) => void;
}

export function PermissionAnalyst({ files, selectedPerms, onSelectPerm, onSetPerms }: PermissionAnalystProps) {
  const [analyzing, setAnalyzing] = useState(false);
  const [suggested, setSuggested] = useState<string[]>([]);
  const [filter, setFilter] = useState("All");

  const runAnalysis = async () => {
    if (files.length === 0) return;
    setAnalyzing(true);
    try {
      // Only send text files for analysis
      const codeFiles = files.filter(f => f.name.endsWith('.kt') || f.name.endsWith('.java') || f.name.endsWith('.xml'));
      const result = await aiPermissionAnalysis({
        files: codeFiles.map(f => ({ filename: f.name, content: f.content }))
      });
      setSuggested(result);
    } catch (error) {
      console.error("AI Analysis failed:", error);
    } finally {
      setAnalyzing(false);
    }
  };

  const groups = ["All", ...new Set(PERMISSIONS.map(p => p.group))];
  const filteredPerms = filter === "All" ? PERMISSIONS : PERMISSIONS.filter(p => p.group === filter);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-headline font-semibold text-primary flex items-center gap-2">
            AI Permission Analyst
          </h3>
          <p className="text-sm text-muted-foreground">Scan source code to identify necessary manifest requirements.</p>
        </div>
        <Button
          onClick={runAnalysis}
          disabled={analyzing || files.length === 0}
          className="relative group overflow-hidden bg-primary text-primary-foreground hover:bg-primary/90 animate-glow"
        >
          {analyzing ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <Sparkles className="w-4 h-4 mr-2" />
          )}
          {analyzing ? "ANALYZING..." : "AUTO-SCAN ASSETS"}
          <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500 ease-in-out pointer-events-none" />
        </Button>
      </div>

      {suggested.length > 0 && (
        <Card className="p-4 bg-primary/5 border-primary/30 space-y-3">
          <div className="flex items-center gap-2 text-primary font-headline text-xs tracking-widest uppercase">
            <CheckCircle2 className="w-4 h-4" />
            AI Suggestions Ready
          </div>
          <div className="flex flex-wrap gap-2">
            {suggested.map((id) => (
              <Button
                key={id}
                variant={selectedPerms.has(id) ? "default" : "outline"}
                size="sm"
                onClick={() => onSelectPerm(id)}
                className={cn(
                  "text-[10px] h-7 border-primary/30",
                  selectedPerms.has(id) ? "bg-primary text-primary-foreground" : "text-primary hover:bg-primary/10"
                )}
              >
                + {id}
              </Button>
            ))}
          </div>
          <Button 
            variant="link" 
            size="sm" 
            className="text-primary text-[10px] p-0 h-auto font-headline uppercase"
            onClick={() => onSetPerms([...new Set([...Array.from(selectedPerms), ...suggested])])}
          >
            Apply All Suggestions
          </Button>
        </Card>
      )}

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {groups.map(g => (
          <Button
            key={g}
            variant="ghost"
            size="sm"
            onClick={() => setFilter(g)}
            className={cn(
              "text-[10px] font-headline h-8 px-4 rounded-full border transition-all",
              filter === g 
                ? "border-primary bg-primary/10 text-primary" 
                : "border-border text-muted-foreground hover:border-primary/50"
            )}
          >
            {g.toUpperCase()}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filteredPerms.map((p) => (
          <Card
            key={p.id}
            onClick={() => onSelectPerm(p.id)}
            className={cn(
              "p-4 cursor-pointer transition-all border group relative overflow-hidden",
              selectedPerms.has(p.id) 
                ? "border-primary bg-primary/5 shadow-[0_0_15px_rgba(0,255,213,0.1)]" 
                : "border-border hover:border-primary/50 bg-card/50"
            )}
          >
            <div className="flex items-start gap-4">
              <div className={cn(
                "w-10 h-10 rounded bg-background flex items-center justify-center border transition-colors",
                selectedPerms.has(p.id) ? "border-primary text-primary" : "border-border text-muted-foreground group-hover:border-primary/50 group-hover:text-primary"
              )}>
                <Shield className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-headline font-semibold truncate">{p.label}</h4>
                <p className="text-[10px] text-muted-foreground font-code truncate">android.permission.{p.id}</p>
              </div>
              <div className={cn(
                "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                selectedPerms.has(p.id) ? "border-primary bg-primary" : "border-border bg-transparent"
              )}>
                {selectedPerms.has(p.id) && <CheckCircle2 className="w-4 h-4 text-background" />}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
