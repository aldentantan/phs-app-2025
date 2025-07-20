import React, { useContext, useEffect, useState } from 'react'
import { Formik, Form, FastField } from 'formik'
import * as Yup from 'yup'

import { Divider, Paper, Grid, CircularProgress, Button } from '@mui/material'

import allForms from './forms.json'
import { submitForm } from '../api/api.jsx'
import { FormContext } from '../api/utils.js'
import { getSavedData } from '../services/mongoDB'
import './fieldPadding.css'
import { useNavigate } from 'react-router'

import CustomRadioGroup from '../components/form-components/CustomRadioGroup'
import CustomNumberField from '../components/form-components/CustomNumberField'

const validationSchema = Yup.object({
  BONE1: Yup.string()
    .oneOf(['High', 'Moderate', 'Low'], 'Please select a valid option')
    .required('This field is required'),
  BONE2: Yup.string()
    .oneOf(['Yes', 'No'], 'Please select Yes or No')
    .required('This field is required'),
  BONE3: Yup.number()
    .min(0, 'Value must be greater than or equal to 0')
    .required('This field is required'),
})

const initialValues = {
  BONE1: '',
  BONE2: '',
  BONE3: '',
}

const formName = 'osteoForm'

const OsteoForm = () => {
  const { patientId } = useContext(FormContext)
  const [loading, setLoading] = useState(false)
  const [loadingSidePanel, isLoadingSidePanel] = useState(true)
  const [saveData, setSaveData] = useState({})
  const [regi, setRegi] = useState({})
  const [triage, setTriage] = useState({})
  const [social, setSocial] = useState({})
  const navigate = useNavigate()

  useEffect(() => {
    const fetchData = async () => {
      const savedData = await getSavedData(patientId, formName)
      setSaveData(savedData)
      const regiData = getSavedData(patientId, allForms.registrationForm)
      const triageData = getSavedData(patientId, allForms.triageForm)
      const socialData = getSavedData(patientId, allForms.hxSocialForm)

      Promise.all([regiData, triageData, socialData]).then((result) => {
        setRegi(result[0])
        setTriage(result[1])
        setSocial(result[2])
        isLoadingSidePanel(false)
      })
    }

    fetchData()
  }, [patientId])

  const formOptions = {
    BONE1: [
      { label: 'High', value: 'High' },
      { label: 'Moderate', value: 'Moderate' },
      { label: 'Low', value: 'Low' },
    ],
    BONE2: [
      { label: 'Yes', value: 'Yes' },
      { label: 'No', value: 'No' },
    ],
  }

  const handleSubmit = async (values) => {
    setLoading(true)
    const response = await submitForm(values, patientId, formName)
    if (response.result) {
      setLoading(false)
      setTimeout(() => {
        alert('Successfully submitted form')
        navigate('/app/dashboard', { replace: true })
      }, 80)
    } else {
      setLoading(false)
      setTimeout(() => {
        alert(`Unsuccessful. ${response.error}`)
      }, 80)
    }
  }

  return (
    <Paper elevation={2}>
      <Grid display='flex' flexDirection='row'>
        <Grid xs={9}>
          <Paper elevation={2}>
            <Formik
              initialValues={{ ...initialValues, ...saveData }}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
              enableReinitialize={true}
            >
              {({ errors, submitCount, isValid }) => (
                <Form className='fieldPadding'>
                  <div className='form--div'>
                    <h1>Osteoporosis</h1>
                    <h3>Based on OSTA, patient&apos;s osteoporosis risk is:</h3>
                    <img src='/images/Ost/ost_self_assessment_tool.png' alt='osta' />
                    <br />

                    <FastField
                      name='BONE1'
                      label='BONE1'
                      component={CustomRadioGroup}
                      options={formOptions.BONE1}
                      row
                    />

                    <h3>FRAX Hip Fracture Score</h3>
                    <FastField name='BONE3' label='BONE3' component={CustomNumberField} min={0} />

                    <h3>Patient requires a follow up</h3>
                    <FastField
                      name='BONE2'
                      label='BONE2'
                      component={CustomRadioGroup}
                      options={formOptions.BONE2}
                      row
                    />
                  </div>

                  {/* Error Display */}
                  {Object.keys(errors).length > 0 && submitCount > 0 && (
                    <div style={{ color: 'red', margin: '10px 0' }}>
                      <h4>Please fix the following errors:</h4>
                      <ul>
                        {Object.entries(errors).map(([field, error]) => (
                          <li key={field}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div>
                    {loading ? (
                      <CircularProgress />
                    ) : (
                      <Button
                        type='submit'
                        variant='contained'
                        color='primary'
                        disabled={!isValid || loading}
                      >
                        Submit
                      </Button>
                    )}
                  </div>
                  <Divider />
                </Form>
              )}
            </Formik>
          </Paper>
        </Grid>

        {/* Side Panel */}
        <Grid
          p={1}
          width='30%'
          display='flex'
          flexDirection='column'
          alignItems={loadingSidePanel ? 'center' : 'left'}
        >
          {loadingSidePanel ? (
            <CircularProgress />
          ) : (
            <div className='summary--question-div'>
              <h2>Patient Info</h2>
              {regi && (
                <>
                  {regi.registrationQ3 instanceof Date ? (
                    <p>
                      Birthday: <strong>{regi.registrationQ3.toDateString()}</strong>
                    </p>
                  ) : (
                    <p className='red'>registrationQ3 is invalid!</p>
                  )}
                  <p>
                    Age: <strong>{regi.registrationQ4}</strong>
                  </p>
                  <p>
                    Gender: <strong>{String(regi.registrationQ5)}</strong>
                  </p>
                </>
              )}

              {triage && (
                <>
                  <p>
                    Height (in cm): <strong>{triage.triageQ10}</strong>
                  </p>
                  <p>
                    Weight (in kg): <strong>{triage.triageQ11}</strong>
                  </p>
                </>
              )}

              {social && (
                <>
                  <p>
                    Does patient currently smoke: <strong>{String(social.SOCIAL10)}</strong>
                  </p>
                  <p>
                    How many pack years: <strong>{String(social.SOCIALShortAns10)}</strong>
                  </p>
                  <p>
                    Does patient consume alcoholic drinks:{' '}
                    <strong>{String(social.SOCIAL12)}</strong>
                  </p>
                </>
              )}
            </div>
          )}
        </Grid>
      </Grid>
    </Paper>
  )
}

OsteoForm.contextType = FormContext
export default OsteoForm
