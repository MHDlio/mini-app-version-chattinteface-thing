import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ZoomIn, ZoomOut, RotateCw, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Highlight {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color?: string;
}

interface DocumentPreviewProps {
  url: string;
  highlights?: Highlight[];
  onHighlightClick?: (highlight: Highlight) => void;
  language?: 'en' | 'ar';
  rtl?: boolean;
}

export const DocumentPreview: React.FC<DocumentPreviewProps> = ({
  url,
  highlights = [],
  onHighlightClick,
  language = 'en',
  rtl = false,
}) => {
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);

  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.1, 2));
  const handleZoomOut = () => setScale(prev => Math.max(prev - 0.1, 0.5));
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);

  return (
    <div className={`space-y-4 ${rtl ? 'rtl' : 'ltr'}`}>
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomOut}
            title={language === 'en' ? 'Zoom Out' : 'تصغير'}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomIn}
            title={language === 'en' ? 'Zoom In' : 'تكبير'}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRotate}
            title={language === 'en' ? 'Rotate' : 'تدوير'}
          >
            <RotateCw className="h-4 w-4" />
          </Button>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.open(url, '_blank')}
          title={language === 'en' ? 'Download' : 'تحميل'}
        >
          <Download className="h-4 w-4" />
        </Button>
      </div>

      {/* Preview */}
      <div className="relative overflow-hidden rounded-lg border bg-background">
        <motion.div
          animate={{ scale, rotate: rotation }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="relative"
          style={{ transformOrigin: 'center center' }}
        >
          <img
            src={url}
            alt="Document preview"
            className="max-w-full h-auto"
          />

          {/* Highlights */}
          {highlights.map((highlight) => (
            <motion.div
              key={highlight.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              whileHover={{ opacity: 0.8 }}
              className="absolute cursor-pointer"
              style={{
                left: `${highlight.x}%`,
                top: `${highlight.y}%`,
                width: `${highlight.width}%`,
                height: `${highlight.height}%`,
                backgroundColor: highlight.color || 'rgba(59, 130, 246, 0.5)',
                border: '2px solid rgba(59, 130, 246, 0.8)'
              }}
              onClick={() => onHighlightClick?.(highlight)}
            />
          ))}
        </motion.div>
      </div>

      {/* Scale indicator */}
      <div className="text-sm text-muted-foreground text-center">
        {Math.round(scale * 100)}%
      </div>
    </div>
  );
};

export default DocumentPreview;
