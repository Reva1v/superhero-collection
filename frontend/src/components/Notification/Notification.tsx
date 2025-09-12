import React, { useEffect } from 'react';
import styles from './Notification.module.css';

interface NotificationProps {
    message: string;
    type?: 'success' | 'error' | 'warning' | 'info';
    duration?: number;
    onClose: () => void;
    isVisible: boolean;
}

const Notification: React.FC<NotificationProps> = ({
                                                       message,
                                                       type = 'info',
                                                       duration = 5000,
                                                       onClose,
                                                       isVisible
                                                   }) => {
    useEffect(() => {
        if (isVisible && duration > 0) {
            const timer = setTimeout(() => {
                onClose();
            }, duration);

            return () => clearTimeout(timer);
        }
    }, [isVisible, duration, onClose]);

    if (!isVisible) return null;

    const getIcon = () => {
        switch (type) {
            case 'success': return '✅';
            case 'error': return '❌';
            case 'warning': return '⚠️';
            case 'info': return 'ℹ️';
            default: return 'ℹ️';
        }
    };

    return (
        <div className={`${styles.notification} ${styles[type]}`}>
            <div className={styles.content}>
                <span className={styles.icon}>{getIcon()}</span>
                <span className={styles.message}>{message}</span>
            </div>
            <button
                onClick={onClose}
                className={styles.closeButton}
                aria-label="Close notification"
            >
                ✕
            </button>
        </div>
    );
};

export default Notification;
