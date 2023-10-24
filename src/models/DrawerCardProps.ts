class DrawerCardProps {
  key: number
  elem: any
  map: any
  setMapHoverState: any
  spiderLayerIds: any
  spiderifierRef: any
  flyToCoords: any
  selectedCard: any
  setSelectedCard: any
  missionActive?: boolean

  constructor(key: number) {
    this.key = key
  }
}

export default DrawerCardProps