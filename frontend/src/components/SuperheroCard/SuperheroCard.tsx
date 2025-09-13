import React, { memo, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import styles from './SuperheroCard.module.css';

interface Superhero {
    id: number;
    nickname: string;
    realName: string;
    images: string[];
}

interface SuperheroCardProps {
    hero: Superhero;
}

const SuperheroCard: React.FC<SuperheroCardProps> = memo(({ hero }) => {
    const [hasImageError, setHasImageError] = useState(false);

    const handleImageError = useCallback(() => {
        console.warn('Failed to load hero image for:', hero.nickname);
        setHasImageError(true);
    }, [hero.nickname]);

    return (
        <div className={styles.superheroCard}>
            <Link to={`/superhero/${hero.id}`} className={styles.cardLink}>
                <div className={styles.heroImage}>
                    {hero.images && hero.images.length > 0 && !hasImageError ? (
                        <img
                            src={hero.images[0]}
                            alt={`${hero.nickname} - ${hero.realName}`}
                            loading="lazy"
                            onError={handleImageError}
                            // onLoad={() => console.log('Image loaded for:', hero.nickname)}
                        />
                    ) : (
                        <div className={styles.noImage}>
                            <span>🦸‍♂️</span>
                            <p>No Image</p>
                        </div>
                    )}
                </div>
                <div className={styles.heroInfo}>
                    <h3 className={styles.heroNickname}>{hero.nickname}</h3>
                    <p className={styles.heroRealName}>{hero.realName}</p>
                </div>
            </Link>
        </div>
    );
});

SuperheroCard.displayName = 'SuperheroCard';

export default SuperheroCard;
