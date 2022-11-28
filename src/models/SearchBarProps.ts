class SearchBarProps {
  isLoading: boolean
  changeTextHandler: any
  clickHandler: any

  constructor(isLoading: boolean) {
    this.isLoading = isLoading
  }
}

export default SearchBarProps;