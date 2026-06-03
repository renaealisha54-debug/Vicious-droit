"use client";

import { useState, useEffect, useRef } from "react";
import { Terminal, Download, Rocket, Hammer, Cpu, Package, CheckCircle2, ShieldCheck, Box } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

type LogEntry = {
  id: string;
  message: string;
  type: "info" | "success" | "warning" | "error" | "step";
  timestamp: number;
};

interface BuildPipelineProps {
  config: {
    appName: string;
    packageName: string;
    versionName: string;
    versionCode: string;
    minSdk: string;
    targetSdk: string;
  };
  files: any[];
  permissions: string[];
  dependencies: string[];
}

export function BuildPipeline({ config, files, permissions, dependencies }: BuildPipelineProps) {
  const [building, setBuilding] = useState(false);
  const [built, setBuilt] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [progress, setProgress] = useState(0);
  const logContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  const addLog = (message: string, type: LogEntry["type"] = "info") => {
    setLogs((prev) => [...prev, { id: Math.random().toString(36), message, type, timestamp: Date.now() }]);
  };

  const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

  const startBuild = async () => {
    if (!config.appName || !config.packageName) {
      alert("Please provide App Name and Package Name in Configuration.");
      return;
    }

    setBuilding(true);
    setBuilt(false);
    setLogs([]);
    setProgress(0);

    const steps = [
      { msg: "INIT_ENVIRONMENT: Setting up toolchain...", type: "step", progress: 5, delay: 600 },
      { msg: "CONFIG_SYNC: Synchronizing project metadata...", type: "info", progress: 10, delay: 400 },
      { msg: `PACKAGE: ${config.packageName} (v${config.versionName})`, type: "info", progress: 15, delay: 200 },
      { msg: "FS_SCAN: Indexing source assets...", type: "step", progress: 20, delay: 500 },
      ...files.map(f => ({ msg: `  INDEXED: ${f.name} (${(f.size / 1024).toFixed(1)} KB)`, type: "info", progress: 20, delay: 100 })),
      { msg: "MANIFEST_GEN: Constructing AndroidManifest.xml...", type: "step", progress: 30, delay: 800 },
      ...permissions.map(p => ({ msg: `  PERMISSION: android.permission.${p}`, type: "info", progress: 30, delay: 50 })),
      { msg: "GRADLE_SYNC: Resolving build dependencies...", type: "step", progress: 45, delay: 1200 },
      ...dependencies.map(d => ({ msg: `  RESOLVED: ${d}`, type: "info", progress: 45, delay: 80 })),
      { msg: "AAPT2: Compiling resource tree...", type: "step", progress: 60, delay: 900 },
      { msg: "R8: Minifying and optimizing bytecode...", type: "step", progress: 75, delay: 1500 },
      { msg: "D8: Executing dexer operation...", type: "step", progress: 85, delay: 800 },
      { msg: "SIGNER: Applying V3 debug signature...", type: "step", progress: 95, delay: 600 },
      { msg: "ZIPALIGN: Optimization complete.", type: "success", progress: 100, delay: 400 },
      { msg: `BUILD_SUCCESS: Artifact generated: ${config.appName.replace(/\s+/g, '_')}.apk`, type: "success", progress: 100, delay: 300 },
    ];

    for (const step of steps) {
      addLog(step.msg, step.type as LogEntry["type"]);
      setProgress(step.progress);
      await sleep(step.delay);
    }

    setBuilding(false);
    setBuilt(true);
  };

  const downloadApk = () => {
    const blob = new Blob(["FOR_DEMO_PURPOSES_ONLY"], { type: "application/vnd.android.package-archive" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${config.appName.replace(/\s+/g, '_')}-v${config.versionName}.apk`;
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-headline font-semibold text-primary">Virtual Build Pipeline</h3>
          <p className="text-sm text-muted-foreground">Monitor real-time compilation and package assembly.</p>
        </div>
        {!building && !built && (
          <Button onClick={startBuild} className="bg-primary text-primary-foreground hover:bg-primary/90 animate-glow">
            <Hammer className="w-4 h-4 mr-2" />
            INITIATE BUILD
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "ASSETS", val: files.length, icon: Package, color: "text-primary" },
          { label: "PERMS", val: permissions.length, icon: ShieldCheck, color: "text-secondary" },
          { label: "DEPS", val: dependencies.length, icon: Box, color: "text-orange-400" },
          { label: "TARGET", val: `API ${config.targetSdk}`, icon: Cpu, color: "text-purple-400" },
        ].map((stat, i) => (
          <Card key={i} className="bg-card/50 border-border p-3 text-center space-y-1">
            <stat.icon className={cn("w-4 h-4 mx-auto mb-1 opacity-60", stat.color)} />
            <p className="text-xl font-headline font-bold">{stat.val}</p>
            <p className="text-[10px] tracking-widest text-muted-foreground uppercase">{stat.label}</p>
          </Card>
        ))}
      </div>

      <Card className="bg-black border-border shadow-2xl relative overflow-hidden font-code">
        <div className="absolute top-0 left-0 right-0 h-1 bg-border/20 z-10">
          <div 
            className="h-full bg-primary transition-all duration-300 shadow-[0_0_10px_#00FFD5]" 
            style={{ width: `${progress}%` }} 
          />
        </div>
        
        <div className="flex items-center justify-between px-4 py-2 bg-muted/20 border-b border-border/50">
          <div className="flex gap-1.5">
            <div className="w-2 h-2 rounded-full bg-red-500/50" />
            <div className="w-2 h-2 rounded-full bg-yellow-500/50" />
            <div className="w-2 h-2 rounded-full bg-green-500/50" />
          </div>
          <div className="text-[10px] text-muted-foreground flex items-center gap-2">
            <Terminal className="w-3 h-3" />
            DROITFORGE_SYSTEM_CONSOLE
          </div>
          <div className="text-[10px] text-primary">{progress}%</div>
        </div>

        <div 
          ref={logContainerRef}
          className="h-[400px] overflow-y-auto p-4 space-y-1.5 text-[11px] leading-relaxed"
        >
          {logs.length === 0 && !building && (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground/30 space-y-4">
              <Hammer className="w-12 h-12 opacity-10" />
              <p className="font-headline tracking-widest uppercase">System Standby</p>
            </div>
          )}
          {logs.map((log) => (
            <div key={log.id} className="flex gap-4 group">
              <span className="text-muted-foreground/30 select-none">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
              <span className={cn(
                "font-medium",
                log.type === "step" ? "text-primary" :
                log.type === "success" ? "text-green-400" :
                log.type === "warning" ? "text-yellow-400" :
                log.type === "error" ? "text-red-400" : "text-foreground/80"
              )}>
                {log.type === "step" && ">> "}
                {log.message}
              </span>
            </div>
          ))}
          {building && (
            <div className="flex gap-4">
              <span className="text-muted-foreground/30 select-none">[{new Date().toLocaleTimeString()}]</span>
              <span className="w-2 h-4 bg-primary animate-terminal-cursor shadow-[0_0_8px_#00FFD5]" />
            </div>
          )}
        </div>
      </Card>

      {built && (
        <div className="animate-in fade-in slide-in-from-top-4 duration-500 space-y-4">
          <Button 
            onClick={downloadApk}
            className="w-full h-14 bg-secondary text-secondary-foreground hover:bg-secondary/90 text-lg font-headline font-bold tracking-widest shadow-[0_0_20px_rgba(0,157,255,0.3)]"
          >
            <Download className="w-6 h-6 mr-3" />
            EXPORT PACKAGE BUNDLE (.APK)
          </Button>
          
          <Card className="p-6 bg-secondary/5 border-secondary/30 border-dashed text-center">
            <Rocket className="w-10 h-10 mx-auto mb-4 text-secondary" />
            <h4 className="text-md font-headline font-bold text-secondary mb-2">DEPLOYMENT READY</h4>
            <div className="text-sm text-muted-foreground max-w-lg mx-auto space-y-4">
              <p>The manifest has been injected and the resources have been optimized for distribution.</p>
              <div className="grid grid-cols-2 gap-4 text-left p-4 bg-background/50 rounded-lg border border-border">
                <div className="space-y-1">
                  <p className="text-[10px] text-muted-foreground uppercase font-headline">Checksum</p>
                  <p className="font-code text-[10px] truncate uppercase">sha256:7a9d...f4e2</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-muted-foreground uppercase font-headline">Size</p>
                  <p className="font-code text-[10px]">{(Math.random() * 5 + 2).toFixed(2)} MB</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
