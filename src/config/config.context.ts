import { createContext } from 'react'
import { AppConfig } from './config.types'

const ctx: AppConfig = {} as AppConfig

export const AppConfigContext = createContext<AppConfig>(ctx)
