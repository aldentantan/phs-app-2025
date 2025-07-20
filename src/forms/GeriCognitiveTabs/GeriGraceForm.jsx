import React, { useContext, useEffect, useState } from 'react'
import { 
  Divider, 
  Paper, 
  CircularProgress, 
  Box, 
  Button, 
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormHelperText
} from '@mui/material'
import { Formik, Form, Field } from 'formik'
import * as Yup from 'yup'
import { submitForm } from '../../api/api.jsx'
import { FormContext } from '../../api/utils.js'
import { getSavedData } from '../../services/mongoDB'
import '../fieldPadding.css'
import '../forms.css'

const validationSchema = Yup.object({
  GRACE1: Yup.string().notRequired(),
  GRACE2: Yup.string().oneOf(['Yes', 'No']).required('Required'),
  GRACE3: Yup.string().notRequired(),
  GRACE4: Yup.string().oneOf(['Yes', 'No']).required('Required'),
  GRACE5: Yup.string().notRequired(),
})

// Custom Radio Field Component
const RadioField = ({ field, form, options, label, ...props }) => {
  const { name } = field
  const hasError = form.touched[name] && form.errors[name]
  
  return (
    <FormControl component="fieldset" error={hasError} margin="normal">
      <FormLabel component="legend">{label}</FormLabel>
      <RadioGroup {...field} {...props}>
        {options.map((option) => (
          <FormControlLabel
            key={option.value}
            value={option.value}
            control={<Radio />}
            label={option.label}
          />
        ))}
      </RadioGroup>
      {hasError && (
        <FormHelperText>{form.errors[name]}</FormHelperText>
      )}
    </FormControl>
  )
}

const formName = 'geriGraceForm'

const GeriGraceForm = (props) => {
  const { patientId } = useContext(FormContext)
  const [loading, setLoading] = useState(false)
  const { changeTab, nextTab } = props
  const [initialValues, setInitialValues] = useState({
    GRACE1: '',
    GRACE2: '',
    GRACE3: '',
    GRACE4: '',
    GRACE5: '',
  })

  useEffect(() => {
    const fetchData = async () => {
      const savedData = await getSavedData(patientId, formName)
      setInitialValues({
        GRACE1: savedData.GRACE1 || '',
        GRACE2: savedData.GRACE2 || '',
        GRACE3: savedData.GRACE3 || '',
        GRACE4: savedData.GRACE4 || '',
        GRACE5: savedData.GRACE5 || '',
      })
    }
    fetchData()
  }, [patientId])

  const radioOptions = [
    { label: 'Yes', value: 'Yes' },
    { label: 'No', value: 'No' },
  ]

  return (
    <Paper elevation={2} p={0} m={0}>
      <Formik
        enableReinitialize
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={async (values, { setSubmitting }) => {
          setLoading(true)
          const response = await submitForm(values, patientId, formName)
          setLoading(false)
          setSubmitting(false)
          if (response.result) {
            const event = null
            setTimeout(() => {
              alert('Successfully submitted form')
              changeTab(event, nextTab)
            }, 80)
          } else {
            setTimeout(() => {
              alert(`Unsuccessful. ${response.error}`)
            }, 80)
          }
        }}
      >
        {({ errors, touched, isSubmitting }) => (
          <Form className='fieldPadding'>
            <div className='form--div'>
              <h1>G-RACE</h1>
              
              <h3>MMSE score (_/_):</h3>
              <Field
                as={TextField}
                name="GRACE1"
                label="MMSE Score"
                fullWidth
                variant="outlined"
                margin="normal"
                multiline
                rows={2}
                error={touched.GRACE1 && !!errors.GRACE1}
                helperText={touched.GRACE1 && errors.GRACE1}
              />
              
              <h3>Need referral to G-RACE associated polyclinics/partners?</h3>
              <Field 
                name="GRACE2" 
                component={RadioField} 
                label="Referral needed?" 
                options={radioOptions} 
              />
              
              <h3>Polyclinic:</h3>
              <Field
                as={TextField}
                name="GRACE3"
                label="Polyclinic"
                fullWidth
                variant="outlined"
                margin="normal"
                multiline
                rows={2}
                error={touched.GRACE3 && !!errors.GRACE3}
                helperText={touched.GRACE3 && errors.GRACE3}
              />
              
              <h3>Referral to Doctor&apos;s Consult?</h3>
              <p>For geri patients who may be depressed</p>
              <Field 
                name="GRACE4" 
                component={RadioField} 
                label="Doctor referral?" 
                options={radioOptions} 
              />
              
              <h3>Reason for referral:</h3>
              <Field
                as={TextField}
                name="GRACE5"
                label="Reason for referral"
                fullWidth
                variant="outlined"
                margin="normal"
                multiline
                rows={3}
                error={touched.GRACE5 && !!errors.GRACE5}
                helperText={touched.GRACE5 && errors.GRACE5}
              />
            </div>

            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
              {loading || isSubmitting ? (
                <CircularProgress />
              ) : (
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  size="large"
                  disabled={isSubmitting}
                >
                  Submit
                </Button>
              )}
            </Box>

            <br />
            <Divider />
          </Form>
        )}
      </Formik>
    </Paper>
  )
}

export default GeriGraceForm