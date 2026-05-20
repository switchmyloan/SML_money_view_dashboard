import Api from "../api";

const base = `/disbursal`;

// All Disbursal calls accept an optional AbortController `signal` so the
// Disbursal Dashboard can cancel in-flight requests when the user rapidly
// changes filters (date range / lender / employment / source). Without this,
// stale responses can arrive after newer ones and overwrite chart data.
// `utmSource` filters disbursals via the offerLeads / shortOfferLeads JOIN
// when scope is 'mv' or 'short' respectively.

export const getDisbursalKpis = async ({ range = '7D', fromDate, toDate, scope, utmSource, utmMedium, signal } = {}) =>
    Api().get(`${base}/kpis`, {
        params: { range, fromDate, toDate, scope, utmSource, utmMedium },
        skipAdminAppend: true,
        signal,
    });

export const getDisbursalTrend = async ({ range = '30D', granularity = 'daily', fromDate, toDate, scope, utmSource, utmMedium, signal } = {}) =>
    Api().get(`${base}/trend`, {
        params: { range, granularity, fromDate, toDate, scope, utmSource, utmMedium },
        skipAdminAppend: true,
        signal,
    });

export const getDisbursalLenderStats = async ({ range = '7D', fromDate, toDate, scope, utmSource, utmMedium, signal } = {}) =>
    Api().get(`${base}/lender-stats`, {
        params: { range, fromDate, toDate, scope, utmSource, utmMedium },
        skipAdminAppend: true,
        signal,
    });

export const getDisbursalLenderBreakdown = async ({ range = '7D', fromDate, toDate, scope, utmSource, utmMedium, lender, signal } = {}) =>
    Api().get(`${base}/lender-breakdown`, {
        params: { range, fromDate, toDate, scope, utmSource, utmMedium, lender },
        skipAdminAppend: true,
        signal,
    });

export const getDisbursalEmploymentMix = async ({ range = '7D', fromDate, toDate, scope, utmSource, utmMedium, signal } = {}) =>
    Api().get(`${base}/employment-mix`, {
        params: { range, fromDate, toDate, scope, utmSource, utmMedium },
        skipAdminAppend: true,
        signal,
    });

export const getDisbursalTransactions = async ({
    currentPage = 1,
    perPage = 10,
    search = '',
    range = '7D',
    fromDate,
    toDate,
    lender,
    employmentType,
    scope,
    utmSource,
    utmMedium,
    signal,
} = {}) =>
    Api().get(`${base}/transactions`, {
        params: { currentPage, perPage, search, range, fromDate, toDate, lender, employmentType, scope, utmSource, utmMedium },
        skipAdminAppend: true,
        signal,
    });

export const getDisbursalFilterOptions = async ({ scope, signal } = {}) =>
    Api().get(`${base}/filter-options`, {
        params: { scope },
        skipAdminAppend: true,
        signal,
    });
