import React, { useEffect } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import CardMedia from '@material-ui/core/CardMedia'
import FormControl from '@material-ui/core/FormControl'
import { Checkbox, Input, InputLabel, MenuItem, Select } from '@material-ui/core'
import { HazardType } from 'ermes-ts-sdk'
import useReportList from '../../../../hooks/use-report-list.hook'
import List from '@material-ui/core/List'
import InfiniteScroll from 'react-infinite-scroll-component'
import Card from '@material-ui/core/Card'
import CardActions from '@material-ui/core/CardActions'
import CardContent from '@material-ui/core/CardContent'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import ListItemText from '@material-ui/core/ListItemText'
import { HAZARD_SOCIAL_ICONS } from '../../common/utils/utils.common'
import { useTranslation } from 'react-i18next'

const useStyles = makeStyles((theme) => ({
  cardList: {
    overflowY: 'scroll',
    height: '90%'
  },
  container_without_search: {
    overflowY: 'scroll'
  },
  card: {
    marginBottom: 15,
    display: 'flex'
  },
  cardAction: {
    justifyContent: 'space-between',
    paddingLeft: 16,
    paddingTop: 4,
    paddingBottom: 0,
    paddingRight: 0
  },
  margin: {
    margin: theme.spacing(1),
    width: '70%',
    marginBottom: 25,
    paddingRight: 15
  },
  applyButton: {
    margin: theme.spacing(1),
    marginTop: 23,
    marginBottom: 25,
    paddingRight: 15
  },

  details: {
    display: 'inline-block',
    width: '70%'
  },
  cover: {
    width: '30%',
    height: 154,
    display: 'inline-block'
  },
  topCard: {
    paddingBottom: 16
  },
  viewInMap: {
    textAlign: 'right',
    width: '51%'
  }
}))

export default function ReportPanel(props) {
  const dateOptions = {
    dateStyle: 'short',
    timeStyle: 'short',
    hour12: false
  } as Intl.DateTimeFormatOptions
  const formatter = new Intl.DateTimeFormat('en-GB', dateOptions)

  const classes = useStyles()
  const [selHazard, setSelHazard] = React.useState({}) //['ALL' as HazardType]
  const [repsData, getRepsData, applyFilterReloadData] = useReportList()
  const { t } = useTranslation(['common', 'maps', 'social'])
  const [height, setHeight] = React.useState(window.innerHeight)
  const resizeHeight = () => {
    setHeight(window.innerHeight)
  }
  
  const handleChangeHazard = (event) => {
    const change = event.target.value

    let tmp = { ...selHazard }
    Object.keys(HazardType).forEach((elem) => {
      if (change.includes(elem)) {
        tmp[elem] = true
      } else {
        tmp[elem] = false
      }
    })
    return setSelHazard(tmp)
  }

  const flyToCoords = function (latitude, longitude) {
    props.setGoToCoord({ latitude: latitude, longitude: longitude })
  }

  const handleApplyFilter = function () {
    applyFilterReloadData(Object.keys(selHazard).filter((item) => selHazard[item]))
  }

  useEffect(() => {
    const tmp = {}
    Object.keys(HazardType).map((elem) => (tmp[elem] = false))
    setSelHazard(tmp)

    getRepsData(
      0,
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
    if (!repsData.isLoading) {
      // console.log('REPS DATA', repsData)
      // console.log(repsData?[0].mediaURIs?[0].thumbnailURI)
    }
  }, [repsData])



  useEffect(() => {
    window.addEventListener('resize', resizeHeight)
    return () => window.removeEventListener('resize', resizeHeight)
  })

  return (
    <div className="container_without_search">
      <span>
        <FormControl className={classes.margin}>
          <InputLabel id="demo-mutiple-checkbox-label">{t('maps:filter_by_hazard')}</InputLabel>
          <Select
            labelId="demo-mutiple-checkbox-label"
            id="demo-mutiple-checkbox"
            multiple
            value={Object.keys(selHazard).filter((item) => selHazard[item])}
            onChange={(event) => handleChangeHazard(event)}
            input={<Input />}
            renderValue={(selected) =>
              Object.keys(selHazard)
                .filter((item) => selHazard[item])
                .map((item) => t('maps:' + HazardType[item].toLowerCase()))
                .join(', ')
            }
          >
            {Object.keys(selHazard).map((key) => (
              <MenuItem key={key} value={key}>
                <Checkbox checked={selHazard[key]} />
                <ListItemText primary={t('maps:' + HazardType[key].toLowerCase())} />
                {/* {t('maps:' + HazardType[key].toLowerCase())} */}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button
          variant="contained"
          color="primary"
          onClick={() => {
            handleApplyFilter()
          }}
          className={classes.applyButton}
        >
          {t('social:filter_apply')}
        </Button>
      </span>
      {!repsData.isLoading ? (
        <div
          className={classes.container_without_search}
          id="scrollableElem"
          style={{ height: height - 280 }}
        >
          <List component="span" aria-label="main mailbox folders" className={classes.cardList}>
            <InfiniteScroll
              next={() => {
                getRepsData(
                  repsData.data.length,
                  (data) => {
                    return data
                  },
                  {},
                  (data) => {
                    return data
                  }
                )
              }}
              dataLength={repsData.data.length}
              hasMore={repsData.data.length >= repsData.tot ? false : true}
              loader={<h4>{t('common:loading')}</h4>}
              endMessage={
                <div style={{ textAlign: 'center' }}>
                  <b>{t('common:end_of_list')}</b>
                </div>
              }
              scrollableTarget="scrollableElem"
            >
              {repsData.data.map((elem, i) => {
                return (
                  <Card key={elem.id} className={classes.card}>
                    <CardMedia
                      className={classes.cover}
                      image={
                        elem.mediaURIs &&
                        elem.mediaURIs?.length > 0 &&
                        elem.mediaURIs[0].thumbnailURI
                          ? elem.mediaURIs[0].thumbnailURI
                          : 'https://via.placeholder.com/400x200.png?text=' +
                            t('common:image_not_available')
                      }
                      title="Contemplative Reptile"
                    />
                    <div className={classes.details}>
                      <CardContent className={classes.topCard}>
                        <Typography
                          gutterBottom
                          variant="h5"
                          component="h2"
                          style={{ marginBottom: '0px' }}
                        >
                          {HAZARD_SOCIAL_ICONS[elem.hazard.toLowerCase()]
                            ? HAZARD_SOCIAL_ICONS[elem.hazard.toLowerCase()]
                            : null}
                          {' ' + t('maps:' + elem.hazard.toLowerCase())}
                        </Typography>
                        <Typography color="textSecondary">
                          {formatter.format(new Date(elem.timestamp as string))}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" component="p">
                          {elem.description.length > 40
                            ? elem.description.substring(0, 37) + '...'
                            : elem.description}
                          {/* {elem.notes ? ' - ' + elem.notes : null} */}
                        </Typography>
                      </CardContent>
                      <CardActions className={classes.cardAction}>
                        <Typography variant="body2" color="textSecondary">
                          {(elem!.location!.latitude as number).toFixed(4) +
                            ' , ' +
                            (elem!.location!.longitude as number).toFixed(4)}
                        </Typography>
                        <Button
                          size="small"
                          onClick={() =>
                            flyToCoords(
                              elem!.location!.latitude as number,
                              elem!.location!.longitude as number
                            )
                          }
                          className={classes.viewInMap}
                        >
                          {t('common:view_in_map')}
                        </Button>
                      </CardActions>
                    </div>
                  </Card>
                )
              })}
            </InfiniteScroll>
          </List>
        </div>
      ) : null}
    </div>
  )
}
