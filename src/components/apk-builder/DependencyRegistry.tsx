"use client";

import { useState } from "react";
import { Package, Box, Info, Check, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { DEPENDENCIES, GROUPS_DEP } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface DependencyRegistryProps {
  selectedDeps: Set<string>;
  onToggleDep: (id: string) => void;
}

export function DependencyRegistry({ selectedDeps, onToggleDep }: DependencyRegistryProps) {
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  const filteredDeps = DEPENDENCIES.filter(d => {
    const matchesFilter = filter === "All" || d.group === filter;
    const matchesSearch = d.label.toLowerCase().includes(search.toLowerCase()) || 
                          d.desc.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-headline font-semibold text-primary">Interactive Dependency Registry</h3>
          <p className="text-sm text-muted-foreground">Architect your application with curated framework bundles.</p>
        </div>
        <div className="relative group min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input 
            placeholder="Search dependencies..." 
            className="pl-9 bg-card border-border focus:border-primary/50 transition-all text-sm h-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {["All", ...GROUPS_DEP].map(g => (
          <Button
            key={g}
            variant="ghost"
            size="sm"
            onClick={() => setFilter(g)}
            className={cn(
              "text-[10px] font-headline h-8 px-4 rounded-full border transition-all",
              filter === g 
                ? "border-secondary bg-secondary/10 text-secondary" 
                : "border-border text-muted-foreground hover:border-secondary/50"
            )}
          >
            {g.toUpperCase()}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDeps.map((d) => (
          <Card
            key={d.id}
            onClick={() => onToggleDep(d.id)}
            className={cn(
              "p-4 cursor-pointer transition-all border group flex flex-col justify-between hover:shadow-[0_0_15px_rgba(0,157,255,0.05)]",
              selectedDeps.has(d.id) 
                ? "border-secondary bg-secondary/5" 
                : "border-border hover:border-secondary/50 bg-card/50"
            )}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className={cn(
                  "w-8 h-8 rounded bg-background flex items-center justify-center border",
                  selectedDeps.has(d.id) ? "border-secondary text-secondary" : "border-border text-muted-foreground group-hover:border-secondary/50 group-hover:text-secondary"
                )}>
                  <Box className="w-4 h-4" />
                </div>
                <div className={cn(
                  "w-5 h-5 rounded-sm border flex items-center justify-center transition-all",
                  selectedDeps.has(d.id) ? "border-secondary bg-secondary" : "border-border"
                )}>
                  {selectedDeps.has(d.id) && <Check className="w-3.5 h-3.5 text-background" />}
                </div>
              </div>
              <h4 className="text-sm font-headline font-semibold mb-1">{d.label}</h4>
              <p className="text-[10px] text-muted-foreground line-clamp-2 leading-relaxed">{d.desc}</p>
            </div>
            
            <div className="mt-4 flex items-center justify-between">
              <Badge variant="outline" className="text-[9px] font-code h-5 px-1.5 border-border text-muted-foreground">
                v{d.version}
              </Badge>
              <span className="text-[9px] font-headline text-muted-foreground uppercase tracking-widest">{d.group}</span>
            </div>
          </Card>
        ))}
      </div>
      
      {filteredDeps.length === 0 && (
        <div className="py-20 text-center text-muted-foreground">
          <Info className="w-12 h-12 mx-auto mb-4 opacity-10" />
          <p className="font-headline tracking-widest uppercase">No registry items match search criteria</p>
        </div>
      )}
    </div>
  );
}
