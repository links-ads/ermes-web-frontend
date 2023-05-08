import React from "react";
import SearchIcon from '@material-ui/icons/Search'
import { Button, createStyles, IconButton, makeStyles, Theme } from "@material-ui/core";
import { useTranslation } from "react-i18next";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        button: {
            borderColor: 'white',
            color: 'white',
            borderWidth: 1
        }
    })
)

const MapSearchHere: React.FC<{}> = () => {
  const { t } = useTranslation(['social'])
  const classes = useStyles()
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

