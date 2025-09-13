import React from 'react';
import styles from './EditFormActions.module.css';

interface EditFormActionsProps {
    onDelete: () => void;
    onReset: () => void;
    onCancel: () => void;
    onSubmit: (e: React.FormEvent) => void;
    hasChanges: boolean;
    saving: boolean;
    deleting: boolean;
}

const EditFormActions: React.FC<EditFormActionsProps> = ({
                                                             onDelete,
                                                             onReset,
                                                             onCancel,
                                                             onSubmit,
                                                             hasChanges,
                                                             saving,
                                                             deleting
                                                         }) => {
    return (
        <div className={styles.formActions}>
            <div className={styles.leftActions}>
                <button
                    type="button"
                    onClick={onDelete}
                    className={styles.deleteBtn}
                    disabled={saving || deleting}
                >
                    {deleting ? '🗑️ Deleting...' : '🗑️ Delete Hero'}
                </button>
                <button
                    type="button"
                    onClick={onReset}
                    className={styles.resetBtn}
                    disabled={saving || deleting || !hasChanges}
                >
                    🔄 Reset Changes
                </button>
            </div>

            <div className={styles.rightActions}>
                <button
                    type="button"
                    onClick={onCancel}
                    className={styles.cancelBtn}
                    disabled={saving || deleting}
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    onClick={onSubmit}
                    disabled={saving || deleting || !hasChanges}
                    className={styles.saveBtn}
                >
                    {saving ? '💾 Saving...' : hasChanges ? '💾 Save Changes' : '✅ No Changes'}
                </button>
            </div>
        </div>
    );
};

export default EditFormActions;
