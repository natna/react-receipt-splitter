import React from 'react';
import styles from '../../styles/shared.module.css';

interface ButtonProps {
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'error';
  children: React.ReactNode;
  fullWidth?: boolean;
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  onClick, 
  variant = 'primary', 
  children, 
  fullWidth,
  disabled
}) => {
  const buttonClass = styles[`button${variant.charAt(0).toUpperCase()}${variant.slice(1)}`];
  const fullWidthClass = fullWidth ? styles.buttonFullWidth : '';
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${buttonClass} ${fullWidthClass}`}
    >
      {children}
    </button>
  );
};

interface CardProps {
  children: React.ReactNode;
  padding?: 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({ children, padding = 'md' }) => {
  const paddingClass = styles[`cardPadding${padding.toUpperCase()}`];
  
  return (
    <div className={`${styles.card} ${paddingClass}`}>
      {children}
    </div>
  );
};

interface ProgressBarProps {
  progress: number;
  height?: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ progress, height = 4 }) => (
  <div 
    className={styles.progressBar}
    style={{ height: `${height}px` }}
  >
    <div 
      className={styles.progressFill}
      style={{ width: `${progress}%` }}
    />
  </div>
); 