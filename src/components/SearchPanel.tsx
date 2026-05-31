import type { SearchFilters } from '../App';
import { CPV_GROUPS } from '../data/cpvCodes';

interface SearchPanelProps {
  filters: SearchFilters;
  onFiltersChange: (f: SearchFilters) => void;
  onSearch: () => void;
  loading: boolean;
  cpvCodes: string[];
}

// TED API uses 3-letter ISO country codes in queries
const COUNTRY_OPTIONS = [
  { code: 'SWE', label: '🇸🇪 Sweden' },
  { code: 'NOR', label: '🇳🇴 Norway' },
  { code: 'DNK', label: '🇩🇰 Denmark' },
  { code: 'FIN', label: '🇫🇮 Finland' },
  { code: 'DEU', label: '🇩🇪 Germany' },
  { code: 'NLD', label: '🇳🇱 Netherlands' },
];

const DATE_OPTIONS = [
  { value: 7, label: 'Last 7 days' },
  { value: 14, label: 'Last 14 days' },
  { value: 30, label: 'Last 30 days' },
  { value: 60, label: 'Last 60 days' },
  { value: 90, label: 'Last 90 days' },
];

function toggleArr<T>(arr: T[], val: T): T[] {
  return arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val];
}

export function SearchPanel({ filters, onFiltersChange, onSearch, loading, cpvCodes }: SearchPanelProps) {
  const set = (patch: Partial<SearchFilters>) => onFiltersChange({ ...filters, ...patch });

  return (
    <div className="search-panel">
      <div className="panel-section">
        <label className="section-label">🔎 Free Text Search</label>
        <input
          className="text-input"
          type="text"
          placeholder="e.g. embedded software, signal processing…"
          value={filters.freeText}
          onChange={e => set({ freeText: e.target.value })}
          onKeyDown={e => e.key === 'Enter' && onSearch()}
        />
      </div>

      <div className="panel-section">
        <label className="section-label">📂 CPV Code Groups</label>
        <div className="toggle-hint">Select areas relevant to your services</div>
        <div className="group-toggles">
          {CPV_GROUPS.map(group => (
            <button
              key={group.id}
              className={`group-toggle ${filters.selectedGroups.includes(group.id) ? 'active' : ''}`}
              onClick={() => set({ selectedGroups: toggleArr(filters.selectedGroups, group.id), useOnlyPrimaryCodes: false })}
            >
              <span>{group.icon}</span>
              <span>{group.label}</span>
            </button>
          ))}
        </div>
        <button
          className={`primary-only-btn ${filters.useOnlyPrimaryCodes ? 'active' : ''}`}
          onClick={() => set({
            useOnlyPrimaryCodes: !filters.useOnlyPrimaryCodes,
            selectedGroups: filters.useOnlyPrimaryCodes ? filters.selectedGroups : [],
          })}
        >
          ⭐ Core codes only (71/72/73)
        </button>
        <div className="cpv-count">{cpvCodes.length} CPV codes active</div>
      </div>

      <div className="panel-section">
        <label className="section-label">🌍 Countries</label>
        <div className="checkbox-list">
          {COUNTRY_OPTIONS.map(({ code, label }) => (
            <label key={code} className="checkbox-item">
              <input
                type="checkbox"
                checked={filters.countries.includes(code)}
                onChange={() => set({ countries: toggleArr(filters.countries, code) })}
              />
              {label}
            </label>
          ))}
        </div>
      </div>

      <div className="panel-section">
        <label className="section-label">📅 Publication Window</label>
        <select
          className="select-input"
          value={filters.daysBack}
          onChange={e => set({ daysBack: Number(e.target.value) })}
        >
          {DATE_OPTIONS.map(({ value, label }) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      <div className="panel-section">
        <label className="section-label">📋 Procedure Type</label>
        <div className="checkbox-list">
          {[
            { code: 'OPEN', label: 'Open' },
            { code: 'RESTRICTED', label: 'Restricted' },
          ].map(({ code, label }) => (
            <label key={code} className="checkbox-item">
              <input
                type="checkbox"
                checked={filters.procedureTypes.includes(code)}
                onChange={() => set({ procedureTypes: toggleArr(filters.procedureTypes, code) })}
              />
              {label}
            </label>
          ))}
        </div>
      </div>

      <div className="panel-section">
        <label className="section-label">🎯 Show Relevance</label>
        <div className="checkbox-list">
          {([
            { code: 'high' as const, label: '⬤ High relevance' },
            { code: 'medium' as const, label: '⬤ Medium relevance' },
            { code: 'low' as const, label: '⬤ Other matches' },
          ]).map(({ code, label }) => (
            <label key={code} className={`checkbox-item relevance-${code}`}>
              <input
                type="checkbox"
                checked={filters.relevanceFilter.includes(code)}
                onChange={() => set({ relevanceFilter: toggleArr(filters.relevanceFilter, code) })}
              />
              {label}
            </label>
          ))}
        </div>
      </div>

      <button
        className="search-btn"
        onClick={onSearch}
        disabled={loading}
      >
        {loading ? (
          <><span className="btn-spinner" /> Searching…</>
        ) : (
          '🔍 Search TED'
        )}
      </button>
    </div>
  );
}
