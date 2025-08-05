import { Paper, Divider, Typography, CircularProgress, Button, Grid } from '@mui/material'
import { FastField, Form, Formik } from 'formik'
import React, { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import * as Yup from 'yup'

import { submitForm } from '../api/api.jsx'
import { FormContext } from '../api/utils.js'
import allForms from './forms.json'
import CustomRadioGroup from '../components/form-components/CustomRadioGroup.jsx'
import { getSavedData } from '../services/mongoDB.js'
import './fieldPadding.css'
import './forms.css'

const formName = 'podiatryForm'

const initialValues = {
  podiatryQ1: '',
}

const validationSchema = Yup.object({
  podiatryQ1: Yup.string().required('Required'),
})

const formOptions = {
  podiatryQ1: [
    { label: 'Yes', value: 'Yes' },
    { label: 'No', value: 'No' },
  ],
}

const PodiatryForm = () => {
  const { patientId } = useContext(FormContext)
  const [savedData, setSavedData] = useState(initialValues)
  const [loadingSidePanel, setLoadingSidePanel] = useState(true)
  const [loading, setLoading] = useState(false)
  const [PMHX, setPMHX] = useState({})
  const navigate = useNavigate()

  useEffect(() => {
    const fetchData = async () => {
      const savedData = await getSavedData(patientId, formName)
      setSavedData({ ...initialValues, ...savedData })

      const PMHXData = await getSavedData(patientId, allForms.hxNssForm)
      Promise.all([PMHXData]).then((result) => {
        setPMHX(result[0])
        setLoadingSidePanel(false)
      })
    }
    fetchData()
  }, [patientId])

  const renderForm = () => (
    <Formik
      initialValues={savedData}
      validationSchema={validationSchema}
      enableReinitialize
      onSubmit={async (values, { setSubmitting }) => {
        setLoading(true)
        const response = await submitForm(values, patientId, formName)
        setLoading(false)
        setSubmitting(false)
        if (response.result) {
          alert('Successfully submitted form')
          navigate('/app/dashboard', { replace: true })
        } else {
          alert(`Unsuccessful. ${response.error}`)
        }
      }}
    >
      {({ errors, submitCount, isSubmitting }) => (
        <Paper elevation={2}>
          <Grid display='flex' flexDirection='row'>
            <Grid xs={9} sx={{ width: '50%' }}>
              <Paper elevation={2}>
                <Form className='fieldPadding'>
                  <Typography variant='h4'>
                    <strong>Podiatry</strong>
                  </Typography>
                  <Typography fontWeight='bold'>
                    Do you have your diabetic foot screening every year?
                  </Typography>
                  <FastField
                    name='podiatryQ1'
                    label='podiatryQ1'
                    component={CustomRadioGroup}
                    options={formOptions.podiatryQ1}
                    row
                  />

                  {submitCount > 0 && Object.keys(errors || {}).length > 0 && (
                    <Typography color='error' variant='body2' sx={{ mb: 1 }}>
                      Please fill in all required fields correctly.
                    </Typography>
                  )}

                  <div>
                    {loading || isSubmitting ? (
                      <CircularProgress />
                    ) : (
                      <Button type='submit' variant='contained' color='primary'>
                        Submit
                      </Button>
                    )}
                  </div>
                  <br />
                  <Divider />
                </Form>
              </Paper>
            </Grid>

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
                  <Typography variant='h6' gutterBottom>
                    Patient Info
                  </Typography>

                  {PMHX ? (
                    <>
                      {Array.isArray(PMHX.PMHX5) && PMHX.PMHX5.length > 0 ? (
                        <Typography variant='body1' className='blue'>
                          PMHX: {PMHX.PMHX5.join(', ')}
                        </Typography>
                      ) : (
                        <Typography variant='body1' className='blue'>
                          PMHX: nil
                        </Typography>
                      )}
                    </>
                  ) : (
                    <Typography variant='body1' className='red'>
                      NO PMHX DATA
                    </Typography>
                  )}
                </div>
              )}
            </Grid>
          </Grid>
        </Paper>
      )}
    </Formik>
  )

  return <Paper elevation={2}>{renderForm()}</Paper>
}

export default PodiatryForm
