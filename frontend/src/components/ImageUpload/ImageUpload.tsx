// src/components/ImageUpload/ImageUpload.tsx
import React, {useState, useCallback} from 'react';
import styles from './ImageUpload.module.css';

interface ImageUploadProps {
    onImagesChange: (images: File[], urls: string[]) => void;
    maxFiles?: number;
}

const ImageUpload: React.FC<ImageUploadProps> = ({onImagesChange, maxFiles = 5}) => {
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
    const [imageUrls, setImageUrls] = useState<string[]>(['']);
    const [dragActive, setDragActive] = useState(false);
    const handleFileUpload = useCallback((files: FileList) => {
        const newFiles = Array.from(files).slice(0, maxFiles);
        setUploadedFiles(prev => [...prev, ...newFiles].slice(0, maxFiles));
        onImagesChange([...uploadedFiles, ...newFiles].slice(0, maxFiles), imageUrls.filter(url => url.trim()));
    }, [uploadedFiles, imageUrls, maxFiles, onImagesChange]);
    const handleUrlChange = useCallback((index: number, value: string) => {
        const newUrls = [...imageUrls];
        newUrls[index] = value;

        if (index === newUrls.length - 1 && value.trim() && newUrls.length < maxFiles) {
            newUrls.push('');
        }

        setImageUrls(newUrls);
        onImagesChange(uploadedFiles, newUrls.filter(url => url.trim()));
    }, [imageUrls, uploadedFiles, maxFiles, onImagesChange]);
    const removeFile = useCallback((index: number) => {
        const newFiles = uploadedFiles.filter((_, i) => i !== index);
        setUploadedFiles(newFiles);
        onImagesChange(newFiles, imageUrls.filter(url => url.trim()));
    }, [uploadedFiles, imageUrls, onImagesChange]);
    const removeUrl = useCallback((index: number) => {
        const newUrls = imageUrls.filter((_, i) => i !== index);
        if (newUrls.length === 0 || newUrls[newUrls.length - 1].trim() !== '') {
            newUrls.push('');
        }
        setImageUrls(newUrls);
        onImagesChange(uploadedFiles, newUrls.filter(url => url.trim()));
    }, [imageUrls, uploadedFiles, onImagesChange]);
    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    }, []);
    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFileUpload(e.dataTransfer.files);
        }
    }, [handleFileUpload]);
    return (
        <div className={styles.imageUpload}>
            <h3>Superhero Images</h3>

            {/* File Upload Area */}
            <div
                className={`${styles.uploadArea} ${dragActive ? styles.dragActive : ''}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                <input
                    type="file"
                    multiple
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                    className={styles.fileInput}
                    id="image-upload"
                />
                <label htmlFor="image-upload" className={styles.uploadLabel}>
                    <div className={styles.uploadContent}>
                        <span className={styles.uploadIcon}>📷</span>
                        <p>Click to upload or drag and drop</p>
                        <p className={styles.uploadHint}>JPEG, PNG, WebP up to 5MB</p>
                    </div>
                </label>
            </div>
            {/* Uploaded Files Preview */}
            {uploadedFiles.length > 0 && (
                <div className={styles.previewSection}>
                    <h4>Uploaded Files:</h4>
                    <div className={styles.previewGrid}>
                        {uploadedFiles.map((file, index) => (
                            <div key={index} className={styles.previewItem}>
                                <img
                                    src={URL.createObjectURL(file)}
                                    alt={`Upload ${index + 1}`}
                                    className={styles.previewImage}
                                />
                                <button
                                    type="button"
                                    onClick={() => removeFile(index)}
                                    className={styles.removeBtn}
                                >
                                    ✕
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            {/* URL Input Section */}
            <div className={styles.urlSection}>
                <h4>Or add image URLs:</h4>
                {imageUrls.map((url, index) => (
                    <div key={index} className={styles.urlInput}>
                        <input
                            type="url"
                            placeholder="https://example.com/superhero-image.jpg"
                            value={url}
                            onChange={(e) => handleUrlChange(index, e.target.value)}
                            className={styles.urlField}
                        />
                        {url.trim() && (
                            <button
                                type="button"
                                onClick={() => removeUrl(index)}
                                className={styles.removeUrlBtn}
                            >
                                ✕
                            </button>
                        )}
                    </div>
                ))}
            </div>
            <p className={styles.limitInfo}>
                Maximum {maxFiles} images allowed
            </p>
        </div>
    );
};
export default ImageUpload;
