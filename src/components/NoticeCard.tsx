import type { TedNotice } from '../api/ted';
import { getCodeLabel } from '../data/cpvCodes';

interface NoticeCardProps {
  notice: TedNotice;
  onClick: () => void;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  const dateOnly = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (dateOnly) return `${dateOnly[1]}-${dateOnly[2]}-${dateOnly[3]}`;
  const compactDate = dateStr.match(/^(\d{4})(\d{2})(\d{2})$/);
  if (compactDate) return `${compactDate[1]}-${compactDate[2]}-${compactDate[3]}`;
  try {
    const date = new Date(dateStr);
    return Number.isNaN(date.getTime()) ? 'â€”' : date.toLocaleDateString('sv-SE');
  } catch {
    return 'â€”';
  }
}

function formatValue(val: number | null, currency: string | null): string {
  if (!val) return '—';
  const fmt = new Intl.NumberFormat('sv-SE', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  return `${fmt.format(val)} ${currency || 'EUR'}`;
}

const COUNTRY_FLAGS: Record<string, string> = {
  SE: '🇸🇪', NO: '🇳🇴', DK: '🇩🇰', FI: '🇫🇮',
  DE: '🇩🇪', FR: '🇫🇷', NL: '🇳🇱', GB: '🇬🇧',
  IT: '🇮🇹', ES: '🇪🇸', PL: '🇵🇱', BE: '🇧🇪',
};

export function NoticeCard({ notice, onClick }: NoticeCardProps) {
  const flag = notice.buyerCountry ? (COUNTRY_FLAGS[notice.buyerCountry] || '🌍') : '🌍';
  const cpvLabels = notice.cpvCodes.slice(0, 3).map(c => getCodeLabel(c));

  return (
    <article
      className={`notice-card relevance-${notice.relevanceScore}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onClick()}
    >
      <div className="card-header">
        <div className="card-badges">
          <span className={`relevance-badge ${notice.relevanceScore}`}>
            {notice.relevanceScore === 'high' ? '★ High' : notice.relevanceScore === 'medium' ? '◆ Medium' : '○ Other'}
          </span>
          {notice.procedureType && (
            <span className="procedure-badge">{notice.procedureType}</span>
          )}
        </div>
        <span className="notice-country">{flag} {notice.buyerCountry}</span>
      </div>

      <h3 className="card-title">
        {notice.title || notice.publicationNumber || 'Untitled notice'}
      </h3>

      {notice.buyerName && (
        <p className="card-buyer">🏛 {notice.buyerName}</p>
      )}

      {notice.description && (
        <p className="card-description">
          {notice.description.slice(0, 200)}{notice.description.length > 200 ? '…' : ''}
        </p>
      )}

      <div className="card-cpv-tags">
        {cpvLabels.map((label, i) => (
          <span key={i} className="cpv-tag">{label}</span>
        ))}
        {notice.cpvCodes.length > 3 && (
          <span className="cpv-tag more">+{notice.cpvCodes.length - 3} more</span>
        )}
      </div>

      <div className="card-footer">
        <div className="card-meta">
          <span>📅 {formatDate(notice.publicationDate)}</span>
          {notice.deadlineDate && <span>⏰ Deadline: {formatDate(notice.deadlineDate)}</span>}
          {notice.estimatedValue && <span>💰 {formatValue(notice.estimatedValue, notice.currency)}</span>}
        </div>
        <span className="card-id">{notice.publicationNumber}</span>
      </div>
    </article>
  );
}
