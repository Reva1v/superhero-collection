import React, {useState, useEffect} from 'react';
import {useParams, useNavigate} from 'react-router-dom';
import styles from './EditSuperheroPage.module.css';
import type {Superhero} from "../../types/Superhero.ts";
import PageHeader from "../../components/PageHeader/PageHeader.tsx";
import ConfirmDeleteModal from "../../components/ConfirmDeleteModal/ConfirmDeleteModal.tsx";
import SuperheroEditForm from "../../components/SuperheroEditForm/SuperheroEditForm.tsx";
import ImageManager from "../../components/ImageManager/ImageManager.tsx";
import EditFormActions from "../../components/EditFormActions/EditFormActions.tsx";

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
    const [imagesToDelete, setImagesToDelete] = useState<number[]>([]);
    const [previewImages, setPreviewImages] = useState<string[]>([]);

    useEffect(() => {
        if (!id) {
            setError('Hero ID not provided');
            setLoading(false);
            return;
        }

        fetchSuperhero(parseInt(id));
    }, [id]);

    useEffect(() => {
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
                !keepExistingImages ||
                imagesToDelete.length > 0;

            setHasChanges(hasFormChanges || hasImageChanges);
        }
    }, [formData, originalHero, newImages, newImageUrls, keepExistingImages, imagesToDelete]);


    useEffect(() => {
        if (originalHero) {
            setPreviewImages(originalHero.images || []);
        }
    }, [originalHero]);

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
            if (imagesToDelete.length > 0) {
                console.log('Deleting marked images:', imagesToDelete);

                const sortedIndices = [...imagesToDelete].sort((a, b) => b - a);

                for (const imageIndex of sortedIndices) {
                    try {
                        const deleteResponse = await fetch(`http://localhost:4000/api/superhero/${id}/images/${imageIndex}`, {
                            method: 'DELETE',
                        });

                        if (!deleteResponse.ok) {
                            const errorData = await deleteResponse.json();
                            console.error(`Failed to delete image ${imageIndex}:`, errorData);
                        }
                    } catch (deleteError) {
                        console.error(`Error deleting image ${imageIndex}:`, deleteError);
                    }
                }
            }

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


    const handleMarkImageForDeletion = (imageIndex: number) => {
        const confirmMark = window.confirm(
            `Mark this image for deletion? It will be removed when you save changes.`
        );

        if (!confirmMark) return;

        // Add index to the deletion list
        if (!imagesToDelete.includes(imageIndex)) {
            setImagesToDelete(prev => [...prev, imageIndex]);
        }

        // Update image previews (remove from display)
        const updatedPreview = previewImages.filter((_, index) =>
            !imagesToDelete.includes(index) && index !== imageIndex
        );
        setPreviewImages(updatedPreview);
    };

    const handleRestoreImage = (originalIndex: number) => {
        setImagesToDelete(prev => prev.filter(index => index !== originalIndex));

        if (originalHero?.images && originalHero.images[originalIndex]) {
            setPreviewImages(prev => {
                const restored = [...prev];
                restored.splice(originalIndex, 0, originalHero.images[originalIndex]);
                return restored;
            });
        }
    };

    const handleRestoreAllImages = () => {
        setImagesToDelete([]);
        setPreviewImages(originalHero?.images || []);
    };

    const handleMarkAllImagesForDeletion = () => {
        if (previewImages.length === 0) return;

        const confirmMarkAll = window.confirm(
            `Mark all ${previewImages.length} images for deletion? They will be removed when you save changes.`
        );

        if (!confirmMarkAll) return;

        // Mark all existing images for deletion
        const allIndices = Array.from({length: existingImages.length}, (_, i) => i);
        setImagesToDelete(allIndices);
        setPreviewImages([]);
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

            setImagesToDelete([]);
            setPreviewImages(originalHero.images || []);
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
            <PageHeader
                title="Edit Superhero"
                subtitle={originalHero ? `Update information for ${originalHero.nickname}` : 'Loading...'}
                backButtonText={originalHero ? `← Back to ${originalHero.nickname}` : '← Back'}
                backgroundColor="secondary"
                icon="✏️"
                onBackClick={handleCancel}
            />

            <div className={styles.formContainer}>
                <form onSubmit={handleSubmit} className={styles.form}>
                    <SuperheroEditForm
                        formData={formData}
                        onChange={handleChange}
                        disabled={saving || deleting}
                    />

                    <ImageManager
                        existingImages={existingImages}
                        previewImages={previewImages}
                        imagesToDelete={imagesToDelete}
                        keepExistingImages={keepExistingImages}
                        heroName={originalHero?.nickname}
                        onMarkImageForDeletion={handleMarkImageForDeletion}
                        onMarkAllImagesForDeletion={handleMarkAllImagesForDeletion}
                        onRestoreImage={handleRestoreImage}
                        onRestoreAllImages={handleRestoreAllImages}
                        onImagesChange={handleImagesChange}
                        onKeepExistingChange={setKeepExistingImages}
                        disabled={saving || deleting}
                    />

                    {error && (
                        <div className={styles.error}>
                            ❌ {error}
                        </div>
                    )}

                    <EditFormActions
                        onDelete={() => setShowDeleteConfirm(true)}
                        onReset={handleReset}
                        onCancel={handleCancel}
                        onSubmit={handleSubmit}
                        hasChanges={hasChanges}
                        saving={saving}
                        deleting={deleting}
                    />

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
                        onCancel={() => setShowDeleteConfirm(false)}
                        isDeleting={deleting}
                        customWarning="This action cannot be undone. All hero data and images will be permanently removed."
                    />

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
