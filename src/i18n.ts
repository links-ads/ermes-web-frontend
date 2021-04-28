import i18n, { TFunction } from 'i18next'
import Backend from 'i18next-xhr-backend'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'
import { staticAssetsUrl } from './config/base-path'
import { i18NextConfig } from './config'

export function init18N(isProduction: boolean, config?: i18NextConfig): Promise<TFunction> {
  const transl = i18n // load translation using xhr -> see /public/locales (i.e. https://github.com/i18next/react-i18next/tree/master/example/react/public/locales)
    // learn more: https://github.com/i18next/i18next-xhr-backend
    .use(Backend)
    // detect user language
    // learn more: https://github.com/i18next/i18next-browser-languageDetector
    .use(LanguageDetector)
    .use(initReactI18next) // passes i18n down to react-i18next
    .init(
      {
        ...config,
        debug: !isProduction,
        interpolation: {
          escapeValue: false
        },
        backend: {
          loadPath: `${staticAssetsUrl}locales/{{lng}}/{{ns}}.json`
        },
        react: {
          wait: true,
          useSuspense: true
        }
      },
      (err) => {
        if (err) {
          console.error('Error loading translations', err)
        } else {
          console.debug('TRANSLATIONS LOADED')
        }
      }
    )
  if (!isProduction) {
    window['i18n'] = i18n
  }
  return transl
}
