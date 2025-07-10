import React from 'react'
import { TextField } from '@mui/material'

export const CustomTextField = ({ field, form, ...props }) => (
  <TextField
    {...field}
    {...props}
    fullWidth
    margin='normal'
    error={form.touched[field.name] && Boolean(form.errors[field.name])}
    helperText={form.touched[field.name] && form.errors[field.name]}
  />
)