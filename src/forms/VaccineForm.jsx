import React, { useContext, useEffect, useState } from 'react'
import {
  Paper,
  Divider,
  Typography,
  CircularProgress,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Button,
  Grid,
} from '@mui/material'
import { Formik, Form, Field, FastField, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { FormContext } from '../api/utils.js'
import { getSavedData } from '../services/mongoDB'
import { submitForm } from '../api/api.jsx'
import allForms from './forms.json'
import './fieldPadding.css'
import { useNavigate } from 'react-router'

import CustomRadioGroup from '../components/form-components/CustomRadioGroup'

const formName = 'vaccineForm'

const initialValues = {
  VAX1: '',
}

const formOptions = {
  VAX1: [
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
  const navigate = useNavigate()

  const validationSchema = Yup.object({
    VAX1: Yup.string().oneOf(['Yes', 'No'], 'Please select Yes or No').required('Required'),
  })

  useEffect(() => {
    const fetchData = async () => {
      const savedData = await getSavedData(patientId, formName)
      setSaveData(savedData || initialValues)

      const regiData = getSavedData(patientId, allForms.registrationForm)
      Promise.all([regiData]).then((result) => {
        setRegi(result[0])
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
                  <Typography variant='h4' gutterBottom>
                    Vaccination
                  </Typography>
                  <Typography variant='subtitle1' gutterBottom>
                    You have signed up for your complimentary influenza vaccination.
                  </Typography>

                  <FastField
                    name='VAX1'
                    label='VAX1'
                    component={CustomRadioGroup}
                    options={formOptions.VAX1}
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
                  {regi ? (
                    <>
                      <Typography variant='body1' className='blue'>
                        Age: {regi.registrationQ4}
                      </Typography>
                      <Typography variant='body1' className='blue'>
                        Citizenship: {regi.registrationQ7}
                      </Typography>
                    </>
                  ) : (
                    <Typography variant='body1' className='red'>
                      NO REGI DATA
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
