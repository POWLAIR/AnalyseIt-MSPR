'use client';

import { useState, useCallback } from 'react';

interface ToastOptions {
    message?: string;
    title?: string;
    description?: string;
    variant?: 'default' | 'destructive';
    type?: 'success' | 'error' | 'info';
    duration?: number;
}

export function useToast() {
    const [toast, setToast] = useState<ToastOptions | null>(null);

    const showToast = useCallback(({
        message,
        title,
        description,
        type = 'info',
        variant,
        duration = 3000
    }: ToastOptions) => {
        // Si variant est "destructive", on force le type à "error"
        const finalType = variant === 'destructive' ? 'error' : type;
        setToast({
            message,
            title,
            description,
            type: finalType
        });
        setTimeout(() => {
            setToast(null);
        }, duration);
    }, []);

    const hideToast = useCallback(() => {
        setToast(null);
    }, []);

    return {
        toast: showToast,
        activeToast: toast,
        hideToast
    };
} 