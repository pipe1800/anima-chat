import React, { useEffect, useState } from 'react';
import { useTutorial } from '@/contexts/TutorialContext';
import { TutorialTooltip } from './TutorialTooltip';
import { cn } from '@/lib/utils';

export const TutorialOverlay = () => {
  const { isActive, highlightedElement, currentStepData, disableInteractions } = useTutorial();
  const [highlightedRect, setHighlightedRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (!isActive || !highlightedElement) {
      setHighlightedRect(null);
      return;
    }

    const updateHighlight = () => {
      const element = document.querySelector(highlightedElement);
      if (element) {
        const rect = element.getBoundingClientRect();
        setHighlightedRect(rect);
      }
    };

    updateHighlight();
    const resizeObserver = new ResizeObserver(updateHighlight);
    const element = document.querySelector(highlightedElement);
    
    if (element) {
      resizeObserver.observe(element);
    }

    window.addEventListener('resize', updateHighlight);
    window.addEventListener('scroll', updateHighlight);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateHighlight);
      window.removeEventListener('scroll', updateHighlight);
    };
  }, [isActive, highlightedElement]);

  if (!isActive || !highlightedRect || !currentStepData) {
    return null;
  }

  const clipPath = `polygon(
    0% 0%, 
    0% 100%, 
    ${highlightedRect.left}px 100%, 
    ${highlightedRect.left}px ${highlightedRect.top}px, 
    ${highlightedRect.right}px ${highlightedRect.top}px, 
    ${highlightedRect.right}px ${highlightedRect.bottom}px, 
    ${highlightedRect.left}px ${highlightedRect.bottom}px, 
    ${highlightedRect.left}px 100%, 
    100% 100%, 
    100% 0%
  )`;

  return (
    <>
      {/* Dark overlay with cutout */}
      <div
        className={cn(
          "fixed inset-0 bg-black/70 pointer-events-none z-[9998]",
          "transition-opacity duration-300"
        )}
        style={{
          clipPath,
        }}
      />
      
      {/* Highlight ring */}
      <div
        className="fixed pointer-events-none z-[9999] rounded-lg"
        style={{
          left: highlightedRect.left - 4,
          top: highlightedRect.top - 4,
          width: highlightedRect.width + 8,
          height: highlightedRect.height + 8,
          boxShadow: '0 0 0 3px #FF7A00, 0 0 20px rgba(255, 122, 0, 0.5)',
          animation: 'pulse 2s infinite',
        }}
      />

      {/* Tooltip */}
      <TutorialTooltip
        targetRect={highlightedRect}
        step={currentStepData}
      />

      {/* Interaction blocker */}
      {disableInteractions && (
        <div className="fixed inset-0 z-[9997] pointer-events-auto cursor-not-allowed" />
      )}
    </>
  );
};