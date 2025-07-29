import React, { Fragment } from 'react'
import { useFormikContext } from 'formik'

export default function PopupText({ qnNo, triggerValue, children, condition }) {
  const { values } = useFormikContext()
  const qnValue = values[qnNo]

  if (typeof condition === 'function') {
    if (condition(qnValue)) return <Fragment>{children}</Fragment>
    return null
  }

  if (Array.isArray(triggerValue)) {
    if (triggerValue.includes(qnValue)) return <Fragment>{children}</Fragment>
  } else {
    if (qnValue === triggerValue) return <Fragment>{children}</Fragment>
  }

  return null
}
