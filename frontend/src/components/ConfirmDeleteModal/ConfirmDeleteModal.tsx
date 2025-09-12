import React from 'react';
import styles from './ConfirmDeleteModal.module.css';

interface ConfirmDeleteModalProps {
    isOpen: boolean;
    title?: string;
    itemName: string;
    itemImage?: string;
    itemSubtitle?: string;
    itemQuote?: string;
    onConfirm: () => void;
    onCancel: () => void;
    isDeleting?: boolean;
    customWarning?: string;
}

const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
                                                                   isOpen,
                                                                   title = 'Delete Item',
                                                                   itemName,
                                                                   itemImage,
                                                                   itemSubtitle,
                                                                   itemQuote,
                                                                   onConfirm,
                                                                   onCancel,
                                                                   isDeleting = false,
                                                                   customWarning
                                                               }) => {
    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget && !isDeleting) {
            onCancel();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape' && !isDeleting) {
            onCancel();
        }
    };

    if (!isOpen) return null;

    return (
        <div
            className={styles.modalOverlay}
            onClick={handleOverlayClick}
            onKeyDown={handleKeyDown}
            tabIndex={-1}
        >
            <div className={styles.deleteModal}>
                <div className={styles.modalHeader}>
                    <h3>⚠️ {title}</h3>
                    <button
                        onClick={onCancel}
                        className={styles.modalClose}
                        disabled={isDeleting}
                        aria-label="Close modal"
                    >
                        ✕
                    </button>
                </div>

                <div className={styles.modalContent}>
                    <p>
                        Are you sure you want to permanently delete{' '}
                        <strong>{itemName}</strong>?
                    </p>

                    {(itemImage || itemSubtitle || itemQuote) && (
                        <div className={styles.itemPreview}>
                            {itemImage && (
                                <img
                                    src={itemImage}
                                    alt={itemName}
                                    className={styles.previewImage}
                                    onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.style.display = 'none';
                                    }}
                                />
                            )}
                            <div className={styles.itemInfo}>
                                <h4>{itemName}</h4>
                                {itemSubtitle && <p className={styles.subtitle}>{itemSubtitle}</p>}
                                {itemQuote && (
                                    <blockquote className={styles.quote}>"{itemQuote}"</blockquote>
                                )}
                            </div>
                        </div>
                    )}

                    <div className={styles.warningText}>
                        <p>
                            ⚠️ {customWarning || 'This action cannot be undone. All data will be permanently removed.'}
                        </p>
                    </div>
                </div>

                <div className={styles.modalActions}>
                    <button
                        onClick={onCancel}
                        className={styles.modalCancel}
                        disabled={isDeleting}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className={styles.modalDelete}
                        disabled={isDeleting}
                    >
                        {isDeleting ? '🗑️ Deleting...' : '🗑️ Delete Forever'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDeleteModal;
