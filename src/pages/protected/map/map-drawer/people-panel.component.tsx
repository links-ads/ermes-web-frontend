import React, { useEffect } from 'react'
import InfiniteScroll from 'react-infinite-scroll-component'
import { useTranslation } from 'react-i18next'
import List from '@material-ui/core/List'
import usePeopleList from '../../../../hooks/use-people-list.hook'
import ItemCounter from './item-counter'
import SearchBar from '../../../../common/search-bar.component'
import PeopleCard from './drawer-cards/people-card.component'
import classes from './map-drawer.module.scss'

export default function PeoplePanel(props) {
  // Main data + search text field text
  const [peopData, getPeopData, , applyFilterByText] = usePeopleList()
  const [searchText, setSearchText] = React.useState('')
  const [ teamListIDs, setTeamListIds] = React.useState([])

  // Search text field management functions
  const handleSearchTextChange = (e) => {
    setSearchText(e.target.value)
  }
  const [prevSearchText, setPrevSearchText] = React.useState('')

  // on click of the search button
  const searchInPeople = () => {
    if (searchText !== undefined && searchText != prevSearchText) {
      let selected = props.filters.content[1].selected
      let teamList = props.teamList
      
      var arrayOfTeams: number [] = []
      if(!!selected && selected.length>0){
        for(let i =0; i<selected.length; i++){
          let idFromContent = Number(!!getKeyByValue(teamList,selected[i]) ? getKeyByValue(teamList, selected[i]) : -1)
          if(idFromContent>=0)
            arrayOfTeams.push(idFromContent)
        }
   
      }
      applyFilterByText(searchText, (arrayOfTeams.length>0) ? arrayOfTeams : undefined,)
      setPrevSearchText(searchText)
    }
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
    return Object.keys(object).find(key => object[key] === value);
  }
  // Calls the data only the first time is needed
  useEffect(() => {

    let selected = props.filters.content[1].selected
    let teamList = props.teamList
    
    var arrayOfTeams: number [] = []
    if(!!selected && selected.length>0){
      for(let i =0; i<selected.length; i++){
        let idFromContent = Number(!!getKeyByValue(teamList,selected[i]) ? getKeyByValue(teamList, selected[i]) : -1)
        if(idFromContent>=0)
          arrayOfTeams.push(idFromContent)
      }
 
    }
  
    getPeopData(
      0,
      undefined,
      (arrayOfTeams.length>0) ? arrayOfTeams : undefined,
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

  return (
    <div className="containerWithSearch">
      <SearchBar
        isLoading={peopData.isLoading}
        changeTextHandler={handleSearchTextChange}
        clickHandler={searchInPeople}
      />
      {!peopData.isLoading ? (
        <div
          className={classes.fixHeightContainer}
          id="scrollableElem"
          style={{ height: height - 270 }}
        >
          <ItemCounter itemCount={peopData.tot} />
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
              hasMore={peopData.data.length >= peopData.tot ? false : true}
              loader={<h4>{t('common:loading')}</h4>}
              endMessage={
                <div style={{ textAlign: 'center' }}>
                  <b>{t('common:end_of_list')}</b>
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
