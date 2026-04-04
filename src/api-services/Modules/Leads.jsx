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
        },
        skipAdminAppend: true,
    });
};

export const getDistinctLenders = async () => {
    return Api().get(`/selected-lenders/distinct-lenders`, {
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