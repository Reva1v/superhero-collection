import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from './Layout.module.css';

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    const location = useLocation();

    return (
        <div className={styles.layout}>
            <nav className={styles.navbar}>
                <div className={styles.navContainer}>
                    <Link to="/" className={styles.logo}>
                        Superhero DB
                    </Link>
                    <div className={styles.navLinks}>
                        <Link
                            to="/"
                            className={`${styles.navLink} ${location.pathname === '/' ? styles.active : ''}`}
                        >
                            Home
                        </Link>
                        <Link
                            to="/create"
                            className={`${styles.navLink} ${location.pathname === '/create' ? styles.active : ''}`}
                        >
                            Add Hero
                        </Link>
                    </div>
                </div>
            </nav>

            <main className={styles.main}>
                {children}
            </main>

            <footer className={styles.footer}>
                <p>&copy; 2025 Superhero Database. Made with ❤️ and React</p>
            </footer>
        </div>
    );
};

export default Layout;
