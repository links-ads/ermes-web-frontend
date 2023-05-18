import { CircularProgress, IconButton, TextField } from "@mui/material";
import SearchIcon from '@mui/icons-material/Search'
import React from "react";
import { useTranslation } from "react-i18next";
import SearchBarProps from "../models/SearchBarProps";
import classes from "./search-bar.module.css";

const SearchBar: React.FC<SearchBarProps> = (props) =>{
    const { t } = useTranslation(['common'])
    return (
      <div>
        <TextField
          id="outlined-basic"
          label={t('common:search')}
          variant="outlined"
          size="small"
          className={classes.searchField}
          onChange={props.changeTextHandler}
        />
        {!props.isLoading ? (
          <IconButton
            aria-label="search"
            color="inherit"
            onClick={props.clickHandler}
            className={classes.searchButton}
          >
            <SearchIcon />
          </IconButton>
        ) : (
          <CircularProgress color="secondary" size={30} className={classes.searchButton} />
        )}
      </div>
    )
};

export default SearchBar;