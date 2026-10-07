import React, { useEffect, useState, useRef } from 'react';
import { 
  FileText, 
  Download, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  ChevronLeft, 
  ChevronRight, 
  Loader2, 
  AlertCircle, 
  Maximize2, 
  Minimize2,
  X,
  BookOpen
} from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import mammoth from 'mammoth';

// Configure local bundled worker for PDF.js so it works inside sandboxed environments without external CDN blocks
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

export interface DocumentAttachment {
  id?: string;
  name: string;
  url: string;
  type?: string;
  size?: number;
}

interface DocumentViewerProps {
  attachment: DocumentAttachment;
  title?: string;
  notes?: string;
  onClose?: () => void;
  isModal?: boolean;
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({
  attachment,
  title,
  notes,
  onClose,
  isModal = false
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [docKind, setDocKind] = useState<'pdf' | 'image' | 'docx' | 'text' | 'unsupported'>('pdf');
  const [zoom, setZoom] = useState(1.2);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // PDF state
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [showAllPages, setShowAllPages] = useState(true);
  const pdfDocRef = useRef<any>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  // Text / DOCX state
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [textContent, setTextContent] = useState<string>('');
  const [imageSrc, setImageSrc] = useState<string>('');

  // Helper to convert data: or blob: URL to Uint8Array
  const getBytesFromUrl = async (url: string): Promise<{ bytes: Uint8Array; mime: string }> => {
    if (url.startsWith('data:')) {
      const commaIdx = url.indexOf(',');
      const header = commaIdx !== -1 ? url.slice(0, commaIdx) : '';
      const rawData = commaIdx !== -1 ? url.slice(commaIdx + 1).trim() : '';
      const mimeMatch = header.match(/data:([^;,]+)/i);
      const mime = mimeMatch && mimeMatch[1] ? mimeMatch[1] : 'application/octet-stream';
      const isBase64 = /;base64/i.test(header);

      if (isBase64) {
        const cleanBase64 = rawData.replace(/\s/g, '');
        const binaryStr = atob(cleanBase64);
        const len = binaryStr.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryStr.charCodeAt(i);
        }
        return { bytes, mime };
      } else {
        const decodedText = decodeURIComponent(rawData);
        const encoder = new TextEncoder();
        return { bytes: encoder.encode(decodedText), mime };
      }
    } else {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Could not load the attached file data.');
      }
      const blob = await response.blob();
      const arrayBuffer = await blob.arrayBuffer();
      return {
        bytes: new Uint8Array(arrayBuffer),
        mime: blob.type || 'application/octet-stream'
      };
    }
  };

  // Detect file kind from name, type, and header
  const detectKind = (att: DocumentAttachment, mime: string): 'pdf' | 'image' | 'docx' | 'text' | 'unsupported' => {
    const lowerName = (att.name || '').toLowerCase();
    const lowerType = (att.type || '').toLowerCase();
    const lowerMime = (mime || '').toLowerCase();

    if (
      lowerName.endsWith('.pdf') ||
      lowerType === 'pdf' ||
      lowerMime.includes('pdf')
    ) {
      return 'pdf';
    }
    if (
      lowerName.endsWith('.png') ||
      lowerName.endsWith('.jpg') ||
      lowerName.endsWith('.jpeg') ||
      lowerName.endsWith('.gif') ||
      lowerName.endsWith('.webp') ||
      lowerName.endsWith('.svg') ||
      lowerType === 'image' ||
      lowerMime.startsWith('image/')
    ) {
      return 'image';
    }
    if (
      lowerName.endsWith('.docx') ||
      lowerMime.includes('officedocument.wordprocessingml.document')
    ) {
      return 'docx';
    }
    if (
      lowerName.endsWith('.txt') ||
      lowerName.endsWith('.md') ||
      lowerName.endsWith('.csv') ||
      lowerName.endsWith('.json') ||
      lowerType === 'text' ||
      lowerMime.startsWith('text/') ||
      lowerMime.includes('json') ||
      lowerMime.includes('csv')
    ) {
      return 'text';
    }
    // Check magic bytes for PDF (%PDF-)
    return 'unsupported';
  };

