import React, { useEffect } from 'react'
import InfiniteScroll from 'react-infinite-scroll-component'
import { useTranslation } from 'react-i18next'
import useCommList from '../../../../hooks/use-comm-list.hook'
import List from '@material-ui/core/List'
import ItemCounter from './item-counter'
import CommunicationCard from './drawer-cards/communication-card.component'
import classes from './map-drawer.module.scss'
import SearchBar from '../../../../common/search-bar.component'
import { EntityType } from 'ermes-ts-sdk'

export default function CommunicationPanel(props) {
  const { t } = useTranslation(['common', 'maps'])
  const [searchText, setSearchText] = React.useState('')
  const [commsData, getCommsData, applyFilterByText] = useCommList()

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
    getCommsData(
      0,
      (data) => {
        return data
      },
      {},
      (data) => {
        return data
      }
    )
  }, []) // removed [getcommsdata] cause it was being called on filter search

  //reload data when a new communication is created from the map
  useEffect(() => {
    if (props.communicationCounter > 0){ 
      getCommsData(
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
      props.resetListCounter(EntityType.COMMUNICATION)
    }
  }, [props.communicationCounter]) 

  // Fix height of the list when the window is resized
  useEffect(() => {
    window.addEventListener('resize', resizeHeight)
    return () => window.removeEventListener('resize', resizeHeight)
  })

  return (
    <div className="container">
      <SearchBar
        isLoading={commsData.isLoading}
        changeTextHandler={handleSearchTextChange}
        clickHandler={searchInComm}
      />
      {!commsData.isLoading ? (
        <div
          className={classes.fixHeightContainer}
          id="scrollableElem"
          style={{ height: height - 270 }}
        >
          <ItemCounter itemCount={commsData.tot} />
          <List component="span" aria-label="main mailbox folders" className={classes.cardList}>
            <InfiniteScroll
              next={() => {
                getCommsData(
                  commsData.data.length,
                  (data) => {
                    return data
                  },
                  {},
                  (data) => {
                    return data
                  }
                )
              }}
              dataLength={commsData.data.length}
              hasMore={commsData.data.length < commsData.tot}
              loader={<h4>{t('common:loading')}</h4>}
              endMessage={
                <div style={{ textAlign: 'center' }}>
                  <b>{t('common:end_of_list')}</b>
                </div>
              }
              scrollableTarget="scrollableElem"
            >
              {commsData.data.map((elem, i: number) => (
                <CommunicationCard
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
