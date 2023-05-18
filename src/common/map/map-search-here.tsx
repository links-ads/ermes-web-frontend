import React from "react";
import SearchIcon from '@mui/icons-material/Search'
import { Button, IconButton, Theme } from "@mui/material";
import { useTranslation } from "react-i18next";
import { makeStyles } from "tss-react/mui";

const useStyles = makeStyles()((theme: Theme) =>
    {return {
        button: {
            borderColor: 'white',
            color: 'white',
            borderWidth: 1
        }
    }}
)

const MapSearchHere: React.FC<{}> = () => {
  const { t } = useTranslation(['social'])
  const {classes} = useStyles()
  return (
    <div
      style={{
        position: 'absolute',
        left: '50%',
        top: '50px',
        backgroundColor: 'black',
        opacity: 0.8
      }}
    >
      <Button variant="outlined" startIcon={<SearchIcon />} className={classes.button}>
        {t('social:map_button_label')}
      </Button>
    </div>
  )
}

export default MapSearchHere

