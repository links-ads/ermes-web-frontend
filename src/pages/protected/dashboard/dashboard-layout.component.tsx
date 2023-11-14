import { Card, CardHeader, Grid } from '@material-ui/core'
import React, { useContext, useMemo } from 'react'
import { Map } from '../map/map.component'
import { DashboardWidgetContainer } from './dashboard-widget-container.component'
import { useTranslation } from 'react-i18next'
import useSWR from 'swr'
import { DashboardApiFactory } from 'ermes-backoffice-ts-sdk'
import { useAPIConfiguration } from '../../../hooks/api-hooks'
import { useMemoryState } from '../../../hooks/use-memory-state.hook'
import { FiltersDescriptorType } from '../../../common/floating-filters-tab/floating-filter.interface'
import { Persons } from './widgets/persons.component'
import { FiltersContext } from '../../../state/filters.context'

export function DashboardLayout() {
  const { t } = useTranslation()
  const { apiConfig: backendAPIConfig } = useAPIConfiguration('backoffice')
  const dashboardApiFactory = useMemo(
    () => DashboardApiFactory(backendAPIConfig),
    [backendAPIConfig]
  )
  const [storedFilters, ,] = useMemoryState('memstate-map', null, false)
  const filterCtx = useContext(FiltersContext)
  const activeFilters = filterCtx.mapDrawerTabVisibility

  const { data } = useSWR('stats', () => {
    const filters = (JSON.parse(storedFilters!) as unknown as FiltersDescriptorType).filters

    return dashboardApiFactory
      .dashboardGetStatistics(
        (filters?.datestart as any)?.selected ? (filters?.datestart as any)?.selected : undefined,
        (filters?.dateend as any)?.selected ? (filters?.dateend as any)?.selected : undefined,
        (filters?.mapBounds as any).northEast[1],
        (filters?.mapBounds as any).northEast[0],
        (filters?.mapBounds as any).southWest[1],
        (filters?.mapBounds as any).southWest[0]
      )
      .then((r) => r.data)
  })

  const totals = useMemo(() => {
    if (!data) return {}

    return {
      persons:
        data.personsByStatus?.reduce((acc, curr: any) => {
          console.log(curr)
          return acc + curr.value
        }, 0) ?? 0
    }
  }, [data])

  return (
    <Grid container style={{ height: '100%', padding: 12 }}>
      <Grid item sm={12} md={4}>
        <Map dashboardMode height="95%" />
      </Grid>
      <Grid item sm={12} md={8} style={{ marginTop: 44, paddingLeft: 12 }}>
        <Grid container spacing={2}>
          {activeFilters.Person && (
            <DashboardWidgetContainer
              title={t('labels:filter_persons')}
              info={`Totale: ${totals.persons ?? ''}`}
            >
              <Persons persons={data?.personsByStatus} activationsByDay={data?.activationsByDay} />
            </DashboardWidgetContainer>
          )}
        </Grid>
      </Grid>
    </Grid>
  )
}
