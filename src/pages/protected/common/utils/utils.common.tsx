import { Typography } from '@material-ui/core';
import React from 'react';
import { FiltersType } from '../filters/reducer';
import { DEFAULT_MAP_BOUNDS, getMapBounds } from '../map/map-common'

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

export const getSocialDashboardStyle = (theme) => {
  return {
    tweetsStatContainer: {
      margin: '8px'
    },
    filterContainer: {
      margin: '8px',
      backgroundColor: theme['palette']['primary']['main']
    },
    infoContainer: {
      marginBottom: '16px'
    },
    pieContainer: {
      height: '40vh',
      minHeight: 200,
      width: '45vw',
      position: 'relative'
    } as import('@material-ui/styles').CSSProperties,
    tweetsListContainer: {
      margin: '16px 8px 8px 0px',
      maxWidth: '30vw'
    }
  }
}

export const showMoreSocialData = (shownData, annotationData, pageSize, setShownData) => {
  const newData = shownData.data.concat([...annotationData].slice(shownData.size, shownData.size + pageSize))
  const newSize = newData.length
  setShownData({ size: newSize, data: newData })
}

export const getDefaultFilterArgs = (mapConfig) => {
  return {
    startDate: new Date(new Date().valueOf() - _MS_PER_DAY),
    endDate: new Date(),
    languageSelect: [],
    hazardSelect: [],
    infoTypeSelect: [],
    informativeSelect: 'true',
    southWest: mapConfig?.mapBounds?.southWest || DEFAULT_MAP_BOUNDS.southWest,
    northEast: mapConfig?.mapBounds?.northEast || DEFAULT_MAP_BOUNDS.northEast
  } as FiltersType
}
const checkEqualArrays = (a, b) => {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (a.length !== b.length) return false;

  a.sort()
  b.sort()

  for (var i = 0; i < a.length; ++i) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

export const checkEqualArgs = (oldArgs, newArgs) => {
  if (oldArgs === newArgs) return true
  if (oldArgs == null || newArgs == null) return false
  if (!checkEqualArrays(oldArgs.languages, newArgs.languages)) return false
  if (oldArgs.informative !== newArgs.informative) return false
  if (oldArgs.startDate !== newArgs.startDate) return false
  if (oldArgs.endDate !== newArgs.endDate) return false
  if (!checkEqualArrays(oldArgs.infoTypes, newArgs.infoTypes)) return false
  if (!checkEqualArrays(oldArgs.hazardTypes, newArgs.hazardTypes)) return false
  return true
}

export const parseTweetText = (tweetText) => {
  const text = tweetText.replace(/\n/ig, '')
  let elements = [] as any[]
  let accumulated = ""
  let v = text.trim().split(' ')
  for (let word of v) {
    if (word.startsWith("@")) {
      elements.push({ text: accumulated, type: 'string' })
      elements.push({ text: word, type: 'tag' })
      accumulated = ""
      continue
    }
    if (word.startsWith("#")) {
      elements.push({ text: accumulated, type: 'string' })
      elements.push({ text: word, type: 'hash' })
      accumulated = ""
      continue
    }
    if (word.startsWith("http")) {
      elements.push({ text: accumulated, type: 'string' })
      elements.push({ text: word, type: 'link' })
      accumulated = ""
      continue
    }
    accumulated = accumulated + " " + word
  }
  elements.push({ text: accumulated, type: 'string' })
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


export const filterApplyHandler = (newArgs = {}, stateArgs, setArgs, mapRef) => {
  setArgs({
    ...stateArgs,
    ...newArgs,
    ...getMapBounds(mapRef)
  })
}