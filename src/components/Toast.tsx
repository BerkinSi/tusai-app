"use client";
import { Fragment, useEffect } from 'react';
import { XMarkIcon, CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';

interface ToastProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
  type?: 'success' | 'error' | 'info';
  duration?: number;
}

export default function Toast({
  isOpen,
  onClose,
  message,
  type = 'info',
  duration = 5000
}: ToastProps) {
  useEffect(() => {
    if (isOpen && duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [isOpen, duration, onClose]);

  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-green-50 dark:bg-green-900/20',
          border: 'border-green-200 dark:border-green-700',
          icon: 'text-green-600',
          iconBg: 'bg-green-100 dark:bg-green-900/20'
        };
      case 'error':
        return {
          bg: 'bg-red-50 dark:bg-red-900/20',
          border: 'border-red-200 dark:border-red-700',
          icon: 'text-red-600',
          iconBg: 'bg-red-100 dark:bg-red-900/20'
        };
      default:
        return {
          bg: 'bg-blue-50 dark:bg-blue-900/20',
          border: 'border-blue-200 dark:border-blue-700',
          icon: 'text-blue-600',
          iconBg: 'bg-blue-100 dark:bg-blue-900/20'
        };
    }
  };

  const styles = getTypeStyles();
  const Icon = type === 'success' ? CheckCircleIcon : ExclamationCircleIcon;

  return (
    <div className="fixed top-4 right-4 z-50 transform transition-all duration-300 ease-in-out">
      <div className={`flex items-center gap-3 p-4 rounded-lg border shadow-lg ${styles.bg} ${styles.border}`}>
        <div className={`p-1 rounded-full ${styles.iconBg}`}>
          <Icon className={`w-5 h-5 ${styles.icon}`} />
        </div>
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
          {message}
        </p>
        <button
          onClick={onClose}
          className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          <XMarkIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
        </button>
      </div>
    </div>
  );
} 