# DroitForge — Industrial APK Compiler

A Next.js web app for configuring, analyzing, and generating Android APK manifests and build bundles. Features an AI-powered permission analyst and interactive dependency registry.

## Features

- **Source Asset Management** — Drag-and-drop upload for `.java`, `.kt`, `.xml`, `.gradle` source files
- **Project Metadata Forge** — Configure app name, package ID, version, and SDK targets
- **AI Permission Analyst** — Scans uploaded source code and auto-suggests required `AndroidManifest.xml` permissions using Gemini AI
- **Dependency Registry** — Browse and select from 25+ popular Android libraries (Firebase, Retrofit, Compose, etc.)
- **Virtual Build Pipeline** — Animated terminal console simulating AAPT2 → R8 → D8 → zipalign with downloadable manifest bundle

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **UI**: Tailwind CSS + shadcn/ui + Radix UI
- **AI**: Google Genkit + Gemini
- **Language**: TypeScript

## Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/droitforge.git
cd droitforge
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

```bash
cp .env.example .env
```

Open `.env` and add your Gemini API key:
```
GEMINI_API_KEY=your_gemini_api_key_here
```

Get a free key at [Google AI Studio](https://aistudio.google.com/app/apikey).

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:9002](http://localhost:9002) in your browser.

### 5. (Optional) Run Genkit AI dev server

In a separate terminal:
```bash
npm run genkit:dev
```

## Project Structure

```
src/
├── ai/
│   ├── flows/
│   │   └── ai-permission-analysis-flow.ts  # Genkit AI flow
│   ├── genkit.ts                            # Genkit initialization
│   └── dev.ts                              # Genkit dev server entry
├── app/
│   ├── page.tsx                            # Main app page
│   ├── layout.tsx                          # Root layout
│   └── globals.css                         # Global styles
├── components/
│   ├── apk-builder/
│   │   ├── BuildPipeline.tsx               # Build console component
│   │   ├── DependencyRegistry.tsx          # Library selector
│   │   ├── FileUploader.tsx                # Asset uploader
│   │   └── PermissionAnalyst.tsx           # AI permission scanner
│   └── ui/                                 # shadcn/ui components
├── hooks/
│   ├── use-mobile.tsx
│   └── use-toast.ts
└── lib/
    ├── constants.ts                        # Permissions & dependencies data
    └── utils.ts
```

## License

MIT
