
import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
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
  const [imageLoaded, setImageLoaded] = useState(false);
  const [minZoom, setMinZoom] = useState(0.1);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const cropSize = 200; // The diameter of the crop circle

  const handleImageLoad = () => {
    const image = imageRef.current;
    if (!image) return;

    // Calculate minimum zoom to ensure image always covers the crop circle
    const imageAspectRatio = image.naturalWidth / image.naturalHeight;
    const containerSize = 400; // Preview container size
    
    // Calculate what zoom level ensures the image can always cover the crop circle
    const minZoomX = cropSize / Math.min(image.naturalWidth, containerSize);
    const minZoomY = cropSize / Math.min(image.naturalHeight, containerSize);
    const calculatedMinZoom = Math.max(minZoomX, minZoomY, 0.3);
    
    setMinZoom(calculatedMinZoom);
    setZoom(Math.max(1, calculatedMinZoom));
    setImageLoaded(true);
  };

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

    canvas.width = cropSize;
    canvas.height = cropSize;

    // Create circular clipping path
    ctx.save();
    ctx.beginPath();
    ctx.arc(cropSize / 2, cropSize / 2, cropSize / 2, 0, Math.PI * 2);
    ctx.clip();

    // Calculate the center of the crop area in the preview container
    const containerCenter = { x: 200, y: 200 }; // 400px container / 2
    
    // Apply transformations
    ctx.translate(cropSize / 2, cropSize / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(zoom, zoom);
    
    // Draw the image centered, accounting for position offset
    const drawX = -image.naturalWidth / 2 + (position.x - containerCenter.x) / zoom;
    const drawY = -image.naturalHeight / 2 + (position.y - containerCenter.y) / zoom;
    
    ctx.drawImage(image, drawX, drawY, image.naturalWidth, image.naturalHeight);
    
    ctx.restore();

    const croppedImageUrl = canvas.toDataURL('image/jpeg', 0.9);
    onCrop(croppedImageUrl);
  };

  const handleClose = () => {
    // Reset all states when closing
    setZoom(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
    setImageLoaded(false);
    setMinZoom(0.1);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-[#1a1a2e] border-gray-700 max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-white">Crop Avatar Image</DialogTitle>
          <DialogDescription className="text-gray-400">
            Adjust the image position, zoom, and rotation to create your perfect avatar.
          </DialogDescription>
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
                onLoad={handleImageLoad}
                draggable={false}
              />
            </div>
            
            {/* Crop overlay */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-0 bg-black/50"></div>
              <div 
                className="absolute bg-transparent border-2 border-[#FF7A00] rounded-full"
                style={{
                  width: `${cropSize}px`,
                  height: `${cropSize}px`,
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)'
                }}
              ></div>
            </div>
          </div>

          {/* Controls */}
          {imageLoaded && (
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <ZoomOut className="w-4 h-4 text-gray-400" />
                <Slider
                  value={[zoom]}
                  onValueChange={(value) => setZoom(value[0])}
                  min={minZoom}
                  max={2.5}
                  step={0.05}
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
                    setZoom(Math.max(1, minZoom));
                    setRotation(0);
                    setPosition({ x: 0, y: 0 });
                  }}
                  className="border-gray-600 text-gray-300"
                >
                  Reset
                </Button>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} className="border-gray-600 text-gray-300">
            Cancel
          </Button>
          <Button 
            onClick={handleCrop} 
            className="bg-[#FF7A00] hover:bg-[#FF7A00]/80"
            disabled={!imageLoaded}
          >
            Apply Crop
          </Button>
        </DialogFooter>

        <canvas ref={canvasRef} className="hidden" />
      </DialogContent>
    </Dialog>
  );
};
