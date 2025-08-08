import React, { Fragment, useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Formik, Form, Field } from 'formik'
import * as Yup from 'yup'
import { Typography } from '@mui/material'

import { Divider, Paper, CircularProgress, Button, Box, Grid } from '@mui/material'

import { submitForm, formatBmi, checkFormA } from '../api/api.jsx'
import { FormContext } from '../api/utils.js'
import { getSavedData } from '../services/mongoDB'
import './fieldPadding.css'
import CustomNumberField from '../components/form-components/CustomNumberField'
import CustomRadioGroup from '../components/form-components/CustomRadioGroup'
import ErrorNotification from 'src/components/form-components/ErrorNotification'

let calSyst
let calDias

const validationSchema = Yup.object({
  triageQ1: Yup.number()
    .required('First reading systolic is required')
    .min(0, 'Value must be positive'),
  triageQ2: Yup.number()
    .required('First reading diastolic is required')
    .min(0, 'Value must be positive'),
  triageQHR1: Yup.number()
    .required('First reading heart rate is required')
    .min(0, 'Value must be positive'),
  triageQ3: Yup.number()
    .required('Second reading systolic is required')
    .min(0, 'Value must be positive'),
  triageQ4: Yup.number()
    .required('Second reading diastolic is required')
    .min(0, 'Value must be positive'),
  triageQHR2: Yup.number()
    .required('Second reading heart rate is required')
    .min(0, 'Value must be positive'),
  triageQ5: Yup.number().min(0, 'Value must be positive').nullable(),
  triageQ6: Yup.number().min(0, 'Value must be positive').nullable(),
  triageQHR3: Yup.number().min(0, 'Value must be positive').nullable(),
  triageQ7: Yup.number().nullable(),
  triageQ8: Yup.number().nullable(),
  triageQ9: Yup.string()
    .oneOf(['Yes', 'No'], 'Please select Yes or No')
    .required('This field is required'),
  triageQ10: Yup.number().required('Height is required').min(0, 'Value must be positive'),
  triageQ11: Yup.number().required('Weight is required').min(0, 'Value must be positive'),
  triageQ12: Yup.number().nullable(),
  triageQ13: Yup.number()
    .required('Waist circumference is required')
    .min(0, 'Value must be positive'),
  triageQ14: Yup.number().required('Temperature is required').min(0, 'Value must be positive'),
})

const initialValues = {
  triageQ1: '',
  triageQ2: '',
  triageQHR1: '',
  triageQ3: '',
  triageQ4: '',
  triageQHR2: '',
  triageQ5: '',
  triageQ6: '',
  triageQHR3: '',
  triageQ7: '',
  triageQ8: '',
  triageQ9: '',
  triageQ10: '',
  triageQ11: '',
  triageQ12: '',
  triageQ13: '',
  triageQ14: '',
}

function CalcBMI({ values }) {
  const { triageQ10: height_cm, triageQ11: weight } = values
  if (height_cm && weight) {
    return formatBmi(height_cm, weight)
  }
  return null
}

function IsHighBP({ systolic, diastolic }) {
  let message = ''
  if (systolic > 140) message = 'High systolic BP'
  if (diastolic > 90) message = 'High diastolic BP'
  if (message === '') return null
  return (
    <Fragment>
      <font color='red'>
        <b>{message}</b>
      </font>{' '}
      <br />
    </Fragment>
  )
}

function compareNumbers(a, b) {
  return a - b
}

function CalcAvg({ reading1, reading2, reading3, label }) {
  let ans

  const num1 = parseFloat(reading1) || 0
  const num2 = parseFloat(reading2) || 0
  const num3 = parseFloat(reading3) || null

  if (reading3 == null || reading3 === '') {
    ans = Math.round((num1 + num2) / 2)
    if (label == 1) {
      calSyst = ans
    } else {
      calDias = ans
    }
    return ans
  } else {
    let diff1 = Math.abs(num1 - num2)
    let diff2 = Math.abs(num1 - num3)
    let diff3 = Math.abs(num3 - num2)

    const diffArray = [diff1, diff2, diff3]

    diffArray.sort(compareNumbers)

    if (diffArray[0] == diff1) {
      ans = Math.round((num1 + num2) / 2)
      if (label == 1) {
        calSyst = ans
      } else {
        calDias = ans
      }
    } else if (diffArray[0] == diff2) {
      ans = Math.round((num1 + num3) / 2)
      if (label == 1) {
        calSyst = ans
      } else {
        calDias = ans
      }
    } else {
      ans = Math.round((num2 + num3) / 2)
      if (label == 1) {
        calSyst = ans
      } else {
        calDias = ans
      }
    }
    return ans
  }
}

