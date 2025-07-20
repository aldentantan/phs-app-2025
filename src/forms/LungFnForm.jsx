import React, { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Formik, Form, Field, FastField } from 'formik'
import * as Yup from 'yup'

import { Divider, Paper, Grid, CircularProgress, Button, Typography, Box } from '@mui/material'

import { submitForm } from '../api/api.jsx'
import { FormContext } from '../api/utils.js'
import { getSavedData } from '../services/mongoDB'
import './fieldPadding.css'

import CustomTextField from '../components/form-components/CustomTextField'
import CustomRadioGroup from '../components/form-components/CustomRadioGroup'

const initialValues = {
  LUNG1: '',
  LUNGShortAns1: '',
  LUNG1a: '',
  LUNG2: '',
  LUNGShortAns2: '',
  LUNG3: '',
  LUNG4: '',
  LUNG5: '',
  LUNG6: '',
  LUNG7: '',
}

const validationSchema = Yup.object({
  LUNG1: Yup.string()
    .oneOf(['Yes', 'No'], 'Please select a valid option')
    .required('This field is required'),
  LUNGShortAns1: Yup.string().when('LUNG1', {
    is: 'Yes',
    then: (schema) => schema.required('Please specify'),
    otherwise: (schema) => schema,
  }),
  LUNG1a: Yup.string()
    .oneOf(['Yes', 'No'], 'Please select a valid option')
    .required('This field is required'),
  LUNG2: Yup.string()
    .oneOf(['Yes', 'No'], 'Please select a valid option')
    .required('This field is required'),
  LUNGShortAns2: Yup.string().when('LUNG2', {
    is: 'No',
    then: (schema) => schema.required('Please specify why'),
    otherwise: (schema) => schema,
  }),
  LUNG3: Yup.number().typeError('Must be a number').required('This field is required'),
  LUNG4: Yup.number().typeError('Must be a number').required('This field is required'),
  LUNG5: Yup.number().typeError('Must be a number').required('This field is required'),
  LUNG6: Yup.number().typeError('Must be a number').required('This field is required'),
  LUNG7: Yup.number().typeError('Must be a number').required('This field is required'),
  LUNG14: Yup.string()
    .oneOf(['Yes', 'No'], 'Please select a valid option')
    .required('This field is required'),
})

const formName = 'lungFnForm'

