"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, FileCode, FileText, Image as ImageIcon, Settings, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export type ProjectFile = {
  id: string;
  name: string;
  size: number;
  type: string;
  content: string; // Storing as string for GenAI analysis
};

interface FileUploaderProps {
  files: ProjectFile[];
  onFilesChange: (files: ProjectFile[]) => void;
}

export function FileUploader({ files, onFilesChange }: FileUploaderProps) {
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback(async (incoming: FileList | null) => {
    if (!incoming) return;
    
    const newFiles: ProjectFile[] = await Promise.all(
      Array.from(incoming).map(async (file) => {
        const content = await file.text().catch(() => ""); // Only readable text files
        return {
          id: Math.random().toString(36).slice(2, 9),
          name: file.name,
          size: file.size,
          type: file.type || "application/octet-stream",
          content,
        };
      })
    );
    
    onFilesChange([...files, ...newFiles]);
  }, [files, onFilesChange]);

  const removeFile = (id: string) => {
    onFilesChange(files.filter((f) => f.id !== id));
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / 1048576).toFixed(1) + " MB";
  };

  const getFileIcon = (name: string) => {
    const ext = name.split(".").pop()?.toLowerCase();
    if (ext === "kt" || ext === "java") return <FileCode className="w-4 h-4 text-primary" />;
    if (ext === "xml" || ext === "json") return <FileText className="w-4 h-4 text-secondary" />;
    if (["png", "jpg", "svg", "webp"].includes(ext || "")) return <ImageIcon className="w-4 h-4 text-orange-400" />;
    return <Settings className="w-4 h-4 text-muted-foreground" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-headline font-semibold text-primary">Source Asset Management</h3>
          <p className="text-sm text-muted-foreground">Upload project files, resources, and Gradle configurations.</p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => onFilesChange([])}
          className="border-primary/20 hover:bg-primary/10 text-xs uppercase tracking-widest"
          disabled={files.length === 0}
        >
          Clear All
        </Button>
      </div>

      <div
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          addFiles(e.dataTransfer.files);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          "relative border-2 border-dashed rounded-lg p-12 text-center transition-all cursor-pointer group",
          dragOver ? "border-primary bg-primary/5 shadow-[0_0_20px_rgba(0,255,213,0.1)]" : "border-border hover:border-primary/50 bg-card/50"
        )}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        <Upload className={cn("w-12 h-12 mx-auto mb-4 transition-transform group-hover:-translate-y-1", dragOver ? "text-primary scale-110" : "text-muted-foreground")} />
        <p className="text-sm font-medium">Drag & drop files or click to browse</p>
        <p className="text-xs text-muted-foreground mt-2">.java, .kt, .xml, .gradle, .json and more</p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => addFiles(e.target.files)}
        />
      </div>

      {files.length > 0 && (
        <Card className="bg-background border-border overflow-hidden">
          <div className="bg-muted/50 px-4 py-2 border-b text-[10px] font-headline tracking-widest uppercase text-muted-foreground flex items-center">
            <span className="flex-1">Asset Identifier</span>
            <span className="w-24 text-right">Size</span>
            <span className="w-10"></span>
          </div>
          <div className="max-h-[300px] overflow-y-auto">
            {files.map((file) => (
              <div
                key={file.id}
                className="group px-4 py-3 flex items-center border-b last:border-b-0 hover:bg-primary/5 transition-colors"
              >
                <div className="mr-3">{getFileIcon(file.name)}</div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                </div>
                <div className="w-24 text-right text-xs text-muted-foreground">
                  {formatSize(file.size)}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(file.id);
                  }}
                  className="w-10 flex justify-center text-muted-foreground hover:text-destructive transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          <div className="bg-muted/30 px-4 py-3 border-t text-[11px] text-muted-foreground flex justify-between items-center font-headline">
            <span>TOTAL ASSETS: {files.length}</span>
            <span>DATA FOOTPRINT: {formatSize(files.reduce((acc, f) => acc + f.size, 0))}</span>
          </div>
        </Card>
      )}
    </div>
  );
}
