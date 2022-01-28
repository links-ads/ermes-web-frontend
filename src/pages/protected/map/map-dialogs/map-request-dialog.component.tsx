import React, { useMemo } from 'react';

import { FormControl, TextField, Grid, IconButton, InputLabel, MenuItem, Select } from '@material-ui/core'
import TodayIcon from '@material-ui/icons/Today'

import {
    MuiPickersUtilsProvider,
    DateTimePicker
} from '@material-ui/pickers'
import DateFnsUtils from '@date-io/date-fns'

import useLanguage from '../../../../hooks/use-language.hook';
import { useTranslation } from 'react-i18next';

import { HazardType } from 'ermes-ts-sdk'
import { GenericDialogProps } from '../map-dialog-edit.component';
import { _MS_PER_DAY } from '../../../../utils/utils.common';



export function MapRequestDialog(
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

    const hazardOptions = useMemo(() => { return Object.values(HazardType).filter(v => v !== "None") }, [])

    console.log(editState)
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
            <Grid container>
                <Grid item style={{ flex: 1 }}>
                    <FormControl margin='normal' style={{ minWidth: '50%' }}>
                        <InputLabel id='select-hazard-label'>{t('maps:organization')}</InputLabel>
                        <Select
                            labelId='select-hazard-label'
                            id="select-hazard"
                            value={editState.hazard}
                            renderValue={(h) => t("labels:" + (h as string).toLowerCase())}
                            onChange={(event) => {
                                dispatchEditAction({ type: "HAZARD", value: event.target.value as HazardType })
                            }}
                        >
                            {hazardOptions.map((e) => {
                                return (
                                    <MenuItem key={e} value={e}>
                                        {t("labels:" + (e as string).toLowerCase())}
                                    </MenuItem>
                                )
                            })}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item style={{ flex: 1 }}>
                    <TextField
                        id="title"
                        label={t("maps:frequency_label")}
                        error={editError && parseInt(editState.frequency) < 0}
                        helperText={editError && parseInt(editState.frequency) < 0 && t("maps:frequency_help") }
                        type="number"
                        value={editState.frequency}
                        onChange={e => dispatchEditAction({ type: 'FREQUENCY', value: e.target.value })}
                        variant='outlined'
                        color='primary'
                        fullWidth={true}
                        inputProps={{ min: 0 , max:30}}
                />
                </Grid>
            </Grid>
        </Grid>
    )
}