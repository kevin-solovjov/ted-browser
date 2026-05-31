// TED Search API v3 client
// Field names sourced from: https://docs.ted.europa.eu/ODS/latest/reuse/field-list.html
// No API key required for the Search API.

const TED_API_BASE = import.meta.env.VITE_TED_API_BASE || '/api/ted/v3';

export interface TedSearchParams {
  cpvCodes: string[];
  countries?: string[];      // 3-letter ISO: SWE, NOR, etc.
  procedureTypes?: string[];
  daysBack?: number;
  page?: number;
  pageSize?: number;
  freeText?: string;
}

export interface TedNotice {
  publicationNumber: string;
  title: string | null;
  noticeType: string | null;
  publicationDate: string | null;
  deadlineDate: string | null;
  buyerName: string | null;
  buyerCountry: string | null;
  cpvCodes: string[];
  procedureType: string | null;
  estimatedValue: number | null;
  currency: string | null;
  description: string | null;
  ted_url: string;
  relevanceScore: 'high' | 'medium' | 'low';
}

export interface TedSearchResult {
  notices: TedNotice[];
  totalCount: number;
  page: number;
  pageSize: number;
  query: string;
}

// 3-letter ISO → 2-letter for flag display
export const COUNTRY_ISO3_TO_ISO2: Record<string, string> = {
  SWE: 'SE', NOR: 'NO', DNK: 'DK', FIN: 'FI',
  DEU: 'DE', FRA: 'FR', NLD: 'NL', GBR: 'GB',
  ITA: 'IT', ESP: 'ES', POL: 'PL', BEL: 'BE',
  AUT: 'AT', CHE: 'CH', CZE: 'CZ', HUN: 'HU',
};

// These are the ONLY fields we request — verified against the TED field list.
// Using short aliases where available to avoid issues.
const SEARCH_FIELDS = [
  'publication-number',   // OPP-010 — notice pub number
  'notice-title',         // OPP-011 — title
  'publication-date',     // PD alias — date published
  'buyer-name',           // AU alias
  'buyer-country',        // CY alias
  'classification-cpv',   // PC alias — CPV code(s)
  'procedure-type',       // PR alias
  'notice-type',          // TD alias — form type
  'deadline-receipt-tender-date-lot',  // BT-131(d)-Lot — submission deadline
  'description-lot',      // BT-24-Lot — lot description
];

const SUPPORTED_PROCEDURE_TYPES = new Set(['OPEN', 'RESTRICTED']);

function buildQuery(params: TedSearchParams): string {
  const parts: string[] = [];

  // CPV — field name is classification-cpv (alias PC)
  if (params.cpvCodes.length > 0) {
    const cpvPart = params.cpvCodes
      .map(c => `classification-cpv = ${c}`)
      .join(' OR ');
    parts.push(`(${cpvPart})`);
  }

  // Countries (3-letter ISO)
  if (params.countries && params.countries.length > 0) {
    const countryPart = params.countries
      .map(c => `buyer-country = ${c}`)
      .join(' OR ');
    parts.push(`(${countryPart})`);
  }

  // Procedure type
  if (params.procedureTypes && params.procedureTypes.length > 0) {
    const procPart = params.procedureTypes
      .filter(p => SUPPORTED_PROCEDURE_TYPES.has(p))
      .map(p => `procedure-type = ${p}`)
      .join(' OR ');
    if (procPart) parts.push(`(${procPart})`);
  }

  // Date range — publication-date uses YYYYMMDD format (no dashes)
  if (params.daysBack) {
    const since = new Date();
    since.setDate(since.getDate() - params.daysBack);
    const dateStr = since.toISOString().split('T')[0].replace(/-/g, '');
    parts.push(`publication-date >= ${dateStr}`);
  }

  // Free text — search in notice title
  if (params.freeText?.trim()) {
    parts.push(`notice-title ~ "${params.freeText.trim()}"`);
  }

  return parts.join(' AND ');
}

