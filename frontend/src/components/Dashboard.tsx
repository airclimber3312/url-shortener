import { useEffect, useState } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { UrlResource } from '../types/url';
import EditSlugModal from './EditSlugModal';

interface Analytics {
  totalVisits: number;
  lastVisit: string;
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [selectedUrl, setSelectedUrl] = useState<UrlResource | null>(null);
  const [urls, setUrls] = useState<UrlResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentAnalytics, setCurrentAnalytics] = useState<Analytics | null>(null);

  useEffect(() => {
    const fetchUrls = async () => {
      try {
        const response = await api.get('/urls');
        setUrls(response.data.data);
      } catch (err) {
        setError('Failed to fetch URLs');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchUrls();
    }
  }, [user]);

  const handleDelete = async (urlId: string) => {
    try {
      await api.delete(`/urls/${urlId}`);
      setUrls(urls.filter(url => url.id !== urlId));
    } catch (err) {
      setError('Failed to delete URL');
    }
  };

  const fetchAnalytics = async (urlId: string) => {
    try {
      const response = await api.get(`/urls/${urlId}/analytics`);
      setCurrentAnalytics(response.data.meta);
    } catch (err) {
      setError('Failed to fetch analytics');
    }
  };

  const copyToClipboard = (shortId: string) => {
    navigator.clipboard.writeText(`${shortId}`);
  };

  if (!user) {
    return <div>Please login to view dashboard</div>;
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Your Short URLs</h1>
        <button onClick={logout} className="logout-button">
          Logout
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading">Loading URLs...</div>
      ) : (
        <div className="urls-list">
          <table className="url-table">
            <thead>
              <tr>
                <th>Original URL</th>
                <th>Short URL</th>
                <th>Clicks</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {urls.map(url => (
                <tr key={url.id}>
                  <td>
                    <a
                      href={(() => {
                        const cleanHost = url.attributes.host.replace(/\/+$/, '');
                        const hasProtocol = /^(https?:)?\/\//i.test(cleanHost);
                        const protocol = cleanHost.startsWith('https') ? 'https://' : 'http://';
                        return `${hasProtocol ? cleanHost : protocol + cleanHost}/${url.attributes.shortId}`;
                      })()}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: 'black' }}
                      onClick={(e) => {
                        e.preventDefault();
                        window.open(e.currentTarget.href);
                      }}
                    >
                      {url.attributes.originalUrl}
                    </a>
                  </td>
                  <td>
                    <div className="short-url-cell">
                      <a
                        href={(() => {
                          const cleanHost = url.attributes.host.replace(/\/+$/, '');
                          const hasProtocol = /^(https?:)?\/\//i.test(cleanHost);
                          const protocol = cleanHost.startsWith('https') ? 'https://' : 'http://';
                          return `${hasProtocol ? cleanHost : protocol + cleanHost}/${url.attributes.shortId}`;
                        })()}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {url.attributes.shortId}
                      </a>
                      <button
                        onClick={() => copyToClipboard(`${url.attributes.host}/${url.attributes.shortId}`)}
                        className="copy-button"
                      >
                        Copy
                      </button>
                    </div>
                  </td>
                  <td>{url.attributes.clicks}</td>
                  <td>
                    {new Date(url.attributes.createdAt).toLocaleDateString()}
                  </td>
                  <td>
                    <button
                      onClick={() => fetchAnalytics(url.id)}
                      className="analytics-button"
                    >
                      Analytics
                    </button>
                    <button
                      onClick={() => handleDelete(url.id)}
                      className="delete-button"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => setSelectedUrl(url)}
                      className="edit-button"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {currentAnalytics && (
            <div className="analytics-panel">
              <h3>Analytics</h3>
              <p>Total Visits: {currentAnalytics.totalVisits}</p>
              <p>
                Last Visit: {new Date(currentAnalytics.lastVisit).toLocaleString()}
              </p>
            </div>
          )}
        </div>
      )}
      {selectedUrl && (
        <EditSlugModal
          url={selectedUrl}
          onClose={() => setSelectedUrl(null)}
          onUpdate={(newSlug: string) => {
            setUrls(urls.map(u =>
              u.id === selectedUrl.id ? { ...u, attributes: { ...u.attributes, shortId: newSlug } } : u
            ));
            setSelectedUrl(null);
          }}
        />
      )}
    </div>
  );
}