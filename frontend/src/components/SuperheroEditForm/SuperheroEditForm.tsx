import React from 'react';
import styles from './SuperheroEditForm.module.css';

interface SuperheroEditFormProps {
    formData: {
        nickname: string;
        realName: string;
        originDescription: string;
        superpowers: string;
        catchPhrase: string;
    };
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    disabled?: boolean;
}

const SuperheroEditForm: React.FC<SuperheroEditFormProps> = ({
                                                                 formData,
                                                                 onChange,
                                                                 disabled = false
                                                             }) => {
    return (
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
                        onChange={onChange}
                        disabled={disabled}
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
                        onChange={onChange}
                        disabled={disabled}
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
                    onChange={onChange}
                    disabled={disabled}
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
                    onChange={onChange}
                    rows={4}
                    disabled={disabled}
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
                    onChange={onChange}
                    rows={3}
                    disabled={disabled}
                    required
                />
            </div>
        </div>
    );
};

export default SuperheroEditForm;
