import React, { useMemo } from 'react';

import { Grid, IconButton,TextField,FormControl,InputLabel, MenuItem, Select, Checkbox, ListItemText, FormHelperText } from '@material-ui/core'
import TodayIcon from '@material-ui/icons/Today'

import DateFnsUtils from '@date-io/date-fns'
import {
    MuiPickersUtilsProvider,
    DateTimePicker
} from '@material-ui/pickers'


import useLanguage from '../../../../hooks/use-language.hook';
import { useTranslation } from 'react-i18next';
import { GenericDialogProps } from '../map-dialog-edit.component';
import { CommunicationRestrictionType, CommunicationScopeType } from 'ermes-ts-sdk';


export function CommunicationDialog(
    {
        operationType,
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
    let i = CommunicationScopeType.PUBLIC
    let j = CommunicationRestrictionType.NONE
    const scopeTypes = [ CommunicationScopeType.PUBLIC, CommunicationScopeType.RESTRICTED]
    const restrictedTypes = [CommunicationRestrictionType.CITIZEN, CommunicationRestrictionType.ORGANIZATION, CommunicationRestrictionType.PROFESSIONAL]

    return (
        <Grid container direction='column'>
            <Grid container direction='row'>
                <MuiPickersUtilsProvider utils={DateFnsUtils}>
                    <DateTimePicker
                        style={{ paddingTop: 0, marginTop: 0 }}
                        variant="inline"
                        format={dateFormat}
                        margin="normal"
                        id="start-date-picker-inline"
                        label={t('common:date_picker_test_start')}
                        value={editState.startDate}
                        onChange={d => dispatchEditAction({ type: 'START_DATE', value: d as Date })}
                        disableFuture={false}
                        autoOk={true}
                        ampm={false}
                        clearable={true}
                        InputProps={{
                            endAdornment: endAdornment
                        }}
                    />
                    <DateTimePicker
                        style={{ paddingTop: 0, marginTop: 0 }}
                        variant="inline"
                        format={dateFormat}
                        margin="normal"
                        id="end-date-picker-inline"
                        label={t('common:date_picker_test_end')}
                        value={editState.endDate}
                        onChange={d => dispatchEditAction({ type: 'END_DATE', value: d as Date })}
                        disableFuture={false}
                        autoOk={true}
                        ampm={false}
                        error={editError}
                        helperText={editError && !editState.endDate && t("maps:mandatory_field")}
                        minDate={editState.startDate}
                        InputProps={{
                            endAdornment: endAdornment
                        }}
                    />
                </MuiPickersUtilsProvider>
            </Grid>
            <Grid container style={{marginBottom:16, width:'75%'}} >
                <FormControl margin='normal' style={{ minWidth: '45%', marginRight:'10px' }}>
                    <InputLabel id='select-datatype-label'>{t("labels:scope")}</InputLabel>
                    <Select
                        labelId='select-datatype-label'
                        id="select-datatype"
                        value={editState.scope}
                        multiple={false}
                        error={editError && editState.dataType.length<1}
                       // renderValue={(selected) => (selected as string[]).map(id => dataTypeOptions[id]).join(', ')}
                        onChange={(event) => {
                            
                            dispatchEditAction({ type: "SCOPE", value: event.target.value })
                            if(event.target.value == CommunicationScopeType.PUBLIC)
                            dispatchEditAction({ type: "RESTRICTION", value: CommunicationRestrictionType.NONE })
                            //console.log('HEY', String(event.target.value),editState.scope, CommunicationScopeType.RESTRICTED,  event.target.value == CommunicationScopeType.PUBLIC)
                        }}
                    >
                        {scopeTypes.map((e) => (
                            <MenuItem key={e} value={e}>
                               {e}
                            </MenuItem>
                        ))} 
                    </Select>
                    {(editError)?
                    (
                    <FormHelperText style={{color:'#f44336'}}>{t("maps:mandatory_field")}</FormHelperText>
                    ):null}
                </FormControl>
                {editState.scope == CommunicationScopeType.RESTRICTED ? (
            <>
                <FormControl margin='normal' style={{ minWidth: '45%', marginLeft:'10px' }}>
                    <InputLabel id='select-datatype-label'>{t("labels:restriction")}</InputLabel>
                    <Select
                        labelId='select-datatype-label'
                        id="select-datatype"
                        value={editState.restrictionType}
                        multiple={false}
                        error={editError}
                        //renderValue={(selected) => (selected as string[]).map(id => dataTypeOptions[id]).join(', ')}
                        onChange={(event) => {
                            dispatchEditAction({ type: "RESTRICTION", value: event.target.value })
                            //dispatchEditAction({ type: "DATATYPE", value: event.target.value })
                        }}
                    >
                        {restrictedTypes.map((e) => (
                            <MenuItem key={e} value={e}>
                               {e}
                            </MenuItem>
                        ))} 
                    </Select>
                    {(editError)?
                    (
                    <FormHelperText style={{color:'#f44336'}}>{t("maps:mandatory_field")}</FormHelperText>
                    ):null}
                </FormControl> 
                 </>
                 ) : null}
            </Grid>

            <Grid style={{ marginTop: 8 }}>
                <TextField
                    id="description"
                    label={t("maps:description_label")}
                    multiline
                    error={editError && editState.description.length === 0}
                    helperText={(editError && editState.description.length === 0) ? t("maps:mandatory_field") : `${editState.description.length}/1000`}
                    value={editState.description}
                    onChange={e => dispatchEditAction({ type: 'DESCRIPTION', value: e.target.value })}
                    variant='filled'
                    placeholder={t("maps:description_placeholder")}
                    color='primary'
                    rowsMax={4}
                    rows={4}
                    fullWidth={true}
                    inputProps={{ maxLength: 1000 }}
                />
            </Grid>
        </Grid>
    )
}