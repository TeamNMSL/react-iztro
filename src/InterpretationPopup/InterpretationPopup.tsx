// src/InterpretationPopup/InterpretationPopup.tsx
import React from 'react';
import './InterpretationPopup.css';

interface InterpretationPopupProps {
  visible: boolean;
  title: string;
  content: string;
  onClose: () => void;
  position: { x: number; y: number };
}

export const InterpretationPopup: React.FC<InterpretationPopupProps> = ({
  visible,
  title,
  content,
  onClose,
  position
}) => {
  if (!visible) return null;
  content = content.replace(/\n/g, "<br>");
  
  return (
    <div className="interpretation-backdrop" onClick={onClose}>
      <div 
        className="interpretation-popup"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="interpretation-header">
          <h3>{title}</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <div className="interpretation-content">
           <div dangerouslySetInnerHTML={{ __html: content }} />
        </div>
      </div>
    </div>
  );
};