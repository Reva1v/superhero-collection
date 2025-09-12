import React from 'react';
import ImageUpload from '../ImageUpload/ImageUpload';
import styles from './ImageManager.module.css';

interface ImageManagerProps {
    existingImages: string[];
    previewImages: string[];
    imagesToDelete: number[];
    keepExistingImages: boolean;
    heroName?: string;
    onMarkImageForDeletion: (index: number) => void;
    onMarkAllImagesForDeletion: () => void;
    onRestoreImage: (index: number) => void;
    onRestoreAllImages: () => void;
    onImagesChange: (files: File[], urls: string[]) => void;
    onKeepExistingChange: (keep: boolean) => void;
    disabled?: boolean;
}

const ImageManager: React.FC<ImageManagerProps> = ({
                                                       existingImages,
                                                       previewImages,
                                                       imagesToDelete,
                                                       keepExistingImages,
                                                       heroName,
                                                       onMarkImageForDeletion,
                                                       onMarkAllImagesForDeletion,
                                                       onRestoreImage,
                                                       onRestoreAllImages,
                                                       onImagesChange,
                                                       onKeepExistingChange,
                                                       disabled = false
                                                   }) => {
    return (
        <>
            {/* Existing Images */}
            {existingImages.length > 0 && (
                <div className={styles.section}>
                    <div className={styles.imagesHeader}>
                        <h2>🖼️ Current Images</h2>
                        <div className={styles.headerActions}>
                            {imagesToDelete.length > 0 && (
                                <button
                                    type="button"
                                    onClick={onRestoreAllImages}
                                    className={styles.restoreAllBtn}
                                    disabled={disabled}
                                >
                                    ↩️ Restore All
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={onMarkAllImagesForDeletion}
                                className={styles.deleteAllBtn}
                                disabled={disabled || previewImages.length === 0}
                            >
                                🗑️ Mark All for Deletion
                            </button>
                        </div>
                    </div>

                    {/* Preview Images */}
                    <div className={styles.existingImages}>
                        {previewImages.map((image, previewIndex) => {
                            // Находим оригинальный индекс
                            const originalIndex = existingImages.indexOf(image);

                            return (
                                <div key={`preview-${previewIndex}-${image}`} className={styles.existingImage}>
                                    <img
                                        src={image.startsWith('http') ? image : `http://localhost:4000${image}`}
                                        alt={`${heroName} ${previewIndex + 1}`}
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.src = '/placeholder-hero.jpg';
                                            target.onerror = null;
                                        }}
                                    />
                                    <div className={styles.imageOverlay}>
                                        <button
                                            type="button"
                                            onClick={() => onMarkImageForDeletion(originalIndex)}
                                            className={styles.deleteImageBtn}
                                            disabled={disabled}
                                            title="Mark for deletion"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Marked for Deletion */}
                    {imagesToDelete.length > 0 && (
                        <div className={styles.markedForDeletion}>
                            <h3>⚠️ Marked for Deletion ({imagesToDelete.length})</h3>
                            <div className={styles.deletionPreview}>
                                {imagesToDelete.map((originalIndex) => (
                                    <div key={`marked-${originalIndex}`} className={styles.markedImage}>
                                        <img
                                            src={existingImages[originalIndex]?.startsWith('http')
                                                ? existingImages[originalIndex]
                                                : `http://localhost:4000${existingImages[originalIndex]}`
                                            }
                                            alt={`Marked for deletion ${originalIndex + 1}`}
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                target.src = '/placeholder-hero.jpg';
                                                target.onerror = null;
                                            }}
                                        />
                                        <div className={styles.markedOverlay}>
                                            <button
                                                type="button"
                                                onClick={() => onRestoreImage(originalIndex)}
                                                className={styles.restoreBtn}
                                                disabled={disabled}
                                                title="Restore image"
                                            >
                                                ↩️
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <p className={styles.deletionNote}>
                                These images will be permanently deleted when you save changes
                            </p>
                        </div>
                    )}

                    <div className={styles.imageOptions}>
                        <label className={styles.checkboxLabel}>
                            <input
                                type="checkbox"
                                checked={keepExistingImages}
                                onChange={(e) => onKeepExistingChange(e.target.checked)}
                                disabled={disabled}
                            />
                            <span className={styles.checkmark}></span>
                            Keep existing images when adding new ones
                        </label>
                        <p className={styles.imageNote}>
                            {keepExistingImages
                                ? "New images will be added to existing ones"
                                : "Existing images will be replaced with new ones"}
                        </p>
                    </div>
                </div>
            )}

            {/* New Images */}
            <div className={styles.section}>
                <h2>📷 Add New Images</h2>
                <ImageUpload
                    onImagesChange={onImagesChange}
                    maxFiles={5}
                    disabled={disabled}
                />
            </div>
        </>
    );
};

export default ImageManager;
