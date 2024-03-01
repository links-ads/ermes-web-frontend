// Panel displaying the list of reports (segnalazioni) on the left side Drawer.
import React, { useEffect } from 'react'
import useReportList from '../../../../hooks/use-report-list.hook'
import List from '@material-ui/core/List'
import InfiniteScroll from 'react-infinite-scroll-component'
import { useTranslation } from 'react-i18next'
import ReportCard from './drawer-cards/report-card.component'
import classes from './map-drawer.module.scss'

export default function ReportPanel(props) {
  const [repsData, getRepsData, , applyFilterByText, appendSelectedItems] = useReportList()
  const { isLoading, tot } = repsData
  const { t } = useTranslation(['common', 'maps', 'social'])
  const {
    selectedItemsList,
    missionActive,
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
  const flyToCoords = function (latitude, longitude) {
    props.setGoToCoord({ latitude: latitude, longitude: longitude })
  }

  // Calls the data only the first time is needed
  useEffect(() => {
    getRepsData(
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
    <div>
      {/* List of reports */}
      {!isLoading ? (
        <div
          className={classes.fixHeightContainer}
          id="scrollableElem"
          style={{ height: height - 180 }}
        >
          <List component="span" aria-label="main mailbox folders" className={classes.cardList}>
            <InfiniteScroll
              next={() => {
                getRepsData(
                  repsData.data.length - repsData.selectedItems.length,
                  (data) => {
                    return data
                  },
                  {},
                  (data) => {
                    return data
                  }
                )
              }}
              dataLength={repsData.data.length}
              hasMore={repsData.data.length < tot}
              loader={<h4 className={classes.textCenter}>{t('common:loading')}</h4>}
              endMessage={
                <div className={classes.textCenter}>
                  <b>{tot > 0 ? t('common:end_of_list') : t('common:no_items_found')}</b>
                </div>
              }
              scrollableTarget="scrollableElem"
            >
              {repsData.data?.map((elem, i) => (
                <ReportCard
                  key={i}
                  elem={elem}
                  map={props.map}
                  setMapHoverState={props.setMapHoverState}
                  spiderLayerIds={props.spiderLayerIds}
                  spiderifierRef={props.spiderifierRef}
                  flyToCoords={flyToCoords}
                  selectedCard={props.selectedCard}
                  setSelectedCard={props.setSelectedCard}
                  missionActive={missionActive}
                />
              ))}
            </InfiniteScroll>
          </List>
        </div>
      ) : (
        <h4 className={classes.textCenter}>{t('common:loading')}</h4>
      )}
    </div>
  )
}
