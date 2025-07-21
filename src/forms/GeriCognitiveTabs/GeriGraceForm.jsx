import React, { useContext, useEffect, useState } from 'react'
import { Paper, Divider, Typography, CircularProgress, Box, Button } from '@mui/material'
import { Formik, Form, FastField } from 'formik'
import * as Yup from 'yup'
import { submitForm } from '../../api/api.jsx'
import { FormContext } from '../../api/utils.js'
import { getSavedData } from '../../services/mongoDB'
import '../fieldPadding.css'
import '../forms.css'

import CustomRadioGroup from '../../components/form-components/CustomRadioGroup.jsx'
import CustomTextField from '../../components/form-components/CustomTextField.jsx'

const validationSchema = Yup.object({
  GRACE1: Yup.string().notRequired(),
  GRACE2: Yup.string().oneOf(['Yes', 'No']).required('Required'),
  GRACE3: Yup.string().notRequired(),
  GRACE4: Yup.string().oneOf(['Yes', 'No']).required('Required'),
  GRACE5: Yup.string().notRequired(),
})

const formName = 'geriGraceForm'

const GeriGraceForm = (props) => {
  const { patientId } = useContext(FormContext)
  const [loading, setLoading] = useState(false)
  const { changeTab, nextTab } = props
  const [initialValues, setInitialValues] = useState({
    GRACE1: '',
    GRACE2: '',
    GRACE3: '',
    GRACE4: '',
    GRACE5: '',
  })

  useEffect(() => {
    const fetchData = async () => {
      const savedData = await getSavedData(patientId, formName)
      setInitialValues({
        GRACE1: savedData.GRACE1 || '',
        GRACE2: savedData.GRACE2 || '',
        GRACE3: savedData.GRACE3 || '',
        GRACE4: savedData.GRACE4 || '',
        GRACE5: savedData.GRACE5 || '',
      })
    }
    fetchData()
  }, [patientId])

  const radioOptions = [
    { label: 'Yes', value: 'Yes' },
    { label: 'No', value: 'No' },
  ]

  return (
    <Paper elevation={2} p={0} m={0}>
      <Formik
        enableReinitialize
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={async (values, { setSubmitting }) => {
          setLoading(true)
          const response = await submitForm(values, patientId, formName)
          setLoading(false)
          setSubmitting(false)
          if (response.result) {
            const event = null
            setTimeout(() => {
              alert('Successfully submitted form')
              changeTab(event, nextTab)
            }, 80)
          } else {
            setTimeout(() => {
              alert(`Unsuccessful. ${response.error}`)
            }, 80)
          }
        }}
      >
        {(formikProps) => {
          const { submitCount, errors } = formikProps
          return (
            <Form className='fieldPadding'>
              <div className='form--div'>
                <h1>G-RACE</h1>

                {submitCount > 0 && Object.keys(errors || {}).length > 0 && (
                  <Typography color='error' variant='body2' sx={{ mb: 1 }}>
                    Please fill in all required fields correctly.
                  </Typography>
                )}

                <h3>MMSE score (_/_):</h3>
                <FastField
                  name='GRACE1'
                  label='MMSE Score'
                  component={CustomTextField}
                  fullWidth
                  rows={1}
                />

                <h3>Need referral to G-RACE associated polyclinics/partners?</h3>
                <FastField
                  name='GRACE2'
                  label='Referral needed?'
                  component={CustomRadioGroup}
                  options={radioOptions}
                  row
                />

                <h3>Polyclinic:</h3>
                <FastField
                  name='GRACE3'
                  label='Polyclinic'
                  component={CustomTextField}
                  fullWidth
                  rows={1}
                />

                <h3>Referral to Doctor&apos;s Consult?</h3>
                <p>For geri patients who may be depressed</p>
                <FastField
                  name='GRACE4'
                  label='Doctor referral?'
                  component={CustomRadioGroup}
                  options={radioOptions}
                  row
                />

                <h3>Reason for referral:</h3>
                <FastField
                  name='GRACE5'
                  label='Reason for referral'
                  component={CustomTextField}
                  fullWidth
                  multiline
                  rows={3}
                />
              </div>

              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                {loading || formikProps.isSubmitting ? (
                  <CircularProgress />
                ) : (
                  <Button
                    type='submit'
                    variant='contained'
                    color='primary'
                    size='large'
                    disabled={formikProps.isSubmitting}
                  >
                    Submit
                  </Button>
                )}
              </Box>

              <br />
              <Divider />
            </Form>
          )
        }}
      </Formik>
    </Paper>
  )
}

export default GeriGraceForm
