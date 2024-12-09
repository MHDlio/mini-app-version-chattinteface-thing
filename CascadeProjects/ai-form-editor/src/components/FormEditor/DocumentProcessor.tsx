/**
 * @keywords Document Upload, AI Processing, Form Generation, UI/UX
 * 
 * Component Features:
 * • Drag-and-drop file upload
 * • Multi-format support (PDF, images)
 * • Real-time processing feedback
 * • Document preview with pagination
 * • Accessibility-first design
 * 
 * Integration Points:
 * • AI Assistant for field suggestions
 * • Form generation from extracted data
 * • Privacy-aware data handling
 */

import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDropzone } from 'react-dropzone';
import { Document, Page, pdfjs } from 'react-pdf';
import { Upload, FileType, X, ChevronLeft, ChevronRight } from 'lucide-react';
import Tesseract from 'tesseract.js';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface DocumentProcessorProps {
  onProcessComplete: (result: any) => void;
  onError: (error: string) => void;
}

const DocumentProcessor: React.FC<DocumentProcessorProps> = ({
  onProcessComplete,
  onError,
}) => {
  const { t } = useTranslation();
  const [files, setFiles] = useState<File[]>([]);
  const [processing, setProcessing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) {
        setFiles([file]);
        setPreviewUrl(URL.createObjectURL(file));
        processDocument(file);
      }
    },
    [onProcessComplete]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
    },
    maxFiles: 1,
  });

  const processDocument = async (file: File) => {
    setProcessing(true);
    try {
      if (file.type.startsWith('image/')) {
        const result = await Tesseract.recognize(file, 'eng');
        onProcessComplete({
          text: result.data.text,
          confidence: result.data.confidence,
          type: 'image',
        });
      } else if (file.type === 'application/pdf') {
        // Process PDF using pdf.js
        const reader = new FileReader();
        reader.onload = async (e) => {
          try {
            const typedarray = new Uint8Array(e.target?.result as ArrayBuffer);
            const pdf = await pdfjs.getDocument(typedarray).promise;
            let fullText = '';
            
            for (let i = 1; i <= pdf.numPages; i++) {
              const page = await pdf.getPage(i);
              const textContent = await page.getTextContent();
              const pageText = textContent.items
                .map((item: any) => item.str)
                .join(' ');
              fullText += pageText + '\n';
            }

            onProcessComplete({
              text: fullText,
              type: 'pdf',
              pages: pdf.numPages,
            });
          } catch (error) {
            onError(t('errors.process'));
          }
        };
        reader.readAsArrayBuffer(file);
      }
    } catch (error) {
      onError(t('errors.process'));
    } finally {
      setProcessing(false);
    }
  };

  const removeFile = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setFiles([]);
    setPreviewUrl(null);
    setCurrentPage(1);
    setNumPages(0);
  };

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`dropzone ${isDragActive ? 'dropzone-active' : ''} ${
          files.length > 0 ? 'hidden' : ''
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center space-y-4">
          <Upload
            size={40}
            className={`${
              isDragActive ? 'text-primary' : 'text-gray-400'
            } transition-colors duration-200`}
          />
          <div className="text-center space-y-2">
            <p className="text-lg font-medium">
              {isDragActive
                ? t('documents.upload.drag')
                : t('documents.upload.title')}
            </p>
            <p className="text-sm text-muted-foreground">
              {t('documents.upload.or')}
            </p>
            <button className="btn btn-secondary">
              {t('documents.upload.browse')}
            </button>
          </div>
        </div>
      </div>

      {files.length > 0 && previewUrl && (
        <div className="document-preview">
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center space-x-2">
              <FileType size={20} />
              <span className="font-medium">{files[0].name}</span>
            </div>
            <button
              onClick={removeFile}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
            >
              <X size={20} />
            </button>
          </div>

          {files[0].type === 'application/pdf' ? (
            <div>
              <Document
                file={previewUrl}
                onLoadSuccess={onDocumentLoadSuccess}
                className="flex justify-center"
              >
                <Page
                  pageNumber={currentPage}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                  className="max-w-full"
                  scale={1.0}
                />
              </Document>
              {numPages > 1 && (
                <div className="flex items-center justify-center space-x-4 p-4 border-t">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage <= 1}
                    className="btn btn-ghost p-1"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <span className="text-sm">
                    {t('documents.preview.pageCount', {
                      current: currentPage,
                      total: numPages,
                    })}
                  </span>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(numPages, p + 1))}
                    disabled={currentPage >= numPages}
                    className="btn btn-ghost p-1"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              )}
            </div>
          ) : (
            <img
              src={previewUrl}
              alt={files[0].name}
              className="max-w-full h-auto"
            />
          )}
        </div>
      )}

      {processing && (
        <div className="flex items-center justify-center p-4 text-muted-foreground">
          <div className="animate-spin mr-2">⚪</div>
          {t('documents.upload.processing')}
        </div>
      )}
    </div>
  );
};

export default DocumentProcessor;
