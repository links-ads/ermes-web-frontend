import React from 'react'
import ReactDOM from 'react-dom'
import './index.scss'
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'
import 'mapbox-gl/dist/mapbox-gl.css'
import App from './App'
import { init18N } from './i18n'
//import * as serviceWorker from './serviceWorker'
import { loadConfig } from './config'
import createStore from './state/create-store'
import { configure } from 'axios-hooks'
// import LRU from 'lru-cache'
import Axios from 'axios'
import { getInitialState /* , USER_STORAGE_KEY */ } from './state/store.utils'
import { AxiosHooksConfigurator } from './common/types'
import { AUTH_ACTIONS } from './state/auth/auth.actions'

const isProduction = process.env.NODE_ENV === 'production'

async function start() {
  // LOAD APP CONFIGURATION
  const appConfig = await loadConfig()

  // LOAD LANGUAGES
  /* const i18n =  */ await init18N(isProduction, appConfig.i18n)

  // Create REDUX STORE

  // Rehydrate token
  const initialState = await getInitialState(appConfig)
  const store = createStore(initialState)

  // CONFIGURE INSTANCE FOR Axios BE calls
  // See https://github.com/simoneb/axios-hooks#configure-cache-axios-
  const axios = Axios.create({
    baseURL: appConfig?.backend?.url || '/'
  })

  // // Use interceptors for code expiration
  // axios.interceptors.response.use(undefined, function (error) {
  //   // Any status codes that falls outside the range of 2xx cause this function to trigger
  //   // Do something with response error
  //   if (error.response.status === 401) {
  //     store.dispatch({ type: AUTH_ACTIONS.CLEAR_ALL })
  //     localStorage.removeItem(USER_STORAGE_KEY + appConfig.baseUrl)
  //   }
  //   return Promise.reject(error)
  // })

  // const cache = new LRU({ max: 10 })

  configure({ axios /*, cache */ })

  const configureMainAxiosInstance: AxiosHooksConfigurator = (
    onSessionExpired: (message: string | Error | object) => void, // print session expired and remove token
    onAxiosError: (error: any) => void // print UI error
  ) => {
    axios.interceptors.response.use(undefined, function (error) {
      // Any status codes that falls outside the range of 2xx cause this function to trigger
      // Do something with response error
      if (error?.response?.status === 401) {
        onSessionExpired(error.response.data.error)
        store.dispatch({ type: AUTH_ACTIONS.CLEAR_ALL })
        localStorage.clear()
      }
      // Other errors must be catched locally
      return Promise.reject(error)
    })
    configure({ axios /*, cache */ })
  }

  ReactDOM.render(
    <App config={appConfig} store={store} axiosHooksConfiguration={configureMainAxiosInstance} />,
    document.getElementById('root')
  )
}

start()

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
//serviceWorker.unregister()