  // Load document on mount or attachment change
  useEffect(() => {
    let isCancelled = false;

    const loadDocument = async () => {
      if (!attachment || !attachment.url) {
        setError('No document file URL found.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      setHtmlContent('');
      setTextContent('');
      setImageSrc('');
      pdfDocRef.current = null;

      try {
        const { bytes, mime } = await getBytesFromUrl(attachment.url);
        if (isCancelled) return;

        let kind = detectKind(attachment, mime);
        // Check PDF magic header '%PDF' if kind is unsupported
        if (kind === 'unsupported' && bytes.length > 4) {
          if (bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46) {
            kind = 'pdf';
          }
        }

        setDocKind(kind);

        if (kind === 'pdf') {
          const pdfBytesCopy = new Uint8Array(bytes);
          const loadingTask = pdfjsLib.getDocument({
            data: pdfBytesCopy,
            isEvalSupported: false,
            useSystemFonts: true
          });
          const pdfDoc = await loadingTask.promise;
          if (isCancelled) return;
          pdfDocRef.current = pdfDoc;
          setNumPages(pdfDoc.numPages);
          setCurrentPage(1);
          setLoading(false);
        } else if (kind === 'image') {
          if (attachment.url.startsWith('data:')) {
            setImageSrc(attachment.url);
          } else {
            const blob = new Blob([bytes], { type: mime.startsWith('image/') ? mime : 'image/png' });
            setImageSrc(URL.createObjectURL(blob));
          }
          setLoading(false);
        } else if (kind === 'docx') {
          const result = await mammoth.convertToHtml({ arrayBuffer: bytes.buffer });
          if (isCancelled) return;
          setHtmlContent(result.value || '<p>Document is empty.</p>');
          setLoading(false);
        } else if (kind === 'text') {
          const decoder = new TextDecoder('utf-8');
          setTextContent(decoder.decode(bytes));
          setLoading(false);
        } else {
          // Try decoding as UTF-8 text if reasonably small and readable
          const decoder = new TextDecoder('utf-8', { fatal: false });
          const decoded = decoder.decode(bytes.slice(0, 50000));
          const nonPrintable = decoded.split('').filter(c => c.charCodeAt(0) < 9 || (c.charCodeAt(0) > 13 && c.charCodeAt(0) < 32)).length;
          if (decoded.length > 0 && nonPrintable / decoded.length < 0.05) {
            setDocKind('text');
            setTextContent(decoded);
          } else {
            setDocKind('unsupported');
          }
          setLoading(false);
        }
      } catch (err: any) {
        if (!isCancelled) {
          console.error('Error rendering document inside app:', err);
          setError('This file attachment was from an older session or could not be decoded directly. You can view your document notes below or re-attach the file.');
          setLoading(false);
        }
      }
    };

    loadDocument();

    return () => {
      isCancelled = true;
    };
  }, [attachment]);

  // Render PDF pages onto canvases whenever pdfDoc, zoom, currentPage, or showAllPages changes
  useEffect(() => {
    let isCancelled = false;
    const renderPdfPages = async () => {
      const pdfDoc = pdfDocRef.current;
      const container = canvasContainerRef.current;
      if (!pdfDoc || !container || docKind !== 'pdf') return;

      container.innerHTML = '';

      const pagesToRender = showAllPages
        ? Array.from({ length: pdfDoc.numPages }, (_, i) => i + 1)
        : [currentPage];

      for (const pageNum of pagesToRender) {
        if (isCancelled) return;
        try {
          const page = await pdfDoc.getPage(pageNum);
          if (isCancelled) return;

          const viewport = page.getViewport({ scale: zoom });
          const wrapper = document.createElement('div');
          wrapper.className = 'flex flex-col items-center mb-6 last:mb-0 max-w-full';

          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          const outputScale = window.devicePixelRatio || 1;

          canvas.width = Math.floor(viewport.width * outputScale);
          canvas.height = Math.floor(viewport.height * outputScale);
          canvas.style.width = `${Math.floor(viewport.width)}px`;
          canvas.style.maxWidth = '100%';
          canvas.style.height = 'auto';
          canvas.className = 'rounded-xl shadow-lg bg-white border border-stone-200';

          const pageLabel = document.createElement('span');
          pageLabel.className = 'text-[11px] font-bold text-stone-500 dark:text-orange-200/70 mt-2';
          pageLabel.textContent = `Page ${pageNum} of ${pdfDoc.numPages}`;

          wrapper.appendChild(canvas);
          wrapper.appendChild(pageLabel);
          container.appendChild(wrapper);

          if (context) {
            const transform = outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : undefined;
            await page.render({
              canvasContext: context,
              transform,
              viewport
            }).promise;
          }
        } catch (e) {
          console.error(`Error rendering page ${pageNum}:`, e);
        }
      }
    };

    if (!loading && docKind === 'pdf') {
      renderPdfPages();
    }

    return () => {
      isCancelled = true;
    };
  }, [loading, docKind, zoom, currentPage, showAllPages, numPages]);

  // Safe download without navigating iframe or opening blocked popup
  const handleSafeDownload = async () => {
    try {
      const { bytes, mime } = await getBytesFromUrl(attachment.url);
      const blob = new Blob([bytes], { type: mime });
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = attachment.name || 'document';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 5000);
    } catch {
      const a = document.createElement('a');
      a.href = attachment.url;
      a.download = attachment.name || 'document';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const viewerContent = (
    <div className={`bg-white dark:bg-[#1a1614] rounded-2xl border border-stone-200 dark:border-[#3f332c] overflow-hidden shadow-xl flex flex-col ${
      isFullscreen ? 'fixed inset-3 z-[120] h-[calc(100vh-24px)]' : 'w-full'
    }`}>
      {/* Viewer Top Toolbar */}
      <div className="px-4 py-3 bg-stone-100 dark:bg-[#2a221f] border-b border-stone-200 dark:border-[#3f332c] flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-2.5 min-w-0">
          <div className="p-2 bg-orange-500/15 text-orange-600 dark:text-orange-400 rounded-xl border border-orange-500/20 shrink-0">
            <FileText size={16} />
          </div>
          <div className="min-w-0">
            <h4 className="font-bold text-xs sm:text-sm text-stone-900 dark:text-[#fef3c7] truncate">
              {attachment.name || title || 'Attached Document'}
            </h4>
            <p className="text-[10px] text-stone-600 dark:text-orange-200/70 font-medium">
              In-App Safe Document Reader {numPages > 0 ? `• ${numPages} Page${numPages > 1 ? 's' : ''}` : ''}
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center flex-wrap gap-1.5">
          {(docKind === 'pdf' || docKind === 'image') && (
            <div className="flex items-center space-x-1 bg-white dark:bg-[#1a1614] px-2 py-1 rounded-xl border border-stone-200 dark:border-[#3f332c]">
              <button
                type="button"
                onClick={() => setZoom(z => Math.max(0.6, +(z - 0.2).toFixed(1)))}
                className="p-1 text-stone-700 dark:text-orange-200 hover:text-orange-500 cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut size={14} />
              </button>
              <span className="text-[10px] font-bold text-stone-800 dark:text-orange-100 min-w-[38px] text-center">
                {Math.round(zoom * 100)}%
              </span>
              <button
                type="button"
                onClick={() => setZoom(z => Math.min(2.6, +(z + 0.2).toFixed(1)))}
                className="p-1 text-stone-700 dark:text-orange-200 hover:text-orange-500 cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn size={14} />
              </button>
              <button
                type="button"
                onClick={() => setZoom(1.2)}
                className="p-1 text-stone-700 dark:text-orange-200 hover:text-orange-500 cursor-pointer"
                title="Reset Zoom"
              >
                <RotateCcw size={13} />
              </button>
            </div>
          )}

          {docKind === 'pdf' && numPages > 1 && (
            <div className="flex items-center space-x-1 bg-white dark:bg-[#1a1614] px-2 py-1 rounded-xl border border-stone-200 dark:border-[#3f332c]">
              <button
                type="button"
                onClick={() => setShowAllPages(prev => !prev)}
                className="px-2 py-0.5 text-[10px] font-bold text-orange-600 dark:text-orange-400 hover:underline cursor-pointer"
              >
                {showAllPages ? 'Single Page' : 'All Pages'}
              </button>
              {!showAllPages && (
                <>
                  <button
                    type="button"
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    className="p-1 disabled:opacity-30 text-stone-700 dark:text-orange-200 cursor-pointer"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <span className="text-[10px] font-bold text-stone-800 dark:text-orange-100">
                    {currentPage}/{numPages}
                  </span>
                  <button
                    type="button"
                    disabled={currentPage >= numPages}
                    onClick={() => setCurrentPage(p => Math.min(numPages, p + 1))}
                    className="p-1 disabled:opacity-30 text-stone-700 dark:text-orange-200 cursor-pointer"
                  >
                    <ChevronRight size={14} />
                  </button>
                </>
              )}
            </div>
          )}

          <button
            type="button"
            onClick={handleSafeDownload}
            className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-sm transition-all cursor-pointer active:scale-95"
            title="Download file to your device"
          >
            <Download size={13} />
            <span>Download</span>
          </button>

          <button
            type="button"
            onClick={() => setIsFullscreen(f => !f)}
            className="p-1.5 bg-white dark:bg-[#1a1614] text-stone-700 dark:text-orange-200 hover:text-orange-500 rounded-xl border border-stone-200 dark:border-[#3f332c] cursor-pointer"
            title={isFullscreen ? 'Exit Fullscreen Reader' : 'Expand Fullscreen Reader'}
          >
            {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
          </button>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded-xl border border-rose-500/20 transition-all cursor-pointer"
              title="Close Reader"
            >
              <X size={15} />
            </button>
          )}
        </div>
      </div>

      {/* Viewer Body */}
      <div className={`p-4 sm:p-6 overflow-y-auto bg-stone-50 dark:bg-[#14110f] ${
        isFullscreen ? 'flex-1' : 'max-h-[680px] min-h-[320px]'
      }`}>
        {loading && (
          <div className="flex flex-col items-center justify-center py-16 space-y-3">
            <Loader2 size={32} className="animate-spin text-orange-500" />
            <p className="text-xs font-bold text-stone-700 dark:text-orange-200">
              Rendering document directly in app...
            </p>
          </div>
        )}

        {!loading && error && (
          <div className="p-6 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-center space-y-3 max-w-lg mx-auto my-6">
            <AlertCircle size={28} className="mx-auto text-amber-500" />
            <p className="text-xs font-bold text-stone-800 dark:text-orange-100 leading-relaxed">
              {error}
            </p>
            {notes && (
              <div className="p-4 bg-white dark:bg-[#1a1614] rounded-xl border border-stone-200 dark:border-[#3f332c] text-left mt-3">
                <p className="text-[10px] font-black uppercase text-orange-500 mb-1">Saved Document Notes:</p>
                <p className="text-xs text-stone-800 dark:text-orange-100 whitespace-pre-wrap">{notes}</p>
              </div>
            )}
          </div>
        )}

        {!loading && !error && docKind === 'pdf' && (
          <div ref={canvasContainerRef} className="flex flex-col items-center w-full overflow-x-auto py-2" />
        )}

        {!loading && !error && docKind === 'image' && imageSrc && (
          <div className="flex justify-center items-center py-2 overflow-auto">
            <img
              src={imageSrc}
              alt={attachment.name}
              style={{ width: `${Math.round(zoom * 60)}%`, maxWidth: '100%' }}
              className="rounded-xl shadow-lg border border-stone-200 dark:border-[#3f332c] object-contain"
            />
          </div>
        )}

        {!loading && !error && docKind === 'docx' && (
          <div
            className="max-w-3xl mx-auto p-6 sm:p-8 bg-white text-stone-900 rounded-2xl shadow-md border border-stone-200 prose prose-sm max-w-none leading-relaxed space-y-3"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
        )}

        {!loading && !error && docKind === 'text' && (
          <div className="max-w-3xl mx-auto p-6 bg-white dark:bg-[#1a1614] text-stone-900 dark:text-orange-100 rounded-2xl shadow-md border border-stone-200 dark:border-[#3f332c] whitespace-pre-wrap font-mono text-xs sm:text-sm leading-relaxed">
            {textContent}
          </div>
        )}

        {!loading && !error && docKind === 'unsupported' && (
          <div className="text-center py-12 space-y-4 max-w-md mx-auto">
            <BookOpen size={36} className="mx-auto text-orange-500" />
            <div className="space-y-1">
              <h4 className="font-bold text-sm text-stone-900 dark:text-[#fef3c7]">{attachment.name}</h4>
              <p className="text-xs text-stone-600 dark:text-orange-200/70">
                This file format is ready for direct download or note review below.
              </p>
            </div>
            <button
              type="button"
              onClick={handleSafeDownload}
              className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold inline-flex items-center space-x-2 shadow-md cursor-pointer"
            >
              <Download size={14} />
              <span>Download {attachment.name}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );

  if (isModal) {
    return (
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[120] flex items-center justify-center p-3 sm:p-6"
        onClick={onClose}
      >
        <div
          className="w-full max-w-5xl max-h-[92vh] flex flex-col"
          onClick={e => e.stopPropagation()}
        >
          {viewerContent}
        </div>
      </div>
    );
  }

  return viewerContent;
};
