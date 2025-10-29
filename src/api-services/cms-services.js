import Api from './api'


export const uploadImage = async (formData) => {
  return Api().post('/public', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};


