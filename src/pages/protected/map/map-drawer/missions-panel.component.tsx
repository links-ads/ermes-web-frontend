import React, { useEffect } from 'react'
import InfiniteScroll from 'react-infinite-scroll-component'
import { useTranslation } from 'react-i18next'
import useMissionsList from '../../../../hooks/use-missions-list.hook'
import List from '@mui/material/List'
import ItemCounter from './item-counter'
import MissionCard from './drawer-cards/mission-card.component'
import SearchBar from '../../../../common/search-bar.component'
import classes from './map-drawer.module.scss'
import { EntityType } from 'ermes-ts-sdk'

export default function CommunicationPanel(props) {
  const { t } = useTranslation(['common', 'maps'])
  const [searchText, setSearchText] = React.useState('')
  const [missionsData, getMissionsData, applyFilterByText] = useMissionsList()

  const [height, setHeight] = React.useState(window.innerHeight)
  const resizeHeight = () => {
    setHeight(window.innerHeight)
  }

  // calls the passed function to fly in the map to the desired point
  const flyToCoords = function (latitude, longitude) {
    props.setGoToCoord({ latitude: latitude, longitude: longitude })
  }

  // handle the text changes in the search field
  const handleSearchTextChange = (e) => {
    setSearchText(e.target.value)
  }

  //check if search text is same as before, if so don't call it again
  const [prevSearchText, setPrevSearchText] = React.useState('')

  // on click of the search button
  const searchInMiss = () => {
    if (searchText !== undefined && searchText != prevSearchText) {
      applyFilterByText(searchText)
      setPrevSearchText(searchText)
    }
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

  return (
    <div className="container">
      <SearchBar
        isLoading={missionsData.isLoading}
        changeTextHandler={handleSearchTextChange}
        clickHandler={searchInMiss}
      />
      {!missionsData.isLoading ? (
        <div
          className={classes.fixHeightContainer}
          id="scrollableElem"
          style={{ height: height - 270 }}
        >
          <ItemCounter itemCount={missionsData.tot} />
          <List component="span" aria-label="main mailbox folders" className={classes.cardList}>
            <InfiniteScroll
              next={() => {
                getMissionsData(
                  missionsData.data.length,
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
              hasMore={missionsData.data.length < missionsData.tot}
              loader={<h4>{t('common:loading')}</h4>}
              endMessage={
                <div style={{ textAlign: 'center' }}>
                  <b>{t('common:end_of_list')}</b>
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

