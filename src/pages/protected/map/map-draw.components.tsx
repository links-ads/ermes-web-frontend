import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react'
import {
  Editor,
  EditingMode,
  DrawPolygonMode,
  DrawRectangleMode,
  RENDER_STATE,
  EDIT_TYPE
} from 'react-map-gl-draw'
import { Feature } from '@nebula.gl/edit-modes'
import { useMapStateContext, ProvisionalFeatureType } from './map.contest'
import yellow from '@material-ui/core/colors/yellow'
import { fade } from '@material-ui/core/styles/colorManipulator'
import blueGrey from '@material-ui/core/colors/blueGrey'
// provisional colors
import purple from '@material-ui/core/colors/purple'
import blue from '@material-ui/core/colors/blue'
import pink from '@material-ui/core/colors/pink'

type ModeCtor = typeof EditingMode | typeof DrawPolygonMode | typeof DrawRectangleMode | null
type Handler = EditingMode | DrawPolygonMode | DrawRectangleMode | null
type ModeId = 'drawRectangle' | 'drawPolygon' | 'editing' | null

type Mode = {
  id: ModeId
  text: string
  handler?: Handler
  handlerType: ModeCtor
}

const EMPTY_MODE: Mode = {
  id: null,
  text: '',
  handlerType: null
}

// Use i18n
const MODES: Mode[] = [
  // Select stuff
  { id: 'drawRectangle', text: 'Draw Bounding Box', handlerType: DrawRectangleMode },
  // Draw Area (polygon)
  { id: 'drawPolygon', text: 'Draw Polygon', handlerType: DrawPolygonMode },
  // Edit existing
  { id: 'editing', text: 'Edit Feature', handlerType: EditingMode }
]

export type deleteFeaturesFn = (index: number | number[]) => void

function featureStyle(editingFeatureType: ProvisionalFeatureType | null) {
  let color: any = blueGrey
  switch (editingFeatureType) {
    case 'report_request':
      color = blue
      break
    case 'mission':
      color = purple
      break
    case 'communication':
      color = pink
      break
    default:
      break
  }

  return ({
    feature,
    index,
    state
  }: {
    feature: GeoJSON.Feature
    index: number
    state: RENDER_STATE
  }) => {
    if (state === RENDER_STATE.UNCOMMITTED) {
      return {
        stroke: fade(yellow[800], 0.9),
        fill: fade(yellow[500], 0.2)
      }
    }
    return {
      stroke: fade(color[800], 0.9),
      fill: fade(color[500], 0.2),
      strokeDasharray: '4,2'
    }
  }
}

export interface MapDrawProps {
  defaultDrawerMode?: ModeId
  features?: GeoJSON.Feature[]
  selectedFeatureIndex?: number | null
  onFeatureAdd?: (feature: GeoJSON.Feature[]) => void
  // onSelect?: (
  //   selectedFeature?: GeoJSON.Feature | null, // selected feature. null if clicked an empty space.
  //   selectedFeatureIndex?: number | null, // selected feature index.null if clicked an empty space.
  //   editHandleIndex?: number | null, // selected editHandle index. null if clicked an empty space.
  //   screenCoords?: mapboxgl.PointLike, // screen coordinates of the clicked position.
  //   mapCoords?: mapboxgl.LngLatLike //  map coordinates of the clicked position.
  // ) => void
  // onUpdate?: (
  //   data?: GeoJSON.Feature<GeoJSON.Polygon | GeoJSON.MultiPolygon | GeoJSON.Point>[], //  updated list of GeoJSON features.
  //   editType?: EDIT_TYPE.ADD_FEATURE | EDIT_TYPE.ADD_POSITION | EDIT_TYPE.FINISH_MOVE_POSITION,
  //   editContext?: any[] // list of edit objects, depend on editType, each object may contain featureIndexes, editHandleIndexes, screenCoords, mapCoords.
  // ) => void
  // selectable?: boolean
}

export interface MapDrawRefProps {
  getFeatures: () => void
  addFeatures: () => void
  deleteFeatures: (index: number | number[]) => void
}
export const MapDraw = forwardRef<unknown, MapDrawProps>(
  (
    {
      defaultDrawerMode,
      onFeatureAdd,
      // onUpdate,
      features,
      selectedFeatureIndex
    }: // selectable
    MapDrawProps,
    ref
  ) => {
    const [{ mapMode, editingFeatureType }] = useMapStateContext<any>()

    const editorRef = useRef<Editor>(null)

    const initialMode = MODES.find((m) => m.id === defaultDrawerMode) || EMPTY_MODE
    const [modeHandler, setModeHandler] = useState<Mode>({
      ...initialMode,
      handler: initialMode.handlerType ? new initialMode.handlerType() : null
    })

    function onUpdate({
      data,
      editType,
      editContext
    }: {
      data: GeoJSON.Feature[]
      editType: EDIT_TYPE
      editContext: any[]
    }) {
      if (editType === EDIT_TYPE.ADD_FEATURE && onFeatureAdd) {
        onFeatureAdd(data)
      }
    }

    function switchMode(modeId: ModeId) {
      const mode: Mode | undefined = MODES.find((m) => m.id === modeId)
      if (mode && mode.handlerType) {
        console.debug('Selected', modeId)

        const handler = new mode.handlerType()
        setModeHandler({ ...mode, handler })
      } else {
        setModeHandler(EMPTY_MODE)
      }
    }

    useImperativeHandle<unknown, MapDrawRefProps>(ref, () => ({
      getFeatures: () => {
        if (editorRef.current) {
          editorRef.current.getFeatures()
        }
      },
      addFeatures: () => {
        if (editorRef.current) {
          editorRef.current.addFeatures(features as Feature[])
        }
      },
      deleteFeatures: (index: number | number[]) => {
        if (editorRef.current) {
          editorRef.current.deleteFeatures(index)
        }
      }
    }))

    useEffect(() => {
      switch (mapMode) {
        case 'edit':
          switchMode('drawPolygon') // TODO use edit if features!==undefined
          break
        case 'select':
          console.log('SEL MODE')
          switchMode('drawRectangle')
          break
        case 'browse':
        default:
          switchMode(null)

          break
      }
    }, [mapMode])

    return (
      <Editor
        selectable={mapMode === 'edit'}
        ref={editorRef}
        featureStyle={featureStyle(editingFeatureType)} // TODO make dynamic (mode, type) => featureStyle
        selectedFeatureIndex={selectedFeatureIndex}
        features={(features as Feature[]) || undefined}
        clickRadius={12}
        mode={modeHandler.handler || undefined}
        // onSelect={onSelect}
        onUpdate={onUpdate}
      />
    )
  }
)
