import {
  CommunicationDto,
  CommunicationsApiAxiosParamCreator,
  DTResultOfCommunicationDto,
  CommunicationsApiFactory
} from 'ermes-ts-sdk'
import { useSnackbars } from './use-snackbars.hook'
import { useState, useEffect } from 'react'
import { APIAxiosHookOpts, useAxiosWithParamCreator, useAPIConfiguration } from './api-hooks'

const MAX_RESULT_COUNT = 7

type CommApiPC = typeof CommunicationsApiAxiosParamCreator
type KRCommApiPC = keyof ReturnType<CommApiPC>
type SearchObject = { value: string; regex: boolean }

export default function useCommList() {
  // adds an element to the array if it does not already exist using a comparer
  // function

  const methodName: KRCommApiPC = 'communicationsGetCommunications' // profileGetOrganizationMembers

  const opts: APIAxiosHookOpts<CommApiPC> = {
    type: 'backoffice',
    args: [undefined, undefined, undefined, undefined, undefined, undefined, MAX_RESULT_COUNT], // TODO ADD PAGING PARAMS AND FILTERS
    paramCreator: CommunicationsApiAxiosParamCreator,
    methodName
  }

  const { apiConfig: backendAPIConfig } = useAPIConfiguration('backoffice')
  const commsAPIFactory = CommunicationsApiFactory(backendAPIConfig)

  const [
    { data: result, loading: commsLoading, error: commsError },
    loadUsers
  ] = useAxiosWithParamCreator<CommApiPC, DTResultOfCommunicationDto | undefined>(opts, false)

  const { displayErrorSnackbar } = useSnackbars()
  const comms: CommunicationDto[] = result?.data || []
  const [recordsTotal, setRecordsTotal] = useState<number>(result?.recordsTotal || 0)
  const [updating, setCommUpdating] = useState<boolean>(false)
  const [commsData, setData] = useState<CommunicationDto[]>(comms)
  const isCommsLoading: boolean = updating || commsLoading
  const [startDate, setStartDate] = useState(undefined)
  const [endDate, setEndDate] = useState(undefined)
  const [searchText, setSearchText] = useState<string | undefined>(undefined)

  useEffect(() => {
    if (commsError) {
      displayErrorSnackbar(commsError.response?.data.error)
    }
  }, [commsError, displayErrorSnackbar])

  useEffect(() => {
    if (!commsLoading) {
      setData(comms)
    }
  }, [commsLoading, comms])

  
  const getNextValues = async function () {
    await commsAPIFactory
      .communicationsGetCommunications(
        startDate,
        endDate,
        undefined,
        undefined,
        undefined,
        undefined,
        MAX_RESULT_COUNT,
        commsData.length,
        undefined,
        searchText,
        false
      )
      .then((res) => {
        console.log(res)
        let appComms: CommunicationDto[] = res?.data.data || []
        let tmpArr = [...commsData, ...appComms]
        setRecordsTotal(result?.recordsTotal || 0)
        // appComms.forEach(function (item) {
        //   if (!tmpArr.find((o) => o.id === item.id)) {
        //     tmpArr.push(item)
        //   }
        // })
        setData(tmpArr)
      })
      .catch((err) => {
        displayErrorSnackbar(err)
      })
  }
  const filterByText = (text: string | undefined) => {
    if (text === '' || text === undefined) {
      console.log('EMPTYNESS')
      setSearchText(undefined)
    } else {
      setSearchText(text)
    }

    setCommUpdating(true)
    setData([])
    commsAPIFactory
      .communicationsGetCommunications(
        startDate,
        endDate,
        undefined,
        undefined,
        undefined,
        undefined,
        MAX_RESULT_COUNT,
        commsData.length,
        undefined,
        searchText,
        false
      )
      .then((res) => {
        console.log(res)
        let appComms: CommunicationDto[] = res?.data.data || []
        if(searchText === undefined){
          setRecordsTotal(result?.recordsTotal || 0)
        } else {
          setRecordsTotal(result?.recordsFiltered || 0)
        }
        setData([...appComms])
        setCommUpdating(false)
      })
      .catch((err) => {
        displayErrorSnackbar(err)
      })
  }
  useEffect(() => {
    filterByText(searchText)
  }, [startDate, endDate, searchText])
  return { commsData, isCommsLoading, getNextValues, recordsTotal, filterByText, setStartDate, setEndDate }
}
