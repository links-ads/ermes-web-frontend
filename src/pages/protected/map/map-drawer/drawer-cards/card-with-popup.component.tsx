import React, { useEffect, useRef, useState } from 'react'
import Card from '@material-ui/core/Card'
import { queryHoveredFeature } from '../../../../../common/map/map-common'
import { updatePointFeatureLayerIdFilter } from '../../../../../utils/map.utils'
import { makeStyles } from '@material-ui/core/styles'
import { EmergencyColorMap } from '../../api-data/emergency.component'

const CLUSTER_LAYER_ID = 'clusters'
const SOURCE_ID = 'emergency-source'
const GEOJSON_LAYER_IDS = 'unclustered-point'

const useStyles = makeStyles((theme) => ({
  root: {
    '&:hover > *': {
        boxShadow: 'inset 0 0 0 20em rgba(255, 255, 255, 0.08)',
        cursor: 'pointer'
    },
  }
}))

export default function CardWithPopup(props) {
  const { map, selectedCard, id, keyID } = props
  const [featureToHover, setFeatureHover] = useState<{
    type: 'leaf' | 'point' | 'cluster' | null
    id: string | number | null
    source?: string
  }>({ type: null, id: null })
  const classes = useStyles()
  const ref = useRef<any>(null)

  useEffect(() => {
    if (selectedCard !== '' && selectedCard === keyID) {
      ref.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [selectedCard])

  const hoverFeatureOnMap = () => {
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
        id,
        props.type
      )

      if (result.type) {
        switch (result.type) {
          case 'point':
            updatePointFeatureLayerIdFilter(
              map,
              'unclustered-point-hovered',
              result.id as string
            )
            break
          case 'leaf':
            if (props.spiderifierRef.current) {
              props.spiderifierRef.current.highlightHoveredLeaf(map, result.id)
            }
            break
          case 'cluster':
            map.setFeatureState(
              {
                source: SOURCE_ID,
                id: result.id
              },
              {
                hover: true
              }
            )
            props.setMapHoverState({ set: true })
            break
          default:
            return
        }

        if (result.type !== null) setFeatureHover(result)
      }
    } else {
      return
    }
  }

  const unhoverFeatureOnMap = () => {
    if (!map || selectedCard !== '') return
    switch (featureToHover.type) {
      case 'leaf':
        props.spiderifierRef.current?.highlightHoveredLeaf(map, 'null')
        break
      case 'cluster':
        map.setFeatureState(
          {
            source: SOURCE_ID,
            id: featureToHover.id
          },
          {
            hover: false
          }
        )
        props.setMapHoverState({ set: false })
        break
      case 'point':
        updatePointFeatureLayerIdFilter(map, 'unclustered-point-hovered', 'null')
        break
    }
    setFeatureHover({ type: null, id: null })
  }

  const unhoverAll = () => {
    if (!map) return
    props.spiderifierRef.current?.highlightHoveredLeaf(map, 'null')
    // map.setFeatureState(
    //   {
    //     source: SOURCE_ID,
    //     id: featureToHover.id
    //   },
    //   {
    //     hover: false
    //   }
    // )
    // props.setMapHoverState({ set: false })
    updatePointFeatureLayerIdFilter(map, 'unclustered-point-hovered', 'null')
    setFeatureHover({ type: null, id: null })
  }

  const onCardClick = () => {
    props.setSelectedCard(keyID)
    // unhoverAll()
    hoverFeatureOnMap()
  }

  return (
    <Card
      ref={ref}
      className={`${props.className} ${classes.root}`}
      style={{borderStyle: (selectedCard === keyID) ? 'solid' : '', borderColor: (selectedCard === keyID) ? EmergencyColorMap[props.type] : ''}}
      raised={true}
      onPointerEnter={hoverFeatureOnMap}
      onPointerLeave={unhoverFeatureOnMap}
      onClick={onCardClick}
    >
      {props.children}
    </Card>
  )
}
