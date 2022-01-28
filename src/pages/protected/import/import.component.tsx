import React, { useMemo, useState } from 'react';

import Input from '@material-ui/core/Input';
import { Button, CircularProgress, Grid, InputLabel, ListItemText, List, ListItem, MenuItem, Select, Typography } from '@material-ui/core';

import FormControl from '@material-ui/core/FormControl';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import { useTranslation } from 'react-i18next'
import { useSnackbars } from '../../../hooks/use-snackbars.hook';
import PublishIcon from '@material-ui/icons/Publish';
import DeleteIcon from '@material-ui/icons/Delete';

import useImports, { ImportEnum } from '../../../hooks/use-imports.hook';

import { useDropzone } from 'react-dropzone'

import excelIcon from '../../../assets/excelIcon/excel_128.png'

const getAcceptedFilename = (select) => {
    return 'Import' + select[0].toUpperCase() + select.slice(1)
}

const ImportComponent = (props) => {    
    const { displayErrorSnackbar, displayMessage } = useSnackbars()
    const { importState, sendFile } = useImports()
    const [fileState, setFileState] = useState({
        currentFile: null,
        currentFilename: '',
        progress: 0,
        message: "",
        isError: false,
        fileInfos: null,
    })

    const selectOptions = useMemo(() => Object.values(ImportEnum), [])
    const { t } = useTranslation(['import'])

    const [selectState, setSelectState] = useState<{ choice: string, filename: string }>({ choice: selectOptions[0], filename: getAcceptedFilename(selectOptions[0]) })

    const {
        getRootProps,
        getInputProps,
        isDragActive
    } = useDropzone({
        accept: ".xlsx",
        maxFiles: 1,
        multiple: false,
        onDropAccepted: (files, event) => dropHandler(files, event)
    });

    const useStyles = makeStyles((theme: Theme) =>
        createStyles({
            section: {
                padding: '8px',
                margin: '8px'
            },
            selectOption: {
                width: '100%',
                // minWidth: 180,
                // maxWidth:180
            },
            button:{
                marign:16
            },
            dropzone: {
                background: `repeating-linear-gradient(-45deg,${theme['palette']['background']['paper']},
                ${theme['palette']['background']['paper']} 10px,
                ${theme['palette']['background']['default']} 10px,
                ${theme['palette']['background']['default']} 20px)`,
                height: '30vh',
                minHeight: 200,
                maxHeight: 400,
                borderWidth: 2,
                borderRadius: 2,
                borderColor: isDragActive ? '#2196f3' :fileState.currentFile !== null ? '#00e676' : fileState.isError ? '#ff1744' : theme['palette']['text']['primary'],
                borderStyle: 'dashed',
                transition: 'border .24s ease-in-out',
                outline: 'none',
            }
        }));

    const classes = useStyles();

    const checkFileName = (name: string) => {
        if (name === undefined)
            return [true, '']
        if (!((name.endsWith('.xls')) || (name.endsWith('.xlsx'))))
            return [false, t('import:extension_error')]
        const filename = name.split('.')[0]
        if (filename !== selectState.filename)
            return [false, t('import:name_error', { filename: selectState.filename })]
        return [true, '']
    }


    const inputSelectHandler = (event) => {
        const selection = event.target.value as string
        setSelectState({ choice: selection, filename: getAcceptedFilename(selection) })
        setFileState({
            ...fileState,
            currentFile: null,
            currentFilename: '',
            isError: false
        })
    }

    const deleteButtonHandler = () => {
        setFileState({
            ...fileState,
            currentFile: null,
            currentFilename: '',
            isError: false
        })
    }

    const dropHandler = (files, event) => {
        const file = files[0]
        const [isCorrect, errorMsg] = checkFileName(file ? file.name : undefined)
        if (!isCorrect) {
            displayErrorSnackbar(errorMsg as string)
            setFileState({
                ...fileState,
                currentFile: null,
                currentFilename: '',
                isError: true
            });
        }
        else {
            displayMessage(t("import:file_ok", { filename: file.name }))
            setFileState({
                ...fileState,
                currentFile: file,
                currentFilename: file.name,
                isError: false
            });
        }
    }

    return (
        <Grid container direction="row" justify="flex-start" alignContent='space-around'>
            <Grid item className={classes.section}>
                <h1>
                    {t('import:label_title')}
                </h1>
            </Grid>
            <Grid container>
                <Grid container direction='column' style={{ flex: 2 }}>
                    <Grid item className={classes.section}>
                        <FormControl className={classes.selectOption}>
                            <InputLabel id={'import-label'}>{t("import:select_label")}</InputLabel>
                            <Select
                                labelId={'multi-hazard-label'}
                                id={"multi-hazard-select"}
                                value={selectState.choice}
                                onChange={inputSelectHandler}
                                input={<Input />}
                                renderValue={item => (<Typography align='center'>{t("import:label_" + item)}</Typography>)}
                            >
                                {selectOptions.map((value) => (
                                    <MenuItem
                                        key={value}
                                        value={value}
                                    >
                                        <ListItemText primary={t("import:label_" + value)} />
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item className={classes.section}>
                        <Grid {...getRootProps({ className:classes.dropzone,container:true,justify:'center',alignContent:'center' })}>
                            <input {...getInputProps()} />
                            {fileState.currentFile === null ?
                                (
                                    <Grid>
                                        <Typography align='center' style={{ margin: 5, fontWeight: 1000 }}>{t("import:zone_label")}</Typography>
                                        <Typography align='center' style={{ margin: 5, fontWeight: 1000 }}>{t("import:zone_name_label", { filename: selectState.filename })}</Typography>
                                    </Grid>
                                ) : (
                                    <Grid container justify='center' direction='column' alignContent='center' >
                                        <img src={excelIcon} style={{ objectFit: 'contain' }} alt=''/>
                                        <Typography style={{ margin: 5 }}>{fileState.currentFilename}</Typography>
                                    </Grid>
                                )

                            }
                        </Grid>
                    </Grid>
                    <Grid container className={classes.section} justify='space-around'>
                        <Button
                            startIcon={<DeleteIcon />}
                            size='large'
                            variant='contained'
                            color='secondary'
                            disabled={fileState.currentFile === null}
                            onClick={deleteButtonHandler}
                            className={classes.button}
                        >
                            {t("import:remove_button")}
                        </Button>
                        <Button
                            startIcon={<PublishIcon />}
                            size='large'
                            variant='contained'
                            color='primary'
                            disabled={fileState.currentFile === null}
                            onClick={() => sendFile(selectState.choice, fileState.currentFile)}
                            className={classes.button}
                        >
                            {t("import:upload_button")}
                        </Button>
                    </Grid>
                </Grid>
                <Grid container direction='column' style={{ flex: 3 }}>
                    <Grid container direction='column' style={{ padding: 16 }} justify='center' alignContent='center'>
                        {
                            (importState.isLoading) ? (
                                <Grid container justify='center'>
                                    <Typography align='center' variant='h5'>
                                        {t("import:loading_label")}
                                    </Typography>
                                    <Grid container style={{ margin: 32 }} justify='center'>
                                        <CircularProgress size={100} />
                                    </Grid>
                                </Grid>
                            ) : (Object.keys(importState.data).length > 0) ? (
                                <Grid container justify='center' direction='column'>
                                    <Typography align='center' variant='h5'>
                                        {t("import:result_label")}
                                    </Typography>
                                    <Grid style={{ marginLeft: 32 }}>
                                        <List>
                                            <ListItem>
                                                <Typography align='left' variant='h6' style={{ fontWeight: 800 }}>{t("import:translationsAdded") + ' : '}</Typography>&nbsp;
                                                <Typography align='left' variant='h6' >{importState.data.translationsAdded}</Typography>
                                            </ListItem>
                                            <ListItem>
                                                <Typography variant='h6' style={{ fontWeight: 800 }}>{t("import:translationsUpdated") + ' : '}</Typography>&nbsp;
                                                <Typography variant='h6' >{importState.data.translationsUpdated}</Typography>
                                            </ListItem>
                                            <ListItem>
                                                <Typography variant='h6' style={{ fontWeight: 800 }}>{t("import:translationsDetectedEmptyAndSkipped") + ' : '}</Typography>&nbsp;
                                                <Typography variant='h6' >{importState.data.translationsDetectedEmptyAndSkipped}</Typography>
                                            </ListItem>
                                            <ListItem>
                                                <Typography variant='h6' style={{ fontWeight: 800 }}>{t("import:elementsAdded") + ' : '}</Typography>&nbsp;
                                                <Typography variant='h6' >{importState.data.elementsAdded}</Typography>
                                            </ListItem>
                                            <ListItem>
                                                <Typography variant='h6' style={{ fontWeight: 800 }}>{t("import:elementsUpdated") + ' : '}</Typography>&nbsp;
                                                <Typography variant='h6' >{importState.data.elementsUpdated}</Typography>
                                            </ListItem>
                                        </List>
                                    </Grid>
                                </Grid>
                            ) : null
                        }
                    </Grid>
                </Grid>
            </Grid>
        </Grid>
    )
}

export default ImportComponent;