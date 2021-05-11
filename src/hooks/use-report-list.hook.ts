import { useCallback, useReducer, useMemo, useState } from 'react'
import { ReportsApiFactory, DTResultOfReportDto } from 'ermes-ts-sdk'
import { useAPIConfiguration } from './api-hooks'

const MAX_RESULT_COUNT = 7
const initialState = { error: false, isLoading: true, data: [], tot: 0 }

const reducer = (currentState, action) => {
  switch (action.type) {
    case 'FETCH':
      return {
        ...currentState,
        isLoading: true,
        data: [],
        error: false,
        tot: action.tot
      }
    case 'RESULT':
      return {
        ...currentState,
        isLoading: false,
        data: [...currentState.data, ...action.value],
        error: false,
        tot: action.tot
      }
    case 'ERROR':
      return {
        ...currentState,
        isLoading: false,
        data: action.value,
        hasMore: false,
        error: true
      }
  }
  return initialState
}

export default function useReportList() {
  const [dataState, dispatch] = useReducer(reducer, initialState)
  const { apiConfig: backendAPIConfig } = useAPIConfiguration('backoffice')
  const repApiFactory = useMemo(() => ReportsApiFactory(backendAPIConfig), [backendAPIConfig])

  const fetchReports = useCallback(
    (tot, transformData = (data) => {}, errorData = {}, sideEffect = (data) => {}) => {
      repApiFactory
        .reportsGetReports(
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          MAX_RESULT_COUNT,
          tot
        )
        .then((result) => {
          let newData: DTResultOfReportDto[] = transformData(result.data.data) || []

          let totToDown: number = result?.data?.recordsTotal ? result?.data?.recordsTotal : -1

          dispatch({
            type: 'RESULT',
            value: newData,
            tot: totToDown
          })
        })
        .catch((err) => {
          // displayErrorSnackbar(err)
          dispatch({ type: 'ERROR', value: errorData })
        })
    },
    [repApiFactory]
  )

  return [dataState, fetchReports]
}

// import { ReportsApiAxiosParamCreator, ReportDto, DTResultOfReportDto } from 'faster-ts-sdk'
// import { useSnackbars } from './use-snackbars.hook'
// import { useState, useEffect } from 'react'
// import { APIAxiosHookOpts, useAxiosWithParamCreator, useAPIConfiguration } from './api-hooks'

// const MAX_RESULT_COUNT = 7

// type RepApiPC = typeof ReportsApiAxiosParamCreator
// type KRRepApiPC = keyof ReturnType<RepApiPC>
// type SearchObject = { value: string; regex: boolean }

// export default function useCommList() {
//   // adds an element to the array if it does not already exist using a comparer
//   // function

//   const methodName: KRRepApiPC = 'reportsGetReports' // profileGetOrganizationMembers

//   const opts: APIAxiosHookOpts<RepApiPC> = {
//     type: 'backoffice',
//     args: [
//       undefined,
//       undefined,
//       undefined,
//       undefined,
//       undefined,
//       undefined,
//       undefined,
//       undefined,
//       undefined,
//       undefined,
//       MAX_RESULT_COUNT
//     ], // TODO ADD PAGING PARAMS AND FILTERS
//     paramCreator: ReportsApiAxiosParamCreator,
//     methodName
//   }

//   const [
//     { data: result, loading: repsLoading, error: repsError },
//     loadUsers
//   ] = useAxiosWithParamCreator<RepApiPC, DTResultOfReportDto | undefined>(opts, false)

//   const { displayErrorSnackbar } = useSnackbars()
//   const reps: ReportDto[] = result?.data || []
//   const [recordsTotal, setRecordsTotal] = useState<number>(result?.recordsTotal || 0)
//   const [updating, setCommUpdating] = useState<boolean>(false)
//   const [repsData, setData] = useState<ReportDto[]>(reps)
//   const isRepsLoading: boolean = updating || repsLoading

// useEffect(() => {
//   if (repsError) {
//     displayErrorSnackbar(repsError.response?.data.error)
//   }
// }, [repsError, displayErrorSnackbar])

//   useEffect(() => {
//     if (!isRepsLoading) {
//       setData(reps)
//     }
//   }, [isRepsLoading, reps])

//   console.log('RECORDS TOTAL', recordsTotal)

//   const getNextValues = async function () {
//   }

//   return {
//     repsData,
//     isRepsLoading,
//     getNextValues,
//   }
// }
