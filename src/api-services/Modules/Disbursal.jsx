import Api from "../api";

const base = `/disbursal`;

export const getDisbursalKpis = async ({ range = '7D', fromDate, toDate, scope } = {}) =>
    Api().get(`${base}/kpis`, {
        params: { range, fromDate, toDate, scope },
        skipAdminAppend: true,
    });

export const getDisbursalTrend = async ({ range = '30D', granularity = 'daily', fromDate, toDate, scope } = {}) =>
    Api().get(`${base}/trend`, {
        params: { range, granularity, fromDate, toDate, scope },
        skipAdminAppend: true,
    });

export const getDisbursalLenderStats = async ({ range = '7D', fromDate, toDate, scope } = {}) =>
    Api().get(`${base}/lender-stats`, {
        params: { range, fromDate, toDate, scope },
        skipAdminAppend: true,
    });

export const getDisbursalLenderBreakdown = async ({ range = '7D', fromDate, toDate, scope, lender } = {}) =>
    Api().get(`${base}/lender-breakdown`, {
        params: { range, fromDate, toDate, scope, lender },
        skipAdminAppend: true,
    });

export const getDisbursalEmploymentMix = async ({ range = '7D', fromDate, toDate, scope } = {}) =>
    Api().get(`${base}/employment-mix`, {
        params: { range, fromDate, toDate, scope },
        skipAdminAppend: true,
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
} = {}) =>
    Api().get(`${base}/transactions`, {
        params: { currentPage, perPage, search, range, fromDate, toDate, lender, employmentType, scope },
        skipAdminAppend: true,
    });

export const getDisbursalFilterOptions = async ({ scope } = {}) =>
    Api().get(`${base}/filter-options`, {
        params: { scope },
        skipAdminAppend: true,
    });
