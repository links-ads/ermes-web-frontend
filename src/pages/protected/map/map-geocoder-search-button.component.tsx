import {
  IconButton,
  Popover,
  TextField,
  Theme,
  Tooltip,
  createStyles,
  makeStyles
} from '@material-ui/core'
import SearchIcon from '@material-ui/icons/Search'
import React, { createRef, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import useMapGeocoderSearch from '../../../hooks/use-map-geocoder-search.hook'
import { Autocomplete, AutocompleteRenderOptionState } from '@material-ui/lab'

const GeocoderButtonContainer = styled.div.attrs({
  className: 'mapboxgl-ctrl mapboxgl-ctrl-group'
})`
  width: 100%;
`

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      height: '100%',
      '& .MuiPopover-paper': {
        borderRadius: 21,
        backgroundColor: '#d5d5d5',
        color: 'black'
      }
    },
    autoComplete: {
      marginLeft: theme.spacing(1),
      marginRight: theme.spacing(3),
      flex: 1,
      fontSize: 13,
      height: '3vh',
      width: '36vh',
      backgroundColor: '#d5d5d5',
      color: 'black',
      zIndex: 3,
      // custom style to remove the underline
      '& .MuiInput-underline:before': {
        borderBottom: 'none'
      },
      '& .MuiInput-underline:after': {
        borderBottom: 'none'
      },
      '& .MuiInput-underline:hover:not(.Mui-disabled):before': {
        borderBottom: 'none'
      }
    },
    input: {
      marginTop: 0,
      marginBottom: 0,
      color: 'black',
      '& .MuiInputBase-root': {
        color: 'black',
        fontSize: 13
      },
      '& .MuiInputBase-input': {
        marginTop: 4,
        marginBottom: -4
      }
    },
    listBox: {
      fontSize: 13,
      color: 'black',
      backgroundColor: '#d5d5d5',
      marginBottom: 0,
      paddingLeft: 0
    }
  })
)

const MapGeocoderSearchButton = (props) => {
  const { t } = useTranslation(['maps', 'import'])
  const classes = useStyles()
  const { markSearchLocation } = props
  const [searchText, setSearchText] = useState<string>('')
  const [prevSearchText, setPrevSearchText] = useState<string>('')
  const [isResultSelected, setIsResultSelected] = useState<boolean>(false)
  const [options, setOptions] = useState<any[]>([])
  const autocompleteTextFieldRef = useRef<HTMLInputElement>(null)
  const [autoCompleteValue, setAutoCompleteValue] = useState<any>('')
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null)
  const open = Boolean(anchorEl)
  const id = open ? 'simple-popover' : undefined
  const [searchState, getSearchResults, clearSearchResults] = useMapGeocoderSearch()
  const { results, isLoading, error } = searchState

  const searchClickHandler = (e: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(e.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const onClickHandler = (e: React.ChangeEvent<{}>, newValue: any | null, reason: string) => {
    if (typeof newValue === 'string') {
      setSearchText(newValue)
      setIsResultSelected(false)
    } else if (reason === 'select-option' && newValue && newValue.name) {
      const itemCoord = newValue.coordinates
      const itemText = newValue.name
      setSearchText(itemText)
      setIsResultSelected(true)
      markSearchLocation(itemCoord[1], itemCoord[0])
    } else if (reason === 'clear' || reason === 'blur') {
      clearSearchResults()
      setIsResultSelected(false)
    }
  }

  const onInputChangeHandler = (event: object, value: string, reason: string) => {
    if (reason === 'input') {
      setSearchText(value)
      setIsResultSelected(false)
      if (value.length === 0) {
        clearSearchResults()
      }
    } else if (reason === 'clear') {
      clearSearchResults()
    } else if (reason === 'reset') {
      setSearchText(value)
    }
  }

  useEffect(() => {
    if (searchText && searchText.length > 2 && searchText != prevSearchText && !isResultSelected) {
      getSearchResults(searchText, [])
      setPrevSearchText(searchText)
    } else if (searchText && searchText.length < 3) {
      clearSearchResults()
    }
  }, [searchText])

  useEffect(() => {
    if (!isLoading && !error && results) {
      setOptions(results)
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
          TransitionProps={{
            onEntered: () => autocompleteTextFieldRef.current?.focus()
          }}
        >
          <Autocomplete
            id="free-solo-demo"
            className={classes.autoComplete}
            freeSolo
            fullWidth
            loading={isLoading}
            loadingText={t('import:loading_label') ?? 'Loading...'}
            size="small"
            value={autoCompleteValue}
            //selectOnFocus
            disableClearable
            // disableCloseOnSelect
            //autoSelect
            onChange={onClickHandler}
            onInputChange={onInputChangeHandler}
            onClose={(event: object, reason: string) => {
              if (reason === 'blur') {
                // TODO
              } else if (reason === 'toggleInput') {
                clearSearchResults()
                setIsResultSelected(false)
              } else if (reason === 'select-option') {
                setIsResultSelected(true)
              }
            }}
            ListboxProps={{ className: classes.listBox }}
            options={options}
            getOptionLabel={(option) => option.name ?? ''}
            renderOption={(option: any, state: AutocompleteRenderOptionState) => option.name}
            renderInput={(params) => (
              <TextField
                {...params}
                className={classes.input}
                margin="dense"
                variant="standard"
                placeholder={t('maps:searchLocationButton') ?? 'Search location'}
                inputRef={autocompleteTextFieldRef}
              />
            )}
          />
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
