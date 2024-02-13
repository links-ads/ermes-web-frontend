import React, { useCallback, useEffect, useState } from 'react'
import {
  Card,
  CardContent,
  CardMedia,
  Chip,
  CircularProgress,
  FormControl,
  FormControlLabel,
  FormLabel,
  Grid,
  IconButton,
  Link,
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
import { HowToReg, LocationOn } from '@material-ui/icons'
import { EntityType } from 'ermes-backoffice-ts-sdk'
import useCategoriesList from '../../../../../hooks/use-categories-list.hook'
import { EmergencyColorMap } from '../emergency.component'

const KeyValueTypography = (props) => {
  const { keyStr, value, classes, t } = props
  return (
    <>
      <Typography
        component={'span'}
        variant="caption"
        className={classes.pos}
        color="textSecondary"
        style={{ textTransform: 'uppercase' }}
      >
        {keyStr}:&nbsp;
      </Typography>
      <Typography component={'span'} variant="body1">
        {value}
      </Typography>
      <br />
    </>
  )
}

const MediaCarouselWithModal = (props) => {
  const { mediaURIs, classes, openModal, setOpenModal, theme } = props

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

  return (
    <>
      <Carousel
        animation="slide"
        autoPlay={false}
        fullHeightHover={false}
        activeIndicatorIconButtonProps={{
          className: '',
          style: {
            color: theme.palette.secondary.main
          }
        }}
        navButtonsAlwaysInvisible={mediaURIs.length < 2}
      >
        {mediaURIs.map((media, idx) => {
          return (
            <CardMedia
              key={idx}
              className={classes.media}
              src={media.mediaURI}
              component={guessMediaType(media.mediaURI)}
              style={{ minHeight: '250px', borderRadius: 6 }}
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
              fullHeightHover={false}
              activeIndicatorIconButtonProps={{
                className: '',
                style: {
                  color: theme.palette.secondary.main
                }
              }}
              navButtonsAlwaysInvisible={mediaURIs.length < 2}
            >
              {mediaURIs.map((media, idx) => {
                return (
                  <CardMedia
                    key={idx}
                    autoPlay={true}
                    controls={true}
                    src={media.mediaURI}
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
  )
}

const ReportPopupCard = (props) => {
  const { reportId, t, classes, formatter, theme, setGoToCoord, setSelectedCard } = props
  const [validationNote, setValidationNote] = useState<string>('')
  const [validationValue, setValidationValue] = React.useState<boolean>(true)
  const [openModal, setOpenModal] = useState(false)

  const [repDetails, fetchRepDetails, validateReport] = useReportById()
  const { isLoading, data, error } = repDetails
  const details = data?.feature?.properties
  const [catDetails, fetchCategoriesList] = useCategoriesList()

  const loadReportInfo = useCallback((id) => {
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
    fetchCategoriesList(
      (data) => {
        return data
      },
      {},
      (data) => {
        return data
      }
    )
  }, [])

  useEffect(() => {
    loadReportInfo(reportId)
  }, [])

  useEffect(() => {
    loadReportInfo(reportId)
  }, [reportId])

  const handleValidationRadioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = (event.target as HTMLInputElement).value === 'true' ? true : false
    setValidationValue(value)
  }

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValidationNote(event.target.value)
  }

  const showOnMap = () => {
    setGoToCoord({
      latitude: details!.location!.latitude as number,
      longitude: details!.location!.longitude as number
    })
  }

  const onMissionClick = () => {
    setSelectedCard(EntityType.MISSION + '-' + String(details.relativeMissionId))
  }

  const resetValidationForm = () => {
    setValidationNote('')
    setValidationValue(true)
  }

  const [showValidationDialog, hideValidationDialog] = useModal(
    ({ in: open, onExited }) => {
      return (
        <ConfirmDialog
          open={open}
          fullWidth={false}
          maxWidth={'xl'}
          onExited={onExited}
          title={t('maps:validateReport')}
          confirmLabel={t('maps:dialog_confirm')}
          cancelLabel={t('maps:dialog_cancel')}
          onConfirm={() => {
            validateReport(details.id, validationValue, validationNote)
            setTimeout(() => {
              loadReportInfo(details.id)
            }, 1000)
            hideValidationDialog()
            resetValidationForm()
          }}
          onCancel={() => {
            hideValidationDialog()
            resetValidationForm()
          }}
        >
          <FormControl component="fieldset">
            <FormLabel component="legend">{t('maps:reportContent')}</FormLabel>
            <RadioGroup
              aria-label="contentValidation"
              name="contentValidation"
              value={validationValue}
              onChange={handleValidationRadioChange}
            >
              <FormControlLabel value={true} control={<Radio />} label={t('labels:valid')} />
              <FormControlLabel value={false} control={<Radio />} label={t('labels:invalid')} />
            </RadioGroup>
          </FormControl>
          <TextField
            id="validation-note"
            label={t('maps:validationNote')}
            value={validationNote}
            onChange={handleChange}
            fullWidth
            variant="outlined"
            placeholder={t('maps:validationNotePlaceholder')}
          />
        </ConfirmDialog>
      )
    },
    [validationValue, details, validationNote]
  )

  return (
    <>
      {!isLoading ? (
        <>
          <Card elevation={0} key={'report-popup-card-' + details.id}>
            {details.mediaURIs && details.mediaURIs.length > 0 && (
              <MediaCarouselWithModal
                mediaURIs={details.mediaURIs}
                classes={classes}
                setOpenModal={setOpenModal}
                openModal={openModal}
                theme={theme}
              />
            )}
            <CardContent style={{ paddingTop: '0px' }}>
              <Grid container direction="row" justifyContent="space-between">
                <Grid item xs={10}>
                  <Typography
                    component={'span'}
                    variant="h5"
                    style={{ textTransform: 'uppercase' }}
                  >
                    {t('labels:' + details.type + 'Type')}
                  </Typography>
                </Grid>
                <Grid item xs={2}>
                  <Tooltip title={t('maps:validate') ?? 'Validate'}>
                    <span>
                      <IconButton
                        onClick={showValidationDialog}
                        size="small"
                        disabled={!details.canBeValidated}
                      >
                        <HowToReg />
                      </IconButton>
                    </span>
                  </Tooltip>
                  <Tooltip title={t('maps:seeOnMap') ?? 'See on map'}>
                    <IconButton size="small" onClick={showOnMap} className={classes.viewInMap}>
                      <LocationOn htmlColor={EmergencyColorMap.Report} />
                    </IconButton>
                  </Tooltip>
                </Grid>
              </Grid>
              <KeyValueTypography
                keyStr={t('labels:map_request_hazards')}
                value={
                  HAZARD_SOCIAL_ICONS[details.hazard.toLowerCase()] +
                  ' ' +
                  t('maps:' + details.hazard.toLowerCase())
                }
                classes={classes}
                t={t}
              />
              <KeyValueTypography
                keyStr={t('labels:mission_chip')}
                value={
                  details.relativeMissionId ? (
                    <Link onClick={onMissionClick} color="inherit" underline="always">
                      {'#' + details.relativeMissionId}
                    </Link>
                  ) : (
                    t('maps:noMissionRelated')
                  )
                }
                classes={classes}
                t={t}
              />

              <br />
              {details.mediaURIs.length > 0 && (
                <KeyValueTypography
                  keyStr={t('maps:media')}
                  value={[
                    details.mediaURIs.filter((e) => e.mediaType === 'Image').length > 0
                      ? details.mediaURIs.filter((e) => e.mediaType === 'Image').length +
                        ' ' +
                        t('labels:photo')
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
                  classes={classes}
                  t={t}
                />
              )}
              {['organizationName', 'username'].map((elem, idx) => {
                if (details[elem]) {
                  return (
                    <KeyValueTypography
                      key={'report-popup-card-detail-' + idx}
                      keyStr={t('maps:' + elem)}
                      value={details[elem]}
                      classes={classes}
                      t={t}
                    />
                  )
                }
                return null
              })}
              <br />
              <KeyValueTypography
                keyStr={t('maps:description')}
                value={details.description}
                classes={classes}
                t={t}
              />

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
                        {catDetails?.data
                          ?.filter((x) =>
                            details!.extensionData.map((e) => e.categoryId).includes(x.categoryId)
                          )
                          .filter((e) => e.target !== 'None').length > 0 && (
                          <TableCell align="left">
                            <b>{t('maps:target')}</b>
                          </TableCell>
                        )}
                        <TableCell align="left">
                          <b>{t('maps:value')}</b>
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {details!.extensionData.map((row, idx) => (
                        <TableRow key={row.name + '-' + idx}>
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
                          {catDetails?.data?.find((x) => x.categoryId === row.categoryId)
                            ?.target !== 'None' && (
                            <TableCell align="center">
                              {t(
                                'maps:' +
                                  catDetails?.data?.find((x) => x.categoryId === row.categoryId)
                                    ?.target
                              )}
                            </TableCell>
                          )}
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
              <KeyValueTypography
                keyStr={t('labels:peerReviews')}
                value={
                  (details.upvotes === details.downvotes
                    ? ''
                    : details.upvotes > details.downvotes
                    ? '✅ '
                    : '❌ ') +
                  details.upvotes +
                  '/' +
                  (details.downvotes + details.upvotes)
                }
                classes={classes}
                t={t}
              />
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
          </Card>
        </>
      ) : (
        <div>
          <CircularProgress />
        </div>
      )}
    </>
  )
}

export default ReportPopupCard
