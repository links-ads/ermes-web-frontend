import { useReducer } from 'react'

const initialState = { tabIndex: 0, selectedFeatureId: '', selectedItemsList: [] }

const reducer = (currentState, action) => {
  switch (action.type) {
    case 'SELECT_CARD':
      return {
        ...currentState,
        tabIndex: action.value.tabIndex,
        selectedFeatureId: action.value.featureId
      }
    case 'ADD_TO_SELECTED_LIST':
      return {
        ...currentState,
        selectedItemsList: [...currentState.selectedItemsList, action.value]
      }
    case 'CLEAR_SELECTED_LIST':
      return {
        ...currentState,
        selectedItemsList: []
      }
    case 'SET_TAB_INDEX':
      return {
        ...currentState,
        tabIndex: action.value
      }
  }
  return initialState
}

export default function useMapDrawer() {
  const [dataState, dispatch] = useReducer(reducer, initialState)

  const selectTabCard = (tabIdx, featureId) => {
    dispatch({ type: 'SELECT_CARD', value: { tabIndex: tabIdx, featureId: featureId } })
  }

  const addCardToTabList = (card) => {
    dispatch({ type: 'ADD_TO_SELECTED_LIST', value: card })
  }

  const updateTabIndex = (index) => {
    dispatch({ type: 'SET_TAB_INDEX', value: index })
  }

  return [dataState, updateTabIndex, selectTabCard, addCardToTabList]
}
