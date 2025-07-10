import React from 'react'
import { Checkbox, FormControlLabel } from '@mui/material'

export const CheckboxField = ({ field, form, label, ...props }) => (
    <FormControlLabel
      control={
        <Checkbox
          {...field}
          {...props}
          checked={field.value || false}
          onChange={(event) => form.setFieldValue(field.name, event.target.checked)}
        />
      }
      label={label}
    />
  )