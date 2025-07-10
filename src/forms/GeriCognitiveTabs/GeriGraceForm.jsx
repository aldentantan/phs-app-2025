
import React, { useContext, useEffect, useState } from 'react'
import Divider from '@mui/material/Divider'
import Paper from '@mui/material/Paper'
import CircularProgress from '@mui/material/CircularProgress'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { submitForm } from '../../api/api.jsx'
import { FormContext } from '../../api/utils.js'
import { getSavedData } from '../../services/mongoDB'
import '../fieldPadding.css'
import '../forms.css'


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
        {() => (
          <Form className='fieldPadding'>
            <div className='form--div'>
              <h1>G-RACE</h1>
              <h3>MMSE score (_/_):</h3>
              <Field as='textarea' name='GRACE1' className='form-control' />
              <ErrorMessage name='GRACE1' component='div' className='error' />
              <h3>Need referral to G-RACE associated polyclinics/partners?</h3>
              <div role='group' aria-labelledby='GRACE2'>
                {radioOptions.map((opt) => (
                  <label key={opt.value} style={{ marginRight: 16 }}>
                    <Field type='radio' name='GRACE2' value={opt.value} /> {opt.label}
                  </label>
                ))}
                <ErrorMessage name='GRACE2' component='div' className='error' />
              </div>
              <h3>Polyclinic:</h3>
              <Field as='textarea' name='GRACE3' className='form-control' />
              <ErrorMessage name='GRACE3' component='div' className='error' />
              <h3>Referral to Doctor&apos;s Consult?</h3>
              <p>For geri patients who may be depressed</p>
              <div role='group' aria-labelledby='GRACE4'>
                {radioOptions.map((opt) => (
                  <label key={opt.value} style={{ marginRight: 16 }}>
                    <Field type='radio' name='GRACE4' value={opt.value} /> {opt.label}
                  </label>
                ))}
                <ErrorMessage name='GRACE4' component='div' className='error' />
              </div>
              <h3>Reason for referral: </h3>
              <Field as='textarea' name='GRACE5' className='form-control' />
              <ErrorMessage name='GRACE5' component='div' className='error' />
              <br />
            </div>
            <div>{loading ? <CircularProgress /> : <button type='submit'>Submit</button>}</div>
            <Divider />
          </Form>
        )}
      </Formik>
    </Paper>
  )
}

export default GeriGraceForm