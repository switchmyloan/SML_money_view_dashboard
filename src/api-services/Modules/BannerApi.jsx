import Api from "../api";


export const getBanners = async (pageNo, limit, globalFilter) => {
  return Api().get(`/banner?currentPage=${pageNo}&perPage=${limit}&search=${globalFilter}`,
    {
        skipAdminAppend: false,
    }
  )
};

export const AddBanner = async (formData) => {
  return Api().post('/banner', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

export const getBannerById = async id => Api().get(`/banner/${id}`);

export const UpdateBanner = async (id, formData) => {
  return Api().patch(`/banner/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

export const deleteBanner = async id => Api().delete(`/banner/${id}`);