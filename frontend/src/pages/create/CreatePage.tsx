import React, {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import ImageUpload from '../../components/ImageUpload/ImageUpload';
import styles from './CreatePage.module.css';
import PageHeader from "../../components/PageHeader/PageHeader.tsx";

const CreatePage = () => {
    const [formData, setFormData] = useState({
        nickname: '',
        realName: '',
        originDescription: '',
        superpowers: '',
        catchPhrase: '',
    });

    const [images, setImages] = useState<File[]>([]);
    const [imageUrls, setImageUrls] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({...prev, [e.target.name]: e.target.value}));
    };

    const handleImagesChange = (files: File[], urls: string[]) => {
        setImages(files);
        setImageUrls(urls);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const form = new FormData();
            form.append('nickname', formData.nickname);
            form.append('realName', formData.realName);
            form.append('originDescription', formData.originDescription);
            form.append('superpowers', formData.superpowers);
            form.append('catchPhrase', formData.catchPhrase);

            images.forEach((file) => {
                form.append('images', file);
            });

            if (imageUrls.length > 0) {
                form.append('imageUrls', JSON.stringify(imageUrls));
            }

            const response = await fetch('http://localhost:4000/api/superhero', {
                method: 'POST',
                body: form,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Failed to create superhero: ${response.status}`);
            }

            const data = await response.json();
            console.log('Superhero created:', data);
            navigate('/');
        } catch (err: any) {
            setError(err.message || 'Unknown error occurred');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <PageHeader
                title="Add New Superhero"
                subtitle="Create your unique superhero with superpowers and images"
                backButtonText="← Back to Heroes"
                backButtonPath="/"
                backgroundColor="accent"
                icon="🦸‍♂️"
            />
            <div className={styles.createPage}>
                <form onSubmit={handleSubmit} className={styles.form}>
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

                    <ImageUpload onImagesChange={handleImagesChange} maxFiles={5}/>

                    {error && <div className={styles.error}>❌ {error}</div>}

                    <div className={styles.formActions}>
                        <button
                            type="button"
                            onClick={() => navigate('/')}
                            className={styles.cancelBtn}
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className={styles.submitButton}
                        >
                            {loading ? '🔄 Creating...' : '✨ Create Superhero'}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
};

export default CreatePage;
