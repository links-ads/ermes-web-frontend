import { Card, CardHeader, Grid } from '@material-ui/core'
import React, { useContext, useEffect, useMemo, useState } from 'react'
import { Map } from '../map/map.component'
import { DashboardWidgetContainer } from './dashboard-widget-container.component'
import { useTranslation } from 'react-i18next'
import useSWR from 'swr'
import { DashboardApiFactory, GetStatisticsOutput } from 'ermes-backoffice-ts-sdk'
import { useAPIConfiguration } from '../../../hooks/api-hooks'
import { useMemoryState } from '../../../hooks/use-memory-state.hook'
import { FiltersDescriptorType } from '../../../common/floating-filters-tab/floating-filter.interface'
import { Persons } from './widgets/persons.component'
import { FiltersContext } from '../../../state/filters.context'
import { MapRequests } from './widgets/map-requests.component'
import { Reports } from './widgets/reports.component'
import { Missions } from './widgets/missions.component'
import { Cameras } from './widgets/cameras.component'
import { Communications } from './widgets/communications.component'
import { Alerts } from './widgets/alerts.component'

function useStats() {
  const { apiConfig: backendAPIConfig } = useAPIConfiguration('backoffice')
  const dashboardApiFactory = useMemo(
    () => DashboardApiFactory(backendAPIConfig),
    [backendAPIConfig]
  )
  const [storedFilters, ,] = useMemoryState('memstate-map', null, false)
  const [stats, setStats] = useState<GetStatisticsOutput | null>(null)

  function fetchStats() {
    const filters = (JSON.parse(storedFilters!) as unknown as FiltersDescriptorType).filters

    dashboardApiFactory
      .dashboardGetStatistics(
        (filters?.datestart as any)?.selected ? (filters?.datestart as any)?.selected : undefined,
        (filters?.dateend as any)?.selected ? (filters?.dateend as any)?.selected : undefined,
        (filters?.mapBounds as any).northEast[1],
        (filters?.mapBounds as any).northEast[0],
        (filters?.mapBounds as any).southWest[1],
        (filters?.mapBounds as any).southWest[0]
      )
      .then((r) => r.data)
      .then((data) => setStats(data))
  }

  useEffect(() => {
    fetchStats()
  }, [storedFilters])

  return [stats, fetchStats] as const
}

export function DashboardLayout() {
  const { t } = useTranslation()

  const filterCtx = useContext(FiltersContext)
  const activeFilters = filterCtx.mapDrawerTabVisibility

  const [stats, getStats] = useStats()

  const totals = useMemo(() => {
    if (!stats) return {}

    return {
      persons:
        stats.personsByStatus?.reduce((acc, curr: any) => {
          console.log(curr)
          return acc + curr.value
        }, 0) ?? 0,
      mapRequests: stats.mapRequestByType?.reduce((acc, curr: any) => acc + curr.value, 0) ?? 0,
      reports: stats.reportsByHazard?.reduce((acc, curr: any) => acc + curr.value, 0) ?? 0,
      missions: stats.missionsByStatus?.reduce((acc, curr: any) => acc + curr.value, 0) ?? 0,
      cameras: stats.stations?.reduce((acc, curr: any) => acc + curr.value, 0) ?? 0,
      communications:
        stats.communicationsByRestriction?.reduce((acc, curr: any) => acc + curr.value, 0) ?? 0,
      alerts: stats.alertsByRestriction?.reduce((acc, curr: any) => acc + curr.value, 0) ?? 0
    }
  }, [stats])

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
              info={`${t('labels:total')}: ${totals.persons ?? ''}`}
            >
              <Persons
                persons={stats?.personsByStatus}
                activationsByDay={stats?.activationsByDay}
              />
            </DashboardWidgetContainer>
          )}
          {activeFilters.MapRequest && (
            <DashboardWidgetContainer
              title={t('labels:filter_maprequest')}
              info={`${t('labels:total')}: ${totals.mapRequests ?? ''}`}
            >
              <MapRequests mapRequests={stats?.mapRequestByType} />
            </DashboardWidgetContainer>
          )}
          {activeFilters.Report && (
            <DashboardWidgetContainer
              title={t('labels:filter_report')}
              info={`${t('labels:total')}: ${totals.reports ?? ''}`}
            >
              <Reports reports={stats?.reportsByHazard} />
            </DashboardWidgetContainer>
          )}
          {activeFilters.Mission && (
            <DashboardWidgetContainer
              title={t('labels:filter_mission')}
              info={`${t('labels:total')}: ${totals.missions ?? ''}`}
            >
              <Missions missions={stats?.missionsByStatus} />
            </DashboardWidgetContainer>
          )}
          {activeFilters.Station && (
            <DashboardWidgetContainer
              title={t('labels:filter_station')}
              info={`${t('labels:total')}: ${totals.cameras ?? ''}`}
            >
              <Cameras cameras={stats?.stations} />
            </DashboardWidgetContainer>
          )}
          {activeFilters.Communication && (
            <DashboardWidgetContainer
              title={t('labels:filter_communication')}
              info={`${t('labels:total')}: ${totals.communications ?? ''}`}
            >
              <Communications communications={stats?.communicationsByRestriction} />
            </DashboardWidgetContainer>
          )}
          {activeFilters.Alert && (
            <DashboardWidgetContainer
              title={t('labels:filter_alert')}
              info={`${t('labels:total')}: ${totals.alerts ?? ''}`}
            >
              <Alerts alerts={stats?.alertsByRestriction} />
            </DashboardWidgetContainer>
          )}
        </Grid>
      </Grid>
    </Grid>
  )
}
