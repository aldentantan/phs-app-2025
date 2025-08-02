import React, { useContext, useEffect, useState } from 'react'
import {
  Paper, 
  Divider, 
  Typography, 
  CircularProgress,
  Button, 
  Grid,
  Box
} from '@mui/material'
import { Formik, Form, Field } from 'formik'
import * as Yup from 'yup'
import { FormContext } from '../api/utils.js'
import { getSavedData } from '../services/mongoDB'
import { submitForm } from '../api/api.jsx'
import allForms from './forms.json'
import CustomRadioGroup from '../components/form-components/CustomRadioGroup'
import ErrorNotification from '../components/form-components/ErrorNotification'
import './fieldPadding.css'
import { useNavigate } from 'react-router'

const formName = 'vaccineForm'

const initialValues = {
  VAX1: ''
}

export default function VaccineForm() {
  const { patientId } = useContext(FormContext)
  const [saveData, setSaveData] = useState(initialValues)
  const [loading, setLoading] = useState(false)
  const [loadingSidePanel, setLoadingSidePanel] = useState(true)
  const [regi, setRegi] = useState({})
  const navigate = useNavigate()

  const validationSchema = Yup.object({
    VAX1: Yup.string()
      .oneOf(['Yes', 'No'], 'Please select Yes or No')
      .required('This field is required')
  })

  // Form options following the pattern from other forms
  const formOptions = {
    VAX1: [
      { label: 'Yes', value: 'Yes' },
      { label: 'No', value: 'No' }
    ]
  }

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

  const handleSubmit = async (values, { setSubmitting }) => {
    setLoading(true)
    setSubmitting(true)
    
    const response = await submitForm(values, patientId, formName)
    
    setLoading(false)
    setSubmitting(false)
    
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
  }

  return (
    <Paper elevation={2} p={0} m={0}>
      <Grid display='flex' flexDirection='row'>
        <Grid xs={9}>
          <Paper elevation={2} p={0} m={0}>
            <Formik
              initialValues={saveData}
              validationSchema={validationSchema}
              enableReinitialize
              onSubmit={handleSubmit}
            >
              {({ isSubmitting, errors, submitCount }) => (
                <Form className="fieldPadding">
                  <div className='form--div'>
                    <Typography variant="h4" component="h1" gutterBottom>
                      Vaccination
                    </Typography>
                    
                    <Typography variant="subtitle1" gutterBottom>
                      You have signed up for your complimentary influenza vaccination.
                    </Typography>

                    <Typography variant="h6" component="h3" gutterBottom>
                      Do you consent to receiving the influenza vaccination?
                    </Typography>
                    
                    <Field
                      name="VAX1"
                      component={CustomRadioGroup}
                      options={formOptions.VAX1}
                      label="VAX1"
                      row
                    />
                  </div>

                  <ErrorNotification 
                    show={submitCount > 0 && Object.keys(errors).length > 0}
                  />

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
              <Typography variant="h6" gutterBottom>Patient Info</Typography>
              {regi ? (
                <>
                  <Typography variant="body1" className='blue'>
                    Age: {regi.registrationQ4}
                  </Typography>
                  <Typography variant="body1" className='blue'>
                    Citizenship: {regi.registrationQ7}
                  </Typography>
                </>
              ) : (
                <Typography variant="body1" className='red'>
                  NO REGI DATA
                </Typography>
              )}
            </div>
          )}
        </Grid>
      </Grid>
    </Paper>
  )
}

VaccineForm.contextType = FormContext