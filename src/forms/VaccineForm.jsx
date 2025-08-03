import React, { useContext, useEffect, useState } from 'react'
import { Paper, Divider, Typography, CircularProgress, Button, Grid } from '@mui/material'
import { Formik, Form, FastField } from 'formik'
import * as Yup from 'yup'
import { FormContext } from '../api/utils.js'
import { getSavedData } from '../services/mongoDB'
import { submitForm } from '../api/api.jsx'
import allForms from './forms.json'
import './fieldPadding.css'
import { useNavigate } from 'react-router'

import CustomRadioGroup from '../components/form-components/CustomRadioGroup'
import CustomTextField from '../components/form-components/CustomTextField'

const formName = 'vaccineForm'

const initialValues = {
  VAX1: '',
  VAX2: '',
  VAX3: '',
}

const formOptions = {
  VAX1: [
    { label: 'Yes', value: 'Yes' },
    { label: 'No', value: 'No' },
  ],
  VAX2: [
    { label: 'Yes', value: 'Yes' },
    { label: 'No', value: 'No' },
  ],
}

export default function VaccineForm() {
  const { patientId } = useContext(FormContext)
  const [saveData, setSaveData] = useState(initialValues)
  const [loading, setLoading] = useState(false)
  const [loadingSidePanel, setLoadingSidePanel] = useState(true)
  const [regi, setRegi] = useState({})
  const [historyForm, setHistoryForm] = useState({})
  const navigate = useNavigate()

  const validationSchema = Yup.object({
    VAX1: Yup.string().required(),
    VAX2: Yup.string().required(),
    VAX3: Yup.string().required(),
  })

  useEffect(() => {
    const fetchData = async () => {
      const savedData = await getSavedData(patientId, formName)
      setSaveData(savedData || initialValues)

      const regiData = await getSavedData(patientId, allForms.registrationForm)
      const historyData = await getSavedData(patientId, allForms.hxNssForm)
      Promise.all([regiData, historyData]).then((result) => {
        setRegi(result[0])
        setHistoryForm(result[1])
        setLoadingSidePanel(false)
      })
    }
    fetchData()
  }, [patientId])

  return (
    <Formik
      initialValues={saveData}
      validationSchema={validationSchema}
      enableReinitialize
      onSubmit={async (values, { setSubmitting }) => {
        setLoading(true)
        const response = await submitForm(values, patientId, formName)
        setTimeout(() => {
          setLoading(false)
          setSubmitting(false)
          if (response.result) {
            alert('Successfully submitted form')
            navigate('/app/dashboard', { replace: true })
          } else {
            alert(`Unsuccessful. ${response.error}`)
          }
        }, 80)
      }}
    >
      {({ errors, submitCount, isSubmitting }) => (
        <Paper elevation={2}>
          <Grid display='flex' flexDirection='row'>
            <Grid xs={9}>
              <Paper elevation={2}>
                <Form className='fieldPadding'>
                  <Typography variant='h4'>Vaccination</Typography>

                  <Typography variant='h6' sx={{ fontWeight: 'bold' }}>
                    You have received a pneumococcal vaccine.
                  </Typography>
                  <FastField
                    name='VAX1'
                    label='VAX1'
                    component={CustomRadioGroup}
                    options={formOptions.VAX1}
                    row
                    fullwidth
                  />

                  <Typography variant='h6' sx={{ fontWeight: 'bold' }}>
                    You have received an Influenza vaccine.
                  </Typography>
                  <FastField
                    name='VAX2'
                    label='VAX2'
                    component={CustomRadioGroup}
                    options={formOptions.VAX2}
                    row
                  />

                  <Typography variant='h6' sx={{ fontWeight: 'bold' }}>
                    Patient's Vaccination history
                  </Typography>
                  <FastField
                    name='VAX3'
                    label='VAX3'
                    component={CustomTextField}
                    multiline
                    rows={3}
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
                  {regi ? (
                    <>
                      {regi.registrationQ4 ? (
                        <Typography variant='body1' className='blue'>
                          Age: {regi.registrationQ4}
                        </Typography>
                      ) : (
                        <Typography variant='body1' className='blue'>
                          Age: nil
                        </Typography>
                      )}

                      {regi.registrationQ7 ? (
                        <Typography variant='body1' className='blue'>
                          Citizenship: {regi.registrationQ7}
                        </Typography>
                      ) : (
                        <Typography variant='body1' className='blue'>
                          Citizenship: nil
                        </Typography>
                      )}

                      {regi.registrationQ12 ? (
                        <Typography variant='body1' className='blue'>
                          CHAS status: {regi.registrationQ12}
                        </Typography>
                      ) : (
                        <Typography variant='body1' className='blue'>
                          CHAS status: nil
                        </Typography>
                      )}
                    </>
                  ) : (
                    <Typography variant='body1' className='red'>
                      NO REGI DATA
                    </Typography>
                  )}

                  {historyForm ? (
                    <>
                      {historyForm.PMHXShortAns3 ? (
                        <Typography variant='body1' className='blue'>
                          Food Allergy: {historyForm.PMHXShortAns3}
                        </Typography>
                      ) : (
                        <Typography variant='body1' className='blue'>
                          Food Allergy: nil
                        </Typography>
                      )}

                      {historyForm.PMHXShortAns10 ? (
                        <Typography variant='body1' className='blue'>
                          Drug Allergy: {historyForm.PMHXShortAns10}
                        </Typography>
                      ) : (
                        <Typography variant='body1' className='blue'>
                          Drug Allergy: nil
                        </Typography>
                      )}
                    </>
                  ) : (
                    <Typography variant='body1' className='red'>
                      NO HISTORY FORM DATA
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
}

VaccineForm.contextType = FormContext
