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
        },
        skipAdminAppend: true,
    });
};

export const getAnalytics = async ({
  type,
  fromDate,
  toDate,
} = {}) => {
    return Api().get(`/analytics`, {
        params: {
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