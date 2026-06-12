import Api from "../api";


export const getLeads = async ({
  type,
  fromDate,
  toDate,
  search = '',
  perPage = 10,
  currentPage = 1,
  status = ''
} = {}) => {
    return Api().get(`/leads`, {
        params: {
            currentPage,
            perPage,
            type,
            fromDate,
            toDate,
            status,
            search,
        },
        skipAdminAppend: true,
    });
};
export const getBusinessLoans = async (pageNo, limit, globalFilter) => {
    return Api().get(`/leads/business-loan`,
        {
            skipAdminAppend: true,
        }
    )
};
export const getMviIVRLogs = async ({
  type,
  fromDate,
  toDate,
  search = '',
  perPage = 10,
  currentPage = 1,
  status = ''
}) => {
  return Api().get(`/leads/mv-success-lead`, {
    params: {
      type,
      fromDate,               // optional
      toDate,                 // optional
      search,                 // search term
      perPage,                // number of records per page
      currentPage,            // page number
      status                  // status filter: success, reject, duplicate
    },
    skipAdminAppend: true,
  });
};
export const getKBLogs = async ({
  type,
  fromDate,
  toDate,
  search = '',
  perPage = 10,
  currentPage = 1,
  status = ''
}) => {
  return Api().get(`/leads/kb-success-leads`, {
    params: {
      type,
      fromDate,               // optional
      toDate,                 // optional
      search,                 // search term
      perPage,                // number of records per page
      currentPage,            // page number
      status                  // status filter: success, reject, duplicate
    },
    skipAdminAppend: true,
  });
};
export const getKBMumbaiLogs = async ({
  type,
  fromDate,
  toDate,
  search = '',
  perPage = 10,
  currentPage = 1,
  status = ''
}) => {
  return Api().get(`/leads/kb-success-leads-mumbai`, {
    params: {
      type,
      fromDate,               // optional
      toDate,                 // optional
      search,                 // search term
      perPage,                // number of records per page
      currentPage,            // page number
      status                  // status filter: success, reject, duplicate
    },
    skipAdminAppend: true,
  });
};
export const getKBBangloreLogs = async ({
  type,
  fromDate,
  toDate,
  search = '',
  perPage = 10,
  currentPage = 1,
  status = ''
}) => {
  return Api().get(`/leads/kb-success-leads-banglore`, {
    params: {
      type,
      fromDate,               // optional
      toDate,                 // optional
      search,                 // search term
      perPage,                // number of records per page
      currentPage,            // page number
      status                  // status filter: success, reject, duplicate
    },
    skipAdminAppend: true,
  });
};
export const getCRZypeSuccessLeads = async () => {
    return Api().get(`/leads/cr-zype-success-leads`,
        {
            skipAdminAppend: true,
        }
    )
};
export const getInAppLeads = async (pageNo, limit, globalFilter) => {
    return Api().get(`/leads/admin/in-app-leads?currentPage=${pageNo}&perPage=${limit}&search=${globalFilter}`,
        {
            skipAdminAppend: true,
        }
    )
};

export const getOfferLeads = async ({
  search = '',
  perPage = 10,
  currentPage = 1,
  type,
  fromDate,
  toDate,
  minLoanAmount,
  maxLoanAmount,
  dobFromDate,
  dobToDate,
  loanPurpose,
  minMonthlyIncome,
  maxMonthlyIncome,
  lender,
  disbStatus,
  city,
  employmentType,
  utmMedium,
  utmSource,
  feedbackStatus,
} = {}) => {
    return Api().get(`/offer-leads`, {
        params: {
            currentPage,
            perPage,
            search,
            type,
            fromDate,
            toDate,
            minLoanAmount,
            maxLoanAmount,
            dobFromDate,
            dobToDate,
            loanPurpose,
            minMonthlyIncome,
            maxMonthlyIncome,
            lender,
            disbStatus,
            city,
            employmentType,
            utmMedium,
            utmSource,
            feedbackStatus,
        },
        skipAdminAppend: true,
    });
};

export const getMvSuccessOfferLeads = async ({
  search = '',
  perPage = 10,
  currentPage = 1,
  type,
  fromDate,
  toDate,
  status,
} = {}) => {
    return Api().get(`/offer-leads/mv-success`, {
        params: {
            currentPage,
            perPage,
            search,
            type,
            fromDate,
            toDate,
            status,
        },
        skipAdminAppend: true,
    });
};

