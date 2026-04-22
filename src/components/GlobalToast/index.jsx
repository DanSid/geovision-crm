import React, { useCallback, useEffect, useState } from 'react';
import { Toast, ToastContainer } from 'react-bootstrap';
import { AlertCircle, CheckCircle, Info, AlertTriangle } from 'react-feather';

export const TOAST_EVENT = 'gv-show-toast';

/* ── Public helper — call from anywhere ─────────────────────────────────────
   showToast('Task saved!', 'success')
   showToast('Email required', 'danger', 'Validation Error')
   showToast('Closing in 2 days', 'warning', 'Opportunity Alert')
─────────────────────────────────────────────────────────────────────────── */
export const showToast = (message, variant = 'success', title = null, duration = 4500) => {
    window.dispatchEvent(new CustomEvent(TOAST_EVENT, {
        detail: { message, variant, title, duration, id: `${Date.now()}-${Math.random()}` },
    }));
};

const ICON = {
    success: <CheckCircle size={15} className="text-success" />,
    danger:  <AlertCircle size={15} className="text-danger" />,
    warning: <AlertTriangle size={15} className="text-warning" />,
    info:    <Info size={15} className="text-info" />,
};

const DEFAULT_TITLE = {
    success: 'Success',
    danger:  'Error',
    warning: 'Warning',
    info:    'Info',
};

/* ── Component ──────────────────────────────────────────────────────────── */
const GlobalToast = () => {
    const [toasts, setToasts] = useState([]);

    const handleEvent = useCallback((e) => {
        const t = e.detail;
        setToasts(prev => [...prev, t]);
        setTimeout(() => {
            setToasts(prev => prev.filter(x => x.id !== t.id));
        }, (t.duration || 4500) + 300); // remove slightly after hide
    }, []);

    useEffect(() => {
        window.addEventListener(TOAST_EVENT, handleEvent);
        return () => window.removeEventListener(TOAST_EVENT, handleEvent);
    }, [handleEvent]);

    return (
        <ToastContainer position="top-end" className="p-3" style={{ zIndex: 11000, position: 'fixed' }}>
            {toasts.map(({ id, message, variant, title, duration }) => (
                <Toast
                    key={id}
                    show
                    autohide
                    delay={duration || 4500}
                    onClose={() => setToasts(prev => prev.filter(x => x.id !== id))}
                    className="shadow"
                >
                    <Toast.Header>
                        {ICON[variant] || ICON.info}
                        <strong className="ms-2 me-auto">
                            {title || DEFAULT_TITLE[variant] || 'Notice'}
                        </strong>
                    </Toast.Header>
                    <Toast.Body>{message}</Toast.Body>
                </Toast>
            ))}
        </ToastContainer>
    );
};

export default GlobalToast;
