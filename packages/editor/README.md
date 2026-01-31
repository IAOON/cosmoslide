# CosmosSlide Editor

A browser-based Markdown to PDF editor with precise pagination control.

## Features

- **Live Preview**: See your document exactly as it will print
- **Custom Page Sizes**: Configure width, height, and margins
- **Page Delimiters**: Use `---page---` or form feed (`\f`) to create page breaks
- **Vector PDF Export**: Text remains selectable in exported PDFs

## Installation

```bash
pnpm add @cosmoslide/editor
```

## Components

All components are exported from `@cosmoslide/editor`.

```tsx
import {
  MarkdownToPdfApp,
  MarkdownEditor,
  MarkdownPreview,
  PrintButton,
  PageSizeControls,
  usePdfExport,
} from '@cosmoslide/editor';
```

### MarkdownToPdfApp

Main application component that composes the complete editor interface.

```tsx
function App() {
  return <MarkdownToPdfApp />;
}
```

This component manages all application state internally and provides:

- Header with title, page size controls, and export button
- Split-panel layout with markdown editor and live preview
- Footer with page break syntax help

---

### MarkdownEditor

CodeMirror-based Markdown editor with syntax highlighting.

#### Props

| Prop       | Type                      | Required | Description                         |
| ---------- | ------------------------- | -------- | ----------------------------------- |
| `value`    | `string`                  | Yes      | Current markdown text content       |
| `onChange` | `(value: string) => void` | Yes      | Callback fired when content changes |
| `config`   | `EditorConfig`            | No       | Optional editor configuration       |

#### EditorConfig

| Property       | Type      | Default | Description          |
| -------------- | --------- | ------- | -------------------- |
| `lineNumbers`  | `boolean` | `true`  | Show line numbers    |
| `lineWrapping` | `boolean` | `true`  | Enable line wrapping |

#### Example

```tsx
const [markdown, setMarkdown] = useState('# Hello');

<MarkdownEditor
  value={markdown}
  onChange={setMarkdown}
  config={{ lineNumbers: true, lineWrapping: true }}
/>;
```

---

### MarkdownPreview

iframe-based preview component that renders print-accurate output.

#### Props

| Prop       | Type                     | Required | Description                    |
| ---------- | ------------------------ | -------- | ------------------------------ |
| `markdown` | `string`                 | Yes      | The markdown content to render |
| `pageSize` | `PageSize`               | Yes      | Page dimensions configuration  |
| `ref`      | `Ref<HTMLIFrameElement>` | No       | Forwarded ref to access iframe |

#### Example

```tsx
const iframeRef = useRef<HTMLIFrameElement>(null);
const pageSize = { width: 210, height: 297, margin: 20 };

<MarkdownPreview
  ref={iframeRef}
  markdown="# Hello World"
  pageSize={pageSize}
/>;
```

---

### PrintButton

Button that triggers the browser's native print dialog.

#### Props

| Prop        | Type                                   | Required | Description                           |
| ----------- | -------------------------------------- | -------- | ------------------------------------- |
| `iframeRef` | `RefObject<HTMLIFrameElement \| null>` | Yes      | Reference to the preview iframe       |
| `disabled`  | `boolean`                              | No       | Disable the button (default: `false`) |

#### Example

```tsx
const iframeRef = useRef<HTMLIFrameElement>(null);

<PrintButton iframeRef={iframeRef} />
<PrintButton iframeRef={iframeRef} disabled={true} />
```

---

### PageSizeControls

Controls for configuring PDF page size with presets and custom inputs.

#### Props

| Prop       | Type                           | Required | Description                     |
| ---------- | ------------------------------ | -------- | ------------------------------- |
| `pageSize` | `PageSize`                     | Yes      | Current page size configuration |
| `onChange` | `(pageSize: PageSize) => void` | Yes      | Callback when page size changes |

#### PageSize Type

```ts
interface PageSize {
  width: number; // in mm
  height: number; // in mm
  margin: number; // in mm
}
```

#### Available Presets

| Preset       | Width | Height | Margin |
| ------------ | ----- | ------ | ------ |
| A4           | 210mm | 297mm  | 20mm   |
| A5           | 148mm | 210mm  | 15mm   |
| Letter       | 216mm | 279mm  | 20mm   |
| Slide (16:9) | 254mm | 143mm  | 10mm   |
| Slide (4:3)  | 254mm | 190mm  | 10mm   |
| Custom Book  | 180mm | 250mm  | 15mm   |

#### Example

```tsx
const [pageSize, setPageSize] = useState({
  width: 210,
  height: 297,
  margin: 20,
});

<PageSizeControls pageSize={pageSize} onChange={setPageSize} />;
```

---

## Hooks

```tsx
import { usePdfExport } from '@cosmoslide/editor';
```

### usePdfExport

Custom hook for exporting content to PDF with a callback for server upload.

Uses `html2canvas` and `jspdf` to generate the PDF binary. The `onExport` callback
receives the PDF blob which can be uploaded to external storage.

#### Parameters

| Parameter   | Type                                   | Required | Description                         |
| ----------- | -------------------------------------- | -------- | ----------------------------------- |
| `iframeRef` | `RefObject<HTMLIFrameElement \| null>` | Yes      | Reference to the preview iframe     |
| `options`   | `PdfExportOptions`                     | Yes      | Export options                      |
| `onExport`  | `OnExportCallback`                     | No       | Callback that receives the PDF blob |

#### PdfExportOptions

| Property   | Type       | Required | Description                                        |
| ---------- | ---------- | -------- | -------------------------------------------------- |
| `filename` | `string`   | No       | Filename without extension (default: `"document"`) |
| `pageSize` | `PageSize` | Yes      | Page size configuration                            |

#### OnExportCallback

```ts
type OnExportCallback = (blob: Blob, filename: string) => void | Promise<void>;
```

#### Returns

| Property      | Type                          | Description                          |
| ------------- | ----------------------------- | ------------------------------------ |
| `exportPdf`   | `() => Promise<Blob \| null>` | Trigger PDF export, returns the blob |
| `isExporting` | `boolean`                     | Whether export is in progress        |
| `error`       | `string \| null`              | Error message if export failed       |

#### Example: Basic Export

```tsx
const iframeRef = useRef<HTMLIFrameElement>(null);
const pageSize = { width: 210, height: 297, margin: 20 };

const { exportPdf, isExporting } = usePdfExport(iframeRef, {
  filename: 'my-document',
  pageSize,
});

<button onClick={exportPdf} disabled={isExporting}>
  {isExporting ? 'Exporting...' : 'Export PDF'}
</button>;
```

#### Example: Upload to Server

```tsx
const { exportPdf, isExporting, error } = usePdfExport(
  iframeRef,
  { filename: 'document', pageSize },
  async (blob, filename) => {
    const formData = new FormData();
    formData.append('file', blob, filename);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    const { url } = await response.json();
    console.log('Uploaded to:', url);
  },
);

{
  error && <p className="error">{error}</p>;
}
```

#### Example: Download Locally

```tsx
const { exportPdf } = usePdfExport(
  iframeRef,
  { filename: 'document', pageSize },
  (blob, filename) => {
    // Create download link
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  },
);
```

---

## Component Hierarchy

```
App
└── MarkdownToPdfApp
    ├── PageSizeControls
    ├── PrintButton
    ├── MarkdownEditor
    └── MarkdownPreview
```

## Page Breaks

Insert page breaks in your markdown using:

```markdown
---page---
```

Or use the form feed character (`\f`).
