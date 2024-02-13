import {
  CardActions,
  CardContent,
  CardMedia,
  Chip,
  IconButton,
  Typography,
  useTheme
} from '@material-ui/core'
import { EntityType } from 'ermes-ts-sdk'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { HAZARD_SOCIAL_ICONS } from '../../../../../utils/utils.common'
import CardWithPopup from './card-with-popup.component'
import classes from './report-card.module.scss'
import LocationOnIcon from '@material-ui/icons/LocationOn'
import { FormatDate } from '../../../../../utils/date.utils'
import DrawerCardProps from '../../../../../models/DrawerCardProps'
import { EmergencyColorMap } from '../../api-data/emergency.component'
import { Drafts, Markunread } from '@material-ui/icons'

const ReportCard: React.FC<DrawerCardProps> = (props) => {
  const {
    elem,
    map,
    setMapHoverState,
    spiderLayerIds,
    spiderifierRef,
    flyToCoords,
    missionActive
  } = props
  const { t } = useTranslation(['common', 'maps', 'social', 'labels'])
  const timestamp = FormatDate(elem.timestamp)
  const theme = useTheme()

  const onMissionChipClick = (evt) => {
    evt.stopPropagation()
    props.setSelectedCard(EntityType.MISSION + '-' + String(elem.relativeMissionId))
  }

  return (
    <CardWithPopup
      keyID={EntityType.REPORT + '-' + String(elem.id)}
      latitude={elem!.location!.latitude as number}
      longitude={elem!.location!.longitude as number}
      className={classes.card}
      map={map}
      setMapHoverState={setMapHoverState}
      spiderLayerIds={spiderLayerIds}
      id={elem.id}
      spiderifierRef={spiderifierRef}
      type={EntityType.REPORT}
      selectedCard={props.selectedCard}
      setSelectedCard={props.setSelectedCard}
    >
      <CardMedia
        className={classes.cover}
        image={
          elem.mediaURIs && elem.mediaURIs?.length > 0 && elem.mediaURIs[0].thumbnailURI
            ? elem.mediaURIs[0].thumbnailURI
            : `https://via.placeholder.com/123x187/${EmergencyColorMap.Report.replace(
                '#',
                ''
              )}.png?text=${t('common:image_not_available')}`
        }
        title="Report title"
      />
      <div className={classes.details}>
        <CardContent className={classes.topCard}>
          <div className={classes.hazardRow}>
            <Typography
              gutterBottom
              variant="h5"
              component="h2"
              style={{ marginBottom: '0px', width: '85%', display: 'inline-block' }}
            >
              {HAZARD_SOCIAL_ICONS[elem.hazard.toLowerCase()]
                ? HAZARD_SOCIAL_ICONS[elem.hazard.toLowerCase()]
                : null}
              {' ' + t('maps:' + elem.hazard.toLowerCase())}
            </Typography>
            {elem.relativeMissionId !== null && (
              <Chip
                label={t('labels:mission_chip') + ' #' + elem.relativeMissionId}
                color="primary"
                size="small"
                className={classes.chipStyle}
                disabled={!missionActive}
                onClick={onMissionChipClick}
              />
            )}
          </div>
          <Typography color="textSecondary">{timestamp}</Typography>
          <Typography variant="body2" color="textSecondary" component="p">
            {elem?.description?.length > 40
              ? elem.description.substring(0, 37) + '...'
              : elem.description}
          </Typography>
          <div style={{ display: 'flex', flexDirection: 'row' }}>
            {!!elem.organizationName ? (
              <>
                <Typography
                  component={'span'}
                  variant="body2"
                  color="textSecondary"
                  style={{ textTransform: 'uppercase' }}
                >
                  {t('maps:organization')}:&nbsp;
                </Typography>
                <Typography component={'span'} variant="body1">
                  {elem.organizationName.length > 17
                    ? elem.organizationName.substring(0, 14) + '...'
                    : elem.organizationName}
                </Typography>
              </>
            ) : null}
          </div>
          <div style={{ display: 'flex', flexDirection: 'row' }}>
            <>
              <Typography
                component={'span'}
                variant="body2"
                color="textSecondary"
                style={{ textTransform: 'uppercase' }}
              >
                {t('maps:creator')}:&nbsp;
              </Typography>
              <Typography component={'span'} variant="body1">
                {elem?.displayName.length > 20
                  ? elem.displayName.substring(0, 20) + '...'
                  : elem.displayName}
              </Typography>
            </>
          </div>
        </CardContent>
        <CardActions className={classes.cardAction}>
          <div className={classes.chipContainer}>
            <Chip
              label={elem.isPublic ? t('common:public') : t('common:private')}
              color="primary"
              size="small"
              className={classes.chipStyle}
            />
            <Chip
              label={t('common:' + elem.content.toLowerCase())}
              color="primary"
              size="small"
              className={classes.chipStyle}
              style={{
                backgroundColor: theme.palette.primary.contrastText,
                borderColor: theme.palette.primary.dark,
                color: theme.palette.primary.dark
              }}
            />
            <Chip
              label={elem.read ? t('maps:read') : t('maps:unread')}
              color="primary"
              size="small"
              icon={elem.read ? <Drafts /> : <Markunread />}
              className={classes.chipStyle}
            />
          </div>
          <IconButton
            size="small"
            onClick={() =>
              flyToCoords(elem!.location!.latitude as number, elem!.location!.longitude as number)
            }
            className={classes.viewInMap}
          >
            <LocationOnIcon htmlColor={EmergencyColorMap.Report} />
          </IconButton>
        </CardActions>
      </div>
    </CardWithPopup>
  )
}

export default ReportCard
