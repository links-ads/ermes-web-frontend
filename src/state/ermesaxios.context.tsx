import React, { createContext, useContext } from 'react'
import Axios, { AxiosInstance } from 'ermes-backoffice-ts-sdk/node_modules/axios/index'
import { AUTH_ACTIONS } from '../state/auth/auth.actions'
import { AppConfigContext } from '../config/config.context'
import { AppConfig } from '../config/config.types'
import { useDispatch } from 'react-redux'
import { AuthThunkDispatch } from './auth/auth.types'

export const ErmesAxiosContext = createContext({
  axiosInstance: {} as AxiosInstance
})

const ErmesAxiosContextProvider = (props) => {
  const appConfig = useContext<AppConfig>(AppConfigContext)
  const dispatch = useDispatch<AuthThunkDispatch>()

  let axiosInstance = Axios.create({
    baseURL: appConfig.backend?.url,
    withCredentials: true
  })

  axiosInstance.interceptors.response.use(undefined, function (error) {
    if (error?.response?.status === 401) {
      //TODO: try with refresh token
      dispatch({ type: AUTH_ACTIONS.CLEAR_ALL })
    }

    return Promise.reject(error)
  })

  return (
    <ErmesAxiosContext.Provider
      value={{
        axiosInstance
      }}
    >
      {props.children}
    </ErmesAxiosContext.Provider>
  )
}

export default ErmesAxiosContextProvider
