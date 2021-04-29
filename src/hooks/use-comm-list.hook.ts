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

export default function useCommList() {
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
  const [updating, setUserUpdating] = useState<boolean>(false)
  const [commsData, setData] = useState<CommunicationDto[]>(comms)
  const isCommsLoading: boolean = updating || commsLoading
  const [startDate, setStartDate] = useState(undefined)
  const [endDate, setEndDate] = useState(undefined)
  const [searchText, setSearchText] = useState<string>()
  // const [searchText, setSearchText] = useState(undefined)

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
    setUserUpdating(true)
    console.log( Math.floor(commsData.length/MAX_RESULT_COUNT))
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
        searchText
      )
      .then((res) => {
        console.log(res)
        let appComms: CommunicationDto[] = res?.data.data || []
        setData([...commsData, ...appComms])
      })
      .catch((err) => {
        displayErrorSnackbar(err)
      })
  }
  const filterByText = (text: string) =>{
    if(text === ''){
      setSearchText(undefined)
      console.log('yup')
    } else {
      setSearchText(text)
    }

    setUserUpdating(true)
    console.log( Math.floor(commsData.length/MAX_RESULT_COUNT))
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
        searchText
      )
      .then((res) => {
        console.log(res)
        let appComms: CommunicationDto[] = res?.data.data || []
        setRecordsTotal(result?.recordsFiltered || 0)
        setData([...appComms])
      })
      .catch((err) => {
        displayErrorSnackbar(err)
      })
  }

  return { commsData, isCommsLoading, getNextValues, recordsTotal, filterByText }
}
