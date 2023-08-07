import React from 'react'
import { Button, createStyles, makeStyles, Theme } from '@material-ui/core'
import { useTranslation } from 'react-i18next'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    button: {
      textTransform: 'initial'
    }
  })
)

const MapSearchHere: React.FC<{ disabled; onClickHandler }> = ({ disabled, onClickHandler }) => {
  const { t } = useTranslation(['social'])
  const classes = useStyles()
  return (
    <div
      style={{
        position: 'absolute',
        left: '46%',
        top: '10px',
        backgroundColor: 'black',
        opacity: 0.8,
        borderRadius: 5
      }}
    >
      <Button
        variant="contained"
        className={classes.button}
        disabled={disabled}
        onClick={onClickHandler}
      >
        {t('social:map_button_label')}
      </Button>
    </div>
  )
}

export default MapSearchHere