import { RELEVANT_CPV_CODES, SOMEWHAT_RELEVANT_CPV_CODES } from '../data/cpvCodes';
const relevantSet = new Set(RELEVANT_CPV_CODES);
const somewhatSet = new Set(SOMEWHAT_RELEVANT_CPV_CODES);
const LANGUAGE_PRIORITY = ['swe', 'eng', 'nor', 'dan', 'fin', 'deu', 'fra'];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function extractString(value: unknown): string | null {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  if (Array.isArray(value)) {
    for (const item of value) {
      const text = extractString(item);
      if (text) return text;
    }
    return null;
  }
  if (isRecord(value)) {
    for (const lang of LANGUAGE_PRIORITY) {
      const text = extractString(value[lang]);
      if (text) return text;
    }

    for (const item of Object.values(value)) {
      const text = extractString(item);
      if (text) return text;
    }
  }

  return null;
}

function extractStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.flatMap(item => extractStringArray(item));
  }

  const text = extractString(value);
  return text ? [text] : [];
}

function scoreRelevance(cpvCodes: string[]): 'high' | 'medium' | 'low' {
  let best: 'high' | 'medium' | 'low' = 'low';
  for (const code of cpvCodes) {
    // Strip check digit suffix e.g. "72000000-5" → "72000000"
    const base = code.split('-')[0];
    if (relevantSet.has(base)) return 'high';
    if (somewhatSet.has(base)) best = 'medium';
  }
  return best;
}

function normaliseDate(d: unknown): string | null {
  const text = extractString(d);
  if (!text) return null;
  // API may return "20240115" → "2024-01-15"
  if (text.length === 8 && /^\d{8}$/.test(text)) {
    return `${text.slice(0, 4)}-${text.slice(4, 6)}-${text.slice(6, 8)}`;
  }
  return text;
}

function parseNotice(raw: Record<string, unknown>): TedNotice {
  // publication-number
  const pubNum = extractString(raw['publication-number']) ?? '';

  // CPV codes — classification-cpv, may be string or array
  const cpvRaw = raw['classification-cpv'] ?? raw['cpv-code'] ?? [];
  const cpvCodes = extractStringArray(cpvRaw);

  // Buyer country: 3-letter → 2-letter for display
  const buyerCountryRaw = extractString(raw['buyer-country']);
  const buyerCountry = buyerCountryRaw
    ? (COUNTRY_ISO3_TO_ISO2[buyerCountryRaw] ?? buyerCountryRaw)
    : null;

  // Description: may be array of strings per lot
  const description = extractString(raw['description-lot']);

  return {
    publicationNumber: pubNum,
    title: extractString(raw['notice-title']),
    noticeType: extractString(raw['notice-type']),
    publicationDate: normaliseDate(raw['publication-date']),
    deadlineDate: normaliseDate(raw['deadline-receipt-tender-date-lot']),
    buyerName: extractString(raw['buyer-name']),
    buyerCountry,
    cpvCodes,
    procedureType: extractString(raw['procedure-type']),
    estimatedValue: null,   // not available as a simple field in eForms search
    currency: null,
    description,
    ted_url: `https://ted.europa.eu/en/notice/-/detail/${pubNum}`,
    relevanceScore: scoreRelevance(cpvCodes),
  };
}

export async function searchTedNotices(params: TedSearchParams): Promise<TedSearchResult> {
  const query = buildQuery(params);
  const page = params.page ?? 1;
  const limit = Math.min(params.pageSize ?? 20, 250);

  const requestBody = {
    query,
    fields: SEARCH_FIELDS,
    page,
    limit,
    scope: 'ALL',
    paginationMode: 'PAGE_NUMBER',
  };

  const response = await fetch(`${TED_API_BASE}/notices/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    let detail = '';
    try { detail = await response.text(); } catch { /* ignore */ }
    throw new Error(`TED API ${response.status}: ${detail || response.statusText}`);
  }

  const data = await response.json() as {
    notices?: Record<string, unknown>[];
    results?: Record<string, unknown>[];
    totalNoticeCount?: number;
    total?: number;
  };

  const rawNotices = data.notices ?? data.results ?? [];
  const notices = rawNotices.map(parseNotice);

  return {
    notices,
    totalCount: data.totalNoticeCount ?? data.total ?? notices.length,
    page,
    pageSize: limit,
    query,
  };
}
