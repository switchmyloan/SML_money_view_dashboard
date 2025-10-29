import Api from "../api"

export const getBlogs = async (pageNo, limit, globalFilter) => {
  return Api().get(`/blog?currentPage=${pageNo}&perPage=${limit}&search=${globalFilter}`,
    {
        skipAdminAppend: false,
    }
  )
}
export const getBlogById = async id => Api().get(`/blog/${id}`)
export const AddBlog = async (formData) => {
  return Api().post('/blog', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
}
export const UpdateBlog = async (id, formData) => {
  return Api().patch(`/blog/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};