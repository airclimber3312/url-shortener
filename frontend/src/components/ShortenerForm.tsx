import { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { ApiResponse, UrlResource } from '../types/url';

import './ShortenerForm.css';

export default function ShortenerForm() {
  const { user } = useAuth();
  const [url, setUrl] = useState('');
  const [shortUrl, setShortUrl] = useState<UrlResource | null>(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  const validateUrl = (input: string): boolean => {
    try {
      new URL(input);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setCopied(false);

    if (!validateUrl(url)) {
      setError('Please enter a valid URL starting with http:// or https://');
      return;
    }

    if (!user) {
      setError('You must be logged in to shorten URLs');
      return;
    }

    try {
      setIsLoading(true);
      const response = await api.post<ApiResponse<UrlResource>>(
        '/urls/shorten',
        { originalUrl: url },
      );

      if (response.data.errors) {
        setError(response.data.errors[0].detail);
        return;
      }

      if (response.data.data) {
        setShortUrl(response.data.data);
        setUrl('');
      }
    } catch (err: any) {
      setError('Failed to shorten URL');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!shortUrl) return;
    try {
      await navigator.clipboard.writeText(
        `${shortUrl.attributes.host}/${shortUrl.attributes.shortId}`
      );
      setCopied(true);
    } catch (err) {
      setError('Failed to copy to clipboard');
    }
  };

  return (
    <div className="shortener-form">
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter your URL here..."
            aria-label="URL to shorten"
            required
          />
          <button
            type="submit"
            disabled={isLoading}
            aria-busy={isLoading}
          >
            {isLoading ? 'Shortening...' : 'Shorten URL'}
          </button>
        </div>
        {error && <div className="error-message" role="alert">{error}</div>}
      </form>

      {shortUrl && (
        <div className="result-container">
          <div className="result-header">
            <h3>Your Shortened URL:</h3>
            <span className="visit-count">
              Visits: {shortUrl.attributes.clicks}
            </span>
          </div>
          <div className="result-content">
            <a
              href={(() => {
                const cleanHost = shortUrl.attributes.host.replace(/\/+$/, '');
                const hasProtocol = /^(https?:)?\/\//i.test(cleanHost);
                const protocol = cleanHost.startsWith('https') ? 'https://' : 'http://';
                return `${hasProtocol ? cleanHost : protocol + cleanHost}/${shortUrl.attributes.shortId}`;
              })()}
              target="_blank"
              rel="noopener noreferrer"
              className="short-url"
              onClick={(e) => {
                e.preventDefault();
                window.open(e.currentTarget.href);
              }}
            >
              {shortUrl.attributes.host}/{shortUrl.attributes.shortId}
            </a>
            <button
              onClick={handleCopy}
              className="copy-button"
              aria-live="polite"
            >
              {copied ? '✓ Copied!' : 'Copy URL'}
            </button>
          </div>
          {/* <div className="metadata">
            <time dateTime={shortUrl.createdAt.toISOString()}>
              Created: {new Date(shortUrl.createdAt).toLocaleDateString()}
            </time>
          </div> */}
        </div>
      )}
    </div>
  );
}