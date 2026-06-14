"use client";

import { useState } from "react";
import { FileCode, Copy, Check, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ManifestExporterProps {
  config: {
    appName: string;
    packageName: string;
    versionName: string;
    versionCode: string;
    minSdk: string;
    targetSdk: string;
  };
  permissions: string[];
  dependencies: string[];
}

function generateManifest(config: ManifestExporterProps["config"], permissions: string[]): string {
  const perms = permissions
    .map((p) => `    <uses-permission android:name="android.permission.${p}" />`)
    .join("\n");

  return `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="${config.packageName}"
    android:versionCode="${config.versionCode}"
    android:versionName="${config.versionName}">

    <uses-sdk
        android:minSdkVersion="${config.minSdk}"
        android:targetSdkVersion="${config.targetSdk}" />

${perms}

    <application
        android:label="${config.appName}"
        android:allowBackup="true"
        android:supportsRtl="true">

        <activity
            android:name=".MainActivity"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

    </application>

</manifest>`;
}

function generateGradle(config: ManifestExporterProps["config"], dependencies: string[]): string {
  const depMap: Record<string, string> = {
    retrofit: "    implementation 'com.squareup.retrofit2:retrofit:2.9.0'\n    implementation 'com.squareup.retrofit2:converter-gson:2.9.0'",
    okhttp: "    implementation 'com.squareup.okhttp3:okhttp:4.12.0'\n    implementation 'com.squareup.okhttp3:logging-interceptor:4.12.0'",
    glide: "    implementation 'com.github.bumptech.glide:glide:4.16.0'\n    annotationProcessor 'com.github.bumptech.glide:compiler:4.16.0'",
    picasso: "    implementation 'com.squareup.picasso:picasso:2.8'",
    exoplayer: "    implementation 'com.google.android.exoplayer:exoplayer:2.19.1'",
    room: "    implementation 'androidx.room:room-runtime:2.6.1'\n    annotationProcessor 'androidx.room:room-compiler:2.6.1'",
    realm: "    implementation 'io.realm:realm-android-library:10.18.0'",
    "firebase-core": "    implementation platform('com.google.firebase:firebase-bom:32.7.4')\n    implementation 'com.google.firebase:firebase-analytics'",
    "firebase-auth": "    implementation 'com.google.firebase:firebase-auth'",
    "firebase-firestore": "    implementation 'com.google.firebase:firebase-firestore'",
    "firebase-storage": "    implementation 'com.google.firebase:firebase-storage'",
    "firebase-fcm": "    implementation 'com.google.firebase:firebase-messaging'",
    hilt: "    implementation 'com.google.dagger:hilt-android:2.50'\n    annotationProcessor 'com.google.dagger:hilt-android-compiler:2.50'",
    lifecycle: "    implementation 'androidx.lifecycle:lifecycle-viewmodel-ktx:2.7.0'\n    implementation 'androidx.lifecycle:lifecycle-livedata-ktx:2.7.0'",
    navigation: "    implementation 'androidx.navigation:navigation-fragment-ktx:2.7.7'\n    implementation 'androidx.navigation:navigation-ui-ktx:2.7.7'",
    datastore: "    implementation 'androidx.datastore:datastore-preferences:1.0.0'",
    compose: "    implementation 'androidx.compose.ui:ui:1.6.2'\n    implementation 'androidx.compose.material3:material3:1.2.0'\n    implementation 'androidx.activity:activity-compose:1.8.2'",
    material3: "    implementation 'com.google.android.material:material:1.2.0'",
    lottie: "    implementation 'com.airbnb.android:lottie:6.4.0'",
    maps: "    implementation 'com.google.android.gms:play-services-maps:18.2.0'",
    location: "    implementation 'com.google.android.gms:play-services-location:21.2.0'",
    stripe: "    implementation 'com.stripe:stripe-android:20.40.0'",
    billing: "    implementation 'com.android.billingclient:billing:6.2.1'",
    "ml-kit": "    implementation 'com.google.mlkit:vision-common:18.0.0'",
    tensorflow: "    implementation 'org.tensorflow:tensorflow-lite:2.14.0'",
  };

  const depLines = dependencies
    .map((d) => depMap[d] || `    // implementation '${d}' // TODO: add correct artifact`)
    .join("\n");

  return `plugins {
    id 'com.android.application'
    id 'kotlin-android'
}

android {
    compileSdkVersion ${config.targetSdk}

    defaultConfig {
        applicationId "${config.packageName}"
        minSdkVersion ${config.minSdk}
        targetSdkVersion ${config.targetSdk}
        versionCode ${config.versionCode}
        versionName "${config.versionName}"
    }

    buildTypes {
        release {
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }

    compileOptions {
        sourceCompatibility JavaVersion.VERSION_17
        targetCompatibility JavaVersion.VERSION_17
    }
}

dependencies {
    implementation 'androidx.core:core-ktx:1.12.0'
    implementation 'androidx.appcompat:appcompat:1.6.1'
${depLines}

    testImplementation 'junit:junit:4.13.2'
    androidTestImplementation 'androidx.test.ext:junit:1.1.5'
}`;
}

export function ManifestExporter({ config, permissions, dependencies }: ManifestExporterProps) {
  const [activeFile, setActiveFile] = useState<"manifest" | "gradle">("manifest");
  const [copied, setCopied] = useState(false);

  const manifestXml = generateManifest(config, permissions);
  const gradleContent = generateGradle(config, dependencies);
  const activeContent = activeFile === "manifest" ? manifestXml : gradleContent;
  const activeFilename = activeFile === "manifest" ? "AndroidManifest.xml" : "build.gradle";

  const copyToClipboard = () => {
    navigator.clipboard.writeText(activeContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadFile = () => {
    const blob = new Blob([activeContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = activeFilename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-headline font-semibold text-primary">Manifest & Gradle Export</h3>
          <p className="text-sm text-muted-foreground">
            Live-generated config files based on your current forge settings.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={copyToClipboard} className="border-primary/30 text-primary hover:bg-primary/10 text-xs uppercase tracking-widest">
            {copied ? <Check className="w-3.5 h-3.5 mr-1.5" /> : <Copy className="w-3.5 h-3.5 mr-1.5" />}
            {copied ? "Copied" : "Copy"}
          </Button>
          <Button variant="outline" size="sm" onClick={downloadFile} className="border-primary/30 text-primary hover:bg-primary/10 text-xs uppercase tracking-widest">
            <Download className="w-3.5 h-3.5 mr-1.5" />
            Download
          </Button>
        </div>
      </div>

      <div className="flex gap-2">
        {(["manifest", "gradle"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setActiveFile(f)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 text-[10px] font-headline tracking-widest uppercase border rounded-md transition-all",
              activeFile === f
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:border-primary/40"
            )}
          >
            <FileCode className="w-3.5 h-3.5" />
            {f === "manifest" ? "AndroidManifest.xml" : "build.gradle"}
          </button>
        ))}
      </div>

      <Card className="bg-black border-border overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2 bg-muted/20 border-b border-border/50">
          <div className="flex gap-1.5">
            <div className="w-2 h-2 rounded-full bg-red-500/50" />
            <div className="w-2 h-2 rounded-full bg-yellow-500/50" />
            <div className="w-2 h-2 rounded-full bg-green-500/50" />
          </div>
          <span className="text-[10px] text-muted-foreground font-headline tracking-widest">
            {activeFilename}
          </span>
          <span className="text-[10px] text-primary font-code">{activeContent.split("\n").length} lines</span>
        </div>
        <pre className="p-4 text-[11px] font-code text-foreground/80 overflow-auto max-h-[500px] leading-relaxed whitespace-pre">
          {activeContent}
        </pre>
      </Card>
    </div>
  );
}
