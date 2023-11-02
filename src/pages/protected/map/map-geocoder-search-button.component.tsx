import {
  Card,
  Grid,
  IconButton,
  InputBase,
  List,
  ListItem,
  ListItemText,
  Paper,
  Popover,
  TextField,
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
import { Popup } from 'react-map-gl'
import { Autocomplete } from '@material-ui/lab'

const GeocoderButtonContainer = styled.div.attrs({
  className: 'mapboxgl-ctrl mapboxgl-ctrl-group'
})`
  width: 100%;
`

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      // position: 'absolute',
      // padding: '2px 4px',
      // display: 'flex',
      // alignItems: 'center',
      // width: '39vh',
      height: '40vh',
      // right: 0,
      '& .MuiPopover-paper': {
        borderRadius: 21,
        backgroundColor: '#d5d5d5',
        color: 'black'
      }
      // // borderRadius: 21,
      // backgroundColor: '#d5d5d5',
      // color: 'black'
    },
    input: {
      marginLeft: theme.spacing(1),
      marginRight: theme.spacing(3),
      flex: 1,
      fontSize: 13,
      height: '3vh',
      width: '36vh',
      backgroundColor: '#d5d5d5',
      color: 'black',
      zIndex: 3
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
      width: '35vh',
      backgroundColor: '#d5d5d5',
      color: 'black',
      zIndex: 2,
      borderRadius: 5,
      paddingBottom: 0
    },
    resultListItem: {
      paddingLeft: theme.spacing(1),
      '& .MuiTypography-body2': {
        fontSize: 13
      }
    }
  })
)

const dummyResults = [
  { place_name: 'dummy result 1', center: [0, 0] },
  { place_name: 'dummy result 2', center: [0, 0] },
  { place_name: 'dummy result 3', center: [0, 0] },
  { place_name: 'dummy result 4', center: [0, 0] },
  { place_name: 'dummy result 5', center: [0, 0] }
]

const MapGeocoderSearchButton = (props) => {
  const { t } = useTranslation(['maps'])
  const classes = useStyles()
  const { markSearchLocation } = props
  const [openSearchBar, setOpenSearchBar] = useState<boolean>(false)
  const [searchText, setSearchText] = useState<string>('')
  const [prevSearchText, setPrevSearchText] = useState<string>('')
  const [isResultSelected, setIsResultSelected] = useState<boolean>(false)
  const [showResults, setShowResults] = useState<boolean>(true)
  const [options, setOptions] = useState<any[]>([])
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null)
  const open = Boolean(anchorEl)
  const id = open ? 'simple-popover' : undefined
  const [searchState, getSearchResults] = useMapGeocoderSearch()
  const { results, isLoading, error } = searchState

  const searchClickHandler = (e: React.MouseEvent<HTMLButtonElement>) => {
    setOpenSearchBar(!openSearchBar)
    setAnchorEl(e.currentTarget)
  }

  const onChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value)
    setIsResultSelected(false)
  }

  // const onChangeHandler = (e: React.ChangeEvent<{}>, newValue: string | null) => {
  //   setSearchText(newValue ?? '')
  //   setIsResultSelected(false)
  // }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const onClickHandler = (item) => {
    const itemCoord = item['center']
    const itemText = item['place_name']
    setSearchText(itemText)
    setIsResultSelected(true)
    setShowResults(false)
    markSearchLocation(itemCoord[1], itemCoord[0])
  }

  useEffect(() => {
    if (searchText && searchText.length > 2 && searchText != prevSearchText && !isResultSelected) {
      getSearchResults(searchText, [])
      console.debug(searchState)
      setPrevSearchText(searchText)
      setShowResults(true)
    }
  }, [searchText])

  useEffect(() => {
    if (!isLoading && !error && results && results.length > 0) {
      setOptions(results)
    } else {
      setOptions([])
    }
  }, [results, isLoading, error])

  return (
    <GeocoderButtonContainer>
      <div>
        <Popover
          id={id}
          open={open}
          anchorEl={anchorEl}
          className={classes.root}
          onClose={handleClose}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'left'
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right'
          }}
        >
          {/* <Paper
            component="div"
            className={classes.root}
            //style={{ display: open ? undefined : 'none' }}
            elevation={1}
          > */}
          {/* <Autocomplete
            id="free-solo-demo"
            className={classes.input}
            freeSolo
            value={searchText}
            onChange={onChangeHandler}
            options={options}
            renderOption={(item: any) => {
              return (
                <List
                  component="ul"
                  aria-label="search results"
                  className={classes.resultList}
                  dense
                >
                  {options.map((item, idx) => (
                    <ListItem
                      key={'search-result-' + idx}
                      className={classes.resultListItem}
                      onClick={() => onClickHandler(item)}
                    >
                      <ListItemText primary={item['place_name']} />
                    </ListItem>
                  ))}
                </List>
              )
            }}
            renderInput={(params) => {
              // console.debug(params)
              // return (
              //   <InputBase
              //     className={classes.input}
              //     //{...params}
              //     placeholder="Search location"
              //     inputProps={{ ...params.inputProps, 'aria-label': 'search location' }}
              //   />
              // )
              <TextField {...params} margin="normal" variant='standard'/>
            }}
          /> */}
          <InputBase
            className={classes.input}
            placeholder="Search location"
            inputProps={{ 'aria-label': 'search location' }}
            value={searchText}
            onChange={onChangeHandler}
          />
          {!isLoading && !error && results && results.length > 0 && (
            <List
              component="ul"
              aria-label="search results"
              className={classes.resultList}
              dense
              style={{ display: showResults ? undefined : 'none' }}
            >
              {results.map((item, idx) => (
                <ListItem
                  key={'search-result-' + idx}
                  className={classes.resultListItem}
                  onClick={() => onClickHandler(item)}
                >
                  <ListItemText primary={item['place_name']} />
                </ListItem>
              ))}
            </List>
          )}
          {/* </Paper> */}
        </Popover>
        <Tooltip title={t('maps:searchLocationButton') ?? 'Search location'}>
          <span>
            <IconButton
              onClick={searchClickHandler}
              aria-label="download-button"
              className="mapboxgl-ctrl-icon"
              disabled={false}
              aria-describedby={id}
            >
              <SearchIcon fontSize="small" color={'inherit'} />
            </IconButton>
          </span>
        </Tooltip>
      </div>
    </GeocoderButtonContainer>
  )
}

export default MapGeocoderSearchButton
