import React, { useEffect, useMemo } from 'react';

import { Grid, IconButton,TextField,FormControl,InputLabel, MenuItem, Select, FormHelperText } from '@mui/material'
import TodayIcon from '@mui/icons-material/Today'

// import DateFnsUtils from '@date-io/date-fns'
import {
    // MuiPickersUtilsProvider,
    DateTimePicker
} from '@mui/x-date-pickers/DateTimePicker'


import useLanguage from '../../../../hooks/use-language.hook';
import { useTranslation } from 'react-i18next';
import { GenericDialogProps } from '../map-dialog-edit.component';
import { CommunicationRestrictionType, CommunicationScopeType } from 'ermes-ts-sdk';
import { useAPIConfiguration } from '../../../../hooks/api-hooks';
import { OrganizationDto, OrganizationsApiFactory } from 'ermes-backoffice-ts-sdk';
import useAPIHandler from '../../../../hooks/use-api-handler';


export function CommunicationDialog(
    {
        editState,
        dispatchEditAction,
        editError
    }: React.PropsWithChildren<GenericDialogProps>
) {

    const { dateFormat } = useLanguage()
    const { t } = useTranslation(['maps', 'labels'])
    const endAdornment = useMemo(() => {
        return (<IconButton>
            <TodayIcon />
        </IconButton>)
    }, [])

    const scopeTypes = [ CommunicationScopeType.PUBLIC, CommunicationScopeType.RESTRICTED]
    const restrictedTypes = [CommunicationRestrictionType.CITIZEN, CommunicationRestrictionType.ORGANIZATION, CommunicationRestrictionType.PROFESSIONAL]
    const { apiConfig: backendAPIConfig } = useAPIConfiguration('backoffice')
    const orgApiFactory = useMemo(
      () => OrganizationsApiFactory(backendAPIConfig),
      [backendAPIConfig]
    )
    const [orgApiHandlerState, handleOrgAPICall] = useAPIHandler(false)

    useEffect(() => {
      handleOrgAPICall(() => {
        return orgApiFactory.organizationsGetOrganizations(0, 1000)
      })
    }, [orgApiFactory, handleOrgAPICall])

    const organizationList: OrganizationDto[] = useMemo(() => {
      if (!orgApiHandlerState.loading && orgApiHandlerState.result.data)
          return orgApiHandlerState.result.data.data
      else
          return []
    }, [orgApiHandlerState])    

    return (
      <Grid container direction="column">
        <Grid container direction="row">
          {/* <MuiPickersUtilsProvider utils={DateFnsUtils}> */}
            <DateTimePicker
              // style={{ paddingTop: 0, marginTop: 0 }}  // TODO remove
              // variant="inline" // TODO remove
              format={dateFormat}
              // margin="normal" // TODO remove
              // id="start-date-picker-inline" // TODO remove
              label={t('common:date_picker_test_start')}
              value={editState.startDate}
              onChange={(d) => dispatchEditAction({ type: 'START_DATE', value: d as Date })}
              disableFuture={false}
              // autoOk={true} // TODO remove
              ampm={false}
              // clearable={true} // TODO remove
              // InputProps={{ // // TODO fix
              //   endAdornment: endAdornment
              // }}
            />
            <DateTimePicker
              // style={{ paddingTop: 0, marginTop: 0 }} // TODO remove
              // variant="inline" // TODO remove
              format={dateFormat}
              // margin="normal" // TODO remove 
              // id="end-date-picker-inline" // TODO remove 
              label={t('common:date_picker_test_end')}
              value={editState.endDate}
              onChange={(d) => dispatchEditAction({ type: 'END_DATE', value: d as Date })}
              disableFuture={false}
              // autoOk={true} // TODO remove 
              ampm={false}
              // error={editError} // TODO fix
              // helperText={editError && !editState.endDate && t('maps:mandatory_field')} // TODO fix
              minDate={editState.startDate}
              // InputProps={{ // TODO fix
              //   endAdornment: endAdornment
              // }}
            />
          {/* </MuiPickersUtilsProvider> */}
        </Grid>
        <Grid container style={{ marginBottom: 16, width: '100%' }}>
          <FormControl margin="normal" style={{ minWidth: '30%', marginRight: '10px' }}>
            <InputLabel id="select-datatype-label">{t('labels:scope')}</InputLabel>
            <Select
              labelId="select-datatype-label"
              id="select-datatype"
              value={editState.scope}
              multiple={false}
              error={editError && editState.dataType.length < 1}
              // renderValue={(selected) => (selected as string[]).map(id => dataTypeOptions[id]).join(', ')}
              onChange={(event) => {
                dispatchEditAction({ type: 'SCOPE', value: event.target.value })
                if (event.target.value == CommunicationScopeType.PUBLIC)
                  dispatchEditAction({
                    type: 'RESTRICTION',
                    value: CommunicationRestrictionType.NONE
                  })
              }}
            >
              {scopeTypes.map((e) => (
                <MenuItem key={e} value={e}>
                  {e}
                </MenuItem>
              ))}
            </Select>
            {editError ? (
              <FormHelperText style={{ color: '#f44336' }}>
                {t('maps:mandatory_field')}
              </FormHelperText>
            ) : null}
          </FormControl>
          {editState.scope == CommunicationScopeType.RESTRICTED ? (
            <FormControl margin="normal" style={{ minWidth: '30%', marginLeft: '10px' }}>
              <InputLabel id="select-datatype-label">{t('labels:restriction')}</InputLabel>
              <Select
                labelId="select-datatype-label"
                id="select-datatype"
                value={editState.restrictionType}
                multiple={false}
                error={editError}
                //renderValue={(selected) => (selected as string[]).map(id => dataTypeOptions[id]).join(', ')}
                onChange={(event) => {
                  dispatchEditAction({ type: 'RESTRICTION', value: event.target.value })
                  //dispatchEditAction({ type: "DATATYPE", value: event.target.value })
                }}
              >
                {restrictedTypes.map((e) => (
                  <MenuItem key={e} value={e}>
                    {e}
                  </MenuItem>
                ))}
              </Select>
              {editError ? (
                <FormHelperText style={{ color: '#f44336' }}>
                  {t('maps:mandatory_field')}
                </FormHelperText>
              ) : null}
            </FormControl>
          ) : null}
          {editState.restrictionType == CommunicationRestrictionType.ORGANIZATION ? (
            <FormControl margin="normal" style={{ minWidth: '30%', marginLeft: '10px' }}>
              <InputLabel id="select-organizations-label">{t('labels:receivers')}</InputLabel>
              <Select
                labelId="select-organizations-label"
                id="select-organizations"
                value={editState.organizationReceiverIds}
                multiple={true}
                error={editError}
                onChange={(event) => {
                  dispatchEditAction({ type: 'ORGANIZATIONRECEIVERIDS', value: event.target.value })
                }}
              >
                {organizationList.map((e) => (
                  <MenuItem key={e.id} value={e.id}>
                    {e.name}
                  </MenuItem>
                ))}
              </Select>
              {editError ? (
                <FormHelperText style={{ color: '#f44336' }}>
                  {t('maps:mandatory_field')}
                </FormHelperText>
              ) : null}
            </FormControl>
          ) : null}
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