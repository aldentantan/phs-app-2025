import { useContext, useEffect, useState } from 'react'
import { Paper, CircularProgress, Button } from '@mui/material'
import { Formik, Form, FastField } from 'formik'
import * as Yup from 'yup'
import { submitForm } from '../../api/api.jsx'
import { FormContext } from '../../api/utils.js'
import { getSavedData } from '../../services/mongoDB'
import '../fieldPadding.css'
import '../forms.css'

import CustomRadioGroup from '../../components/form-components/CustomRadioGroup.jsx'
import CustomTextField from '../../components/form-components/CustomTextField.jsx'
import ErrorNotification from '../../components/form-components/ErrorNotification.jsx'

import PopupText from 'src/utils/popupText'
import { useNavigate } from 'react-router'

const validationSchema = Yup.object({
  GRACE1: Yup.string().notRequired(),
  GRACE2: Yup.string().oneOf(['Yes', 'No']).required('Required'),
  GRACE3: Yup.string().notRequired(),
  GRACE4: Yup.string().oneOf(['Yes', 'No']).required('Required'),
  GRACE5: Yup.string().notRequired(),
})

const formName = 'geriGraceForm'

const GeriGraceForm = () => {
  const { patientId } = useContext(FormContext)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
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
            //const event = null
            setTimeout(() => {
              alert('Successfully submitted form')
              navigate('/app/dashboard', { replace: true })
            }, 80)
          } else {
            setTimeout(() => {
              alert(`Unsuccessful. ${response.error}`)
            }, 80)
          }
        }}
      >
        {(formikProps) => {
          return (
            <Form className='fieldPadding'>
              <div className='form--div'>
                <h1>G-RACE</h1>

                <h3>MMSE score (_/_):</h3>
                <FastField
                  name='GRACE1'
                  label='GRACE1'
                  component={CustomTextField}
                  fullWidth
                  rows={1}
                />

                <h3>Need referral to G-RACE associated polyclinics/partners?</h3>
                <FastField
                  name='GRACE2'
                  label='GRACE2'
                  component={CustomRadioGroup}
                  options={radioOptions}
                  row
                />
                <PopupText qnNo='GRACE2' triggerValue='Yes'>
                  <h3>Polyclinic:</h3>
                  <FastField
                    name='GRACE3'
                    label='GRACE3'
                    component={CustomTextField}
                    fullWidth
                    rows={1}
                  />
                </PopupText>

                <h3>Referral to Doctor&apos;s Consult?</h3>
                <p>For geri patients who may be depressed</p>
                <FastField
                  name='GRACE4'
                  label='GRACE4'
                  component={CustomRadioGroup}
                  options={radioOptions}
                  row
                />
                <PopupText qnNo='GRACE4' triggerValue='Yes'>
                  <h3>Reason for referral:</h3>
                  <FastField
                    name='GRACE5'
                    label='Reason for referral'
                    component={CustomTextField}
                    fullWidth
                    multiline
                    rows={3}
                  />
                </PopupText>
              </div>

              <ErrorNotification 
                show={formikProps.submitCount > 0 && Object.keys(formikProps.errors || {}).length > 0}
                message="Please fill in all required fields correctly."
              />

              <div>
                {loading ? (
                  <CircularProgress />
                ) : (
                  <Button type='submit' variant='contained' color='primary'>
                    Submit
                  </Button>
                )}
              </div>
            </Form>
          )
        }}
      </Formik>
    </Paper>
  )
}

export default GeriGraceForm