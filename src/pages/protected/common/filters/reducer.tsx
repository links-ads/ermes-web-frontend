export interface FiltersType {
    startDate: Date
    endDate: Date
    languageSelect: []
    hazardSelect: []
    infoTypeSelect: []
    informativeSelect: string
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
            return {
                startDate: new Date(new Date().valueOf() - 1000 * 60 * 60 * 24),
                endDate: new Date(),
                languageSelect: [],
                hazardSelect: [],
                infoTypeSelect: [],
                informativeSelect: ''
            }
        default:
            throw new Error("Invalid action type")
    }
}

export default filterReducer;