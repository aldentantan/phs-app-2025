import React from 'react'
import { Checkbox, FormControlLabel, FormHelperText, Box } from '@mui/material'

const CustomCheckbox = ({ field, form, label, ...props }) => {
  const showError = form.errors[field.name] && (form.touched[field.name] || form.submitCount > 0)
  return (
    <Box sx={{ mt: 1, mb: 1 }}>
      <FormControlLabel
        control={
          <Checkbox
            {...field}
            {...props}
            checked={Boolean(field.value)}
            color={form.touched[field.name] && form.errors[field.name] ? 'error' : 'primary'}
          />
        }
        label={label}
      />
      {showError && (
        <FormHelperText error>{form.errors[field.name]}</FormHelperText>
      )}
    </Box>
  )
}

export default CustomCheckbox
