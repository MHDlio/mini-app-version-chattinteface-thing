import React from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Loader } from 'lucide-react';
import { motion } from 'framer-motion';

interface ScanControlsProps {
  onDrop: (files: File[]) => void;
  onScan: () => void;
  processing: boolean;
  supportedFormats: string[];
  maxFileSize: number;
  multiple: boolean;
}

export const ScanControls: React.FC<ScanControlsProps> = ({
  onDrop,
  onScan,
  processing,
  supportedFormats,
  maxFileSize,
  multiple
}) => {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: supportedFormats.reduce((acc, format) => ({
      ...acc,
      [format]: []
    }), {}),
    maxSize: maxFileSize,
    multiple
  });

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8
          transition-colors duration-200 ease-in-out
          ${isDragActive 
            ? 'border-primary bg-primary/5' 
            : 'border-muted-foreground/20 hover:border-primary/50'
          }
        `}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center text-center">
          <Upload className="w-10 h-10 text-muted-foreground mb-4" />
          <p className="text-lg font-medium">
            {isDragActive
              ? "Drop the files here..."
              : "Drag & drop files here, or click to select"
            }
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Supported formats: {supportedFormats.join(', ')}
          </p>
          <p className="text-sm text-muted-foreground">
            Max file size: {(maxFileSize / (1024 * 1024)).toFixed(0)}MB
          </p>
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onScan}
        disabled={processing}
        className={`
          w-full py-3 px-4 rounded-lg
          flex items-center justify-center space-x-2
          font-medium transition-colors
          ${processing
            ? 'bg-primary/50 cursor-not-allowed'
            : 'bg-primary hover:bg-primary/90'
          }
          text-primary-foreground
        `}
      >
        {processing ? (
          <>
            <Loader className="w-5 h-5 animate-spin" />
            <span>Processing...</span>
          </>
        ) : (
          <>
            <Upload className="w-5 h-5" />
            <span>Start Scan</span>
          </>
        )}
      </motion.button>
    </div>
  );
};

export default ScanControls;
