import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ScanText, Upload, AlertCircle } from 'lucide-react';
import { ScanPreview } from './ScanPreview';
import { ScanControls } from './ScanControls';
import { useDocumentScanner } from '@/hooks/useDocumentScanner';
import type { ScanResult, ScanError } from '@/types/scanner';

interface DocumentScannerProps {
  onScan: (result: ScanResult) => void;
  onError: (error: ScanError) => void;
  supportedFormats?: string[];
  maxFileSize?: number;
  multipleFiles?: boolean;
}

export const DocumentScanner: React.FC<DocumentScannerProps> = ({
  onScan,
  onError,
  supportedFormats = ['.pdf', '.jpg', '.png'],
  maxFileSize = 10 * 1024 * 1024, // 10MB
  multipleFiles = false,
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const { scan, processing, error } = useDocumentScanner();

  const handleFileDrop = async (acceptedFiles: File[]) => {
    const validFiles = acceptedFiles.filter(file => 
      supportedFormats.some(format => file.name.toLowerCase().endsWith(format)) &&
      file.size <= maxFileSize
    );

    if (validFiles.length !== acceptedFiles.length) {
      onError({ 
        type: 'invalid_files',
        message: 'Some files were rejected due to format or size restrictions'
      });
    }

    setFiles(validFiles);
  };

  const handleScan = async () => {
    try {
      const results = await Promise.all(files.map(file => scan(file)));
      results.forEach(onScan);
    } catch (err) {
      onError(err as ScanError);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="bg-card rounded-lg p-6">
        <div className="flex items-center space-x-4 mb-4">
          <div className="bg-primary/10 p-3 rounded-full">
            <ScanText className="w-6 h-6 text-primary" />
          </div>
          <h2 className="text-xl font-semibold">Document Scanner</h2>
        </div>

        <ScanControls
          onDrop={handleFileDrop}
          onScan={handleScan}
          processing={processing}
          supportedFormats={supportedFormats}
          maxFileSize={maxFileSize}
          multiple={multipleFiles}
        />

        {error && (
          <div className="mt-4 p-4 bg-destructive/10 rounded-lg flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-destructive" />
            <span className="text-sm text-destructive">{error.message}</span>
          </div>
        )}

        {files.length > 0 && (
          <div className="mt-6">
            <ScanPreview files={files} />
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default DocumentScanner;
