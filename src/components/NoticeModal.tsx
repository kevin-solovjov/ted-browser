import { useEffect } from 'react';
import type { TedNotice } from '../api/ted';
import { getCodeLabel } from '../data/cpvCodes';

interface NoticeModalProps {
  notice: TedNotice;
  onClose: () => void;
}

const COUNTRY_NAMES: Record<string, string> = {
  SE: 'Sweden', NO: 'Norway', DK: 'Denmark', FI: 'Finland',
  DE: 'Germany', FR: 'France', NL: 'Netherlands', GB: 'United Kingdom',
};

function formatDate(d: string | null) {
  if (!d) return '—';
  const dateOnly = d.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (dateOnly) return `${dateOnly[1]}-${dateOnly[2]}-${dateOnly[3]}`;
  const compactDate = d.match(/^(\d{4})(\d{2})(\d{2})$/);
  if (compactDate) return `${compactDate[1]}-${compactDate[2]}-${compactDate[3]}`;
  try {
    const date = new Date(d);
    return Number.isNaN(date.getTime())
      ? 'â€”'
      : date.toLocaleDateString('sv-SE', { year: 'numeric', month: 'long', day: 'numeric' });
  }
  catch { return 'â€”'; }
}

function formatValue(val: number | null, currency: string | null) {
  if (!val) return '—';
  return new Intl.NumberFormat('sv-SE', { minimumFractionDigits: 0 }).format(val) + ' ' + (currency || 'EUR');
}

export function NoticeModal({ notice, onClose }: NoticeModalProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-content" role="dialog" aria-modal="true">
        <div className="modal-header">
          <div className="modal-badges">
            <span className={`relevance-badge ${notice.relevanceScore}`}>
              {notice.relevanceScore === 'high' ? '★ High relevance' : notice.relevanceScore === 'medium' ? '◆ Medium relevance' : '○ Other match'}
            </span>
            {notice.procedureType && <span className="procedure-badge">{notice.procedureType}</span>}
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <h2 className="modal-title">{notice.title || notice.publicationNumber}</h2>

          <div className="modal-grid">
            <div className="info-block">
              <span className="info-label">Publication Number</span>
              <span className="info-value mono">{notice.publicationNumber}</span>
            </div>
            <div className="info-block">
              <span className="info-label">Published</span>
              <span className="info-value">{formatDate(notice.publicationDate)}</span>
            </div>
            {notice.deadlineDate && (
              <div className="info-block">
                <span className="info-label">Deadline</span>
                <span className="info-value deadline">{formatDate(notice.deadlineDate)}</span>
              </div>
            )}
            {notice.buyerName && (
              <div className="info-block">
                <span className="info-label">Contracting Authority</span>
                <span className="info-value">{notice.buyerName}</span>
              </div>
            )}
            {notice.buyerCountry && (
              <div className="info-block">
                <span className="info-label">Country</span>
                <span className="info-value">{COUNTRY_NAMES[notice.buyerCountry] || notice.buyerCountry}</span>
              </div>
            )}
            {notice.noticeType && (
              <div className="info-block">
                <span className="info-label">Notice Type</span>
                <span className="info-value">{notice.noticeType}</span>
              </div>
            )}
            {notice.estimatedValue && (
              <div className="info-block">
                <span className="info-label">Estimated Value</span>
                <span className="info-value value">{formatValue(notice.estimatedValue, notice.currency)}</span>
              </div>
            )}
          </div>

          {notice.description && (
            <div className="modal-section">
              <h4>Description</h4>
              <p className="modal-description">{notice.description}</p>
            </div>
          )}

          <div className="modal-section">
            <h4>CPV Codes</h4>
            <div className="modal-cpv-list">
              {notice.cpvCodes.map(code => (
                <div key={code} className="modal-cpv-item">
                  <span className="cpv-code-num">{code}</span>
                  <span className="cpv-code-label">{getCodeLabel(code)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <a
            href={notice.ted_url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
          >
            View on TED ↗
          </a>
          <button className="btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
