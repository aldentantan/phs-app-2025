import React, { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Formik, Form, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import {
  Paper,
  CircularProgress,
  Divider,
  Checkbox,
  FormControlLabel,
  FormGroup,
  FormHelperText,
  Button,
} from '@mui/material'

import { submitForm } from '../api/api.jsx'
import { FormContext } from '../api/utils.js'
import { getSavedData } from '../services/mongoDB'
import './fieldPadding.css'

const validationSchema = Yup.object().shape({
  HPV1: Yup.array()
    .of(
      Yup.string().oneOf([
        'Has completed the registration forms and finished the on-site testing.',
      ]),
    )
    .required('This field is required'),
})

const formName = 'hpvForm'

const HpvForm = () => {
  const { patientId } = useContext(FormContext)
  const [loading, setLoading] = useState(false)
  const [initialValues, setInitialValues] = useState({
    HPV1: [],
  })

  const navigate = useNavigate()

  useEffect(() => {
    const fetchData = async () => {
      const savedData = await getSavedData(patientId, formName)
      if (savedData) {
        setInitialValues({
          HPV1: Array.isArray(savedData.HPV1) ? savedData.HPV1 : [],
        })
      }
    }
    fetchData()
  }, [patientId])

  const handleSubmit = async (values, { setSubmitting }) => {
    setLoading(true)
    try {
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
    } catch (error) {
      alert(`Error: ${error.message}`)
    } finally {
      setLoading(false)
      setSubmitting(false)
    }
  }

  return (
    <Paper elevation={2} p={0} m={0}>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ isSubmitting, values, setFieldValue }) => (
          <Form className='fieldPadding'>
            <div className='form--div'>
              <h1>On-Site HPV Testing</h1>
              <h3>Registration & Testing</h3>

              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={
                        values.HPV1?.includes(
                          'Has completed the registration forms and finished the on-site testing.',
                        ) || false
                      }
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFieldValue('HPV1', [
                            'Has completed the registration forms and finished the on-site testing.',
                          ])
                        } else {
                          setFieldValue('HPV1', [])
                        }
                      }}
                    />
                  }
                  label='Has completed the registration forms and finished the on-site testing.'
                />
                <ErrorMessage name='HPV1' component={FormHelperText} error />
              </FormGroup>
            </div>

            <div>
              {loading ? (
                <CircularProgress />
              ) : (
                <Button type='submit' variant='contained' color='primary' disabled={isSubmitting}>
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

export default HpvForm
