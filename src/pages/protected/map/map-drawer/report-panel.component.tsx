// Panel displaying the list of reports (segnalazioni) on the left side Drawer.
import React, { useEffect, useState } from 'react'
import useReportList from '../../../../hooks/use-report-list.hook'
import List from '@material-ui/core/List'
import InfiniteScroll from 'react-infinite-scroll-component'
import { useTranslation } from 'react-i18next'
import ItemCounter from './item-counter'
import ReportCard from './drawer-cards/report-card.component'
import classes from './map-drawer.module.scss'
import SearchBar from '../../../../common/search-bar.component'

export default function ReportPanel(props) {
  const [repsData, getRepsData, , applyFilterByText, appendSelectedItems] = useReportList()
  const { t } = useTranslation(['common', 'maps', 'social'])
  const [searchText, setSearchText] = useState('')
  const { selectedItemsList } = props

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

  const [prevSearchText, setPrevSearchText] = React.useState('')

  // on click of the search button
  const searchInReport = () => {
    if (searchText !== undefined && searchText !== prevSearchText) {
      applyFilterByText(searchText)
      setPrevSearchText(searchText)
    }
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
      }
    )
  }, [])

  useEffect(() => {
    if(selectedItemsList.length > 0){
      appendSelectedItems(selectedItemsList)
    }
  }, [selectedItemsList])

  // Fix height of the list when the window is resized
  useEffect(() => {
    window.addEventListener('resize', resizeHeight)
    return () => window.removeEventListener('resize', resizeHeight)
  })

  return (
    <div className="containerWithSearch">
      <SearchBar
        isLoading={repsData.isLoading}
        changeTextHandler={handleSearchTextChange}
        clickHandler={searchInReport}
      />
      {/* List of reports */}
      {!repsData.isLoading ? (
        <div
          className={classes.fixHeightContainer}
          id="scrollableElem"
          style={{ height: height - 280 }}
        >
          <ItemCounter itemCount={repsData.tot} />
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
              hasMore={repsData.data.length < repsData.tot}
              loader={<h4>{t('common:loading')}</h4>}
              endMessage={
                <div style={{ textAlign: 'center' }}>
                  <b>{t('common:end_of_list')}</b>
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
