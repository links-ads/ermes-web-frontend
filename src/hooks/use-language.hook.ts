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

export const useLanguageForTimeWindow = () => {
    const { i18n } = useTranslation()
    const getLanguageSettings = useCallback((language) => {
        switch(language)
        {
            case 'it':
                return {dateFormat:"cccc dd MMMM yyyy", dateLocale:"it-IT"}
            case 'en':
                return {dateFormat:"cccc MMMM dd yyyy", dateLocale:"en-US"}
            default:
                return {dateFormat:"cccc dd MMMM yyyy", dateLocale:"en-GB"}
        }
    },[])
    return getLanguageSettings(i18n.language)
}