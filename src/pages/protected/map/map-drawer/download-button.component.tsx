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
  position: absolute;
  top: 160px;
  right: 0px;
  margin: 10px;
`

const ICON_STYLE: React.CSSProperties = { fontSize: 16 }

export function DownloadButton(props) {
  const { t } = useTranslation(['maps'])
  function onClick(e: React.MouseEvent) {
    props.downloadGeojsonFeatureCollection()
  }

  return (
    <DownloadButtonContainer>
      <Tooltip title={t('maps:downloadButton') ?? 'Download'}>
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
