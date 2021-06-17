import {_MS_PER_DAY} from '../utils/utils.common'

export interface FiltersType {
    startDate: Date
    endDate: Date
    languageSelect?: []
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
                startDate: action.value
            }
        case 'END_DATE':
            return {
                ...currentFilters,
                endDate: action.value
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
                startDate: new Date(currentDate.valueOf() - _MS_PER_DAY * (action.days || 1)),
                endDate: currentDate,
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