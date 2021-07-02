import {
  OrganizationsApiAxiosParamCreator,
  OrganizationDto,
  DTResultOfOrganizationDto
} from 'ermes-backoffice-ts-sdk'
import { useAxiosWithParamCreator, APIAxiosHookOpts } from './api-hooks'

import { useSnackbars } from './use-snackbars.hook'
import { useState, useEffect } from 'react'

const MAX_RESULT_COUNT = 1000

type OrgApiPC = typeof OrganizationsApiAxiosParamCreator
type KROrgApiPC = keyof ReturnType<OrgApiPC>

export default function useOrgList () {
  const methodName: KROrgApiPC = 'organizationsGetOrganizations'
  const opts: APIAxiosHookOpts<OrgApiPC> = {
    type: 'backoffice',
    args: [MAX_RESULT_COUNT], // TODO ADD PAGING PARAMS AND FILTERS
    paramCreator: OrganizationsApiAxiosParamCreator,
    methodName
  }

  const [
    { data: result, loading: orgsLoading, error: orgsError },
    loadOrganizations
  ] = useAxiosWithParamCreator<OrgApiPC, DTResultOfOrganizationDto | undefined>(opts, false)
  const { displayErrorSnackbar } = useSnackbars()
  const organizations: OrganizationDto[] = result?.data || []
  const [updating, setOrgUpdating] = useState<boolean>(false)
  const [orgData, setData] = useState<OrganizationDto[]>(organizations)
  const [orgLookup, setOrgLookup] = useState<Object>({})

  const isOrgLoading: boolean = updating || orgsLoading

  useEffect(() => {
    if (!orgsLoading) {
      const lookupObject: any = {}

      Object.entries(organizations).forEach(([key, value]: any) => {
        lookupObject[value.id] = value.name
      })
      setOrgLookup(lookupObject)
      setData(organizations)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orgsLoading])
  // eslint-enable-next-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (orgsError) {
      displayErrorSnackbar(orgsError.response?.data.error)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orgsError])
  // eslint-enable-next-line react-hooks/exhaustive-deps

  return { orgData, isOrgLoading, loadOrganizations, setOrgUpdating, updating, setData, orgLookup }
}
