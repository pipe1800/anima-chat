
import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';
import { RotateCw, ZoomIn, ZoomOut, Move } from 'lucide-react';

interface ImageCropperProps {
  imageUrl: string;
  isOpen: boolean;
  onClose: () => void;
  onCrop: (croppedImageUrl: string) => void;
  aspectRatio?: number;
}

export const ImageCropper = ({ 
  imageUrl, 
  isOpen, 
  onClose, 
  onCrop, 
  aspectRatio = 1 
}: ImageCropperProps) => {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const handleCrop = async () => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    if (!canvas || !image) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = 200; // Output size
    canvas.width = size;
    canvas.height = size;

    ctx.save();
    ctx.translate(size / 2, size / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(zoom, zoom);
    ctx.translate(-size / 2, -size / 2);
    
    ctx.drawImage(
      image,
      position.x,
      position.y,
      image.naturalWidth,
      image.naturalHeight
    );
    
    ctx.restore();

    const croppedImageUrl = canvas.toDataURL('image/jpeg', 0.9);
    onCrop(croppedImageUrl);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#1a1a2e] border-gray-700 max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-white">Crop Avatar Image</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Preview Area */}
          <div className="relative bg-gray-800 rounded-lg overflow-hidden" style={{ height: '400px' }}>
            <div 
              className="absolute inset-0 flex items-center justify-center cursor-move"
              onMouseDown={handleMouseDown}
            >
              <img
                ref={imageRef}
                src={imageUrl}
                alt="Crop preview"
                className="max-w-none"
                style={{
                  transform: `translate(${position.x}px, ${position.y}px) scale(${zoom}) rotate(${rotation}deg)`,
                  transformOrigin: 'center center'
                }}
                draggable={false}
              />
            </div>
            
            {/* Crop overlay */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-0 bg-black/50"></div>
              <div 
                className="absolute bg-transparent border-2 border-[#FF7A00] rounded-full"
                style={{
                  width: '200px',
                  height: '200px',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)'
                }}
              ></div>
            </div>
          </div>

          {/* Controls */}
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <ZoomOut className="w-4 h-4 text-gray-400" />
              <Slider
                value={[zoom]}
                onValueChange={(value) => setZoom(value[0])}
                min={0.5}
                max={3}
                step={0.1}
                className="flex-1"
              />
              <ZoomIn className="w-4 h-4 text-gray-400" />
            </div>
            
            <div className="flex items-center space-x-4">
              <RotateCw className="w-4 h-4 text-gray-400" />
              <Slider
                value={[rotation]}
                onValueChange={(value) => setRotation(value[0])}
                min={-180}
                max={180}
                step={15}
                className="flex-1"
              />
            </div>

            <div className="flex justify-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setZoom(1);
                  setRotation(0);
                  setPosition({ x: 0, y: 0 });
                }}
                className="border-gray-600 text-gray-300"
              >
                Reset
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="border-gray-600 text-gray-300">
            Cancel
          </Button>
          <Button onClick={handleCrop} className="bg-[#FF7A00] hover:bg-[#FF7A00]/80">
            Apply Crop
          </Button>
        </DialogFooter>

        <canvas ref={canvasRef} className="hidden" />
      </DialogContent>
    </Dialog>
  );
};
