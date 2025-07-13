import React from 'react'
import { FormControl, FormControlLabel, FormLabel, Radio, RadioGroup, Typography } from '@mui/material'

const CustomRadioGroup = ({ field, form, options, label, ...props }) => {
  const showError = form.errors[field.name] && (form.touched[field.name] || form.submitCount > 0)

  return (
    <FormControl
      component='fieldset'
      margin='normal'
      error={showError}
    >
      <FormLabel component='legend'>{label}</FormLabel>
      <RadioGroup
        {...field}
        {...props}
        value={field.value || ''}
        onChange={(event) => form.setFieldValue(field.name, event.target.value)}
      >
        {options.map((option) => (
          <FormControlLabel
            key={option.value}
            value={option.value}
            control={<Radio />}
            label={option.label}
          />
        ))}
      </RadioGroup>
      {showError && (
        <Typography variant='caption' color='error'>
          {form.errors[field.name]}
        </Typography>
      )}
    </FormControl>
  )
}

export default CustomRadioGroup