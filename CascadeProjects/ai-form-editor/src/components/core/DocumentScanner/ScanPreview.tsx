import React from 'react';
import { motion } from 'framer-motion';
import { File, X } from 'lucide-react';

interface ScanPreviewProps {
  files: File[];
  onRemove?: (file: File) => void;
}

export const ScanPreview: React.FC<ScanPreviewProps> = ({
  files,
  onRemove
}) => {
  const previewFile = (file: File) => {
    if (file.type.startsWith('image/')) {
      return URL.createObjectURL(file);
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {files.map((file, index) => (
        <motion.div
          key={`${file.name}-${index}`}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative group"
        >
          <div className="bg-muted rounded-lg p-4 h-full">
            {previewFile(file) ? (
              <img
                src={previewFile(file)}
                alt={file.name}
                className="w-full h-32 object-cover rounded-md"
              />
            ) : (
              <div className="w-full h-32 flex items-center justify-center bg-muted-foreground/10 rounded-md">
                <File className="w-8 h-8 text-muted-foreground" />
              </div>
            )}
            
            <div className="mt-2">
              <p className="text-sm font-medium truncate">{file.name}</p>
              <p className="text-xs text-muted-foreground">
                {(file.size / 1024).toFixed(1)} KB
              </p>
            </div>

            {onRemove && (
              <button
                onClick={() => onRemove(file)}
                className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default ScanPreview;
