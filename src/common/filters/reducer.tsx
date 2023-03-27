import {_MS_PER_DAY} from '../../utils/utils.common'

export interface FiltersType {
    datestart: Date
    dateend: Date
    languageSelect?: []
    hazardSelect?: []
    infoTypeSelect?: []
    informativeSelect?: string,
    southWest?:[number,number] | undefined,
    northEast?:[number,number] | undefined

}

export interface FiltersSocialType {
    datestart: Date
    dateend: Date
    languageSelect?: string []
    hazardSelect?: []
    infoTypeSelect?: []
    informativeSelect?: string,
    southWest?:[number,number] | undefined,
    northEast?:[number,number] | undefined

}

const filterReducer = (currentFilters: FiltersType, action: any): FiltersType => {
    switch (action.type) {
        case 'START_DATE':
            return {
                ...currentFilters,
                datestart: action.value
            }
        case 'END_DATE':
            return {
                ...currentFilters,
                dateend: action.value
            }
        case 'LANGUAGES':
            return {
                ...currentFilters,
                languageSelect: action.value
            }
        case 'HAZARDS':
            return {
                ...currentFilters,
                hazardSelect: action.value
            }
        case 'INFORMATIONS':
            return {
                ...currentFilters,
                infoTypeSelect: action.value
            }
        case 'INFORMATIVE':
            return {
                ...currentFilters,
                informativeSelect: action.value
            }
        case 'RESET':
            const currentDate = new Date()
            return {
                datestart: new Date(currentDate.valueOf() - _MS_PER_DAY * 3),//(action.days || 1)),
                dateend: new Date(currentDate.valueOf() + _MS_PER_DAY * 7),
                languageSelect: [],
                hazardSelect: [],
                infoTypeSelect: [],
                informativeSelect: '',
                southWest:undefined,
                northEast:undefined
            }
        default:
            throw new Error("Invalid action type")
    }
}

export default filterReducer;