// Download button for feature collection
import React from 'react'
import IconButton from '@material-ui/core/IconButton'
import Tooltip from '@material-ui/core/Tooltip'

import styled from 'styled-components'
import { GetApp } from '@material-ui/icons'
import { useTranslation } from 'react-i18next'

const DownloadButtonContainer = styled.div.attrs({
  className: 'mapboxgl-ctrl mapboxgl-ctrl-group'
})`
  border-bottom: 1px solid #fff;
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
`

const ICON_STYLE: React.CSSProperties = { fontSize: 16 }

export function DownloadButton(props) {
  const { t } = useTranslation(['maps'])
  function onClick(e: React.MouseEvent) {
    props.downloadGeojsonFeatureCollection()
  }

  return (
    <DownloadButtonContainer>
      <Tooltip title={t('maps:downloadButton') ?? 'Download'} placement="left-start">
        <span>
          <IconButton
            onClick={onClick}
            aria-label="download-button"
            className="mapboxgl-ctrl-icon"
            disabled={false}
          >
            <GetApp style={ICON_STYLE} color={'inherit'} />
          </IconButton>
        </span>
      </Tooltip>
    </DownloadButtonContainer>
  )
}
