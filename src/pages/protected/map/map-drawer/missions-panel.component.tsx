import React, { useEffect } from 'react'
import InfiniteScroll from 'react-infinite-scroll-component'
import { useTranslation } from 'react-i18next'
import useMissionsList from '../../../../hooks/use-missions-list.hook'
import List from '@material-ui/core/List'
import MissionCard from './drawer-cards/mission-card.component'
import classes from './map-drawer.module.scss'
import { EntityType } from 'ermes-ts-sdk'

export default function MissionsPanel(props) {
  const { t } = useTranslation(['common', 'maps'])
  const [missionsData, getMissionsData, applyFilterByText, appendSelectedItems] = useMissionsList()
  const { isLoading, tot } = missionsData
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
  const flyToCoords = function (latitude, longitude) {
    props.setGoToCoord({ latitude: latitude, longitude: longitude })
  }

  // Calls the data only the first time is needed
  useEffect(() => {
    getMissionsData(
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

  //reload data when a new communication is created from the map
  useEffect(() => {
    if (props.missionCounter > 0) {
      getMissionsData(
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
      props.resetListCounter(EntityType.MISSION)
    }
  }, [props.missionCounter])

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
          style={{ height: height - 180 }}
        >
          <List component="span" aria-label="main mailbox folders" className={classes.cardList}>
            <InfiniteScroll
              next={() => {
                getMissionsData(
                  missionsData.data.length - missionsData.selectedItems.length,
                  (data) => {
                    return data
                  },
                  {},
                  (data) => {
                    return data
                  }
                )
              }}
              dataLength={missionsData.data.length}
              hasMore={missionsData.data.length < tot}
              loader={<h4 className={classes.textCenter}>{t('common:loading')}</h4>}
              endMessage={
                <div className={classes.textCenter}>
                  <b>{tot > 0 ? t('common:end_of_list') : t('common:no_items_found')}</b>
                </div>
              }
              scrollableTarget="scrollableElem"
            >
              {missionsData.data.map((elem, i) => (
                <MissionCard
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
        <h4 className={classes.textCenter}>{t('common:loading')}</h4>
      )}
    </div>
  )
}
