// dashboard-layout.tsx
import { Card, CardHeader, Grid } from '@material-ui/core'
import React, { useContext, useEffect, useMemo, useRef, useState } from 'react'
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
import { TeamsApiFactory } from 'ermes-ts-sdk'
import useAPIHandler from '../../../hooks/use-api-handler'

function getKeyByValue(object, value) {
  return Object.keys(object).find((key) => object[key] === value)
}

function useTeamIds() {
  const [storedFilters, ,] = useMemoryState('memstate-map', null, false)

  const { apiConfig: backendAPIConfig } = useAPIConfiguration('backoffice')

  const teamsApiFactory = useMemo(() => TeamsApiFactory(backendAPIConfig), [backendAPIConfig])
  const [teamsApiHandlerState, handleTeamsAPICall] = useAPIHandler(false)

  const [teamList, setTeamList] = useState<any>([])

  const filters = (JSON.parse(storedFilters!) as unknown as FiltersDescriptorType).filters

  useEffect(() => {
    handleTeamsAPICall(() => {
      return teamsApiFactory.teamsGetTeams(1000)
    })
  }, [teamsApiFactory, handleTeamsAPICall])

  useEffect(() => {
    if (
      !teamsApiHandlerState.loading &&
      !!teamsApiHandlerState.result &&
      teamsApiHandlerState.result.data
    ) {
      //update team list
      let i = Object.fromEntries(
        teamsApiHandlerState.result.data.data.map((obj) => [obj['id'], obj['name']])
      )
      setTeamList(i)
      //update starting filter object with actual team names from http
      // const teamNamesList = Object.values(i)
      // updateTeamList(teamNamesList)
    }
  }, [teamsApiHandlerState])

  const teamIds = useMemo(() => {
    let f: any = filters?.persons
    //once the team list is available (ids are available)
    if (Object.keys(teamList).length > 0) {
      let selected = f.content[1].selected
      var arrayOfTeams: number[] = []
      if (!!selected && selected.length > 0) {
        for (let i = 0; i < selected.length; i++) {
          //if teams selected in filters have corresponcence with ids available
          let idFromContent = Number(
            !!getKeyByValue(teamList, selected[i]) ? getKeyByValue(teamList, selected[i]) : -1
          )
          //add them to array to use for new call
          if (idFromContent >= 0) arrayOfTeams.push(idFromContent)
        }
      }

      return arrayOfTeams
    }

    return []
  }, [teamList, (filters?.persons as any).content[1].selected])

  return teamIds
}

function useStats() {
  const isFetchingRef = useRef(false)
  const { apiConfig: backendAPIConfig } = useAPIConfiguration('backoffice')
  const dashboardApiFactory = useMemo(
    () => DashboardApiFactory(backendAPIConfig),
    [backendAPIConfig]
  )
  const [storedFilters, ,] = useMemoryState('memstate-map', null, false)
  const [stats, setStats] = useState<GetStatisticsOutput | null>(null)
  const teamIds = useTeamIds()

  function fetchStats() {
    if (isFetchingRef.current) return

    isFetchingRef.current = true

    const filters = (JSON.parse(storedFilters!) as unknown as FiltersDescriptorType).filters

    dashboardApiFactory
      .dashboardGetStatistics(
        (filters?.datestart as any)?.selected ? (filters?.datestart as any)?.selected : undefined,
        (filters?.dateend as any)?.selected ? (filters?.dateend as any)?.selected : undefined,
        (filters?.mapBounds as any).northEast[1],
        (filters?.mapBounds as any).northEast[0],
        (filters?.mapBounds as any).southWest[1],
        (filters?.mapBounds as any).southWest[0],
        (filters?.persons as any).content[0]?.selected,
        teamIds,
        (filters?.report as any).content[0]?.selected,
        (filters?.report as any).content[1]?.selected,
        (filters?.mission as any).content[0]?.selected,
        (filters?.communication as any).content[1]?.selected,
        (filters?.communication as any).content[0]?.selected,
        (filters?.mapRequests as any).content[1]?.selected,
        (filters?.mapRequests as any).content[0]?.selected
      )
      .then((r) => r.data)
      .then((data) => setStats(data))
      .then(() => {
        isFetchingRef.current = false
      })
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
      teams:
        stats.persons
          ?.map((p) => p.teamId)
          .filter((value, index, self) => self.indexOf(value) === index).length ?? 0,
      mapRequests: stats.mapRequestByType?.reduce((acc, curr: any) => acc + curr.value, 0) ?? 0,
      reports: stats.reportsByHazard?.reduce((acc, curr: any) => acc + curr.value, 0) ?? 0,
      missions: stats.missionsByStatus?.reduce((acc, curr: any) => acc + curr.value, 0) ?? 0,
      cameras: stats.stations?.length ?? 0,
      communications:
        stats.communicationsByRestriction?.reduce((acc, curr: any) => acc + curr.value, 0) ?? 0
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
              info={
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingRight: 60 }}>
                  <span>{`${t('labels:total')}: ${totals.persons ?? ''}`}</span>
                  <span>{`${t('labels:chart_teams')}: ${totals.teams ?? ''}`}</span>
                </div>
              }
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
        </Grid>
      </Grid>
    </Grid>
  )
}
