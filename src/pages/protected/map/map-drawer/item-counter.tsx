import React from 'react'
import { useTranslation } from 'react-i18next'

const ItemCounter = (props) => {
  const { t } = useTranslation(['common'])
  return (
    <h2>
      {t('common:number_of_items')}: {props.itemCount}
    </h2>
  )
}

export default ItemCounter