import React, { useMemo, useEffect } from 'react'

import {
  FormControl,
  FormHelperText,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField
} from '@material-ui/core'
import ClearIcon from '@material-ui/icons/Clear'

import { CoordinatorType } from '../map-dialog.hooks'
import { useTranslation } from 'react-i18next'
import { useAPIConfiguration } from '../../../../hooks/api-hooks'

import { OrganizationsApiFactory } from 'ermes-backoffice-ts-sdk'
import { TeamsApiFactory, MissionStatusType } from 'ermes-ts-sdk'
import useAPIHandler from '../../../../hooks/use-api-handler'
import { GenericDialogProps } from '../map-dialog-edit.component'
import RangeDateTimePicker from '../../../../common/range-date-time-picker'

export function MissionDialog({
  operationType,
  editState,
  dispatchEditAction,
  editError
}: React.PropsWithChildren<GenericDialogProps>) {
  const { t } = useTranslation(['maps', 'labels'])
  const missionStatusOptions = Object.values(MissionStatusType)
  const { apiConfig: backendAPIConfig } = useAPIConfiguration('backoffice')
  const orgApiFactory = useMemo(() => OrganizationsApiFactory(backendAPIConfig), [backendAPIConfig])
  const teamsApiFactory = useMemo(() => TeamsApiFactory(backendAPIConfig), [backendAPIConfig])
  const [orgApiHandlerState, handleOrgAPICall] = useAPIHandler(false)
  const [teamsApiHandlerState, handleTeamsAPICall] = useAPIHandler(false)

  useEffect(() => {
    handleOrgAPICall(() => {
      return orgApiFactory.organizationsGetOrganizations(0, 1000)
    })
    handleTeamsAPICall(() => {
      return teamsApiFactory.teamsGetTeams(1000)
    })
  }, [orgApiFactory, teamsApiFactory, handleOrgAPICall, handleTeamsAPICall])

  const orgOptions = useMemo(() => {
    return orgApiHandlerState.result.data
      ? Object.fromEntries(
          orgApiHandlerState.result.data.data.map((obj) => [obj['id'], obj['name']])
        )
      : {}
  }, [orgApiHandlerState])

  const teamsOptions = useMemo(() => {
    return teamsApiHandlerState.result.data && editState.orgId !== -1
      ? Object.fromEntries(
          teamsApiHandlerState.result.data.data
            .filter((e) => e['organization']['id'] === editState.orgId)
            .map((obj) => [obj['id'], obj['name']])
        )
      : {}
  }, [teamsApiHandlerState, editState.orgId])

  const usersOptions = useMemo(() => {
    return teamsApiHandlerState.result.data && editState.teamId !== -1
      ? Object.fromEntries(
          teamsApiHandlerState.result.data.data
            .filter((e) => e['id'] === editState.teamId)[0]
            ['members'].map((obj) => [obj['id'], obj['displayName']])
            .filter((e) => (e[1] ? true : false))
        )
      : {}
  }, [teamsApiHandlerState, editState.teamId])

  useEffect(() => {
    if (Object.entries(orgOptions).length === 1)
      dispatchEditAction({
        type: 'COORDINATOR',
        value: {
          coordType: CoordinatorType.ORGANIZATION,
          coordId: Number(Object.entries(orgOptions)[0][0])
        }
      })
  }, [orgOptions, dispatchEditAction])

  return (
    <Grid container direction="column">
      <Grid style={{ marginBottom: 8 }}>
        <TextField
          id="title"
          label={t('maps:title_label')}
          error={editError && editState.title.length === 0}
          helperText={
            editError && editState.title.length === 0
              ? t('maps:mandatory_field')
              : `${editState.title.length}/255`
          }
          value={editState.title}
          onChange={(e) => dispatchEditAction({ type: 'TITLE', value: e.target.value })}
          variant="outlined"
          placeholder={t('maps:title_placeholder')}
          color="primary"
          fullWidth={true}
          inputProps={{ maxLength: 255 }}
        />
      </Grid>
      <Grid container direction="row" alignItems="center">
        <RangeDateTimePicker editState={editState} dispatchEditAction={dispatchEditAction} />
        <Grid item style={{ marginLeft: 16, flex: 1 }}>
          <FormControl
            margin="normal"
            style={{ minWidth: '50%' }}
            disabled={operationType === 'create'}
          >
            <InputLabel id="select-mission-status-label">{t('labels:status')}</InputLabel>
            <Select
              labelId="select-mission-status-label"
              id="select-mission-status"
              value={editState.status}
              renderValue={(e) => t('labels:' + (e as string).toLowerCase())}
              onChange={(event) => {
                dispatchEditAction({ type: 'STATUS', value: event.target.value as string })
              }}
            >
              {missionStatusOptions.map((e) => {
                return (
                  <MenuItem key={e} value={e}>
                    {t('labels:' + e.toLowerCase())}
                  </MenuItem>
                )
              })}
            </Select>
          </FormControl>
        </Grid>
      </Grid>
      <Grid container>
        <Grid item style={{ flex: 1 }}>
          <FormControl
            margin="normal"
            style={{ minWidth: '50%' }}
            disabled={Object.entries(orgOptions).length < 2}
            error={editError && editState.coordinatorType === CoordinatorType.NONE}
          >
            <InputLabel id="select-organization-label">{t('maps:organization')}</InputLabel>
            <Select
              labelId="select-organization-label"
              id="select-organization"
              value={editState.orgId}
              renderValue={(orgId) => (orgId === -1 ? '' : orgOptions[orgId as number])}
              onChange={(event) => {
                dispatchEditAction({
                  type: 'COORDINATOR',
                  value: {
                    coordType: CoordinatorType.ORGANIZATION,
                    coordId: Number(event.target.value)
                  }
                })
              }}
            >
              {Object.entries(orgOptions).map((e) => {
                return (
                  <MenuItem key={e[0]} value={e[0]}>
                    {e[1]}
                  </MenuItem>
                )
              })}
            </Select>
            <FormHelperText>
              {editError &&
                editState.coordinatorType === CoordinatorType.NONE &&
                t('maps:mandatory_field')}
            </FormHelperText>
          </FormControl>
        </Grid>
        <Grid item style={{ flex: 1 }}>
          <FormControl
            margin="normal"
            style={{ minWidth: '50%' }}
            disabled={Object.entries(teamsOptions).length === 0}
          >
            <InputLabel id="select-team-label">{t('maps:team')}</InputLabel>
            <Select
              labelId="select-team-label"
              id="select-team"
              value={editState.teamId}
              renderValue={(teamId) => (teamId === -1 ? '' : teamsOptions[teamId as number])}
              onChange={(event) => {
                dispatchEditAction({
                  type: 'COORDINATOR',
                  value: { coordType: CoordinatorType.TEAM, coordId: Number(event.target.value) }
                })
              }}
              startAdornment={
                editState.teamId !== -1 && (
                  <IconButton
                    size="small"
                    disabled={editState.teamId === -1}
                    onClick={(e) =>
                      dispatchEditAction({
                        type: 'COORDINATOR',
                        value: { coordType: CoordinatorType.TEAM, coordId: -1 }
                      })
                    }
                  >
                    <ClearIcon />
                  </IconButton>
                )
              }
            >
              {Object.entries(teamsOptions).map((e) => {
                return (
                  <MenuItem key={e[0]} value={e[0]}>
                    {e[1]}
                  </MenuItem>
                )
              })}
            </Select>
          </FormControl>
        </Grid>
        <Grid item style={{ flex: 1 }}>
          <FormControl
            margin="normal"
            style={{ minWidth: '50%' }}
            disabled={Object.entries(usersOptions).length === 0}
          >
            <InputLabel id="select-user-label">{t('maps:user')}</InputLabel>
            <Select
              labelId="select-user-label"
              id="select-user"
              value={editState.userId}
              renderValue={(userId) => (userId === -1 ? '' : usersOptions[userId as number])}
              onChange={(event) => {
                dispatchEditAction({
                  type: 'COORDINATOR',
                  value: {
                    coordType: CoordinatorType.USER,
                    coordId: event.target.value as number
                  }
                })
              }}
              startAdornment={
                editState.userId !== -1 && (
                  <IconButton
                    size="small"
                    disabled={editState.userId === -1}
                    onClick={(e) =>
                      dispatchEditAction({
                        type: 'COORDINATOR',
                        value: { coordType: CoordinatorType.USER, coordId: -1 }
                      })
                    }
                  >
                    <ClearIcon />
                  </IconButton>
                )
              }
            >
              {Object.entries(usersOptions).map((e) => {
                return (
                  <MenuItem key={e[0]} value={e[0]}>
                    {e[1]}
                  </MenuItem>
                )
              })}
            </Select>
          </FormControl>
        </Grid>
      </Grid>
      <Grid style={{ marginTop: 8 }}>
        <TextField
          id="description"
          label={t('maps:description_label')}
          multiline
          error={editError && editState.description.length === 0}
          helperText={
            editError && editState.description.length === 0
              ? t('maps:mandatory_field')
              : `${editState.description.length}/1000`
          }
          value={editState.description}
          onChange={(e) => dispatchEditAction({ type: 'DESCRIPTION', value: e.target.value })}
          variant="filled"
          placeholder={t('maps:description_placeholder')}
          color="primary"
          rowsMax={4}
          rows={4}
          fullWidth={true}
          inputProps={{ maxLength: 1000 }}
        />
      </Grid>
    </Grid>
  )
}
