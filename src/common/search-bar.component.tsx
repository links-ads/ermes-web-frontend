import { CircularProgress, Grid, IconButton, TextField } from '@material-ui/core'
import SearchIcon from '@material-ui/icons/Search'
import React from 'react'
import { useTranslation } from 'react-i18next'
import SearchBarProps from '../models/SearchBarProps'
import classes from './search-bar.module.css'

const SearchBar: React.FC<SearchBarProps> = (props) => {
  const { t } = useTranslation(['common'])
  return (
    <div style={{ flexGrow: 1 }}>
      <Grid container direction="row" spacing={1} alignItems="center">
        <Grid item xs={10}>
          <TextField
            id="outlined-basic"
            label={t('common:search')}
            variant="outlined"
            size="small"
            //className={classes.searchField}
            onChange={props.changeTextHandler}
          />
        </Grid>
        <Grid item xs={2}>
          {!props.isLoading ? (
            <IconButton
              aria-label="search"
              color="inherit"
              onClick={props.clickHandler}
              //className={classes.searchButton}
              size="small"
            >
              <SearchIcon fontSize="small" />
            </IconButton>
          ) : (
            <CircularProgress color="secondary" size={20} /> //className={classes.searchButton}
          )}
        </Grid>
      </Grid>
    </div>
  )
}

export default SearchBar
