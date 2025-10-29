import Api from "../api";

export const getPress = async (pageNo = 1, limit =10, globalFilter='') => {
  return Api().get(`/press?currentPage=${pageNo}&perPage=${limit}&search=${globalFilter}`)
}
export const AddPress = async (formData) => {
  return Api().post('/press', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

export const UpdatePress = async (formData) => {
  console.log(formData, "www")
  return Api().put(`/press/${formData?.id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};