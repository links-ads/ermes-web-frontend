import React, { useEffect } from 'react'
import InfiniteScroll from 'react-infinite-scroll-component'
import { useTranslation } from 'react-i18next'
import useAlerts from '../../../../hooks/use-alerts.hook'
import List from '@material-ui/core/List'
import AlertCard from './drawer-cards/alert-card.component'
import classes from './map-drawer.module.scss'

const AlertPanel: React.FC<{
  setGoToCoord: any
  map: any
  setMapHoverState: any
  spiderLayerIds: any
  spiderifierRef: any
  flyToCoords: any
  selectedCard: any
  setSelectedCard: any
  selectedItemsList: []
  updateIsLoadingStatus
  searchText: string
  triggerSearch: boolean
  updateTriggerSearch
  updateItemsCounter
}> = (props) => {
  const { t } = useTranslation(['common', 'maps'])
  const [alertsData, getAlerts, applyFilterByText, getAlertById, appendSelectedItems] = useAlerts()
  const { isLoading, tot } = alertsData
  const {
    selectedItemsList,
    updateIsLoadingStatus,
    searchText,
    triggerSearch,
    updateTriggerSearch,
    updateItemsCounter
  } = props

  const [height, setHeight] = React.useState(window.innerHeight)
  const resizeHeight = () => {
    setHeight(window.innerHeight)
  }

  // calls the passed function to fly in the map to the desired point
  const flyToCoords = (latitude, longitude) => {
    props.setGoToCoord({ latitude: latitude, longitude: longitude })
  }

  // Calls the data only the first time is needed
  useEffect(() => {
    getAlerts(
      0,
      (data) => {
        return data
      },
      {},
      (data) => {
        return data
      }
    )
  }, [])

  useEffect(() => {
    if (selectedItemsList.length > 0) {
      appendSelectedItems(selectedItemsList)
    }
  }, [selectedItemsList])

  // Fix height of the list when the window is resized
  useEffect(() => {
    window.addEventListener('resize', resizeHeight)
    return () => window.removeEventListener('resize', resizeHeight)
  })

  useEffect(() => {
    updateIsLoadingStatus(isLoading)
    if (!isLoading) {
      const counter = tot >= 0 ? tot : 0
      updateItemsCounter(counter)
    }
  }, [isLoading])

  useEffect(() => {
    if (triggerSearch) {
      applyFilterByText(searchText)
      updateTriggerSearch(false)
    }
  }, [triggerSearch])

  return (
    <div className="container">
      {!isLoading ? (
        <div
          className={classes.fixHeightContainer}
          id="scrollableElem"
          style={{ height: height - 270 }}
        >
          <List component="span" aria-label="main mailbox folders" className={classes.cardList}>
            <InfiniteScroll
              next={() => {
                getAlerts(
                  alertsData.data.length - alertsData.selectedItems.length,
                  (data) => {
                    return data
                  },
                  {},
                  (data) => {
                    return data
                  }
                )
              }}
              dataLength={alertsData.data.length}
              hasMore={alertsData.data.length < tot}
              loader={<h4>{t('common:loading')}</h4>}
              endMessage={
                <div style={{ textAlign: 'center' }}>
                  <b>{t('common:end_of_list')}</b>
                </div>
              }
              scrollableTarget="scrollableElem"
            >
              {alertsData.data.map((elem, i: number) => (
                <AlertCard
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

export default AlertPanel
