import Api from "../api";

export const getTestimonials = async (pageNo, limit, globalFilter) => {
  return Api().get(`/testimonial?currentPage=${pageNo}&perPage=${limit}&search=${globalFilter}`)
}

export const addTestimonial = async (data) => {
    console.log('Sending to API:', data);
    return Api().post('/testimonial', data, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
};


export const updateTestimonial = async (id, formData) => {
  console.log(id, "id?????????????")
  return Api().put(`/testimonial/${id?.id}`, id, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}