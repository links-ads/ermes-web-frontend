import Axios, { AxiosInstance } from 'ermes-backoffice-ts-sdk/node_modules/axios/index'
import { AUTH_ACTIONS } from '../state/auth/auth.actions'

export function CreatAxiosInstance(backendUrl: string): AxiosInstance {
  let instance = Axios.create({
    baseURL: backendUrl,
    withCredentials: true
  })

  instance.interceptors.response.use(undefined, function (error) {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error
    if (error?.response?.status !== 401) {
      console.log(error.response.data.error)
      //dispatch({ type: AUTH_ACTIONS.CLEAR_ALL })
      //localStorage.clear()
    }
    // Other errors must be catched locally
    return Promise.reject(error)
  })

  return instance
}
