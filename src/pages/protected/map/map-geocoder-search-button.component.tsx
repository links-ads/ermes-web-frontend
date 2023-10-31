import {
  IconButton,
  InputBase,
  List,
  ListItem,
  ListItemText,
  Paper,
  Theme,
  Tooltip,
  createStyles,
  makeStyles
} from '@material-ui/core'
import SearchIcon from '@material-ui/icons/Search'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import useMapGeocoderSearch from '../../../hooks/use-map-geocoder-search.hook'

const GeocoderButtonContainer = styled.div.attrs({
  className: 'mapboxgl-ctrl mapboxgl-ctrl-group'
})``

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      position: 'absolute',
      padding: '2px 4px',
      display: 'flex',
      alignItems: 'center',
      width: '39vh',
      right: 0,
      borderRadius: 21
    },
    input: {
      marginLeft: theme.spacing(1),
      flex: 1,
      fontSize: 13,
      height: '3vh'
    },
    iconButton: {
      padding: 10
    },
    divider: {
      height: 28,
      margin: 4
    },
    resultList: {
      position: 'absolute',
      top: '2vh', 
      width: '36vh'
    },
    resultListItem: {
      paddingLeft: theme.spacing(1),
      '& .MuiTypography-body2': {
        fontSize: 13
      }
    }
  })
)

const MapGeocoderSearchButton = (props) => {
  const { t } = useTranslation(['maps'])
  const classes = useStyles()
  const { markSearchLocation } = props
  const [openSearchBar, setOpenSearchBar] = useState<boolean>(false)
  const [searchText, setSearchText] = useState<string>('')
  const [prevSearchText, setPrevSearchText] = useState<string>('')
  const [searchState, getSearchResults] = useMapGeocoderSearch()
  const { results, isLoading, error } = searchState

  const searchClickHandler = (e: React.MouseEvent) => {
    setOpenSearchBar(!openSearchBar)
  }

  const onChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value)
  }

  const onClickHandler = (itemCoord) => {
    // TODO fly to coord from props
    console.debug(itemCoord)
    markSearchLocation({ latitude: itemCoord[1], longitude: itemCoord[0] })
  }

  useEffect(() => {
    if (searchText && searchText.length > 2 && searchText != prevSearchText) {
      getSearchResults(searchText, [])
      console.debug(searchState)
      setPrevSearchText(searchText)
    }
  }, [searchText])

  return (
    <GeocoderButtonContainer>
      <Paper
        component="div"
        className={classes.root}
        style={{ display: openSearchBar ? undefined : 'none' }}
      >
        <InputBase
          className={classes.input}
          placeholder="Search location"
          inputProps={{ 'aria-label': 'search location' }}
          value={searchText}
          onChange={onChangeHandler}
        />
        {!isLoading && !error && results && results.length > 0 && (
          <List component="ul" aria-label="search results" className={classes.resultList} dense>
            {results.map((item, idx) => (
              <ListItem key={'search-result-' + idx} className={classes.resultListItem} onClick={() => onClickHandler(item['center'])}>
                <ListItemText primary={item['place_name']} />
              </ListItem>
            ))}
          </List>
        )}
      </Paper>
      <Tooltip title={t('maps:downloadButton') ?? 'Search location'}>
        <span>
          <IconButton
            onClick={searchClickHandler}
            aria-label="download-button"
            className="mapboxgl-ctrl-icon"
            disabled={false}
          >
            <SearchIcon fontSize="small" color={'inherit'} />
          </IconButton>
        </span>
      </Tooltip>
    </GeocoderButtonContainer>
  )
}

export default MapGeocoderSearchButton
