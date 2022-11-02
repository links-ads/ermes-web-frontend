import React, { useMemo, useEffect } from 'react';

import { FormControl, TextField, Grid, IconButton, InputLabel, MenuItem, Select, Checkbox, ListItemText, FormHelperText } from '@material-ui/core'
import TodayIcon from '@material-ui/icons/Today'

import {
    MuiPickersUtilsProvider,
    DateTimePicker, 
    DatePicker
} from '@material-ui/pickers'
import DateFnsUtils from '@date-io/date-fns'

import useLanguage from '../../../../hooks/use-language.hook';
import { useTranslation } from 'react-i18next';

import { GenericDialogProps } from '../map-dialog-edit.component';
import { _MS_PER_DAY } from '../../../../utils/utils.common';
import useAPIHandler from '../../../../hooks/use-api-handler';
import { LayersApiFactory } from 'ermes-backoffice-ts-sdk';
import { useAPIConfiguration } from '../../../../hooks/api-hooks';



export function MapRequestDialog(
    {
        operationType,
        editState,
        dispatchEditAction,
        editError
    }: React.PropsWithChildren<GenericDialogProps>
) {
    //const { dateFormat } = useLanguage()
    const { t } = useTranslation(['maps', 'labels'])
    const endAdornment = useMemo(() => {
        return (<IconButton>
            <TodayIcon />
        </IconButton>)
    }, [])

    const { apiConfig: backendAPIConfig } = useAPIConfiguration('backoffice')
    const layersApiFactory = useMemo(() => LayersApiFactory(backendAPIConfig), [backendAPIConfig])
    const [apiHandlerState, handleAPICall, resetApiHandlerState] = useAPIHandler(false)
    useEffect(() => {
        handleAPICall(() => layersApiFactory.getStaticDefinitionOfLayerList())
    }, [])

/**
 * object that represents the list elements in the createmaprequest layers dropdown;
 * typescript and javascript keep the dictionaries ordered by key, so the elements
 * order is different from what comes form the apis
 */
    const dataTypeOptions = useMemo(() => {
        
        if (Object.entries(apiHandlerState.result).length === 0)
            return []
        else {
            const entries = [] as any[]
            apiHandlerState.result.data.layerGroups.forEach(group => {
                group.subGroups.forEach(subGroup => {
                    subGroup.layers.forEach(layer => {
                        if (layer.frequency === 'OnDemand') {
                            entries.push([layer.dataTypeId as string, layer.name])
                        }
                    })
                })
            })
            return Object.fromEntries(entries) //this method orders elements by the keys, could be a way to sort the contents of a dictionary
        }

    }, [apiHandlerState])
console.log('datatype', editState.dataType, typeof( editState.dataType[0]))
    return (
        <Grid container direction='column'>
            <Grid container direction='row'>
                <MuiPickersUtilsProvider utils={DateFnsUtils}>
                    <DatePicker
                        style={{ paddingTop: 0, marginTop: 0 }}
                        variant="inline"
                        format={"dd/MM/yyyy"}
                        margin="normal"
                        id="start-date-picker-inline"
                        label={t('common:date_picker_test_start')}
                        value={editState.startDate}
                       
                        onChange={d => {
                            if(d!=null){
                                let d1 = new Date(d?.setHours(0,0,0,0))
                                return dispatchEditAction({ type: 'START_DATE', value: d1 as Date })
                            }}}
                        disableFuture={false}
                        autoOk={true}
                      
                        clearable={true}
                        InputProps={{
                            endAdornment: endAdornment
                        }}
                    />
                    <DatePicker
                        style={{ paddingTop: 0, marginTop: 0 }}
                        variant="inline"
                        format={"dd/MM/yyyy"}
                        margin="normal"
                        id="end-date-picker-inline"
                        label={t('common:date_picker_test_end')}
                        value={editState.endDate}
                        onChange={d => {
                            if(d!=null){
                                let d1 = new Date(d?.setHours(23,59,59,0))
                                return dispatchEditAction({ type: 'END_DATE', value: d1 as Date })
                            }}}
                        disableFuture={false}
                        autoOk={true}
                       
                        error={editError && !editState.endDate}
                        helperText={editError && !editState.endDate && t("maps:mandatory_field")}
                        minDate={editState.startDate}
                        maxDate={new Date(new Date(editState.startDate).valueOf() + _MS_PER_DAY * 30)}
                        InputProps={{
                            endAdornment: endAdornment
                        }}
                    />
                </MuiPickersUtilsProvider>
            </Grid>
            <Grid container style={{marginBottom:16, width:'50%'}} >
                <FormControl margin='normal' style={{ minWidth: '50%' }}>
                    <InputLabel id='select-datatype-label'>{t('maps:layer')}</InputLabel>
                    <Select
                        labelId='select-datatype-label'
                        id="select-datatype"
                        value={editState.dataType}
                        multiple={true}
                        error={editError && editState.dataType.length<1}
                        renderValue={(selected) => (selected as string[]).map(id => dataTypeOptions[id]).join(', ')}
                        onChange={(event) => {
                            dispatchEditAction({ type: "DATATYPE", value: event.target.value })
                        }}
                    >
                        {Object.entries(dataTypeOptions).map((e) => (
                            <MenuItem key={e[0]} value={e[0]}>
                                <Checkbox checked={editState.dataType.indexOf(e[0]) > -1} />
                                <ListItemText primary={e[1]} />
                            </MenuItem>
                        ))}
                    </Select>
                    {(editError && editState.dataType.length<1)?
                    (
                    <FormHelperText style={{color:'#f44336'}}>{t("maps:mandatory_field")}</FormHelperText>
                    ):null}
                </FormControl>
            </Grid>
            <Grid container style={{marginBottom:16, width:'50%'}}>
                <TextField
                    id="frequency-title"
                    label={t("maps:frequency_label")}
                    error={editError && parseInt(editState.frequency) < 0}
                    helperText={editError && parseInt(editState.frequency) < 0 && t("maps:frequency_help")}
                    type="number"
                    value={editState.frequency}
                    onChange={e => dispatchEditAction({ type: 'FREQUENCY', value: e.target.value })}
                    variant='outlined'
                    color='primary'
                    fullWidth={true}
                    inputProps={{ min: 0, max: 30 }}
                />
            </Grid>
            <Grid container style={{marginBottom:16, width:'50%'}}>
                <TextField
                    id="resolution-title"
                    label={t("maps:resolution_label")}
                    error={editError && parseInt(editState.resolution) < 0}
                    helperText={editError && parseInt(editState.resolution) < 0 && t("maps:resolution_help")}
                    type="number"
                    value={editState.resolution}
                    onChange={e => dispatchEditAction({ type: 'RESOLUTION', value: e.target.value })}
                    variant='outlined'
                    color='primary'
                    fullWidth={true}
                    inputProps={{ min: 10, max: 60 }}
                />
            </Grid>
        </Grid>
    )
}