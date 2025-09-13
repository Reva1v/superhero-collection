import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './PageHeader.module.css';

interface PageHeaderProps {
    title: string;
    subtitle?: string;
    backButtonText?: string;
    backButtonPath?: string;
    onBackClick?: () => void;
    backgroundColor?: 'primary' | 'secondary' | 'accent' | 'danger';
    icon?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({
                                                   title,
                                                   subtitle,
                                                   backButtonText = '← Back',
                                                   backButtonPath,
                                                   onBackClick,
                                                   backgroundColor = 'primary',
                                                   icon
                                               }) => {
    const navigate = useNavigate();

    const handleBackClick = () => {
        if (onBackClick) {
            onBackClick();
        } else if (backButtonPath) {
            navigate(backButtonPath);
        } else {
            navigate(-1); // Go back in history
        }
    };

    return (
        <header className={`${styles.header} ${styles[backgroundColor]}`}>
            <div className={styles.headerContent}>
                <button onClick={handleBackClick} className={styles.backButton}>
                    {backButtonText}
                </button>
                <div className={styles.title}>
                    <h1>
                        {icon && <span className={styles.icon}>{icon}</span>}
                        {title}
                    </h1>
                    {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
                </div>
            </div>
        </header>
    );
};

export default PageHeader;
