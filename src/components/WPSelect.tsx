import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './WPSelect.css';

interface WPSelectProps {
  label: string;
  value: string;
  options: string[];
  onChange: (val: string) => void;
  zeroValue?: string;
  placeholder?: string;
}

export const WPSelect: React.FC<WPSelectProps> = ({ 
  label, 
  value, 
  options, 
  onChange, 
  zeroValue, 
  placeholder = 'Selecciona' 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="cl-wp-dropdown-container" ref={ref}>
      <div 
        className={`cl-wp-input-wrapper is-select ${isOpen ? 'is-open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <label>{label}</label>
        <div className="cl-wp-dropdown-value">{value || placeholder}</div>
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className="cl-wp-dropdown-menu"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.15 }}
          >
            <div className="cl-wp-dropdown-grid">
              {zeroValue !== undefined && (
                <div 
                    className={`cl-wp-dropdown-item zero-item ${value === zeroValue ? 'selected' : ''}`}
                    onClick={() => { onChange(zeroValue); setIsOpen(false); }}
                  >
                    0
                </div>
              )}
              {options && options.map((opt: string) => (
                <div 
                  key={opt} 
                  className={`cl-wp-dropdown-item ${value === opt ? 'selected' : ''}`}
                  onClick={() => { onChange(opt); setIsOpen(false); }}
                >
                  {opt}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
