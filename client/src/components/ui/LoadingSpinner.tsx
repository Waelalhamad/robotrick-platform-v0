import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * A customizable loading spinner component
 * 
 * @component
 * @param {string} [size='md'] - The size of the spinner (sm, md, lg)
 * @param {string} [className] - Additional CSS classes to apply
 * @returns {JSX.Element} A loading spinner element
 */
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-2',
    lg: 'h-12 w-12 border-[3px]',
  };

  return (
    <div
      className={`inline-block animate-spin rounded-full border-solid border-indigo-500 border-t-transparent ${sizeClasses[size]} ${className}`}
      role="status"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};

/**
 * A full-page loading spinner overlay
 */
export const FullPageSpinner: React.FC = () => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-75">
    <LoadingSpinner size="lg" />
  </div>
);

export default LoadingSpinner;
