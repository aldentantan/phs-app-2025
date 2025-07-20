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
import CustomNumberField from '../components/form-components/CustomNumberField'

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
  GYNAE1: Yup.string().oneOf(['Yes', 'No'], 'Invalid selection'),
  GYNAE2: Yup.string().oneOf(['Yes', 'No'], 'Invalid selection'),
  GYNAEShortAns2: Yup.string().when('GYNAE2', {
    is: 'Yes',
    then: (schema) => schema.required('Please specify'),
    otherwise: (schema) => schema,
  }),
  GYNAE3: Yup.string().oneOf(['Yes', 'No'], 'Invalid selection'),
  GYNAEShortAns3: Yup.string().when('GYNAE3', {
    is: 'Yes',
    then: (schema) => schema.required('Please specify'),
    otherwise: (schema) => schema,
  }),
  GYNAE4: Yup.string().oneOf(['Yes', 'No'], 'Invalid selection'),
  GYNAEShortAns4: Yup.string().when('GYNAE4', {
    is: 'Yes',
    then: (schema) => schema.required('Please specify'),
    otherwise: (schema) => schema,
  }),
  GYNAE5: Yup.string().oneOf(['Yes', 'No'], 'Invalid selection'),
  GYNAEShortAns5: Yup.string().when('GYNAE5', {
    is: 'Yes',
    then: (schema) => schema.required('Please specify'),
    otherwise: (schema) => schema,
  }),
  GYNAE6: Yup.string().oneOf(['Yes', 'No'], 'Invalid selection'),
  GYNAEShortAns6: Yup.string().when('GYNAE6', {
    is: 'Yes',
    then: (schema) => schema.required('Please specify'),
    otherwise: (schema) => schema,
  }),
  GYNAE7: Yup.string().oneOf(['Yes', 'No'], 'Invalid selection'),
  GYNAEShortAns7: Yup.string().when('GYNAE7', {
    is: 'Yes',
    then: (schema) => schema.required('Please specify'),
    otherwise: (schema) => schema,
  }),
  GYNAE8: Yup.string().oneOf(['Yes', 'No'], 'Invalid selection'),
  GYNAEShortAns8: Yup.string().when('GYNAE8', {
    is: 'Yes',
    then: (schema) => schema.required('Please specify'),
    otherwise: (schema) => schema,
  }),
  GYNAE9: Yup.string().oneOf(['Yes', 'No'], 'Invalid selection'),
  GYNAE10: Yup.string().oneOf(['Yes', 'No'], 'Invalid selection'),
  GYNAEShortAns10: Yup.string().when('GYNAE10', {
    is: 'Yes',
    then: (schema) => schema.required('Please specify'),
    otherwise: (schema) => schema,
  }),
  GYNAE11: Yup.string().oneOf(['Yes', 'No'], 'Invalid selection'),
  GYNAEShortAns11: Yup.string().when('GYNAE11', {
    is: 'Yes',
    then: (schema) => schema.required('Please specify'),
    otherwise: (schema) => schema,
  }),
  GYNAE13: Yup.string().oneOf(['Yes', 'No'], 'Invalid selection'),
  GYNAEShortAns13: Yup.string().when('GYNAE13', {
    is: 'Yes',
    then: (schema) => schema.required('Please specify'),
    otherwise: (schema) => schema,
  }),
})

const formName = 'lungFnForm'

const formOptions = {
  yesNoOptions: [
    { label: 'Yes', value: 'Yes' },
    { label: 'No', value: 'No' },
  ],
}

const LungFnForm = () => {
  const { patientId } = useContext(FormContext)
  const [loading, isLoading] = useState(true)
  const [loadingSidePanel, isLoadingSidePanel] = useState(true)
  const [savedData, setSavedData] = useState(initialValues)
  const [socialData, setSocialData] = useState({})
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

  const renderFormSection = (title, children) => (
    <Box sx={{ mb: 3 }}>
      <Typography variant='h6' component='h3' gutterBottom>
        {title}
      </Typography>
      {children}
    </Box>
  )

  const renderForm = () => (
    <Formik
      initialValues={savedData}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
      enableReinitialize={true}
    >
      {({ isSubmitting, submitCount, values, errors, touched }) => {
        const currentLungType = calculateLungType(values.LUNG5, values.LUNG7)

        return (
          <Form className='fieldPadding'>
            <Typography variant='h4' component='h1' gutterBottom>
              Lung Function
            </Typography>

            {renderFormSection(
              'Do you have any flu, fever now?',
              <>
                <FastField
                  name='LUNG1'
                  component={CustomRadioGroup}
                  options={formOptions.yesNoOptions}
                  row
                />
                {values.LUNG1 === 'Yes' && (
                  <FastField
                    name='LUNGShortAns1'
                    label='Please specify details'
                    component={CustomTextField}
                    multiline
                    rows={2}
                    fullWidth
                  />
                )}
              </>,
            )}

            {renderFormSection(
              'Has the patient undergone education for smoking cessation?',
              <FastField
                name='LUNG1a'
                component={CustomRadioGroup}
                options={formOptions.yesNoOptions}
                row
              />,
            )}

            {renderFormSection(
              'Lung function test completed?',
              <>
                <FastField
                  name='LUNG2'
                  component={CustomRadioGroup}
                  options={formOptions.yesNoOptions}
                  row
                />
                {values.LUNG2 === 'No' && (
                  <FastField
                    name='LUNGShortAns2'
                    label='Please specify why'
                    component={CustomTextField}
                    multiline
                    rows={2}
                    fullWidth
                  />
                )}
              </>,
            )}

            {renderFormSection(
              'Pre-bronchodilator',
              <>
                {renderFormSection(
                  'FVC (L)',
                  <FastField name='LUNG3' component={CustomNumberField} />,
                )}
                {renderFormSection(
                  'FEV1 (L)',
                  <FastField name='LUNG4' component={CustomNumberField} />,
                )}
                {renderFormSection(
                  'FVC (%pred)',
                  <FastField name='LUNG5' component={CustomNumberField} />,
                )}
                {renderFormSection(
                  'FEV1 (%pred)',
                  <FastField name='LUNG6' component={CustomNumberField} />,
                )}
                {renderFormSection(
                  'FEV1:FVC (%)',
                  <FastField name='LUNG7' component={CustomNumberField} />,
                )}
              </>,
            )}

            {renderFormSection(
              'What defect does the patient have?',
              <Typography className='blue'>{currentLungType || 'nil'}</Typography>,
            )}

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
    <Box className='summary--question-div'>
      <Typography variant='h6' component='h2' gutterBottom>
        Social History
      </Typography>

      {[
        { label: 'Does patient currently smoke:', value: socialData?.SOCIAL10 },
        { label: 'How many pack-years:', value: socialData?.SOCIALShortAns10 },
        { label: 'Has patient smoked before:', value: socialData?.SOCIAL11 },
        { label: 'For how long and when did they stop:', value: socialData?.SOCIALShortAns11 },
      ].map((item, index) => (
        <Box key={index} sx={{ mb: 2 }}>
          <Typography variant='body2' color='text.secondary'>
            {item.label}
          </Typography>
          <Typography className='blue'>{item.value || 'nil'}</Typography>
        </Box>
      ))}
    </Box>
  )

  return (
    <Paper elevation={2} sx={{ p: 0, m: 0 }}>
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
