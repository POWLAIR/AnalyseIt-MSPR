'use client';

import React from 'react';

interface ToastProps {
    message?: string;
    title?: string;
    description?: string;
    type?: 'success' | 'error' | 'info';
    onClose?: () => void;
}

export function Toast({ message, title, description, type = 'info', onClose }: ToastProps) {
    const baseStyles = "fixed bottom-4 right-4 p-4 rounded-lg shadow-lg max-w-sm z-50";
    const typeStyles = {
        success: "bg-green-100 text-green-800 border border-green-200",
        error: "bg-red-100 text-red-800 border border-red-200",
        info: "bg-blue-100 text-blue-800 border border-blue-200"
    };

    return (
        <div className={`${baseStyles} ${typeStyles[type]}`}>
            <div className="flex items-center justify-between">
                <div className="flex-1 mr-4">
                    {title && (
                        <h4 className="font-medium mb-1">{title}</h4>
                    )}
                    {description && (
                        <p className="text-sm opacity-90">{description}</p>
                    )}
                    {message && (
                        <p className="text-sm">{message}</p>
                    )}
                </div>
                {onClose && (
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 self-start"
                    >
                        ×
                    </button>
                )}
            </div>
        </div>
    );
} 