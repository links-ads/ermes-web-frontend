import React, { useState } from 'react'
import Card from '@material-ui/core/Card'
import { queryHoveredFeature } from '../../../../common/map/map-common'

const CLUSTER_LAYER_ID = 'clusters'
const SOURCE_ID = 'emergency-source'
const GEOJSON_LAYER_IDS = 'unclustered-point'

export default function CardWithPopup(props) {
  const map = props.map
  const [featureToHover, setFeatureHover] = useState<{
    type: 'leaf' | 'point' | 'cluster' | null
    id: string | number | null
    source?: string
  }>({ type: null, id: null })
  // console.log('SpyderLayerIds', props.spiderLayerIds)
  return (
    <Card
      key={props.keyID}
      className={props.className}
      onPointerEnter={() => {

        if (!props.latitude || !props.longitude) return
        const coord = { latitude: props.latitude, longitude: props.longitude }
        
        if (!coord) return
        if (map) {
          const result = queryHoveredFeature(
            map,
            [coord.longitude, coord.latitude],
            [GEOJSON_LAYER_IDS, CLUSTER_LAYER_ID, ...props.spiderLayerIds],
            GEOJSON_LAYER_IDS,
            CLUSTER_LAYER_ID,
            props.id,
            SOURCE_ID
          )
          console.log('IDS', props.id, result.id, SOURCE_ID)
          if (result.type) {
            map.setFeatureState(
              {
                source: result.type === 'leaf' ? result.source : SOURCE_ID,
                id: result.id
              },
              {
                hover: true
              }
            )
            console.log('RESULT', result)
            if (result.type === 'cluster') props.setMapHoverState({ set: true })
            setFeatureHover(result)
          }
        } else {
          return
        }
      }}
      onPointerLeave={() => {
        // const map = props.mapRef.current.getMap()
        if (!props.latitude || props.longitude) return
        if (!map) return
        if (featureToHover.type) {
          map.setFeatureState(
            {
              source: featureToHover.type === 'leaf' ? featureToHover.source : SOURCE_ID,
              id: featureToHover.id
            },
            {
              hover: false
            }
          )
          if (featureToHover.type === 'cluster') props.setMapHoverState({ set: false })
        }
        setFeatureHover({ type: null, id: null })
      }}
    >
      {props.children}
    </Card>
  )
}
