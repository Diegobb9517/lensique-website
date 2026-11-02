import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown } from 'lucide-react';

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: { label: string; value: string }[];
  placeholder?: string;
  className?: string;
  triggerLabel?: string;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({ 
  value, 
  onChange, 
  options, 
  placeholder, 
  className = '',
  triggerLabel 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

  const updateCoords = () => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const dropdownWidth = 260;
    let left = rect.left;
    if (typeof window !== 'undefined' && left + dropdownWidth > window.innerWidth - 12) {
      left = Math.max(12, window.innerWidth - dropdownWidth - 12);
    }
    setCoords({
      top: rect.bottom + 6,
      left: Math.max(12, left)
    });
  };

  const toggleOpen = () => {
    if (!isOpen) {
      updateCoords();
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    const handleScrollOrResize = () => {
      updateCoords();
    };

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        containerRef.current && !containerRef.current.contains(target) &&
        dropdownRef.current && !dropdownRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const selectedOption = options.find(o => o.value === value);
  const displayText = triggerLabel || (selectedOption ? selectedOption.label : placeholder);

  return (
    <div className={`custom-select-container ${className}`} ref={containerRef}>
      <button 
        type="button" 
        className="custom-select-trigger brand-select" 
        onClick={toggleOpen}
        style={{ backgroundImage: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap' }}
      >
        <span>{displayText}</span>
        <ChevronDown size={14} style={{ transition: 'transform 0.2s', transform: isOpen ? 'rotate(180deg)' : 'rotate(0)' }} />
      </button>
      
      {isOpen && typeof document !== 'undefined' && createPortal(
        <div 
          className="custom-select-dropdown" 
          ref={dropdownRef}
          style={{
            position: 'fixed',
            top: `${coords.top}px`,
            left: `${coords.left}px`,
            zIndex: 9999,
            margin: 0
          }}
        >
          {options.map((opt) => (
            <div
              key={opt.value}
              className={`custom-select-option ${value === opt.value ? 'selected' : ''}`}
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
            >
              {opt.label}
            </div>
          ))}
        </div>,
        document.body
      )}
    </div>
  );
};
