'use client'
import axios from 'axios'
import { TokenService } from '../custom-hooks/index'

const createAxiosInstance = () => {
  const instance = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '',
    params: {

    }
  })

  instance.defaults.headers.common['Content-Type'] = 'application/json'
  instance.defaults.headers.common['module-name'] = window && window.location.pathname

  const token = TokenService.getToken()
  if (token) {
    instance.defaults.headers.common['Authorization'] = `Bearer ${token}`
  }

  instance.interceptors.response.use(
    function (response) {
      return response
    },
    function (error) {
      if (error.response && error.response.status === 403) {
        TokenService.removeToken()
      }
      return Promise.reject(error)
    }
  )

  // Request interceptor
  instance.interceptors.request.use((config) => {
    const token = TokenService.getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    if (config.url !== '/auth/login' && !config.skipAdminAppend) {

      const [path, query] = config.url.split('?')

      // check if path has an ID at the end
      const parts = path.split('/')
     
      if (parts.length > 2 && /^\d+$/.test(parts[parts.length - 1])) {
        // id is last part => insert "admin" before it
        const id = parts.pop()
        const newPath = [...parts, 'admin', id].join('/')
        config.url = query ? `${newPath}?${query}` : newPath
      } else {
        // normal case => append admin at the end
        const newPath = `${path}/admin`
        config.url = query ? `${newPath}?${query}` : newPath
      }
    }

    return config
  })

  return instance
}

export default createAxiosInstance
