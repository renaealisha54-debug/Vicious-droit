"use client";

import { useState } from "react";
import { Hammer, Settings2 } from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { FileUploader, type ProjectFile } from "@/components/apk-builder/FileUploader";
import { PermissionAnalyst } from "@/components/apk-builder/PermissionAnalyst";
import { DependencyRegistry } from "@/components/apk-builder/DependencyRegistry";
import { BuildPipeline } from "@/components/apk-builder/BuildPipeline";
import { ManifestExporter } from "@/components/apk-builder/ManifestExporter";

type AppConfig = {
  appName: string;
  packageName: string;
  versionName: string;
  versionCode: string;
  minSdk: string;
  targetSdk: string;
};

export default function Home() {
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [selectedPerms, setSelectedPerms] = useState<Set<string>>(new Set());
  const [selectedDeps, setSelectedDeps] = useState<Set<string>>(new Set());
  const [config, setConfig] = useState<AppConfig>({
    appName: "My Application",
    packageName: "com.example.myapp",
    versionName: "1.0.0",
    versionCode: "1",
    minSdk: "24",
    targetSdk: "34",
  });

  const togglePerm = (id: string) => {
    setSelectedPerms((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const setPerms = (ids: string[]) => {
    setSelectedPerms(new Set(ids));
  };

  const toggleDep = (id: string) => {
    setSelectedDeps((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const updateConfig = (key: keyof AppConfig, value: string) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="container mx-auto max-w-6xl px-4 py-6 flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary">
            <Hammer className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-headline font-bold tracking-tight">
              DroitForge
            </h1>
            <p className="text-sm text-muted-foreground">
              Industrial APK Compiler &amp; Manifest Generator
            </p>
          </div>
        </div>
      </header>

      <div className="container mx-auto max-w-6xl px-4 py-8 space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline text-lg">
              <Settings2 className="w-4 h-4" />
              Project Metadata Forge
            </CardTitle>
            <CardDescription>
              Configure your application identity and SDK targets.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="appName">App Name</Label>
              <Input
                id="appName"
                value={config.appName}
                onChange={(e) => updateConfig("appName", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="packageName">Package Name</Label>
              <Input
                id="packageName"
                value={config.packageName}
                onChange={(e) => updateConfig("packageName", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="versionName">Version Name</Label>
              <Input
                id="versionName"
                value={config.versionName}
                onChange={(e) => updateConfig("versionName", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="versionCode">Version Code</Label>
              <Input
                id="versionCode"
                value={config.versionCode}
                onChange={(e) => updateConfig("versionCode", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="minSdk">Min SDK</Label>
              <Input
                id="minSdk"
                value={config.minSdk}
                onChange={(e) => updateConfig("minSdk", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="targetSdk">Target SDK</Label>
              <Input
                id="targetSdk"
                value={config.targetSdk}
                onChange={(e) => updateConfig("targetSdk", e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="files" className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5">
            <TabsTrigger value="files">Source Files</TabsTrigger>
            <TabsTrigger value="permissions">Permissions</TabsTrigger>
            <TabsTrigger value="dependencies">Dependencies</TabsTrigger>
            <TabsTrigger value="build">Build</TabsTrigger>
            <TabsTrigger value="export">Export</TabsTrigger>
          </TabsList>

          <TabsContent value="files" className="mt-6">
            <FileUploader files={files} onFilesChange={setFiles} />
          </TabsContent>

          <TabsContent value="permissions" className="mt-6">
            <PermissionAnalyst
              files={files}
              selectedPerms={selectedPerms}
              onSelectPerm={togglePerm}
              onSetPerms={setPerms}
            />
          </TabsContent>

          <TabsContent value="dependencies" className="mt-6">
            <DependencyRegistry
              selectedDeps={selectedDeps}
              onToggleDep={toggleDep}
            />
          </TabsContent>

          <TabsContent value="build" className="mt-6">
            <BuildPipeline
              config={config}
              files={files}
              permissions={Array.from(selectedPerms)}
              dependencies={Array.from(selectedDeps)}
            />
          </TabsContent>

          <TabsContent value="export" className="mt-6">
            <ManifestExporter
              config={config}
              permissions={Array.from(selectedPerms)}
              dependencies={Array.from(selectedDeps)}
            />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
