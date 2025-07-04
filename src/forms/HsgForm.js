import React from 'react'
import { useContext, useEffect, useState } from 'react'
import { Formik, Form, Field } from 'formik'
import * as Yup from 'yup'

import Divider from '@mui/material/Divider'
import Paper from '@mui/material/Paper'
import CircularProgress from '@mui/material/CircularProgress'
import Button from '@mui/material/Button'
import FormControl from '@mui/material/FormControl'
import FormLabel from '@mui/material/FormLabel'
import RadioGroup from '@mui/material/RadioGroup'
import FormControlLabel from '@mui/material/FormControlLabel'
import Radio from '@mui/material/Radio'
import TextField from '@mui/material/TextField'
import FormHelperText from '@mui/material/FormHelperText'

import { submitForm } from '../api/api.js'
import { FormContext } from '../api/utils.js'
import { getSavedData } from '../services/mongoDB'
import './fieldPadding.css'
import { useNavigate } from 'react-router'

// Yup validation schema - replacing simpl-schema
const validationSchema = Yup.object({
  HSG1: Yup.string()
    .oneOf([
      'Yes, I signed up for HSG today',
      'No, I did not sign up for HSG',
      'No, I am already on HSG',
    ])
    .required('This field is required'),
  HSG2: Yup.string().when('HSG1', {
    is: 'No, I did not sign up for HSG',
    then: (schema) => schema.optional(),
    otherwise: (schema) => schema.optional(),
  }),
})

const formName = 'hsgForm'

const HsgForm = () => {
  const [loading, isLoading] = useState(false)
  const { patientId } = useContext(FormContext)
  const [saveData, setSaveData] = useState({})
  const navigate = useNavigate()

  useEffect(() => {
    const fetchData = async () => {
      const savedData = await getSavedData(patientId, formName)
      setSaveData(savedData)
    }
    fetchData()
  }, [patientId])

  // Form options - keeping original structure
  const formOptions = {
    HSG1: [
      {
        label: 'Yes, I signed up for HSG today',
        value: 'Yes, I signed up for HSG today',
      },
      { label: 'No, I did not sign up for HSG', value: 'No, I did not sign up for HSG' },
      { label: 'No, I am already on HSG', value: 'No, I am already on HSG' },
    ],
  }

  // Initial values for Formik
  const initialValues = {
    HSG1: saveData.HSG1 || '',
    HSG2: saveData.HSG2 || '',
  }

  const handleSubmit = async (values) => {
    isLoading(true)
    const response = await submitForm(values, patientId, formName)
    if (response.result) {
      isLoading(false)
      setTimeout(() => {
        alert('Successfully submitted form')
        navigate('/app/dashboard', { replace: true })
      }, 80)
    } else {
      isLoading(false)
      setTimeout(() => {
        alert(`Unsuccessful. ${response.error}`)
      }, 80)
    }
  }

  // Custom Radio Field Component
  const RadioField = ({ name, label, options, formik }) => (
    <FormControl component="fieldset" error={formik.touched[name] && !!formik.errors[name]}>
      <FormLabel component="legend">{label}</FormLabel>
      <Field name={name}>
        {({ field }) => (
          <RadioGroup
            {...field}
            value={field.value || ''}
            onChange={(e) => formik.setFieldValue(name, e.target.value)}
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
        )}
      </Field>
      {formik.touched[name] && formik.errors[name] && (
        <FormHelperText>{formik.errors[name]}</FormHelperText>
      )}
    </FormControl>
  )

  // Custom Long Text Field Component
  const LongTextField = ({ name, label, formik }) => (
    <Field name={name}>
      {({ field }) => (
        <TextField
          {...field}
          label={label}
          multiline
          rows={4}
          variant="outlined"
          fullWidth
          error={formik.touched[name] && !!formik.errors[name]}
          helperText={formik.touched[name] && formik.errors[name]}
          value={field.value || ''}
        />
      )}
    </Field>
  )

  // Conditional rendering component - replacing PopupText
  const ConditionalContent = ({ condition, children }) => {
    return condition ? children : null
  }

  return (
    <Paper elevation={2} p={0} m={0}>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize={true}
      >
        {(formik) => (
          <Form className='fieldPadding'>
            <div className='form--div'>
              <h1>HealthierSG</h1>
              <h3>Previously not signed up for HealthierSG and sign-up for HealthierSG today.</h3>
              
              <RadioField 
                name='HSG1' 
                label='HSG1' 
                options={formOptions.HSG1}
                formik={formik}
              />
              
              <ConditionalContent condition={formik.values.HSG1 === 'No, I did not sign up for HSG'}>
                <div style={{ marginTop: '16px' }}>
                  <h4 style={{ marginBottom: '16px' }}>If no, why?</h4>
                  <LongTextField name='HSG2' label='HSG2' formik={formik} />
                </div>
              </ConditionalContent>
            </div>
            
            {/* Error display - replacing ErrorsField */}
            {Object.keys(formik.errors).length > 0 && formik.submitCount > 0 && (
              <div style={{ color: 'red', margin: '10px 0' }}>
                {Object.values(formik.errors).map((error, index) => (
                  <div key={index}>{error}</div>
                ))}
              </div>
            )}
            
            {/* Submit button - replacing SubmitField */}
            <div>
              {loading ? (
                <CircularProgress />
              ) : (
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={loading}
                >
                  Submit
                </Button>
              )}
            </div>
            
            <br />
            <Divider />
          </Form>
        )}
      </Formik>
    </Paper>
  )
}

HsgForm.contextType = FormContext

export default function Hsgform(props) {
  return <HsgForm {...props} />
}