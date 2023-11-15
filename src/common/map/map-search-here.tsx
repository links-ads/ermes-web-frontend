import React from 'react'
import { Button, createStyles, makeStyles, Theme } from '@material-ui/core'
import { useTranslation } from 'react-i18next'

const useStyles = (props) =>
  makeStyles((theme: Theme) =>
    createStyles({
      button: {
        textTransform: 'initial',
        color: props.disabled ? 'white!important' : undefined
      },
      buttonDiv: {
        position: 'absolute',
        left: 'calc(50% - 85px)',
        top: '10px',
        backgroundColor: props.disabled ? 'black' : undefined,
        opacity: 0.8,
        borderRadius: 5
      }
    })
  )

const MapSearchHere: React.FC<{ disabled; onClickHandler }> = ({ disabled, onClickHandler }) => {
  const { t } = useTranslation(['social'])
  const classes = useStyles({ disabled })()
  return (
    <div className={classes.buttonDiv}>
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