// New: pulls MV-success rows from offerLeads using response_track.MoneyView.
// Used by the MV Success Leads page; old getMvSuccessOfferLeads (mvSuccessLeads
// table) stays available for any other caller that needs it.
export const getMvSuccessFromOfferLeads = async ({
  search = '',
  perPage = 10,
  currentPage = 1,
  type,
  fromDate,
  toDate,
  status,
  utmMedium,
  utmSource,
} = {}) => {
    return Api().get(`/offer-leads/mv-success-track`, {
        params: {
            currentPage,
            perPage,
            search,
            type,
            fromDate,
            toDate,
            status,
            utmMedium,
            utmSource,
        },
        skipAdminAppend: true,
    });
};

export const getOfferLeadsLenderKeys = async () => {
    return Api().get(`/offer-leads/lender-keys`, {
        skipAdminAppend: true,
    });
};

export const getOfferLeadsFilterValues = async () => {
    return Api().get(`/offer-leads/filter-values`, {
        skipAdminAppend: true,
    });
};

export const getOfferLeadsLenderStats = async ({
  type,
  fromDate,
  toDate,
  utmMedium,
} = {}) => {
    return Api().get(`/offer-leads/lender-stats`, {
        params: {
            type,
            fromDate,
            toDate,
            utmMedium,
        },
        skipAdminAppend: true,
    });
};

export const getSelectedLenders = async ({
  search = '',
  perPage = 10,
  currentPage = 1,
  type,
  fromDate,
  toDate,
  lenderName,
  status,
  utmMedium,
  utmSource,
  minMonthlyIncome,
  maxMonthlyIncome,
  minLoanAmount,
  feedbackStatus,
} = {}) => {
    return Api().get(`/selected-lenders`, {
        params: {
            currentPage,
            perPage,
            search,
            type,
            fromDate,
            toDate,
            lenderName,
            status,
            utmMedium,
            utmSource,
            minMonthlyIncome,
            maxMonthlyIncome,
            minLoanAmount,
            feedbackStatus,
        },
        skipAdminAppend: true,
    });
};

export const getDistinctLenders = async () => {
    return Api().get(`/selected-lenders/distinct-lenders`, {
        skipAdminAppend: true,
    });
};

export const getKBLendingPageLeads = async ({
  type,
  fromDate,
  toDate,
  search = '',
  perPage = 10,
  currentPage = 1,
  status = '',
  dobFromDate,
  dobToDate,
  minLoanAmount,
  maxLoanAmount,
  minSalary,
  maxSalary,
  profession,
  utmMedium,
  utmSource,
} = {}) => {
    return Api().get(`/kb-lending-page`, {
        params: {
            type,
            fromDate,
            toDate,
            search,
            perPage,
            currentPage,
            status,
            dobFromDate,
            dobToDate,
            minLoanAmount,
            maxLoanAmount,
            minSalary,
            maxSalary,
            profession,
            utmMedium,
            utmSource,
        },
        skipAdminAppend: true,
    });
};

export const getShortKBLendingPageLeads = async ({
  type,
  fromDate,
  toDate,
  search = '',
  perPage = 10,
  currentPage = 1,
  status = '',
  dobFromDate,
  dobToDate,
  minLoanAmount,
  maxLoanAmount,
  minSalary,
  maxSalary,
  profession,
} = {}) => {
    return Api().get(`/short-kb-lending-page`, {
        params: {
            type,
            fromDate,
            toDate,
            search,
            perPage,
            currentPage,
            status,
            dobFromDate,
            dobToDate,
            minLoanAmount,
            maxLoanAmount,
            minSalary,
            maxSalary,
            profession,
        },
        skipAdminAppend: true,
    });
};

export const getDraftLeadsNew = async ({
  type,
  fromDate,
  toDate,
  search = '',
  perPage = 10,
  currentPage = 1,
  dobFromDate,
  dobToDate,
  minLoanAmount,
  maxLoanAmount,
  minSalary,
  maxSalary,
  profession,
  utmMedium,
  utmSource,
} = {}) => {
    return Api().get(`/draft-leads-new`, {
        params: {
            type,
            fromDate,
            toDate,
            search,
            perPage,
            currentPage,
            dobFromDate,
            dobToDate,
            minLoanAmount,
            maxLoanAmount,
            minSalary,
            maxSalary,
            profession,
            utmMedium,
            utmSource,
        },
        skipAdminAppend: true,
    });
};

