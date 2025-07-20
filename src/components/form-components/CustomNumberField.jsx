import { TextField } from '@mui/material'

const CustomNumberField = ({ field, form, ...props }) => {
  const showError = form.errors[field.name] && (form.touched[field.name] || form.submitCount > 0)

  return (
    <TextField
      {...field}
      {...props}
      type='number'
      fullWidth
      margin='normal'
      error={showError}
      helperText={showError ? form.errors[field.name] : ''}
      inputProps={{
        inputMode: 'decimal',
        pattern: '[0-9]*',
      }}
      onChange={(e) => {
        let value = e.target.value
        // Only allow numbers with at most one decimal point, and not consecutive decimal points
        if (/^(?!.*\.\.)(\d*\.?\d*)?$/.test(value)) {
          const numericValue = value === '' ? '' : Number(value)
          form.setFieldValue(field.name, numericValue)
        }
      }}
      onKeyDown={(e) => {
        const currentValue = e.target.value
        // Prevent non-numeric characters
        if (
          !/[0-9.]/.test(e.key) &&
          e.key !== 'Backspace' &&
          e.key !== 'Delete' &&
          e.key !== 'ArrowLeft' &&
          e.key !== 'ArrowRight' &&
          e.key !== 'Tab'
        ) {
          e.preventDefault()
        }
        // Prevent multiple decimal points anywhere
        if (e.key === '.' && currentValue.includes('.')) {
          e.preventDefault()
        }
      }}
    />
  )
}

export default CustomNumberField