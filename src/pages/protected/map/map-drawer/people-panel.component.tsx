import React, { useEffect } from 'react'
import InfiniteScroll from 'react-infinite-scroll-component'
import { useTranslation } from 'react-i18next'
import List from '@material-ui/core/List'
import usePeopleList from '../../../../hooks/use-people-list.hook'
import PeopleCard from './drawer-cards/people-card.component'
import classes from './map-drawer.module.scss'

export default function PeoplePanel(props) {
  // Main data + search text field text
  const [peopData, getPeopData, , applyFilterByText] = usePeopleList()
  const { isLoading, tot } = peopData
  const [teamListIDs, setTeamListIds] = React.useState([])
  const {
    updateIsLoadingStatus,
    searchText,
    triggerSearch,
    updateTriggerSearch,
    updateItemsCounter
  } = props

  // on click of the search button
  const searchInPeople = () => {
    let selected = props.filters.content[1].selected
    let teamList = props.teamList

    var arrayOfTeams: number[] = []
    if (!!selected && selected.length > 0) {
      for (let i = 0; i < selected.length; i++) {
        let idFromContent = Number(
          !!getKeyByValue(teamList, selected[i]) ? getKeyByValue(teamList, selected[i]) : -1
        )
        if (idFromContent >= 0) arrayOfTeams.push(idFromContent)
      }
    }
    applyFilterByText(searchText, arrayOfTeams.length > 0 ? arrayOfTeams : undefined)
  }

  // function which takes care of fixing the list height for windows resize
  const [height, setHeight] = React.useState(window.innerHeight)
  const resizeHeight = () => {
    setHeight(window.innerHeight)
  }

  // calls the passed function to fly in the map to the desired point
  const flyToCoords = function (latitude, longitude) {
    if (latitude && longitude) {
      props.setGoToCoord({ latitude: latitude, longitude: longitude })
    }
  }
  const { t } = useTranslation(['common', 'maps', 'social', 'labels'])
  function getKeyByValue(object, value) {
    return Object.keys(object).find((key) => object[key] === value)
  }
  // Calls the data only the first time is needed
  useEffect(() => {
    let selected = props.filters.content[1].selected
    let teamList = props.teamList

    var arrayOfTeams: number[] = []
    if (!!selected && selected.length > 0) {
      for (let i = 0; i < selected.length; i++) {
        let idFromContent = Number(
          !!getKeyByValue(teamList, selected[i]) ? getKeyByValue(teamList, selected[i]) : -1
        )
        if (idFromContent >= 0) arrayOfTeams.push(idFromContent)
      }
    }

    getPeopData(
      0,
      undefined,
      arrayOfTeams.length > 0 ? arrayOfTeams : undefined,
      (data) => {
        return data
      },
      {},
      (data) => {
        return data
      }
    )
  }, [])

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
      searchInPeople()
      updateTriggerSearch(false)
    }
  }, [triggerSearch])

  return (
    <div>
      {!isLoading ? (
        <div
          className={classes.fixHeightContainer}
          id="scrollableElem"
          style={{ height: height - 180 }}
        >
          <List component="span" aria-label="main mailbox folders" className={classes.cardList}>
            <InfiniteScroll
              next={() => {
                getPeopData(
                  peopData.data.length,
                  undefined,
                  undefined,
                  (data) => {
                    return data
                  },
                  {},
                  (data) => {
                    return data
                  }
                )
              }}
              dataLength={peopData.data.length}
              hasMore={peopData.data.length < tot}
              loader={<h4 className={classes.textCenter}>{t('common:loading')}</h4>}
              endMessage={
                <div className={classes.textCenter}>
                  <b>{tot > 0 ? t('common:end_of_list') : t('common:no_items_found')}</b>
                </div>
              }
              scrollableTarget="scrollableElem"
            >
              {peopData.data.map((elem, i) => (
                <PeopleCard
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
