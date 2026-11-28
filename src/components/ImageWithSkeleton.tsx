import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface ImageWithSkeletonProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  containerClassName?: string;
  skeletonClassName?: string;
}

export const ImageWithSkeleton: React.FC<ImageWithSkeletonProps> = ({ 
  src, 
  alt, 
  className, 
  containerClassName = '', 
  skeletonClassName = '',
  onError,
  ...props 
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => setIsLoaded(true);
  
  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setHasError(true);
    if (onError) onError(e);
  };

  return (
    <div 
      className={`image-with-skeleton-container ${containerClassName}`} 
      style={{ 
        position: 'relative', 
        width: '100%', 
        height: '100%', 
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      {/* Skeleton loader */}
      {!isLoaded && !hasError && (
        <motion.div
          className={`skeleton-loader ${skeletonClassName}`}
          initial={{ opacity: 0.5 }}
          animate={{ opacity: 1 }}
          transition={{ repeat: Infinity, duration: 1, repeatType: 'reverse' }}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: '#f1f5f9',
            borderRadius: 'inherit'
          }}
        />
      )}

      {/* Actual image */}
      <img
        src={src}
        alt={alt}
        className={className}
        width={props.width || 400}
        height={props.height || 300}
        loading={props.loading || 'lazy'}
        decoding={props.decoding || 'async'}
        onLoad={handleLoad}
        onError={handleError}
        style={{ 
          opacity: isLoaded ? 1 : 0, 
          transition: 'opacity 0.3s ease-in-out',
          maxWidth: '100%',
          maxHeight: '100%',
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          objectPosition: 'center',
          display: 'block',
          margin: 'auto',
          ...props.style
        }}
        {...props}
      />
    </div>
  );
};
