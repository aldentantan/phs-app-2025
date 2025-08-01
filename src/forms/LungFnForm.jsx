import React, { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Formik, FastField } from 'formik'
import * as Yup from 'yup'

import { Divider, Paper, Grid, CircularProgress, Button, Typography } from '@mui/material'

import { submitForm } from '../api/api.jsx'
import { FormContext } from '../api/utils.js'
import { getSavedData } from '../services/mongoDB'

import allForms from './forms.json'
import CustomRadioGroup from '../components/form-components/CustomRadioGroup'
import CustomTextField from '../components/form-components/CustomTextField'
import CustomNumberField from '../components/form-components/CustomNumberField'
import PopupText from 'src/utils/popupText'

import './fieldPadding.css'

const formName = 'lungFnForm'

const YesNo = [
  { label: 'Yes', value: 'Yes' },
  { label: 'No', value: 'No' },
]

const formOptions = {
  LUNG1: YesNo,
  LUNG1a: YesNo,
  LUNG2: YesNo,
}

const validationSchema = Yup.object({
  LUNG1: Yup.string().required(),
  LUNGShortAns1: Yup.string().when('LUNG1', {
    is: 'Yes',
    then: (schema) => schema.required(),
    otherwise: (schema) => schema,
  }),
  LUNG1a: Yup.string().required(),
  LUNG2: Yup.string().required(),
  LUNGShortAns2: Yup.string().when('LUNG2', {
    is: 'No',
    then: (schema) => schema.required(),
    otherwise: (schema) => schema,
  }),
})

function determineLungType(lung5, lung7) {
  if (lung5 >= 80 && lung7 < 70) return 'Obstructive Defect'
  if (lung5 < 80 && lung7 < 70) return 'Mixed Pattern'
  if (lung5 < 80 && lung7 >= 70) return 'Restrictive Defect'
  if (lung5 >= 80 && lung7 >= 70) return 'Normal'
  return null
}

const LungFnForm = () => {
  const { patientId } = useContext(FormContext)
  const navigate = useNavigate()

  const [initialValues, setInitialValues] = useState({
    LUNG1: '',
    LUNGShortAns1: '',
    LUNG1a: '',
    LUNG2: '',
    LUNGShortAns2: '',
  })
  const [social, setSocial] = useState({})
  const [lungType, setLungType] = useState(null)
  const [loadingSidePanel, isLoadingSidePanel] = useState(true)
  const [loading, isLoading] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      const savedData = await getSavedData(patientId, formName)
      const socialData = await getSavedData(patientId, allForms.hxSocialForm)
      setInitialValues(savedData || {})
      setSocial(socialData || {})
      isLoadingSidePanel(false)
    }
    fetchData()
  }, [])

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      enableReinitialize
      onSubmit={async (values, { setSubmitting }) => {
        isLoading(true)
        const finalValues = { ...values, LUNG13: determineLungType(values.LUNG5, values.LUNG7) }
        const response = await submitForm(finalValues, patientId, formName)
        isLoading(false)
        setSubmitting(false)
        if (response.result) {
          alert('Successfully submitted form')
          navigate('/app/dashboard', { replace: true })
        } else {
          alert(`Unsuccessful. ${response.error}`)
        }
      }}
    >
      {({ handleSubmit, values, submitCount, errors }) => (
        <Paper elevation={2}>
          <Grid container>
            <Grid item xs={9}>
              <form onSubmit={handleSubmit} className='fieldPadding'>
                <div className='form--div'>
                  <h1>Lung Function</h1>
                  <h3>Do you have any flu, fever now?</h3>
                  <FastField
                    name='LUNG1'
                    label='LUNG1'
                    component={CustomRadioGroup}
                    options={formOptions.LUNG1}
                    row
                  />
                  <PopupText qnNo='LUNG1' triggerValue='Yes'>
                    <h4>Please specify why</h4>
                    <FastField
                      name='LUNGShortAns1'
                      label='LUNGShortAns1'
                      component={CustomTextField}
                      multiline
                      fullWidth
                    />
                  </PopupText>

                  <h3>Has the patient undergone education for smoking cessation?</h3>
                  <FastField
                    name='LUNG1a'
                    label='LUNG1a'
                    component={CustomRadioGroup}
                    options={formOptions.LUNG1a}
                    row
                  />

                  <h3>Lung function test completed?</h3>
                  <FastField
                    name='LUNG2'
                    label='LUNG2'
                    component={CustomRadioGroup}
                    options={formOptions.LUNG2}
                    row
                  />
                  {values.LUNG2 === 'No' && (
                    <FastField
                      name='LUNGShortAns2'
                      label='LUNGShortAns2'
                      component={CustomTextField}
                      multiline
                      fullWidth
                    />
                  )}
                </div>

                {submitCount > 0 && Object.keys(errors || {}).length > 0 && (
                  <Typography color='error' variant='body2' sx={{ mb: 1 }}>
                    Please fill in all required fields correctly.
                  </Typography>
                )}

                <div>
                  {loading ? (
                    <CircularProgress />
                  ) : (
                    <Button type='submit' variant='contained' color='primary'>
                      Submit
                    </Button>
                  )}
                </div>
                <br />
                <Divider />
              </form>
            </Grid>

            <Grid item xs={3} p={1} display='flex' flexDirection='column'>
              {loadingSidePanel ? (
                <CircularProgress />
              ) : (
                <div className='summary--question-div'>
                  <h2>Social</h2>
                  <p className='underlined'>Currently smoke:</p>
                  <p className='blue'>{social.SOCIAL10 || 'nil'}</p>
                  <p className='underlined'>Pack-years:</p>
                  <p className='blue'>{social.SOCIALShortAns10 || 'nil'}</p>
                  <p className='underlined'>Smoked before:</p>
                  <p className='blue'>{social.SOCIAL11 || 'nil'}</p>
                  <p className='underlined'>Quit history:</p>
                  <p className='blue'>{social.SOCIALShortAns11 || 'nil'}</p>
                </div>
              )}
            </Grid>
          </Grid>
        </Paper>
      )}
    </Formik>
  )
}

export default LungFnForm
