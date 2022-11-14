import useLanguage from "../hooks/use-language.hook";

const dateOptions = {
  dateStyle: 'short',
  timeStyle: 'short',
  hour12: false
} as Intl.DateTimeFormatOptions

export function FormatDate(date: string): string {
  const { dateLocale } = useLanguage()
  if(!date || date === '')
    return '';

  const formatter = new Intl.DateTimeFormat(dateLocale, dateOptions)
  return formatter.format(new Date(date))
}
