import React from 'react'
import styled from 'styled-components'
import { useTheme } from '@material-ui/core'
import { useMemoryState } from '../../hooks/use-memory-state.hook'
import { FiltersDescriptorType } from './floating-filter.interface'
import { useTranslation } from 'react-i18next'

const FilterTooltipContainer = styled.div.attrs({
  className: 'mapboxgl-ctrl mapboxgl-ctrl-group mapboxgl-ctrl-popupfilter'
})`
  position: absolute;
  top: 2px;
  left: 35px;
  margin: 4px;
  padding: 8px;
  width: 240px;
`

const ICON_STYLE: React.CSSProperties = { fontSize: 16 }
// Button which enables the filter on the top left part of the map to filter the types
export function FilterTooltip(props) {
  const theme = useTheme()
  const [storedFilters, changeItem, removeStoredFilters] = useMemoryState(
    'memstate-map',
    null,
    false
  )
  const filters = (JSON.parse(storedFilters!) as unknown as FiltersDescriptorType).filters
  const { t } = useTranslation(['common', 'labels'])
  const checkIfVisible = () => {
    if (
      (filters?.datestart as any)?.selected == null &&
      (filters?.dateend as any)?.selected == null &&
      (filters?.report as any).content[0].selected.length === 0 &&
      (filters?.report as any).content[1].selected.length === 0 &&
      (filters?.mission as any).content[0].selected.length === 0 &&
      (filters?.persons as any).content[0].selected.length === 0
    ) {
      return false
    }
    return true
  }
  const dateStart = (filters?.datestart as any)?.selected
    ? (filters?.datestart as any)?.selected?.slice(0, -3)
    : null
  const dateEnd = (filters?.dateend as any)?.selected
    ? (filters?.dateend as any)?.selected?.slice(0, -3)
    : null
  const reportHazardSelect =
    (filters?.report as any).content[0].selected.length === 0
      ? t('labels:all')
      : (filters?.report as any).content[0].selected.join(', ')
  const reportState =
    (filters?.report as any).content[1].selected.length === 0
      ? t('labels:all')
      : (filters?.report as any).content[1].selected.join(', ')
  const missionState =
    (filters?.mission as any).content[0].selected.length === 0
      ? t('labels:all')
      : (filters?.mission as any).content[0].selected.join(', ')
  const personState =
    (filters?.persons as any).content[0].selected.length === 0
      ? t('labels:all')
      : (filters?.persons as any).content[0].selected.join(', ')
  return checkIfVisible() ? (
    <FilterTooltipContainer
      style={{ backgroundColor: theme.palette.secondary.contrastText + ' !important' }}
    >
      {/* <b>{t('filters:set_filters') + ': '}</b> */}
      {t('filters:from_date') + ' '}
      {dateStart ? dateStart : t('labels:any')}
      {t('filters:to_date') + ' '}
      {dateEnd ? dateEnd : t('labels:any')}
      {' • '}
      {reportHazardSelect}
      {' • '}
      {reportState}
      {' • '}
      {missionState}
      {' • '}
      {personState}
    </FilterTooltipContainer>
  ) : null
}
