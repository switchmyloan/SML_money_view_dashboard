import Api from "../api";

export const getFaq = async (pageNo, limit, globalFilter) => {
  return Api().get(`/faq?currentPage=${pageNo}&perPage=${limit}&search=${globalFilter}`)
}
export const AddFaq = async payload => Api().post(`/faq`, payload)

export const getFaqById = async id => Api().get(`/faq/${id}`)

export const updateFaq = async payload => {
  const { id, ...data } = payload
  return Api().patch(`/faq/${id}`, data)
}