const formName = 'triageForm'

const TriageForm = () => {
  const [loading, isLoading] = useState(false)
  const { patientId } = useContext(FormContext)
  const [saveData, setSaveData] = useState(initialValues)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchData = async () => {
      const savedData = await getSavedData(patientId, formName)
      setSaveData({ ...initialValues, ...savedData })
    }
    fetchData()
  }, [patientId])

  const formOptions = {
    triageQ9: [
      { label: 'Yes', value: 'Yes' },
      { label: 'No', value: 'No' },
    ],
  }

  const handleSubmit = async (model, { setSubmitting }) => {
    isLoading(true)
    setSubmitting(true)

    //calculated values
    model.triageQ7 = calSyst
    model.triageQ8 = calDias
    model.triageQ12 = parseFloat(formatBmi(model.triageQ10, model.triageQ11).props.children)

    const response = await submitForm(model, patientId, formName)

    if (response.result) {
      await checkFormA(patientId)
      isLoading(false)
      setSubmitting(false)
      setTimeout(() => {
        alert('Successfully submitted form')
        navigate('/app/dashboard', { replace: true })
      }, 80)
    } else {
      isLoading(false)
      setSubmitting(false)
      setTimeout(() => {
        alert(`Unsuccessful. ${response.error}`)
      }, 80)
    }
  }
  return (
    <Paper elevation={2} p={0} m={0}>
      <Formik
        initialValues={saveData}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize={true}
      >
        {({ values, isSubmitting, submitCount, ...formikProps }) => (
          <Form>
            <div className='form--div'>
              <h1>Triage</h1>
              <h2>VITALS</h2>
              <h2>1) BLOOD PRESSURE</h2>
              <p>
                (Before measuring BP: ensure no caffeine, anxiety, running and smoking in the last
                30 minutes.)
              </p>

              <Grid container spacing={1}>
                {/* First readings in the first row */}
                <Grid item xs={12} sm={4}>
                  <Typography variant='h6' component='h3' sx={{ fontWeight: 'bold' }}>
                    1st Reading Systolic (mmHg)
                  </Typography>
                  <Field name='triageQ1' component={CustomNumberField} label='Triage Q1' min={0} />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant='h6' component='h3' sx={{ fontWeight: 'bold' }}>
                    1st Reading Diastolic (mmHg)
                  </Typography>
                  <Field name='triageQ2' component={CustomNumberField} label='Triage Q2' min={0} />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant='h6' component='h3' sx={{ fontWeight: 'bold' }}>
                    1st Reading Heart Rate (bpm)
                  </Typography>
                  <Field
                    name='triageQHR1'
                    component={CustomNumberField}
                    label='TriageQHR1'
                    min={0}
                  />
                </Grid>

                {/* First row warnings for high BP */}
                <Grid item xs={12} sm={4} sx={{ mt: -2 }}>
                  <IsHighBP systolic={values.triageQ1} />
                </Grid>
                <Grid item xs={12} sm={4} sx={{ mt: -2 }}>
                  <IsHighBP diastolic={values.triageQ2} />
                </Grid>
                <Grid item xs={12} sm={4} sx={{ mt: -2 }}></Grid>

                {/* Second readings in the second row */}
                <Grid item xs={12} sm={4}>
                  <Typography variant='h6' component='h3' sx={{ fontWeight: 'bold' }}>
                    2nd Reading Systolic (mmHg)
                  </Typography>
                  <Field name='triageQ3' component={CustomNumberField} label='Triage Q3' min={0} />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant='h6' component='h3' sx={{ fontWeight: 'bold' }}>
                    2nd Reading Diastolic (mmHg)
                  </Typography>
                  <Field name='triageQ4' component={CustomNumberField} label='Triage Q4' min={0} />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant='h6' component='h3' sx={{ fontWeight: 'bold' }}>
                    2nd Reading Heart Rate (bpm)
                  </Typography>
                  <Field
                    name='triageQHR2'
                    component={CustomNumberField}
                    label='TriageQHR2'
                    min={0}
                  />
                </Grid>
                {/* Second row warnings for high BP */}
                <Grid item xs={12} sm={4} sx={{ mt: -2 }}>
                  <IsHighBP systolic={values.triageQ3} />
                </Grid>
                <Grid item xs={12} sm={4} sx={{ mt: -2 }}>
                  <IsHighBP diastolic={values.triageQ4} />
                </Grid>
                <Grid item xs={12} sm={4} sx={{ mt: -2 }}></Grid>

                {/* Optional third readings in the third row */}
                <Grid item xs={12} sm={4}>
                  <Typography variant='h6' component='h3' sx={{ fontWeight: 'bold' }}>
                    3rd Reading Systolic (Only if 1st and 2nd systolic reading differ by{' '}
                    <b>&gt;5mmHg</b>)
                  </Typography>
                  <Field name='triageQ5' component={CustomNumberField} label='Triage Q5' min={0} />
                </Grid>

                <Grid item xs={12} sm={4}>
                  <Typography variant='h6' component='h3' sx={{ fontWeight: 'bold' }}>
                    3rd Reading Diastolic (ONLY if 1st and 2nd diastolic reading differ by{' '}
                    <b>&gt;5mmHg</b>)
                  </Typography>
                  <Field name='triageQ6' component={CustomNumberField} label='Triage Q6' min={0} />
                </Grid>

                <Grid item xs={12} sm={4}>
                  <Typography variant='h6' component='h3' sx={{ fontWeight: 'bold' }}>
                    3rd Reading Heart Rate (ONLY if 1st and 2nd heart rate reading differ by{' '}
                    <b>&gt;5bpm</b>)
                  </Typography>
                  <Field
                    name='triageQHR3'
                    component={CustomNumberField}
                    label='TriageQHR3'
                    min={0}
                  />
                </Grid>
                <Grid item xs={12} sm={4} sx={{ mt: -2 }}>
                  <IsHighBP systolic={values.triageQ5} />
                </Grid>
                <Grid item xs={12} sm={4} sx={{ mt: -2 }}>
                  <IsHighBP diastolic={values.triageQ6} />
                </Grid>
                <Grid item xs={12} sm={4} sx={{ mt: -2 }}></Grid>
              </Grid>

              <h3>Average Reading Systolic (average of closest 2 readings):</h3>
              <h3>
                Calculated Average: &nbsp;
                <CalcAvg
                  label={1}
                  reading1={values.triageQ1}
                  reading2={values.triageQ3}
                  reading3={values.triageQ5}
                />
              </h3>
              <br />

              <h3>Average Reading Diastolic (average of closest 2 readings):</h3>
              <h3>
                Calculated Average: &nbsp;
                <CalcAvg
                  label={2}
                  reading1={values.triageQ2}
                  reading2={values.triageQ4}
                  reading3={values.triageQ6}
                />
              </h3>
              <br />

              <h3>Average Reading Heart Rate (average of closest 2 readings):</h3>
              <h3>
                Calculated Average: &nbsp;
                <CalcAvg
                  label={2}
                  reading1={values.triageQHR1}
                  reading2={values.triageQHR2}
                  reading3={values.triageQHR3}
                />
              </h3>
              <br />

              <h3>Hypertension criteria:</h3>
              <ul>
                <li>Younger participants: BP &gt; 140/90</li>
                <li>Participants &gt; 80 years old: BP &gt; 150/90</li>
                <li>CKD w proteinuria (mod to severe albuminuria): &gt; 130/80</li>
                <li>DM: &gt; 130/80</li>
              </ul>

              <h3>Malignant criteria:</h3>
              <ul>
                <li>BP &gt; 180/120</li>
              </ul>
              <Typography fontWeight='bold' variant='h4'>
                Q9. Does the patient's blood pressure require closer scrutiny by doctors later?
                (e.g. Systolic above 180/120)
              </Typography>

              <Field
                name='triageQ9'
                component={CustomRadioGroup}
                label='Triage Q9'
                options={formOptions.triageQ9}
                row
              />

              <h2>2) BMI</h2>
              <h3>Height (in cm)</h3>
              <Field name='triageQ10' component={CustomNumberField} label='Triage Q10' min={0} />

              <h3>Weight (in kg)</h3>
              <Field name='triageQ11' component={CustomNumberField} label='Triage Q11' min={0} />

              <h3>
                BMI: <CalcBMI values={values} />
              </h3>

              <h2>3) Waist Circumference</h2>
              <h3>Waist Circumference (in cm)</h3>
              <Field name='triageQ13' component={CustomNumberField} label='Triage Q13' min={0} />

              <h2>4) Ear Temperature Taking</h2>
              <h3>Temperature (in Celsius)</h3>
              <Field
                name='triageQ14'
                component={CustomNumberField}
                label='Triage Q14'
                min={0}
                step={0.1}
              />
            </div>

            {/* Display form errors */}
            <ErrorNotification
              show={submitCount > 0 && Object.keys(formikProps.errors || {}).length > 0}
              message='Please fill in all required fields correctly.'
            />

            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
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

            <br />
            <Divider />
          </Form>
        )}
      </Formik>
    </Paper>
  )
}

TriageForm.contextType = FormContext

export default TriageForm
