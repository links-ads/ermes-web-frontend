export type AxiosHooksConfigurator = (
  onSessionExpired: (message: string | Error | object) => void,
  onAxiosError: (error: any) => void
) => void
