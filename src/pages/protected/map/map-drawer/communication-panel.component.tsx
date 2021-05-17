import React, { useEffect } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Card from '@material-ui/core/Card'
import CardActions from '@material-ui/core/CardActions'
import CardContent from '@material-ui/core/CardContent'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import IconButton from '@material-ui/core/IconButton'
import SearchIcon from '@material-ui/icons/Search'
import CircularProgress from '@material-ui/core/CircularProgress'
import List from '@material-ui/core/List'
import InfiniteScroll from 'react-infinite-scroll-component'
import { useTranslation } from 'react-i18next'
import useCommList from '../../../../hooks/use-comm-list.hook'

const useStyles = makeStyles((theme) => ({
  searchField: {
    marginTop: 20,
    width: '88%',
    marginBottom: 20
  },
  searchButton: {
    marginBottom: 20,
    marginTop: 20,
    padding: 9,
    marginLeft: 6
  },

  container: {
    height: window.innerHeight - 270,
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

  cardList: {
    overflowY: 'scroll',
    height: '90%'
  }
}))

export default function CommunicationPanel(props) {
  const dateOptions = {
    dateStyle: 'short',
    timeStyle: 'short',
    hour12: false
  } as Intl.DateTimeFormatOptions
  const formatter = new Intl.DateTimeFormat('en-GB', dateOptions)

  const { t } = useTranslation(['common', 'maps'])
  const {
    commsData,
    isCommsLoading,
    getNextValues,
    recordsTotal,
    filterByText,
    setStartDate,
    setEndDate
  } = useCommList()
  const classes = useStyles()

  const [searchText, setSearchText] = React.useState('')

  const handleSearchTextChange = (e) => {
    setSearchText(e.target.value)
  }
  const searchInComm = () => {
    console.log(searchText)
    if (searchText !== undefined) {
      filterByText(searchText)
    }
  }
  const flyToCoords = function (latitude, longitude) {
    props.setGoToCoord({ latitude: latitude, longitude: longitude })
  }

  useEffect(() => {
    if (!isCommsLoading) {
      console.log(commsData)
    }
  }, [commsData, isCommsLoading])

  useEffect(() => {
    setStartDate(props.selectedStartDate)
  }, [props.selectedStartDate, setStartDate])

  useEffect(() => {
    setEndDate(props.selectedEndDate)
  }, [props.selectedEndDate, setEndDate])

  return (
    <div className="container">
      <span>
        <TextField
          id="outlined-basic"
          label={t('common:search')}
          variant="outlined"
          size="small"
          className={classes.searchField}
          onChange={handleSearchTextChange}
        />
        {!isCommsLoading ? (
          <IconButton
            aria-label="search"
            color="inherit"
            onClick={searchInComm}
            className={classes.searchButton}
          >
            <SearchIcon />
          </IconButton>
        ) : (
          <CircularProgress color="secondary" size={30} className={classes.searchButton} />
        )}
      </span>
      {!isCommsLoading ? (
        <div className={classes.container} id="scrollableElem">
          <List component="span" aria-label="main mailbox folders" className={classes.cardList}>
            <InfiniteScroll
              next={getNextValues}
              dataLength={commsData.length}
              hasMore={!(recordsTotal === Number(commsData.length))}
              loader={<h4>{t('common:loading')}</h4>}
              endMessage={
                <div style={{ textAlign: 'center' }}>
                  <b>{t('common:end_of_list')}</b>
                </div>
              }
              scrollableTarget="scrollableElem"
              // className={classes.cardList}
            >
              {commsData.map((elem, i) => {
                return (
                  <Card key={elem.id} className={classes.card}>
                    <CardContent>
                      <Typography variant="h5" component="h2" gutterBottom>
                        {elem.message}
                      </Typography>
                      <Typography color="textSecondary">
                        {' '}
                        {formatter.format(new Date(elem.duration?.lowerBound as string))} -{' '}
                        {formatter.format(new Date(elem.duration?.upperBound as string))}
                        {/* {elem.duration?.lowerBound} - {elem.duration?.upperBound} */}
                      </Typography>
                    </CardContent>
                    <CardActions className={classes.cardAction}>
                      <Typography color="textSecondary">
                        {(elem!.centroid!.latitude as number).toFixed(4) +
                          ' , ' +
                          (elem!.centroid!.longitude as number).toFixed(4)}
                      </Typography>
                      <Button
                        size="medium"
                        onClick={() =>
                          flyToCoords(
                            elem!.centroid!.latitude as number,
                            elem!.centroid!.longitude as number
                          )
                        }
                      >
                        {t('common:view_in_map')}
                      </Button>
                    </CardActions>
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
