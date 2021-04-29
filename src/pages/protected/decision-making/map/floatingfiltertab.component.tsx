// This script takes care of the floating widget containing all the filter the
// user can decide to select or deselect by clicking the third button on the top left list
// in the map page

import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import Draggable from 'react-draggable'
import Card from '@material-ui/core/Card'
import CardHeader from '@material-ui/core/CardHeader'
import CardContent from '@material-ui/core/CardContent'
import { useTheme } from '@material-ui/core'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction'
import ListItemText from '@material-ui/core/ListItemText'
import Divider from '@material-ui/core/Divider'
import Checkbox from '@material-ui/core/Checkbox'
import { EmergencyColorMap } from './api-data/emergency.component'
import Typography from '@material-ui/core/Typography'
import { useTranslation } from 'react-i18next'

// Define the style of the widget
const FloatingFilterContainer = styled.div.attrs({
  className: 'mapboxgl-ctrl mapboxgl-ctrl-group'
})`
  position: absolute;
  z-index: 9;
  width: 300px;
`

// Define the accepted types of status in the filter
export type StatusTypes = 'Off' | 'Moving' | 'Active'
const statusTypesModel = {
  Off: true,
  Moving: true,
  Active: true
}

export default function FloatingFilterTab(props) {
  // function for translation (we load map json)
  const { t } = useTranslation(['maps'])

  // Get the list of the activities (this is taken from outside because is due to an API call and a filter to select only some values (see use-activities.hook))
  const activitiesList = props.activitiesList
  const theme = useTheme()
  const [emergencyCat, setEmergencyCat] = useState(
    Object.keys(EmergencyColorMap).reduce((o, key) => ({ ...o, [key]: true }), {})
  )

  const [statusTypesValues, setStatusTypesValues] = useState(statusTypesModel)
  const [activityFilter, setActivityFilter] = useState({})

  // This handle the switch of the checkbox, given a key, a function and an object
  const handleChange = function (key: string, fun: Function, obj: Object) {
    const tmp = obj
    tmp[key] = !tmp[key]
    fun({ ...tmp })
  }

  // This handle the switch of the checkbox which toggles on or off all the other checkboxes
  const handleChangeAll = function () {
    if (checkAllChecked()) {
      setEmergencyCat(
        Object.keys(EmergencyColorMap).reduce((o, key) => ({ ...o, [key]: false }), {})
      )
      setStatusTypesValues({
        Off: false,
        Moving: false,
        Active: false
      })
      const filObj: object = {}
      activitiesList.forEach((e) => {
        if (e.id !== undefined) {
          filObj[e.id] = false
        }
      })
      setActivityFilter(filObj)
    } else {
      setEmergencyCat(
        Object.keys(EmergencyColorMap).reduce((o, key) => ({ ...o, [key]: true }), {})
      )
      setStatusTypesValues({
        Off: true,
        Moving: true,
        Active: true
      })
      const filObj: object = {}
      activitiesList.forEach((e) => {
        if (e.id !== undefined) {
          filObj[e.id] = true
        }
      })
      setActivityFilter(filObj)
    }
  }

  // This handle the switch of the checkbox Acttive, which toggles also the activities
  const handleChangeWithActive = function (key: string) {
    handleChange(key, setStatusTypesValues, statusTypesValues)
    if (key === 'Active') {
      let toreturn = false
      Object.keys(activityFilter).forEach((k) => {
        if (activityFilter[k]) {
          toreturn = true
          return
        }
      })
      if (toreturn) {
        const filObj: object = {}
        activitiesList.forEach((e) => {
          if (e.id !== undefined) {
            filObj[e.id] = false
          }
        })
        setActivityFilter(filObj)
      } else {
        const filObj: object = {}
        activitiesList.forEach((e) => {
          if (e.id !== undefined) {
            filObj[e.id] = true
          }
        })
        setActivityFilter(filObj)
      }
    }
  }

  // This handle the switch of the activities, which sync with the active box
  const handleChangeActivities = function (key: string) {
    handleChange(key, setActivityFilter, activityFilter)
    let toreturn = false
    Object.keys(activityFilter).forEach((k) => {
      if (activityFilter[k]) {
        toreturn = true
        return
      }
    })
    if (!toreturn) {
      setStatusTypesValues({
        ...statusTypesValues,
        Active: false
      })
    } else {
      setStatusTypesValues({
        ...statusTypesValues,
        Active: true
      })
    }
  }

  // Function to check if all checkboxes are checked or unchecked. If onlyAct = true, checks only the activites boxes and ignores the others
  const checkAllChecked = function () {
    let toreturn = true
    Object.keys(emergencyCat).forEach((k) => {
      if (!emergencyCat[k]) {
        toreturn = false
        return
      }
    })

    Object.keys(statusTypesValues).forEach((k) => {
      if (!statusTypesValues[k]) {
        toreturn = false
        return
      }
    })
    Object.keys(activityFilter).forEach((k) => {
      if (!activityFilter[k]) {
        toreturn = false
        return
      }
    })
    return toreturn
  }

  // set the filter list passed as a prob accordingly with the checkboxes
  const setFilterList = props.setFilterList
  useEffect(() => {
    const newFilterList: (string | number)[] = []
    for (let k in emergencyCat) {
      if (emergencyCat[k] && k !== 'Person') {
        newFilterList.push(k)
      }
    }
    for (let k in statusTypesValues) {
      if (statusTypesValues[k]) {
        newFilterList.push(k)
      }
    }
    for (let k in activityFilter) {
      if (activityFilter[k]) {
        newFilterList.push(parseInt(k))
      }
    }
    setFilterList(newFilterList)
  }, [emergencyCat, statusTypesValues, activityFilter, setFilterList])

  // Draw the activities filters when the values get returned from the API call
  useEffect(() => {
    const filObj: object = {}
    activitiesList.forEach((e) => {
      if (e.id !== undefined) {
        filObj[e.id] = true
      }
    })
    setActivityFilter(filObj)
  }, [activitiesList])

  return (
    <Draggable
      axis="both"
      handle=".handle"
      defaultPosition={{ x: 50, y: 10 }}
      position={undefined}
      scale={1}
      onStart={(e) => e.preventDefault()}
      onDrag={(e) => e.preventDefault()}
      onStop={(e) => e.preventDefault()}
    >
      <FloatingFilterContainer
        style={{ display: props.toggleActiveFilterTab ? undefined : 'none' }}
      >
        <Card>
          <CardHeader
            className="handle"
            title={t('maps:filter_by_type')}
            style={{ backgroundColor: theme.palette.primary.dark }}
          />
          <CardContent style={{ backgroundColor: theme.palette.primary.main }}>
            <List style={{ paddingRight: 7 }}>
              <ListItem
                disableRipple
                key={'checkbox-list-label-all'}
                role={undefined}
                dense
                button
                onClick={(e) => handleChangeAll()}
              >
                <Typography id="checkbox-list-label-all" color="textSecondary">
                  {t('maps:all')}
                </Typography>
                <ListItemSecondaryAction>
                  <Checkbox
                    edge="start"
                    checked={checkAllChecked()}
                    onChange={() => handleChangeAll()}
                    color="default"
                    inputProps={{ 'aria-labelledby': 'all' }}
                  />
                </ListItemSecondaryAction>
              </ListItem>
            </List>
            <Divider />
            <div style={{ maxHeight: 300, overflow: 'auto' }}>
              <List>
                {Object.keys(emergencyCat).map((key) => {
                  const labelId = `checkbox-list-label-${key}`

                  return (
                    <ListItem
                      key={key}
                      role={undefined}
                      dense
                      button
                      onClick={() =>
                        key !== 'Person'
                          ? () => handleChange(key, setEmergencyCat, emergencyCat)
                          : null
                      }
                    >
                      <ListItemText id={labelId} primary={`${t('maps:' + key)}`} />
                      {key !== 'Person' ? (
                        <ListItemSecondaryAction>
                          <Checkbox
                            edge="start"
                            checked={emergencyCat[key]}
                            tabIndex={-1}
                            onChange={() => handleChange(key, setEmergencyCat, emergencyCat)}
                            color="default"
                            inputProps={{ 'aria-labelledby': labelId }}
                          />
                        </ListItemSecondaryAction>
                      ) : null}
                    </ListItem>
                  )
                })}

                <List component="div" disablePadding style={{ marginLeft: 20 }}>
                  <br />
                  {Object.keys(statusTypesValues).map((key) => {
                    const labelId = `checkbox-list-label-${key}`

                    return (
                      <ListItem
                        key={key}
                        role={undefined}
                        dense
                        button
                        onClick={() => handleChangeWithActive(key)}
                      >
                        <ListItemText id={labelId} primary={`${t('maps:' + key)}`} />
                        <ListItemSecondaryAction>
                          <Checkbox
                            edge="start"
                            checked={statusTypesValues[key]}
                            tabIndex={-1}
                            onChange={() => handleChangeWithActive(key)}
                            color="default"
                            inputProps={{ 'aria-labelledby': labelId }}
                          />
                        </ListItemSecondaryAction>
                      </ListItem>
                    )
                  })}
                  <br />
                  <Divider />
                  <br />
                  {Object.keys(activityFilter).map((key) => {
                    const labelId = `checkbox-list-label-${key}`
                    return (
                      <ListItem
                        key={key}
                        role={undefined}
                        dense
                        button
                        onClick={() => handleChange(key, setActivityFilter, activityFilter)}
                      >
                        <ListItemText
                          id={labelId}
                          primary={
                            activitiesList !== []
                              ? activitiesList?.find((x) => x.id.toString() === key).name
                              : ''
                          }
                        />
                        <ListItemSecondaryAction>
                          <Checkbox
                            edge="start"
                            checked={activityFilter[key]}
                            tabIndex={-1}
                            onChange={() => handleChangeActivities(key)}
                            color="default"
                            inputProps={{ 'aria-labelledby': labelId }}
                          />
                        </ListItemSecondaryAction>
                      </ListItem>
                    )
                  })}
                </List>
              </List>
            </div>
          </CardContent>
        </Card>
      </FloatingFilterContainer>
    </Draggable>
  )
}