export const getAnalytics = async ({
  type,
  fromDate,
  toDate,
  lender,
  utmMedium,
  utmSource,
} = {}) => {
    return Api().get(`/analytics`, {
        params: {
            type,
            fromDate,
            toDate,
            lender,
            utmMedium,
            utmSource,
        },
        skipAdminAppend: true,
    });
};

export const getLendingUserJourney = async ({
  search = '',
  perPage = 10,
  currentPage = 1,
  type,
  fromDate,
  toDate,
  stage,
  lender,
} = {}) => {
    return Api().get(`/lending-user-journey`, {
        params: {
            currentPage,
            perPage,
            search,
            type,
            fromDate,
            toDate,
            stage,
            lender,
        },
        skipAdminAppend: true,
    });
};

export const getLendingUserJourneyDetail = async ({ phone } = {}) => {
    return Api().get(`/lending-user-journey/detail`, {
        params: { phone },
        skipAdminAppend: true,
    });
};

export const getUserTrack = async ({
  search = '',
  perPage = 10,
  currentPage = 1,
  type,
  fromDate,
  toDate,
  stage,
  lender,
  medium,
  source,
  viewAllClicked,
  feedbackStatus,
} = {}) => {
    return Api().get(`/user-track`, {
        params: {
            currentPage,
            perPage,
            search,
            type,
            fromDate,
            toDate,
            stage,
            lender,
            medium,
            source,
            viewAllClicked,
            feedbackStatus,
        },
        skipAdminAppend: true,
    });
};

export const getUserTrackDetail = async ({ phone } = {}) => {
    return Api().get(`/user-track/detail`, {
        params: { phone },
        skipAdminAppend: true,
    });
};

export const getDistinctMediums = async () => {
    return Api().get(`/user-track/distinct-mediums`, {
        skipAdminAppend: true,
    });
};

// ---------- Short Ticket (short_*) CMS endpoints ----------

export const getShortUserTrack = async ({
  search = '',
  perPage = 10,
  currentPage = 1,
  type,
  fromDate,
  toDate,
  stage,
  medium,
  source,
  feedbackStatus,
  lender,
} = {}) => {
    return Api().get(`/short-user-track`, {
        params: {
            currentPage,
            perPage,
            search,
            type,
            fromDate,
            toDate,
            stage,
            medium,
            source,
            feedbackStatus,
            lender,
        },
        skipAdminAppend: true,
    });
};

export const getShortDistinctMediums = async () => {
    return Api().get(`/short-user-track/distinct-mediums`, {
        skipAdminAppend: true,
    });
};

export const getShortUserTrackDetail = async ({ phone } = {}) => {
    return Api().get(`/short-user-track/detail`, {
        params: { phone },
        skipAdminAppend: true,
    });
};

export const getShortOfferLeads = async ({
  search = '',
  perPage = 10,
  currentPage = 1,
  type,
  fromDate,
  toDate,
  minLoanAmount,
  maxLoanAmount,
  dobFromDate,
  dobToDate,
  loanPurpose,
  minMonthlyIncome,
  maxMonthlyIncome,
  lender,
  disbStatus,
  pincode,
  employmentType,
  medium,
  source,
  feedbackStatus,
} = {}) => {
    return Api().get(`/short-offer-leads`, {
        params: {
            currentPage,
            perPage,
            search,
            type,
            fromDate,
            toDate,
            minLoanAmount,
            maxLoanAmount,
            dobFromDate,
            dobToDate,
            loanPurpose,
            minMonthlyIncome,
            maxMonthlyIncome,
            lender,
            disbStatus,
            pincode,
            employmentType,
            medium,
            source,
            feedbackStatus,
        },
        skipAdminAppend: true,
    });
};

export const getShortOfferLeadsFilterValues = async () => {
    return Api().get(`/short-offer-leads/filter-values`, {
        skipAdminAppend: true,
    });
};

