import { Typography } from '@material-ui/core';
import { SocialModuleLanguageType } from 'ermes-backoffice-ts-sdk';
import React from 'react';
import { FiltersSocialType, FiltersType } from '../common/filters/reducer';
import { FiltersDescriptorType } from '../common/floating-filters-tab/floating-filter.interface';
import { DEFAULT_MAP_BOUNDS, getMapBounds } from '../common/map/map-common'
import { EmergencyColorMap } from '../pages/protected/map/api-data/emergency.component';

export const _MS_PER_DAY = 1000 * 60 * 60 * 24;

export const HAZARD_SOCIAL_ICONS = {
  storm: '⚡️',
  wildfire: '🔥',
  fire: '🔥',
  flood: '💧',
  earthquake: '🌋',
  landslide: '⛰️',
  avalanche: '⛰️',
  subsidence: '⛰️',
  pandemic: '🦠', // official icon for COVID-19 (source emojipedia https://emojipedia.org/microbe/)
  terrorism: '⚫',
  temp_anomaly: '🌀️',
  collapse: '⛰️',
  accident: '🚨',
  rain: '⛈️',
  none: ''
  // NEW 2020!
};

export const INFORMATIVE_ICONS = {
  informative: '🟢',
  not_informative: '🔴'
}

export const getSocialCardStyle = (theme) => {
  return {
    root: {
      width: '100%',
      marginBottom: '8px',
      textOverflow: "ellipsis",
      overflow: "hidden",
      display: 'inline-block',
      padding: 6,
      "&:hover": {
        boxShadow: 'inset 0 0 0 20em rgba(255, 255, 255, 0.3)',
        cursor: 'pointer'
      }
    },
    expand: {
      transform: 'rotate(0deg)',
      marginLeft: 'auto',
      transition: theme.transitions.create('transform', {
        duration: theme.transitions.duration.shortest,
      }),
    },
    expandOpen: {
      transform: 'rotate(180deg)',
    },
    content: {
      margin: '5px',
      padding: 5
    },
    action: {
      margin: '0px 5px',
      padding: 0
    }
  }
}

export const getSocialDashboardStyle = (theme) => {
  return {
    tweetsStatContainer: {
      padding: '8px',
      height: '100%'
    },
    infoContainer: {
      marginBottom: '16px'
    },
    pieContainer: {
      height: '20vh',
      minHeight: 200,
      width: '100%',
      position: 'relative'
    } as import('@material-ui/styles').CSSProperties,
    tweetsListContainer: {
      margin: '16px 8px 8px 0px',
      maxWidth: '30vw'
    },
    indicator: {
      backgroundColor: '#FFF'
    },
    appbar: {
      backgroundColor: theme.palette.primary.main,
      boxShadow: 'none'
    }
  }
}

export const getFiltersStyle = (theme) => {
  return {
    filterSection: {
      padding: '16px 8px',
      marginLeft: '8px',
      minWidth: 180,
      width: '15vw'
    },
    filterContainer: {
      padding: '8px',
      backgroundColor: theme['palette']['primary']['main']
    },
    applyButton: {
      color: theme['palette']['text']['primary'],
      backgroundColor: theme['palette']['secondary']['main'],
      fontSize: '15px',
      margin: '8px'
    },
    personApplyButton: {
      color: '#000000',
      backgroundColor: EmergencyColorMap['Person'],
      fontSize: '15px',
      margin: '8px'
    },
    reportApplyButton: {
      color: '#000000',
      backgroundColor: EmergencyColorMap['Report'],
      fontSize: '15px',
      margin: '8px'
    },
    missionApplyButton: {
      color: '#000000',
      backgroundColor: EmergencyColorMap['Mission'],
      fontSize: '15px',
      margin: '8px'
    },
    communicationApplyButton: {
      color: '#000000',
      backgroundColor: EmergencyColorMap['Communication'],
      fontSize: '15px',
      margin: '8px'
    },
    mapRequestApplyButton: {
      color: '#000000',
      backgroundColor: EmergencyColorMap['MapRequest'],
      fontSize: '15px',
      margin: '8px'
    },
    resetButton: {
      color: theme['palette']['text']['primary'],
      backgroundColor: 'inherit', 
      fontSize: '15px',
      margin: '8px'
    },
    selectOption: {
      width: '100%',
      minWidth: 180,
      // maxWidth:180

    },
    filterCheckbox: {
      marginLeft: '0px'
    },
    filterButton: {
      // color: theme['palette']['text']['primary'],
      // backgroundColor: theme['palette']['secondary']['main'],
      paddingBottom: '4px',
      paddingTop: '4px',
      paddingLeft: '10px',
      paddingRight: '10px',
      margin: '8px',
      fontSize: '15px',
    }
  }
}

export const showMoreSocialData = (shownData, annotationData, pageSize, setShownData) => {
  const newData = shownData.data.concat([...annotationData].slice(shownData.size, shownData.size + pageSize))
  const newSize = newData.length
  setShownData({ size: newSize, data: newData })
}

export const getDefaultFilterArgs = (mapConfig) => {
  const currentDate = new Date()
  return {
    datestart: new Date(currentDate.valueOf() - _MS_PER_DAY),
    dateend: currentDate,
    languageSelect: [],
    hazardSelect: [],
    infoTypeSelect: [],
    informativeSelect: 'true',
    southWest: mapConfig?.mapBounds?.southWest || DEFAULT_MAP_BOUNDS.southWest,
    northEast: mapConfig?.mapBounds?.northEast || DEFAULT_MAP_BOUNDS.northEast
  } as FiltersType
}

