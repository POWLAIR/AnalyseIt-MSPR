'use client';

import { useToast } from './use-toast';
import { Toast } from './toast';

export function Toaster() {
    const { activeToast, hideToast } = useToast();

    if (!activeToast) return null;

    return (
        <Toast
            message={activeToast.message}
            type={activeToast.type}
            onClose={hideToast}
        />
    );
} 