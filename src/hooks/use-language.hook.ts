import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'


const useLanguage = () => {
    
    const { i18n } = useTranslation()
    const getLanguageSettings = useCallback((language) => {
        switch(language)
        {
            case 'it':
                return {dateFormat:"dd/MM/yyyy - HH:mm", dateLocale:"it-IT"}
            case 'en':
                return {dateFormat:"MM/dd/yyyy - HH:mm", dateLocale:"en-US"}
            default:
                return {dateFormat:"dd/MM/yyyy - HH:mm", dateLocale:"en-GB"}
        }
    },[])
    return getLanguageSettings(i18n.language)
}

export default useLanguage;

export const useFiltersLocale = () => {
    const { i18n } = useTranslation()
    let locale = {}
    const getLanguageSettings = useCallback((language) => {
        switch(language)
        {
            case 'it':
                locale = require('antd/es/date-picker/locale/it_IT')
                return locale
            case 'en':
                locale = require('antd/es/date-picker/locale/en_US')
                return locale
            default:
                locale = require('antd/es/date-picker/locale/en_GB')
                return locale
        }
    },[])
    return getLanguageSettings(i18n.language)
}