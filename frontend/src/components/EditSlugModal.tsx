import { useState } from 'react';
import api from '../api';
import { UrlResource } from '../types/url';
import './EditSlugModal.css';

interface EditSlugModalProps {
  url: UrlResource;
  onClose: () => void;
  onUpdate: (newSlug: string) => void;
}

export default function EditSlugModal({ url, onClose, onUpdate }: EditSlugModalProps) {
  const [newSlug, setNewSlug] = useState(url.attributes.shortId);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      await api.patch(`/urls/${url.id}`, { newSlug });
      onUpdate(newSlug);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.errors?.[0]?.detail || 'Failed to update slug');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>Edit Short URL</h3>
        <div className="original-url">
          <a href={url.attributes.originalUrl} target="_blank" rel="noopener noreferrer"
            style={{ color: 'black' }}>
            {url.attributes.originalUrl}
          </a>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Short Slug</label>
            <input
              type="text"
              value={newSlug}
              onChange={(e) => setNewSlug(e.target.value)}
              pattern="[a-zA-Z0-9_-]{3,30}"
              required
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="modal-actions">
            <button
              type="button"
              onClick={onClose}
              className="cancel-button"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="save-button"
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}