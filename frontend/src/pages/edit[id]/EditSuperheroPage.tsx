import React, {useState, useEffect} from 'react';
import {useParams, useNavigate} from 'react-router-dom';
import ImageUpload from '../../components/ImageUpload/ImageUpload';
import styles from './EditSuperheroPage.module.css';
import type {Superhero} from "../../types/Superhero.ts";
import PageHeader from "../../components/PageHeader/PageHeader.tsx";
import ConfirmDeleteModal from "../../components/ConfirmDeleteModal/ConfirmDeleteModal.tsx";

const EditSuperheroPage = () => {
    const {id} = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        nickname: '',
        realName: '',
        originDescription: '',
        superpowers: '',
        catchPhrase: '',
    });

    const [originalHero, setOriginalHero] = useState<Superhero | null>(null);
    const [newImages, setNewImages] = useState<File[]>([]);
    const [newImageUrls, setNewImageUrls] = useState<string[]>([]);
    const [existingImages, setExistingImages] = useState<string[]>([]);
    const [keepExistingImages, setKeepExistingImages] = useState(true);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasChanges, setHasChanges] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        if (!id) {
            setError('Hero ID not provided');
            setLoading(false);
            return;
        }

        fetchSuperhero(parseInt(id));
    }, [id]);

    useEffect(() => {
        // Проверяем, есть ли изменения в форме
        if (originalHero) {
            const hasFormChanges =
                formData.nickname !== originalHero.nickname ||
                formData.realName !== originalHero.realName ||
                formData.originDescription !== originalHero.originDescription ||
                formData.superpowers !== originalHero.superpowers ||
                formData.catchPhrase !== originalHero.catchPhrase;

            const hasImageChanges =
                newImages.length > 0 ||
                newImageUrls.length > 0 ||
                !keepExistingImages;

            setHasChanges(hasFormChanges || hasImageChanges);
        }
    }, [formData, originalHero, newImages, newImageUrls, keepExistingImages]);

    const fetchSuperhero = async (heroId: number) => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(`http://localhost:4000/api/superhero/${heroId}`);

            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('Superhero not found');
                }
                throw new Error(`Failed to fetch superhero: ${response.status}`);
            }

            const hero: Superhero = await response.json();
            setOriginalHero(hero);
            setFormData({
                nickname: hero.nickname,
                realName: hero.realName,
                originDescription: hero.originDescription,
                superpowers: hero.superpowers,
                catchPhrase: hero.catchPhrase,
            });
            setExistingImages(hero.images || []);
        } catch (err) {
            console.error('Error fetching superhero:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch superhero');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({...prev, [e.target.name]: e.target.value}));
    };

    const handleImagesChange = (files: File[], urls: string[]) => {
        setNewImages(files);
        setNewImageUrls(urls);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!hasChanges) {
            navigate(`/superhero/${id}`);
            return;
        }

        setSaving(true);
        setError(null);

        try {
            const form = new FormData();

            Object.entries(formData).forEach(([key, value]) => {
                form.append(key, value);
            });

            newImages.forEach((file) => {
                form.append('images', file);
            });

            if (newImageUrls.length > 0) {
                form.append('imageUrls', JSON.stringify(newImageUrls));
            }

            form.append('keepExistingImages', keepExistingImages.toString());

            const response = await fetch(`http://localhost:4000/api/superhero/${id}`, {
                method: 'PUT',
                body: form,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Failed to update superhero: ${response.status}`);
            }

            const updatedHero = await response.json();
            console.log('Superhero updated:', updatedHero);
            navigate(`/superhero/${id}`);
        } catch (err: any) {
            setError(err.message || 'Unknown error occurred');
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!originalHero) return;

        setDeleting(true);
        setError(null);

        try {
            const response = await fetch(`http://localhost:4000/api/superhero/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Failed to delete superhero: ${response.status}`);
            }

            // Успешное удаление - перенаправляем на главную
            navigate('/', {
                state: {
                    message: `${originalHero.nickname} has been deleted successfully`,
                    type: 'success'
                }
            });
        } catch (err: any) {
            setError(err.message || 'Failed to delete superhero');
            console.error('Delete error:', err);
        } finally {
            setDeleting(false);
            setShowDeleteConfirm(false);
        }
    };

    const confirmDelete = () => {
        setShowDeleteConfirm(true);
    };

    const cancelDelete = () => {
        setShowDeleteConfirm(false);
    };

    const handleCancel = () => {
        if (hasChanges) {
            const confirmLeave = window.confirm(
                'You have unsaved changes. Are you sure you want to leave?'
            );
            if (!confirmLeave) return;
        }
        navigate(`/superhero/${id}`);
    };

    const handleReset = () => {
        if (originalHero) {
            setFormData({
                nickname: originalHero.nickname,
                realName: originalHero.realName,
                originDescription: originalHero.originDescription,
                superpowers: originalHero.superpowers,
                catchPhrase: originalHero.catchPhrase,
            });
            setNewImages([]);
            setNewImageUrls([]);
            setKeepExistingImages(true);
        }
    };

    if (loading) {
        return (
            <div className={styles.editPage}>
                <div className={styles.loading}>
                    <div className={styles.spinner}></div>
                    <p>Loading superhero data...</p>
                </div>
            </div>
        );
    }

    if (error && !originalHero) {
        return (
            <div className={styles.editPage}>
                <div className={styles.error}>
                    <h2>⚠️ Error</h2>
                    <p>{error}</p>
                    <div className={styles.errorActions}>
                        <button onClick={() => navigate('/')} className={styles.backBtn}>
                            ← Back to Home
                        </button>
                        <button onClick={() => window.location.reload()} className={styles.retryBtn}>
                            🔄 Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.editPage}>
            {/* Header */}
            <PageHeader
                title="Edit Superhero"
                subtitle={originalHero ? `Update information for ${originalHero.nickname}` : 'Loading...'}
                backButtonText={originalHero ? `← Back to ${originalHero.nickname}` : '← Back'}
                backgroundColor="secondary"
                icon="✏️"
                onBackClick={handleCancel}
            />

            {/* Form */}
            <div className={styles.formContainer}>
                <form onSubmit={handleSubmit} className={styles.form}>
                    {/* Basic Information */}
                    <div className={styles.section}>
                        <h2>📝 Basic Information</h2>

                        <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                                <label htmlFor="nickname">Superhero Nickname *</label>
                                <input
                                    id="nickname"
                                    name="nickname"
                                    type="text"
                                    placeholder="e.g., Iron Man, Superman"
                                    value={formData.nickname}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="realName">Real Name *</label>
                                <input
                                    id="realName"
                                    name="realName"
                                    type="text"
                                    placeholder="e.g., Tony Stark, Clark Kent"
                                    value={formData.realName}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="catchPhrase">Catch Phrase *</label>
                            <input
                                id="catchPhrase"
                                name="catchPhrase"
                                type="text"
                                placeholder="e.g., 'I am Iron Man!'"
                                value={formData.catchPhrase}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="originDescription">Origin Story *</label>
                            <textarea
                                id="originDescription"
                                name="originDescription"
                                placeholder="Describe how this superhero got their powers..."
                                value={formData.originDescription}
                                onChange={handleChange}
                                rows={4}
                                required
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="superpowers">Superpowers *</label>
                            <textarea
                                id="superpowers"
                                name="superpowers"
                                placeholder="List their superpowers: flight, super strength, telepathy..."
                                value={formData.superpowers}
                                onChange={handleChange}
                                rows={3}
                                required
                            />
                        </div>
                    </div>

                    {/* Existing Images */}
                    {existingImages.length > 0 && (
                        <div className={styles.section}>
                            <h2>🖼️ Current Images</h2>
                            <div className={styles.existingImages}>
                                {existingImages.map((image, index) => (
                                    <div key={index} className={styles.existingImage}>
                                        <img
                                            src={image.startsWith('http') ? image : `http://localhost:4000${image}`}
                                            alt={`${originalHero?.nickname} ${index + 1}`}
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                target.src = '/placeholder-hero.jpg';
                                                target.onerror = null;
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>

                            <div className={styles.imageOptions}>
                                <label className={styles.checkboxLabel}>
                                    <input
                                        type="checkbox"
                                        checked={keepExistingImages}
                                        onChange={(e) => setKeepExistingImages(e.target.checked)}
                                    />
                                    <span className={styles.checkmark}></span>
                                    Keep existing images
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
                        <ImageUpload onImagesChange={handleImagesChange} maxFiles={5}/>
                    </div>

                    {/* Error Display */}
                    {error && (
                        <div className={styles.error}>
                            ❌ {error}
                        </div>
                    )}

                    {/* Form Actions */}
                    <div className={styles.formActions}>
                        <div className={styles.leftActions}>
                            <button
                                type="button"
                                onClick={confirmDelete}
                                className={styles.deleteBtn}
                                disabled={saving || deleting}
                            >
                                {deleting ? '🗑️ Deleting...' : '🗑️ Delete Hero'}
                            </button>
                            <button
                                type="button"
                                onClick={handleReset}
                                className={styles.resetBtn}
                                disabled={saving || deleting || !hasChanges}
                            >
                                🔄 Reset Changes
                            </button>
                        </div>

                        <div className={styles.rightActions}>
                            <button
                                type="button"
                                onClick={handleCancel}
                                className={styles.cancelBtn}
                                disabled={saving || deleting}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={saving || deleting || !hasChanges}
                                className={styles.saveBtn}
                            >
                                {saving ? '💾 Saving...' : hasChanges ? '💾 Save Changes' : '✅ No Changes'}
                            </button>
                        </div>
                    </div>

                    <ConfirmDeleteModal
                        isOpen={showDeleteConfirm}
                        title="Delete Superhero"
                        itemName={originalHero?.nickname || ''}
                        itemImage={
                            originalHero?.images && originalHero.images.length > 0
                                ? originalHero.images[0].startsWith('http')
                                    ? originalHero.images[0]
                                    : `http://localhost:4000${originalHero.images[0]}`
                                : undefined
                        }
                        itemSubtitle={originalHero?.realName}
                        itemQuote={originalHero?.catchPhrase}
                        onConfirm={handleDelete}
                        onCancel={cancelDelete}
                        isDeleting={deleting}
                        customWarning="This action cannot be undone. All hero data and images will be permanently removed."
                    />

                    {/* Changes Indicator */}
                    {hasChanges && (
                        <div className={styles.changesIndicator}>
                            <span>📝</span>
                            You have unsaved changes
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
};

export default EditSuperheroPage;