export const getShortSelectedLenders = async ({
  search = '',
  perPage = 10,
  currentPage = 1,
  type,
  fromDate,
  toDate,
  lenderName,
  status,
  medium,
  source,
  minMonthlyIncome,
  maxMonthlyIncome,
  minLoanAmount,
  feedbackStatus,
} = {}) => {
    return Api().get(`/short-selected-lenders`, {
        params: {
            currentPage,
            perPage,
            search,
            type,
            fromDate,
            toDate,
            lenderName,
            status,
            medium,
            source,
            minMonthlyIncome,
            maxMonthlyIncome,
            minLoanAmount,
            feedbackStatus,
        },
        skipAdminAppend: true,
    });
};

export const getShortDistinctLenders = async () => {
    return Api().get(`/short-selected-lenders/distinct-lenders`, {
        skipAdminAppend: true,
    });
};

export const getShortOfferLeadByPhone = async (phone) => {
    return Api().get(`/short-offer-leads/by-phone/${encodeURIComponent(phone)}`, {
        skipAdminAppend: true,
    });
};

export const getOfferLeadByPhone = async (phone) => {
    return Api().get(`/offer-leads/by-phone/${encodeURIComponent(phone)}`, {
        skipAdminAppend: true,
    });
};

// ---------- Lead Feedback (call-center disposition, keyed by phone) ----------
// skipAdminAppend is required — otherwise the request interceptor rewrites the
// URL to /lead-feedback/admin/... and breaks the route match.
export const getLeadFeedback = async (phone) => {
    return Api().get(`/lead-feedback/${encodeURIComponent(phone)}`, {
        skipAdminAppend: true,
    });
};

export const saveLeadFeedback = async ({ phone, status, remark, updatedBy, nextAction, nextActionAt } = {}) => {
    return Api().put(`/lead-feedback`, { phone, status, remark, updatedBy, nextAction, nextActionAt }, {
        skipAdminAppend: true,
    });
};

// ---------- Short Ticket feedback (separate short_feedback table) ----------
export const getShortLeadFeedback = async (phone) => {
    return Api().get(`/short-feedback/${encodeURIComponent(phone)}`, {
        skipAdminAppend: true,
    });
};

export const saveShortLeadFeedback = async ({ phone, status, remark, updatedBy, nextAction, nextActionAt } = {}) => {
    return Api().put(`/short-feedback`, { phone, status, remark, updatedBy, nextAction, nextActionAt }, {
        skipAdminAppend: true,
    });
};

export const getShortAnalytics = async ({
  type,
  fromDate,
  toDate,
  medium,
  source,
} = {}) => {
    return Api().get(`/short-analytics`, {
        params: {
            type,
            fromDate,
            toDate,
            medium,
            source,
        },
        skipAdminAppend: true,
    });
};

export const getShortDraftLeadsNew = async ({
  type,
  fromDate,
  toDate,
  search = '',
  perPage = 10,
  currentPage = 1,
  dobFromDate,
  dobToDate,
  minLoanAmount,
  maxLoanAmount,
  minSalary,
  maxSalary,
  profession,
} = {}) => {
    return Api().get(`/short-draft-leads`, {
        params: {
            type,
            fromDate,
            toDate,
            search,
            perPage,
            currentPage,
            dobFromDate,
            dobToDate,
            minLoanAmount,
            maxLoanAmount,
            minSalary,
            maxSalary,
            profession,
        },
        skipAdminAppend: true,
    });
};


export const getOtpLogs = async ({
  search = '',
  perPage = 10,
  currentPage = 1,
  status,
  purpose,
  type,
  fromDate,
  toDate,
} = {}) => {
    return Api().get(`/auth/otp-logs`, {
        params: {
            currentPage,
            perPage,
            search,
            status,
            purpose,
            type,
            fromDate,
            toDate,
        },
        skipAdminAppend: true,
    });
};

export const getExportAuditLogs = async ({
  search = '',
  perPage = 10,
  currentPage = 1,
  exportType,
  type,
  fromDate,
  toDate,
} = {}) => {
    return Api().get(`/auth/export-audit-logs`, {
        params: {
            currentPage,
            perPage,
            search,
            exportType,
            type,
            fromDate,
            toDate,
        },
        skipAdminAppend: true,
    });
};

export const AddLender = async (formData) => {
    console.log(formData, "fffsss")
    return Api().post('/lender', formData);
};

export const getLenderById = async id => Api().get(`/lender/${id}`);

export const UpdateLender = async (id, formData) => {
    return Api().put(`/lender/${id}`, formData);
};