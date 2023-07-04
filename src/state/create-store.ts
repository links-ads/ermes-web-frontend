import { applyMiddleware, combineReducers, compose, createStore, CombinedState, Store } from 'redux'
import thunk from 'redux-thunk'
import { authReducer } from './auth/auth.reducer'
import { preferencesReducer } from './preferences/preferences.reducer'
import { AppState } from './app.state'
import { selectedCameraReducer } from './selected-camera.state'

const composeEnhancers = window['__REDUX_DEVTOOLS_EXTENSION_COMPOSE__'] || compose

const appReducer = combineReducers<AppState>({
  // MAP pieceOfState: Reducer
  auth: authReducer,
  preferences: preferencesReducer,
  selectedCameraState: selectedCameraReducer
})

/**
 * 
 *  VISCA Persisted reducer (check if persistence needed)
const transforms = [appTransform]
const whitelist = ['app', 'preferences']

const persistConfig = makePersistConfig(whitelist, transforms)

const persistedReducer = persistReducer(persistConfig, rootReducer)
 export const store = createStore(persistedReducer, composeEnhancers(applyMiddleware(thunk)))

// export const persistor = persistStore(store)
export const getPersistor = onRehydrate => persistStore(store, null, onRehydrate)

 */

// https://stackoverflow.com/questions/35622588/how-to-reset-the-state-of-a-redux-store
const rootReducer = (state: any, action: any) => {
  if (action && action.type === `ROOT:CLEAR_ALL`) {
    state = undefined
  }
  // return state;
  return appReducer(state, action)
}

export type AppStore = Store<CombinedState<AppState>>

/// with typed object Partial<AppState> --> compiler error
function createReduxStore(initialState: any /*Partial<AppState> = {}*/): AppStore {
  const store = createStore(rootReducer, initialState, composeEnhancers(applyMiddleware(thunk)))
  if (process.env.NODE_ENV !== 'production') {
    window['store'] = store
  }
  return store
}

export default createReduxStore
