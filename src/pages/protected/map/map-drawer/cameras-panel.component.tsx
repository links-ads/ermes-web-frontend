import React, { useEffect } from 'react'
import InfiniteScroll from 'react-infinite-scroll-component'
import { useTranslation } from 'react-i18next'
import useCameras from '../../../../hooks/use-cameras.hook'
import List from '@material-ui/core/List'
import ItemCounter from './item-counter'
import AlertCard from './drawer-cards/alert-card.component'
import classes from './map-drawer.module.scss'
import SearchBar from '../../../../common/search-bar.component'
import { EntityType } from 'ermes-ts-sdk'
import CameraCard from './drawer-cards/camera-card.component'
import { useSelector } from 'react-redux'
import { AppState } from '../../../../state/app.state'

const CamerasPanel: React.FC<{
  setGoToCoord: any
  map: any
  setMapHoverState: any
  spiderLayerIds: any
  spiderifierRef: any
  flyToCoords: any
  selectedCard: any
  setSelectedCard: any
}> = (props) => {
  const { t } = useTranslation(['common', 'maps'])
  const [searchText, setSearchText] = React.useState('')
  const [camerasData, getCameras, applyFilterByText, getCameraById] = useCameras()
  const selectedCameraState = useSelector((state: AppState) => state.selectedCameraState)

  const [height, setHeight] = React.useState(window.innerHeight)
  const resizeHeight = () => {
    setHeight(window.innerHeight)
  }

  // handle the text changes in the search field
  const handleSearchTextChange = (e) => {
    setSearchText(e.target.value)
  }

  const [prevSearchText, setPrevSearchText] = React.useState('')
  // on click of the search button
  const searchInComm = () => {
    if (searchText !== undefined && searchText != prevSearchText) {
      applyFilterByText(searchText)
      setPrevSearchText(searchText)
    }
  }

  // calls the passed function to fly in the map to the desired point
  const flyToCoords = (latitude, longitude) => {
    props.setGoToCoord({ latitude: latitude, longitude: longitude })
  }

  // Calls the data only the first time is needed
  useEffect(() => {
    if (selectedCameraState) {
      return
    }

    getCameras(
      0,
      (data) => {
        return data
      },
      {},
      (data) => {
        return data
      },
      true
    )
  }, [selectedCameraState])

  // Fix height of the list when the window is resized
  useEffect(() => {
    window.addEventListener('resize', resizeHeight)
    return () => window.removeEventListener('resize', resizeHeight)
  })

  return (
    <div className="container">
      <SearchBar
        isLoading={camerasData.isLoading}
        changeTextHandler={handleSearchTextChange}
        clickHandler={searchInComm}
      />
      {!camerasData.isLoading && !camerasData.error ? (
        <div
          className={classes.fixHeightContainer}
          id="scrollableElem"
          style={{ height: height - 270 }}
        >
          <ItemCounter itemCount={camerasData.tot} />
          <List component="span" aria-label="main mailbox folders" className={classes.cardList}>
            <InfiniteScroll
              next={() => {
                getCameras(
                  camerasData.data.length - camerasData.selectedItems.length,
                  (data) => {
                    return data
                  },
                  {},
                  (data) => {
                    return data
                  }
                )
              }}
              dataLength={camerasData.data.length}
              hasMore={camerasData.data.length < camerasData.tot}
              loader={<h4>{t('common:loading')}</h4>}
              endMessage={
                <div style={{ textAlign: 'center' }}>
                  <b>{t('common:end_of_list')}</b>
                </div>
              }
              scrollableTarget="scrollableElem"
            >
              {camerasData.data.map((elem, i: number) => (
                <CameraCard
                  key={i}
                  elem={elem}
                  map={props.map}
                  setMapHoverState={props.setMapHoverState}
                  spiderLayerIds={props.spiderLayerIds}
                  spiderifierRef={props.spiderifierRef}
                  flyToCoords={flyToCoords}
                  selectedCard={props.selectedCard}
                  setSelectedCard={props.setSelectedCard}
                />
              ))}
            </InfiniteScroll>
          </List>
        </div>
      ) : (
        <h4>{t('common:loading')}</h4>
      )}
    </div>
  )
}

export default CamerasPanel
