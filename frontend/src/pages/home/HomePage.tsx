import React, {useState, useEffect, useCallback, useRef} from 'react';
import {Link} from 'react-router-dom';
import styles from './HomePage.module.css';
import type {Superhero} from '../../types/Superhero';
import type {SuperheroResponse} from '../../types/SuperheroResponse';
import SuperheroCard from "../../components/SuperheroCard/SuperheroCard.tsx";

const HomePage = () => {
    const [superheroes, setSuperheroes] = useState<Superhero[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [searchLoading, setSearchLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');

    const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
    const abortController = useRef<AbortController | null>(null);

    const itemsPerPage = 6;

    useEffect(() => {
        if (debounceTimeout.current) {
            clearTimeout(debounceTimeout.current);
        }

        debounceTimeout.current = setTimeout(() => {
            setDebouncedQuery(searchQuery);
        }, 300);

        return () => {
            if (debounceTimeout.current) {
                clearTimeout(debounceTimeout.current);
            }
        };
    }, [searchQuery]);

    useEffect(() => {
        fetchSuperheroes(currentPage, debouncedQuery);
    }, [currentPage, debouncedQuery]);

    useEffect(() => {
        if (debouncedQuery !== searchQuery) {
            setCurrentPage(1);
        }
    }, [debouncedQuery]);

    const fetchSuperheroes = useCallback(async (page: number, search: string = '') => {
        try {
            if (abortController.current) {
                abortController.current.abort();
            }

            abortController.current = new AbortController();

            if (!superheroes.length && !search) {
                setLoading(true);
            } else if (search) {
                setSearchLoading(true);
            }

            setError(null);

            const searchParams = new URLSearchParams({
                page: page.toString(),
                limit: itemsPerPage.toString(),
            });

            if (search.trim()) {
                searchParams.append('search', search.trim());
            }

            const response = await fetch(
                `http://localhost:4000/api/superhero?${searchParams}`,
                {signal: abortController.current.signal}
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: SuperheroResponse = await response.json();
            setSuperheroes(data.superheroes || []);
            setTotalPages(data.totalPages || 0);
            setTotal(data.total || 0);

        } catch (err) {
            if (err instanceof Error && err.name === 'AbortError') {
                return;
            }

            console.error('Error fetching superheroes:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch superheroes');
            setSuperheroes([]);
        } finally {
            setLoading(false);
            setSearchLoading(false);
        }
    }, []);

    const handlePageChange = useCallback((page: number) => {
        if (page >= 1 && page <= totalPages && page !== currentPage) {
            setCurrentPage(page);
        }
    }, [currentPage, totalPages]);

    const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchQuery(value);

        if (value.trim()) {
            setSearchLoading(true);
        }
    }, []);

    const clearSearch = useCallback(() => {
        setSearchQuery('');
        setDebouncedQuery('');
        setCurrentPage(1);
        setSearchLoading(false);
    }, []);

    const renderPagination = () => {
        const pages = [];
        const maxVisiblePages = 5;

        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        // Previous pages indicator
        if (startPage > 1) {
            pages.push(
                <button
                    key={1}
                    onClick={() => handlePageChange(1)}
                    className={styles.paginationBtn}
                >
                    1
                </button>
            );
            if (startPage > 2) {
                pages.push(
                    <span key="dots1" className={styles.paginationDots}>...</span>
                );
            }
        }

        // Page numbers
        for (let i = startPage; i <= endPage; i++) {
            pages.push(
                <button
                    key={i}
                    onClick={() => handlePageChange(i)}
                    className={`${styles.paginationBtn} ${currentPage === i ? styles.active : ''}`}
                >
                    {i}
                </button>
            );
        }

        // Next pages indicator
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                pages.push(
                    <span key="dots2" className={styles.paginationDots}>...</span>
                );
            }
            pages.push(
                <button
                    key={totalPages}
                    onClick={() => handlePageChange(totalPages)}
                    className={styles.paginationBtn}
                >
                    {totalPages}
                </button>
            );
        }

        return pages;
    };

    if (loading) {
        return (
            <div className={styles.homePage}>
                <div className={styles.loading}>
                    <div className={styles.spinner}></div>
                    <p>Loading superheroes...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.homePage}>
                <div className={styles.error}>
                    <h2>Error</h2>
                    <p>{error}</p>
                    <button
                        onClick={() => fetchSuperheroes(currentPage, debouncedQuery)}
                        className={styles.retryBtn}
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.homePage}>
            <header className={styles.pageHeader}>
                <h1>Superhero Database</h1>
                <Link to="/create" className={styles.createBtn}>
                    + Add New Superhero
                </Link>
            </header>

            {/* Search Bar */}
            <div className={styles.searchSection}>
                <div className={styles.searchBar}>
                    <input
                        type="text"
                        placeholder="Search superheroes by name..."
                        value={searchQuery}
                        onChange={handleSearchChange}
                        className={styles.searchInput}
                    />
                    <div className={styles.searchActions}>
                        {searchLoading && (
                            <div className={styles.searchSpinner}></div>
                        )}
                        {searchQuery && (
                            <button
                                onClick={clearSearch}
                                className={styles.clearSearch}
                                aria-label="Clear search"
                            >
                                ✕
                            </button>
                        )}
                    </div>
                </div>
                {debouncedQuery && (
                    <p className={styles.searchInfo}>
                        Search results for "{debouncedQuery}"
                    </p>
                )}
            </div>

            {/* Results Info */}
            <div className={styles.resultsInfo}>
                <p>
                    Showing {superheroes.length} of {total} superheroes
                    {totalPages > 1 && ` (Page ${currentPage} of ${totalPages})`}
                </p>
            </div>

            {/* Heroes Grid */}
            <div className={styles.superheroesGrid}>
                {superheroes.length === 0 ? (
                    <div className={styles.noData}>
                        {debouncedQuery ? (
                            <>
                                <h3>🔍 No Results Found</h3>
                                <p>No superheroes found matching "{debouncedQuery}"</p>
                                <button
                                    onClick={clearSearch}
                                    className={styles.clearSearchBtn}
                                >
                                    Clear Search
                                </button>
                            </>
                        ) : (
                            <>
                                <h3>No Superheroes Yet</h3>
                                <p>Be the first to create a superhero!</p>
                                <Link to="/create" className={styles.createLink}>
                                    Create Your First Superhero
                                </Link>
                            </>
                        )}
                    </div>
                ) : (
                    superheroes.map((hero) => (
                        <SuperheroCard key={hero.id} hero={hero}/>
                    ))
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className={styles.paginationContainer}>
                    <div className={styles.pagination}>
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className={`${styles.paginationBtn} ${styles.prev}`}
                            aria-label="Previous page"
                        >
                            ← Previous
                        </button>

                        {renderPagination()}

                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className={`${styles.paginationBtn} ${styles.next}`}
                            aria-label="Next page"
                        >
                            Next →
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HomePage;
