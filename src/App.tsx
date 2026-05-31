import { useState, useCallback, useEffect } from 'react';
import { searchTedNotices } from './api/ted';
import type { TedNotice, TedSearchResult } from './api/ted';
import { CPV_GROUPS, PRIMARY_CPV_CODES } from './data/cpvCodes';
import { SearchPanel } from './components/SearchPanel';
import { NoticeCard } from './components/NoticeCard';
import { NoticeModal } from './components/NoticeModal';
import { Pagination } from './components/Pagination';
import './App.css';

const logoUrl = `${import.meta.env.BASE_URL}logo_togethertech.png`;

export interface SearchFilters {
  selectedGroups: string[];
  customCpvCodes: string[];
  countries: string[];
  procedureTypes: string[];
  daysBack: number;
  freeText: string;
  relevanceFilter: ('high' | 'medium' | 'low')[];
  useOnlyPrimaryCodes: boolean;
}

const DEFAULT_FILTERS: SearchFilters = {
  selectedGroups: ['engineering', 'it_software', 'rnd'],
  customCpvCodes: [],
  countries: ['SWE', 'NOR'],
  procedureTypes: ['OPEN'],
  daysBack: 7,
  freeText: '',
  relevanceFilter: ['high', 'medium'],
  useOnlyPrimaryCodes: false,
};

function App() {
  const [filters, setFilters] = useState<SearchFilters>(DEFAULT_FILTERS);
  const [result, setResult] = useState<TedSearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [selectedNotice, setSelectedNotice] = useState<TedNotice | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const getCpvCodesForFilters = useCallback((f: SearchFilters): string[] => {
    if (f.useOnlyPrimaryCodes) return PRIMARY_CPV_CODES;
    const codes = new Set<string>([...f.customCpvCodes]);
    for (const groupId of f.selectedGroups) {
      const group = CPV_GROUPS.find(g => g.id === groupId);
      if (group) {
        for (const code of group.codes) codes.add(code);
      }
    }
    return Array.from(codes);
  }, []);

  const runSearch = useCallback(async (currentFilters: SearchFilters, currentPage: number) => {
    const cpvCodes = getCpvCodesForFilters(currentFilters);
    if (cpvCodes.length === 0) {
      setError('Please select at least one CPV code group.');
      return;
    }
    setLoading(true);
    setError(null);
    setHasSearched(true);
    try {
      const res = await searchTedNotices({
        cpvCodes,
        countries: currentFilters.countries,
        procedureTypes: currentFilters.procedureTypes,
        daysBack: currentFilters.daysBack,
        freeText: currentFilters.freeText || undefined,
        page: currentPage,
        pageSize: 20,
      });
      setResult(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Search failed. Please try again.');
      setResult(null);
    } finally {
      setLoading(false);
    }
  }, [getCpvCodesForFilters]);

  const handleSearch = useCallback(() => {
    setPage(1);
    runSearch(filters, 1);
  }, [filters, runSearch]);

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
    runSearch(filters, newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [filters, runSearch]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setPage(1);
      runSearch(filters, 1);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [filters, runSearch]);

  const filteredNotices = result?.notices.filter(n =>
    filters.relevanceFilter.includes(n.relevanceScore)
  ) ?? [];

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-inner">
          <div className="header-brand">
            <img className="header-logo" src={logoUrl} alt="Together Tech" />
            <div>
              <h1>TED Notice Browser</h1>
              <p className="header-sub">European procurement notices</p>
            </div>
          </div>
          {result && !loading && (
            <div className="header-stats">
              <span className="stat-badge">{result.totalCount.toLocaleString()} notices found</span>
              <span className="stat-badge secondary">{filteredNotices.length} shown</span>
            </div>
          )}
        </div>
      </header>

      <div className="app-body">
        <aside className="sidebar">
          <SearchPanel
            filters={filters}
            onFiltersChange={setFilters}
            onSearch={handleSearch}
            loading={loading}
            cpvCodes={getCpvCodesForFilters(filters)}
          />
        </aside>

        <main className="main-content">
          {!hasSearched && !loading && (
            <div className="empty-state">
              <div className="empty-icon">🔍</div>
              <h2>Ready to search</h2>
              <p>Configure your filters and click Search to find relevant tenders.</p>
            </div>
          )}

          {loading && (
            <div className="loading-state">
              <div className="spinner" />
              <p>Searching TED database…</p>
              <p className="loading-sub">Querying {getCpvCodesForFilters(filters).length} CPV codes</p>
            </div>
          )}

          {error && !loading && (
            <div className="error-state">
              <div className="error-icon">⚠️</div>
              <h3>Search failed</h3>
              <p>{error}</p>
              <button className="btn-primary" onClick={handleSearch}>Retry</button>
            </div>
          )}

          {!loading && !error && result && (
            <>
              <div className="results-header">
                <div className="results-meta">
                  <span className="results-count">{result.totalCount.toLocaleString()} total results</span>
                  <span className="results-query" title={result.query}>
                    {result.query.length > 90 ? result.query.slice(0, 90) + '…' : result.query}
                  </span>
                </div>
                <div className="relevance-legend">
                  <span className="dot high" /> High
                  <span className="dot medium" /> Medium
                  <span className="dot low" /> Other
                </div>
              </div>

              {filteredNotices.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📭</div>
                  <h2>No matching notices</h2>
                  <p>Try broadening your filters — more countries, longer date range, or more CPV groups.</p>
                </div>
              ) : (
                <div className="notices-grid">
                  {filteredNotices.map(notice => (
                    <NoticeCard
                      key={notice.publicationNumber}
                      notice={notice}
                      onClick={() => setSelectedNotice(notice)}
                    />
                  ))}
                </div>
              )}

              <Pagination
                page={page}
                pageSize={20}
                total={result.totalCount}
                onChange={handlePageChange}
              />
            </>
          )}
        </main>
      </div>

      {selectedNotice && (
        <NoticeModal notice={selectedNotice} onClose={() => setSelectedNotice(null)} />
      )}
    </div>
  );
}

export default App;

