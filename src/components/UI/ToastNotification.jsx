/**
 * 🍞 TOAST NOTIFICATION COMPONENT
 *
 * Container untuk menampilkan stack of toasts
 * Positioned di kanan atas layar
 */

import useGameStore from '../../stores/useGameStore';
import '../../styles/ToastNotification.css';

const ToastNotification = () => {
    const toasts = useGameStore((state) => state.toasts);
    const removeToast = useGameStore((state) => state.removeToast);

    if (toasts.length === 0) return null;

    const getIcon = (type, customIcon) => {
        if (customIcon) return customIcon;
        
        switch (type) {
            case 'success': return '✅';
            case 'warning': return '⚠️';
            case 'error': return '❌';
            case 'info':
            default: return 'ℹ️';
        }
    };

    return (
        <div className="toast-container">
            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    className={`toast toast-${toast.type}`}
                    onClick={() => removeToast(toast.id)}
                >
                    <span className="toast-icon">{getIcon(toast.type, toast.icon)}</span>
                    <span className="toast-message">{toast.message}</span>
                    <button className="toast-close" onClick={() => removeToast(toast.id)}>
                        ×
                    </button>
                </div>
            ))}
        </div>
    );
};

export default ToastNotification;
