import React from 'react'
import { FormControl, FormControlLabel, FormLabel, Radio, RadioGroup, Typography } from '@mui/material'

export const RadioFieldGroup = ({ field, form, options, label, ...props }) => (
    <FormControl
      component='fieldset'
      margin='normal'
      error={form.touched[field.name] && Boolean(form.errors[field.name])}
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
      {form.touched[field.name] && form.errors[field.name] && (
        <Typography variant='caption' color='error'>
          {form.errors[field.name]}
        </Typography>
      )}
    </FormControl>
  )