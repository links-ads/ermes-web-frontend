import {
  UsersApiAxiosParamCreator,
  DTResultOfProfileDto,
  ProfileDto,
  
} from 'ermes-backoffice-ts-sdk'
import { useSnackbars } from './use-snackbars.hook'
import { useState, useEffect } from 'react'
import { APIAxiosHookOpts, useAxiosWithParamCreator } from './api-hooks'
import useOrgList from './use-organization-list.hooks'

const MAX_RESULT_COUNT = 5000

type UsrApiPC = typeof UsersApiAxiosParamCreator
type KRUsrApiPC = keyof ReturnType<UsrApiPC>

export default function useUsersList () {
  const methodName: KRUsrApiPC = 'usersGetUsers' // profileGetOrganizationMembers

  const { orgData } = useOrgList() // Retrieve the organization data from the relative hook
  const opts: APIAxiosHookOpts<UsrApiPC> = {
    type: 'backoffice',
    args: [MAX_RESULT_COUNT], // TODO ADD PAGING PARAMS AND FILTERS
    paramCreator: UsersApiAxiosParamCreator,
    methodName
  }

  const [
    { data: result, loading: usersLoading, error: usersError },
    loadUsers
  ] = useAxiosWithParamCreator<UsrApiPC, DTResultOfProfileDto | undefined>(opts, false)
  const { displayErrorSnackbar } = useSnackbars()
  const users: ProfileDto[] = result?.data || []
  const [updating, setUserUpdating] = useState<boolean>(false)
  const [usersData, setData] = useState<ProfileDto[]>(users)
  const isUserLoading: boolean = updating || usersLoading

  useEffect(() => {
    if (usersError) {
      displayErrorSnackbar(usersError.response?.data.error)
    }
  }, [usersError, displayErrorSnackbar])

  useEffect(() => {
    if (!usersLoading) {
      let orgIdList = orgData.map(elem => elem.id)
      const filtered_users = users.filter(elem => {
        if(orgIdList.includes(elem.organization?.id) && !elem.user?.roles?.includes('citizen')){
          return elem
        }
        return null
      })
      setData(filtered_users)
    }
  }, [usersLoading, orgData, users])

  return { usersData, isUserLoading, loadUsers, setUserUpdating, updating, setData }
}
