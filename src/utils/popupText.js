import React, { Fragment } from 'react'
import { useFormikContext } from 'formik'

export default function PopupText(props) {
  const { values } = useFormikContext()
  const qnValue = values[props.qnNo]

  if (Array.isArray(props.triggerValue)) {
    if (props.triggerValue.includes(qnValue)) {
      return <Fragment>{props.children}</Fragment>
    }
  } else {
    if (qnValue === props.triggerValue) {
      return <Fragment>{props.children}</Fragment>
    }
  }

  return null
}