export const getDefaultFilterSocialArgs = (mapConfig) => {
  const currentDate = new Date()
  return {
    datestart: new Date(currentDate.valueOf() - _MS_PER_DAY),
    dateend: currentDate,
    languageSelect: [SocialModuleLanguageType.EN],
    hazardSelect: [],
    infoTypeSelect: [],
    informativeSelect: 'true',
    southWest: mapConfig?.mapBounds?.southWest || DEFAULT_MAP_BOUNDS.southWest,
    northEast: mapConfig?.mapBounds?.northEast || DEFAULT_MAP_BOUNDS.northEast
  } as FiltersSocialType
}

export const getFilterObjFromFilters = (defaultArgs, id2hazardNames, id2infoNames, renderInformative = true) => {
  const obj = {
    tabs: 1,
    xystart: [60, 60],
    filters: {
      datestart: {
        selected: typeof defaultArgs.datestart == 'string' ? defaultArgs.datestart : defaultArgs.datestart.toISOString(),
        type: 'date',
        tab: 1
      },
      dateend: {
        selected: typeof defaultArgs.dateend == 'string' ? defaultArgs.dateend : defaultArgs.dateend.toISOString(),
        type: 'date',
        tab: 1,
        range: 4
      },
      languageSelect: {
        name: 'language',
        options: Object.values(SocialModuleLanguageType),
        type: 'multipleselect',
        selected: defaultArgs.languageSelect
      },
      hazardSelect: {
        name: 'hazard',
        options: Object.values(id2hazardNames),
        type: 'multipleselect',
        selected: Object.entries(id2hazardNames).length > 0 ? defaultArgs.hazardSelect.map(id => id2hazardNames[id]) : ''
      },
      infoTypeSelect: {
        name: 'information',
        options: Object.values(id2infoNames),
        type: 'multipleselect',
        selected: Object.entries(id2infoNames).length > 0 ? defaultArgs.infoTypeSelect.map(id => id2infoNames[id]) : ''
      },
    }
  } as FiltersDescriptorType
  if (renderInformative) {
    obj.filters!['informativeSelect'] = {
      name: 'Informative',
      options: ['all', 'true', 'false'],
      type: 'select',
      selected: defaultArgs.informativeSelect === undefined ?  'all' : defaultArgs.informativeSelect
    }
  }
  return obj
}

export const forceFiltersDateRange = (startDate, endDate, range, updateEndDate) => {
  if (Math.abs(endDate - startDate) > range) {
    updateEndDate(startDate + range)
  }
}

export const parseTweetText = (tweetText) => {
  const text = tweetText.replace(/\n/ig, ' ')
  const update = () => {
    if (accumulated.length > 0)
      elements.push({ text: accumulated, type: 'string' })
  }
  let elements = [] as any[]
  let accumulated = ""
  let v = text.trim().split(' ')
  for (let word of v) {
    if (word.startsWith("@")) {
      update()
      elements.push({ text: word, type: 'tag' })
      accumulated = ""
      continue
    }
    if (word.startsWith("#")) {
      update()
      elements.push({ text: word, type: 'hash' })
      accumulated = ""
      continue
    }
    if (word.startsWith("http")) {
      update()
      elements.push({ text: word, type: 'link' })
      accumulated = ""
      continue
    }
    accumulated = accumulated + " " + word
  }
  update()
  return elements
}


export const ParsedTweet = (props) => {

  return (
    <React.Fragment>
      {
        parseTweetText(props.text).map((tweet, index) => {
          if (tweet.type === 'string') {
            return (
              <Typography key={index} display='inline' paragraph={true} variant={props.textSizes.body} color="textSecondary" component="p">
                {tweet.text + " "}
              </Typography>
            )
          }
          else {
            let linkToFollow = "";
            switch (tweet.type) {
              case 'tag':
                linkToFollow = "https://twitter.com/" + tweet.text.substring(1)
                break;
              case 'hash':
                linkToFollow = "https://twitter.com/hashtag/" + tweet.text.substring(1) + "?src=hashtag_click"
                break;
              case 'link':
                linkToFollow = tweet.text
                break;
              default:
            }
            return (<Typography key={index} style={{ cursor: 'pointer' }} display="inline" variant={props.textSizes.body} color="secondary"
              onClick={(evt) => {
                evt.stopPropagation()
                evt.preventDefault()
                window.open(linkToFollow)
              }}>
              {tweet.text + " "}
            </Typography>)
          }
        }
        )
      }
    </React.Fragment>
  )
}


export const filterObjApplyHandler = (filtersObj, mapHazards, mapInfos, oldArgs, mapRef, setStorage, setState) => {
  const filters = extractFilters(filtersObj.filters, mapHazards, mapInfos)
  const newFilters = mergeFilters(oldArgs, filters, mapRef)
  setStorage(JSON.stringify(newFilters))
  setState(newFilters)
}

export const mergeFilters = (oldArgs, newArgs, mapRef) => {
  return {
    ...oldArgs,
    ...newArgs,
    ...getMapBounds(mapRef)
  }
}

export const extractFilters = (filtersObj, mapHazards, mapInfos) => {
  const selectedFilters = {}
  Object.entries(filtersObj).forEach((e: [string, any]) => selectedFilters[e[0]] = e[1].selected)
  selectedFilters['hazardSelect'] = selectedFilters['hazardSelect'].map(h => mapHazards[h])
  selectedFilters['infoTypeSelect'] = selectedFilters['infoTypeSelect'].map(i => mapInfos[i])
  if (selectedFilters['informativeSelect'] !== undefined)
    selectedFilters['informativeSelect'] = String(selectedFilters['informativeSelect']) === 'all' ? undefined : String(selectedFilters['informativeSelect']) === 'true'
  return selectedFilters
}