const LungFnForm = () => {
  const { patientId } = useContext(FormContext)
  const [loading, isLoading] = useState(true)
  const [loadingSidePanel, isLoadingSidePanel] = useState(true)
  const [savedData, setSavedData] = useState(initialValues)
  const [socialData, setSocialData] = useState({})
  const [lungType, setLungType] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchData = async () => {
      const [lungData, social] = await Promise.all([
        getSavedData(patientId, formName),
        getSavedData(patientId, 'hxSocialForm'),
      ])

      setSavedData(lungData)
      setSocialData(social)
      isLoading(false)
      isLoadingSidePanel(false)
    }
    fetchData()
  }, [patientId])

  const calculateLungType = (lung5, lung7) => {
    if (lung5 >= 80 && lung7 < 70) {
      return 'Obstructive Defect'
    } else if (lung5 < 80 && lung7 < 70) {
      return 'Mixed Pattern'
    } else if (lung5 < 80 && lung7 >= 70) {
      return 'Restrictive Defect'
    } else if (lung5 >= 80 && lung7 >= 70) {
      return 'Normal'
    }
    return null
  }

  const handleSubmit = async (values, { setSubmitting }) => {
    isLoading(true)
    setSubmitting(true)

    const response = await submitForm(values, patientId, formName)

    if (response.result) {
      setTimeout(() => {
        alert('Successfully submitted form')
        navigate('/app/dashboard', { replace: true })
      }, 80)
    } else {
      setTimeout(() => {
        alert(`Unsuccessful. ${response.error}`)
      }, 80)
    }

    isLoading(false)
    setSubmitting(false)
  }

  const formOptions = {
    LUNG1: [
      { label: 'Yes', value: 'Yes' },
      { label: 'No', value: 'No' },
    ],
    LUNG1a: [
      { label: 'Yes', value: 'Yes' },
      { label: 'No', value: 'No' },
    ],
    LUNG2: [
      { label: 'Yes', value: 'Yes' },
      { label: 'No', value: 'No' },
    ],
  }

  const renderForm = () => (
    <Formik
      initialValues={savedData}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
      enableReinitialize={true}
    >
      {({ isSubmitting, submitCount, values, errors, touched }) => {
        // Calculate lung type whenever values change
        const currentLungType = calculateLungType(values.LUNG5, values.LUNG7)

        return (
          <Form className='fieldPadding'>
            <div className='form--div'>
              <Typography variant='h4' component='h1' gutterBottom>
                Lung Function
              </Typography>

              <Typography variant='h6' component='h3' gutterBottom>
                Do you have any flu, fever now?
              </Typography>
              <FastField
                name='LUNG1'
                label='LUNG1'
                component={CustomRadioGroup}
                options={formOptions.LUNG1}
                row
              />

              {values.LUNG1 === 'Yes' && (
                <FastField
                  name='LUNGShortAns1'
                  label='Please specify details'
                  component={CustomTextField}
                  multiline
                  rows={2}
                />
              )}

              <Typography variant='h6' component='h3' gutterBottom sx={{ mt: 2 }}>
                Has the patient undergone education for smoking cessation?
              </Typography>
              <FastField
                name='LUNG1a'
                label='LUNG1a'
                component={CustomRadioGroup}
                options={formOptions.LUNG1a}
                row
              />

              <Typography variant='h6' component='h3' gutterBottom>
                Lung function test completed?
              </Typography>
              <FastField
                name='LUNG2'
                label='LUNG2'
                component={CustomRadioGroup}
                options={formOptions.LUNG2}
                row
              />

              {values.LUNG2 === 'No' && (
                <>
                  <Typography variant='subtitle1' component='h4' gutterBottom>
                    If no, why?
                  </Typography>
                  <FastField
                    name='LUNGShortAns2'
                    label='Please specify why'
                    component={CustomTextField}
                    multiline
                    rows={2}
                  />
                </>
              )}

              <Typography variant='h6' component='h3' gutterBottom>
                Pre-bronchodilator
              </Typography>

              <Typography variant='h6' component='h3' gutterBottom>
                FVC (L)
              </Typography>
              <FastField name='LUNG3' label='LUNG3' component={CustomTextField} type='number' />

              <Typography variant='h6' component='h3' gutterBottom>
                FEV1 (L)
              </Typography>
              <FastField name='LUNG4' label='LUNG4' component={CustomTextField} type='number' />

              <Typography variant='h6' component='h3' gutterBottom>
                FVC (%pred)
              </Typography>
              <FastField name='LUNG5' label='LUNG5' component={CustomTextField} type='number' />

              <Typography variant='h6' component='h3' gutterBottom>
                FEV1 (%pred)
              </Typography>
              <FastField name='LUNG6' label='LUNG6' component={CustomTextField} type='number' />

              <Typography variant='h6' component='h3' gutterBottom>
                FEV1:FVC (%)
              </Typography>
              <FastField name='LUNG7' label='LUNG7' component={CustomTextField} type='number' />

              <Typography variant='h6' component='h3' gutterBottom sx={{ mt: 2 }}>
                What defect does the patient have?
              </Typography>
              <Typography className='blue'>{currentLungType || 'nil'}</Typography>
            </div>

            <Box mt={2} mb={2}>
              {submitCount > 0 && Object.keys(errors || {}).length > 0 && (
                <Typography color='error' variant='body2' sx={{ mb: 1 }}>
                  Please fill in all required fields correctly.
                </Typography>
              )}
              {loading || isSubmitting ? (
                <CircularProgress />
              ) : (
                <Button
                  type='submit'
                  variant='contained'
                  color='primary'
                  size='large'
                  disabled={isSubmitting}
                >
                  Submit
                </Button>
              )}
            </Box>

            <Divider />
          </Form>
        )
      }}
    </Formik>
  )

  const renderSidePanel = () => (
    <div className='summary--question-div'>
      <Typography variant='h6' component='h2' gutterBottom>
        Social
      </Typography>

      <Typography variant='body2' color='text.secondary'>
        Does patient currently smoke:
      </Typography>
      <Typography className='blue'>{socialData?.SOCIAL10 || 'nil'}</Typography>

      <Typography variant='body2' color='text.secondary'>
        How many pack-years:
      </Typography>
      <Typography className='blue'>{socialData?.SOCIALShortAns10 || 'nil'}</Typography>

      <Typography variant='body2' color='text.secondary'>
        Has patient smoked before:
      </Typography>
      <Typography className='blue'>{socialData?.SOCIAL11 || 'nil'}</Typography>

      <Typography variant='body2' color='text.secondary'>
        For how long and when did they stop:
      </Typography>
      <Typography className='blue'>{socialData?.SOCIALShortAns11 || 'nil'}</Typography>
    </div>
  )

  return (
    <Paper elevation={2} p={0} m={0}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={9}>
          {renderForm()}
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper elevation={2} sx={{ p: 2 }}>
            {loadingSidePanel ? <CircularProgress /> : renderSidePanel()}
          </Paper>
        </Grid>
      </Grid>
    </Paper>
  )
}

export default LungFnForm
