import React, { useCallback, useEffect, useState } from 'react'
import {
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Chip,
  CircularProgress,
  FormControl,
  FormControlLabel,
  FormLabel,
  Grid,
  IconButton,
  Modal,
  Paper,
  Radio,
  RadioGroup,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography
} from '@material-ui/core'
import Carousel from 'react-material-ui-carousel'
import { HAZARD_SOCIAL_ICONS } from '../../../../../utils/utils.common'
import useReportById from '../../../../../hooks/use-report-by-id.hook'
import { ConfirmDialog } from '../../../../../common/dialogs/confirm-dialog.component'
import { useModal } from 'react-modal-hook'
import { HowToReg, LowPriority } from '@material-ui/icons'
import { GeneralStatus } from 'ermes-backoffice-ts-sdk'
import useCategoriesList from '../../../../../hooks/use-categories-list.hook'

const ReportCard = (data, t, classes, catDetails, formatter, openModal, setOpenModal, theme) => {
  // function getModalStyle() {
  //   const top = 50
  //   const left = 50

  //   return {
  //     top: `${top}%`,
  //     left: `${left}%`,
  //     transform: `translate(-${top}%, -${left}%)`
  //   }
  // }
  const details = data?.data?.feature?.properties
  const [rejectionNote, setRejectionNote] = useState<string>('')
  const [openKoValidationModal, setOpenKoValidationModal] = useState<boolean>(false)
  const [validationValue, setValidationValue] = React.useState<boolean>(true)
  const [statusChangeValue, setStatusChangeValue] = React.useState<string>(
    details?.status ?? GeneralStatus.NOTIFIED
  )
  const [repDetails, fetchRepDetails, validateReport, updateReportStatus] = useReportById()
  //const [catDetails, fetchCategoriesList] = useCategoriesList()

  const reloadReportInfo = useCallback((id) => {
    fetchRepDetails(
      id,
      (data) => {
        return data
      },
      {},
      (data) => {
        return data
      }
    )
    // fetchCategoriesList(
    //   (data) => {
    //     return data
    //   },
    //   {},
    //   (data) => {
    //     return data
    //   }
    // )
  }, [])

  const handleValidationRadioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = (event.target as HTMLInputElement).value === 'true' ? true : false
    setValidationValue(value)
  }

  const handleStatusRadioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = (event.target as HTMLInputElement).value
    setStatusChangeValue(value)
  }

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRejectionNote(event.target.value)
  }

  useEffect(() => {
    if (details !== undefined) {
      setStatusChangeValue(details.status)
    }
  }, [details])

  const [showValidationDialog, hideValidationDialog] = useModal(
    ({ in: open, onExited }) => {
      return (
        <ConfirmDialog
          open={open}
          fullWidth={false}
          maxWidth={'xl'}
          onExited={onExited}
          title={'Why do you want to dismiss the report?'}
          confirmLabel={t('maps:dialog_confirm')}
          cancelLabel={t('maps:dialog_cancel')}
          onConfirm={() => {
            if (validationValue === true) {
              validateReport(details.id, true)
            } else {
              validateReport(details.id, false, rejectionNote)
            }
            // TODO reload card
            hideValidationDialog()
          }}
          onCancel={() => {
            hideValidationDialog()
          }}
        >
          <FormControl component="fieldset">
            <FormLabel component="legend">Report content</FormLabel>
            <RadioGroup
              aria-label="contentValidation"
              name="contentValidation"
              value={validationValue}
              onChange={handleValidationRadioChange}
            >
              <FormControlLabel value={true} control={<Radio />} label="Valid" />
              <FormControlLabel value={false} control={<Radio />} label="Invalid" />
            </RadioGroup>
          </FormControl>
          {validationValue === false && (
            <TextField
              id="rejection-note"
              label="Rejection note"
              value={rejectionNote}
              onChange={handleChange}
              fullWidth
              variant="outlined"
              placeholder="Leave an optional rejection note"
            />
          )}
        </ConfirmDialog>
      )
    },
    [validationValue]
  )

  const [showStatusChangeDialog, hideStatusChangeDialog] = useModal(
    ({ in: open, onExited }) => {
      return (
        <ConfirmDialog
          open={open}
          fullWidth={false}
          maxWidth={'xl'}
          onExited={onExited}
          title={'Why do you want to dismiss the report?'}
          confirmLabel={t('maps:dialog_confirm')}
          cancelLabel={t('maps:dialog_cancel')}
          onConfirm={() => {
            updateReportStatus(details.id, statusChangeValue)
            // TOOD reload card
            reloadReportInfo(details.id)
            hideStatusChangeDialog()
          }}
          onCancel={() => {
            hideStatusChangeDialog()
          }}
        >
          <FormControl component="fieldset">
            <FormLabel component="legend">Report status</FormLabel>
            <RadioGroup
              aria-label="contentValidation"
              name="contentValidation"
              value={statusChangeValue}
              onChange={handleStatusRadioChange}
            >
              <FormControlLabel
                value={GeneralStatus.NOTIFIED}
                control={<Radio />}
                label={GeneralStatus.NOTIFIED}
              />
              <FormControlLabel
                value={GeneralStatus.MANAGED}
                control={<Radio />}
                label={GeneralStatus.MANAGED}
              />
              <FormControlLabel
                value={GeneralStatus.CLOSED}
                control={<Radio />}
                label={GeneralStatus.CLOSED}
              />
            </RadioGroup>
          </FormControl>
        </ConfirmDialog>
      )
    },
    [statusChangeValue]
  )

  function guessMediaType(mediaType) {
    const extension = mediaType.split('.').pop()
    console.debug('MEDIA TYPE', extension)
    if (
      extension === 'jpeg' ||
      extension === 'jpg' ||
      extension === 'png' ||
      extension === 'gif' ||
      extension === 'PNG'
    ) {
      return 'img'
    } else if (extension === 'mp4' || extension === 'webm') {
      return 'video'
    } else {
      return 'audio'
    }
  }
  console.debug('REP DATA DATUM', data)
  console.debug('REP DATA DATUM DETA', catDetails)
  if (!data.isLoading) {
    return (
      <>
        <Card elevation={0}>
          {details.mediaURIs.length > 0 && (
            <>
              <Carousel
                animation="slide"
                autoPlay={false}
                // timeout={800}
                fullHeightHover={false}
              >
                {details.mediaURIs.map((media, idx) => {
                  return (
                    <CardMedia
                      key={idx}
                      className={classes.media}
                      src={media.mediaURI}
                      component={guessMediaType(media.mediaURI)}
                      style={{ minHeight: '250px', borderRadius: 6 }}
                      // autoPlay={true}
                      controls={true}
                      onClick={() => {
                        setOpenModal(true)
                      }}
                    />
                  )
                })}
              </Carousel>
              <Modal
                open={openModal}
                onClose={() => setOpenModal(false)}
                aria-labelledby="simple-modal-title"
                aria-describedby="simple-modal-description"
              >
                {
                  <Card
                    elevation={0}
                    style={{
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)'
                    }}
                    className={classes.paper}
                  >
                    <Carousel
                      animation="slide"
                      autoPlay={false}
                      // timeout={800}

                      fullHeightHover={false}
                    >
                      {details.mediaURIs.map((media, idx) => {
                        return (
                          <CardMedia
                            key={idx}
                            // className={classes.media}
                            autoPlay={true}
                            controls={true}
                            src={media.mediaURI} //media.mediaURI
                            style={{ maxHeight: '750px', minHeight: '250px' }}
                            component={guessMediaType(media.mediaURI)}
                            onClick={() => {
                              setOpenModal(true)
                            }}
                          />
                        )
                      })}
                    </Carousel>
                  </Card>
                }
              </Modal>
            </>
          )}
          <CardContent style={{ paddingTop: '0px' }}>
            {/* <div style={{ marginBottom: 10 }}>
              <Typography component={'span'} variant="h5" style={{ textTransform: 'uppercase' }}>
                {t('labels:' + details.type + 'Type')}
              </Typography>
            </div> */}
            <Grid container direction="row" justifyContent="space-between">
              <Grid item xs={8}>
                <Typography component={'span'} variant="h5" style={{ textTransform: 'uppercase' }}>
                  {t('labels:' + details.type + 'Type')}
                </Typography>
              </Grid>
              <Grid item xs={4}>
                <Tooltip title={t('labels:validate') ?? 'Validate'}>
                  <IconButton
                    onClick={showValidationDialog}
                    size="small"
                    disabled={!details.canBeValidated}
                  >
                    <HowToReg />
                  </IconButton>
                </Tooltip>
                <Tooltip title={t('labels:change_status') ?? 'Change status'}>
                  <IconButton onClick={showStatusChangeDialog} size="small">
                    <LowPriority />
                  </IconButton>
                </Tooltip>
              </Grid>
            </Grid>
            <Typography
              gutterBottom
              variant="caption"
              component="span"
              color="textSecondary"
              style={{ wordBreak: 'break-all', textTransform: 'uppercase' }}
            >
              {t('labels:map_request_hazards') + ': '}
            </Typography>
            <Typography component={'span'} variant="body1">
              {HAZARD_SOCIAL_ICONS[details.hazard.toLowerCase()] +
                ' ' +
                t('maps:' + details.hazard.toLowerCase())}
            </Typography>
            <br />
            <Typography
              component={'span'}
              variant="caption"
              className={classes.pos}
              color="textSecondary"
              style={{ textTransform: 'uppercase' }}
            >
              {t('maps:status')}:&nbsp;
            </Typography>
            <Typography component={'span'} variant="body1">
              {details.status}
            </Typography>
            <br />
            <>
              <Typography
                component={'span'}
                variant="caption"
                className={classes.pos}
                color="textSecondary"
                style={{ textTransform: 'uppercase' }}
              >
                {t('maps:relativeMissionId')}:&nbsp;
              </Typography>
              <Typography component={'span'} variant="body1">
                {details.relativeMissionId ?? 'None'}
              </Typography>
              <br />
            </>

            <br />
            {details.mediaURIs.length > 0 && (
              <>
                <Typography
                  component={'span'}
                  variant="caption"
                  className={classes.pos}
                  color="textSecondary"
                  style={{ textTransform: 'uppercase' }}
                >
                  {t('maps:media')}:&nbsp;
                </Typography>
                <Typography component={'span'} variant="body1">
                  {[
                    details.mediaURIs.filter((e) => e.mediaType === 'Image').length > 0
                      ? details.mediaURIs.filter((e) => e.mediaType === 'Image').length + ' photo'
                      : undefined,
                    details.mediaURIs.filter((e) => e.mediaType === 'Audio').length > 0
                      ? details.mediaURIs.filter((e) => e.mediaType === 'Audio').length + ' audio'
                      : undefined,
                    details.mediaURIs.filter((e) => e.mediaType === 'Video').length > 0
                      ? details.mediaURIs.filter((e) => e.mediaType === 'Video').length + ' video'
                      : undefined
                  ]
                    .filter((e) => e)
                    .join(', ')}
                </Typography>
                <br />
              </>
            )}
            {['organizationName', 'username'].map((elem) => {
              if (details[elem]) {
                return (
                  <>
                    <Typography
                      component={'span'}
                      variant="caption"
                      className={classes.pos}
                      color="textSecondary"
                      style={{ textTransform: 'uppercase' }}
                    >
                      {t('maps:' + elem)}:&nbsp;
                      {/* {elem.replace(/([A-Z])/g, ' $1').trim()}: &nbsp; */}
                    </Typography>
                    <Typography component={'span'} variant="body1">
                      {details[elem]}
                    </Typography>
                    <br />
                  </>
                )
              }
              return null
            })}
            <br />
            <>
              <Typography
                component={'span'}
                variant="caption"
                className={classes.pos}
                color="textSecondary"
                style={{ textTransform: 'uppercase' }}
              >
                {t('maps:description')}:&nbsp;
              </Typography>
              <Typography component={'span'} variant="body1">
                {details.description}
              </Typography>
              <br />
            </>

            {details?.extensionData.length > 0 ? (
              <TableContainer component={Paper}>
                <Table className={classes.table} size="small" aria-label="a dense table">
                  <TableHead>
                    <TableRow>
                      <TableCell align="left" width="35%">
                        <b>{t('maps:group')}</b>
                      </TableCell>
                      <TableCell align="left">
                        <b>{t('maps:name')}</b>
                      </TableCell>
                      <TableCell align="left">
                        <b>{t('maps:target')}</b>
                      </TableCell>
                      <TableCell align="left">
                        <b>{t('maps:value')}</b>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {details!.extensionData.map((row) => (
                      <TableRow key={row.name}>
                        <TableCell align="left" width="35%">
                          {
                            catDetails?.data?.find((x) => x.categoryId === row.categoryId)
                              ?.groupIcon
                          }{' '}
                          {catDetails?.data?.find((x) => x.categoryId === row.categoryId)?.group}
                        </TableCell>
                        <TableCell component="th" align="left" scope="row">
                          {catDetails?.data?.find((x) => x.categoryId === row.categoryId)?.name}
                        </TableCell>
                        <TableCell align="center">
                          {t(
                            'maps:' +
                              catDetails?.data?.find((x) => x.categoryId === row.categoryId)?.target
                          )}
                        </TableCell>
                        <TableCell align="left">
                          {row.value}{' '}
                          {catDetails?.data?.find((x) => x.categoryId === row.categoryId)
                            ?.unitOfMeasure
                            ? catDetails?.data?.find((x) => x.categoryId === row.categoryId)
                                ?.unitOfMeasure
                            : null}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : null}
            <br />
            <>
              <Typography
                component={'span'}
                variant="caption"
                className={classes.pos}
                color="textSecondary"
                style={{ textTransform: 'uppercase' }}
              >
                {t('maps:peer_reviews')}:&nbsp;
              </Typography>
              <Typography component={'span'} variant="body1">
                {details.upvotes === details.downvotes
                  ? ''
                  : details.upvotes > details.downvotes
                  ? '✅'
                  : '❌'}
                {details.upvotes + '/' + (details.downvotes + details.upvotes)}
              </Typography>
              <br />
            </>

            <div className={classes.chipContainer}>
              <Chip
                label={details.isPublic ? t('common:public') : t('common:private')}
                color="primary"
                size="small"
                className={classes.chipStyle}
              />
              <Chip
                label={t('common:' + details.content.toLowerCase())}
                color="primary"
                size="small"
                className={classes.chipStyle}
                style={{
                  backgroundColor: theme.palette.primary.contrastText,
                  borderColor: theme.palette.primary.dark,
                  color: theme.palette.primary.dark
                }}
              />
            </div>
            <br />
            <Typography component={'span'} variant="body1">
              {formatter.format(new Date(details.timestamp as string))}
            </Typography>
          </CardContent>
          {/* <CardActions className={classes.cardAction}>
            <Typography color="textSecondary">
              {' '}
              {formatter.format(new Date(details.timestamp as string))}
            </Typography>

            <Typography color="textSecondary">
              {(details!.location!.latitude as number).toFixed(4) +
                ' , ' +
                (details!.location!.longitude as number).toFixed(4)}
            </Typography>
          </CardActions> */}
        </Card>

        {/* <Typography
          variant="body2"
          color="textSecondary"
          component="p"
          style={{ wordBreak: 'break-all' }}
        > */}
        {/* Latitude: {latitude.toFixed(4)}, Longitude: {longitude.toFixed(4)} */}
        {/* {details!.extensionData.map((elem) => {
            return elem.categoryId + ' '
          })} */}
        {/* </Typography> */}
      </>
    )
  }
  return (
    <div>
      <CircularProgress />
    </div>
  )
}

export default ReportCard
