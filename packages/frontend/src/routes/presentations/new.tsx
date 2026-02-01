import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router';
import { useState, useRef } from 'react';
import {
  MarkdownEditor,
  MarkdownPreview,
  PageSizeControls,
  usePdfExport,
} from '@cosmoslide/editor';
import type { PageSize } from '@cosmoslide/editor';
import { uploadApi } from '@/lib/api';
import UploadDialog from '@/components/UploadDialog';
import AppLayout from '@/components/AppLayout';

const DEFAULT_PAGE_SIZE: PageSize = {
  width: 254,
  height: 143,
  margin: 10,
};

const INITIAL_MARKDOWN = `# New Presentation

Start typing your content here...

---page---

# Second Slide

Add more content...
`;

export const Route = createFileRoute('/presentations/new')({
  beforeLoad: () => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (!token) {
        throw redirect({ to: '/auth/signin' });
      }
    }
  },
  component: EditorPage,
});

function EditorPage() {
  const navigate = useNavigate();
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const [markdown, setMarkdown] = useState(INITIAL_MARKDOWN);
  const [pageSize, setPageSize] = useState<PageSize>(DEFAULT_PAGE_SIZE);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    exportPdf,
    isExporting,
    error: exportError,
  } = usePdfExport(iframeRef, { filename: 'presentation', pageSize });

  const handleDownload = async () => {
    const blob = await exportPdf();
    if (blob) {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'presentation.pdf';
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleUpload = async (title: string, comment: string) => {
    setIsUploading(true);
    setError(null);

    try {
      const blob = await exportPdf();
      if (!blob) {
        throw new Error('Failed to generate PDF');
      }

      // Combine title and comment
      const finalTitle = comment ? `${title} - ${comment}` : title;

      const file = new File([blob], `${title}.pdf`, {
        type: 'application/pdf',
      });
      const result = await uploadApi.uploadPresentation(file, finalTitle);

      setShowUploadDialog(false);
      navigate({ to: `/presentations/${result.id}` });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <AppLayout>
      <div className="h-[calc(100vh-4rem)] lg:h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
        {/* Header with controls */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between gap-4 flex-wrap">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
            Create Slide
          </h1>

          <div className="flex items-center gap-4 flex-wrap">
            <PageSizeControls pageSize={pageSize} onChange={setPageSize} />

            <div className="flex gap-2">
              <button
                onClick={handleDownload}
                disabled={isExporting}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isExporting ? 'Exporting...' : 'Download PDF'}
              </button>
              <button
                onClick={() => setShowUploadDialog(true)}
                disabled={isExporting}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Publish
              </button>
            </div>
          </div>
        </header>

        {/* Error display */}
        {(error || exportError) && (
          <div className="bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800 px-4 py-2">
            <p className="text-sm text-red-800 dark:text-red-200">
              {error || exportError}
            </p>
          </div>
        )}

        {/* Editor panels */}
        <main className="flex flex-1 overflow-hidden">
          <div className="flex-1 flex flex-col border-r border-gray-200 dark:border-gray-700">
            <div className="px-4 py-2 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300">
              MARKDOWN
            </div>
            <div className="flex-1 overflow-hidden">
              <MarkdownEditor value={markdown} onChange={setMarkdown} />
            </div>
          </div>
          <div className="flex-1 flex flex-col">
            <div className="px-4 py-2 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300">
              PREVIEW
            </div>
            <div className="flex-1 overflow-hidden p-4 bg-gray-200 dark:bg-gray-800">
              <MarkdownPreview
                ref={iframeRef}
                markdown={markdown}
                pageSize={pageSize}
              />
            </div>
          </div>
        </main>

        {/* Footer with syntax help */}
        <footer className="px-4 py-2 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 text-center text-sm text-gray-600 dark:text-gray-400">
          Use{' '}
          <code className="bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded text-xs">
            ---page---
          </code>{' '}
          to create page breaks
        </footer>

        <UploadDialog
          isOpen={showUploadDialog}
          onClose={() => setShowUploadDialog(false)}
          onConfirm={handleUpload}
          isUploading={isUploading}
          defaultTitle="My Presentation"
        />
      </div>
    </AppLayout>
  );
}
