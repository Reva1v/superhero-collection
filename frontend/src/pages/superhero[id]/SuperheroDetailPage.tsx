import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import styles from './SuperheroDetailPage.module.css';
import type {Superhero} from "../../types/Superhero.ts";
import PageHeader from "../../components/PageHeader/PageHeader.tsx";

const SuperheroDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [hero, setHero] = useState<Superhero | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    useEffect(() => {
        if (!id) {
            setError('Hero ID not provided');
            setLoading(false);
            return;
        }

        fetchSuperhero(parseInt(id));
    }, [id]);

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

            const data: Superhero = await response.json();
            setHero(data);
        } catch (err) {
            console.error('Error fetching superhero:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch superhero');
        } finally {
            setLoading(false);
        }
    };

    const getImageUrl = (imagePath: string) => {
        if (!imagePath) return '';
        if (imagePath.startsWith('http')) return imagePath;
        return `http://localhost:4000${imagePath}`;
    };

    const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
        const target = e.target as HTMLImageElement;
        target.src = '/placeholder-hero.jpg';
        target.onerror = null;
    };

    const nextImage = () => {
        if (hero && hero.images.length > 1) {
            setCurrentImageIndex((prev) => (prev + 1) % hero.images.length);
        }
    };

    const prevImage = () => {
        if (hero && hero.images.length > 1) {
            setCurrentImageIndex((prev) => (prev - 1 + hero.images.length) % hero.images.length);
        }
    };

    const formatSuperpowers = (powers: string) => {
        return powers.split(',').map(power => power.trim());
    };

    if (loading) {
        return (
            <div className={styles.detailPage}>
                <div className={styles.loading}>
                    <div className={styles.spinner}></div>
                    <p>Loading superhero details...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.detailPage}>
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

    if (!hero) {
        return (
            <div className={styles.detailPage}>
                <div className={styles.error}>
                    <h2>Superhero not found</h2>
                    <button onClick={() => navigate('/')} className={styles.backBtn}>
                        ← Back to Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.detailPage}>
            {/* Hero Header */}
            <PageHeader
                title={hero.nickname}
                subtitle={hero.realName}
                backButtonText="← Back to Heroes"
                backButtonPath="/"
                backgroundColor="primary"
            />

            {/* Main Content */}
            <div className={styles.mainContent}>
                {/* Image Gallery */}
                <div className={styles.imageSection}>
                    {hero.images && hero.images.length > 0 ? (
                        <div className={styles.imageGallery}>
                            <div className={styles.mainImage}>
                                <img
                                    src={getImageUrl(hero.images[currentImageIndex])}
                                    alt={`${hero.nickname} - Image ${currentImageIndex + 1}`}
                                    onError={handleImageError}
                                />
                                {hero.images.length > 1 && (
                                    <>
                                        <button
                                            className={`${styles.imageNav} ${styles.prevBtn}`}
                                            onClick={prevImage}
                                            aria-label="Previous image"
                                        >
                                            ‹
                                        </button>
                                        <button
                                            className={`${styles.imageNav} ${styles.nextBtn}`}
                                            onClick={nextImage}
                                            aria-label="Next image"
                                        >
                                            ›
                                        </button>
                                    </>
                                )}
                            </div>

                            {hero.images.length > 1 && (
                                <div className={styles.imageThumbnails}>
                                    {hero.images.map((image, index) => (
                                        <button
                                            key={index}
                                            className={`${styles.thumbnail} ${index === currentImageIndex ? styles.active : ''}`}
                                            onClick={() => setCurrentImageIndex(index)}
                                        >
                                            <img
                                                src={getImageUrl(image)}
                                                alt={`${hero.nickname} thumbnail ${index + 1}`}
                                                onError={handleImageError}
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}

                            <div className={styles.imageCounter}>
                                {currentImageIndex + 1} / {hero.images.length}
                            </div>
                        </div>
                    ) : (
                        <div className={styles.noImage}>
                            <span>🦸‍♂️</span>
                            <p>No Images Available</p>
                        </div>
                    )}
                </div>

                {/* Hero Information */}
                <div className={styles.infoSection}>
                    {/* Catch Phrase */}
                    <div className={styles.catchPhrase}>
                        <span className={styles.quoteIcon}>"</span>
                        {hero.catchPhrase}
                        <span className={styles.quoteIcon}>"</span>
                    </div>

                    {/* Origin Story */}
                    <div className={styles.infoCard}>
                        <h3>🌟 Origin Story</h3>
                        <p>{hero.originDescription}</p>
                    </div>

                    {/* Superpowers */}
                    <div className={styles.infoCard}>
                        <h3>⚡ Superpowers</h3>
                        <div className={styles.superpowersList}>
                            {formatSuperpowers(hero.superpowers).map((power, index) => (
                                <span key={index} className={styles.superpower}>
                  {power}
                </span>
                            ))}
                        </div>
                    </div>

                    {/* Hero Stats */}
                    <div className={styles.infoCard}>
                        <h3>📊 Hero Information</h3>
                        <div className={styles.statsGrid}>
                            <div className={styles.statItem}>
                                <span className={styles.statLabel}>Superhero Name:</span>
                                <span className={styles.statValue}>{hero.nickname}</span>
                            </div>
                            <div className={styles.statItem}>
                                <span className={styles.statLabel}>Real Identity:</span>
                                <span className={styles.statValue}>{hero.realName}</span>
                            </div>
                            <div className={styles.statItem}>
                                <span className={styles.statLabel}>Total Images:</span>
                                <span className={styles.statValue}>{hero.images?.length || 0}</span>
                            </div>
                            <div className={styles.statItem}>
                                <span className={styles.statLabel}>Created:</span>
                                <span className={styles.statValue}>
                  {new Date(hero.createdAt).toLocaleDateString()}
                </span>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className={styles.actionButtons}>
                        <Link to={`/edit/${hero.id}`} className={styles.editBtn}>
                            ✏️ Edit Hero
                        </Link>
                        <button
                            onClick={() => navigator.share?.({
                                title: hero.nickname,
                                text: hero.catchPhrase,
                                url: window.location.href
                            })}
                            className={styles.shareBtn}
                        >
                            🔗 Share
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SuperheroDetailPage;
