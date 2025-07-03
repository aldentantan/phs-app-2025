
import React, { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Divider from '@mui/material/Divider'
import Paper from '@mui/material/Paper'
import CircularProgress from '@mui/material/CircularProgress'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { submitForm } from '../../api/api.js'
import { FormContext } from '../../api/utils.js'
import { getSavedData } from '../../services/mongoDB'
import '../fieldPadding.css'
import '../forms.css'


const validationSchema = Yup.object({
  WH1: Yup.string().oneOf(['Yes', 'No']).required('Required'),
  WH2shortAns: Yup.string().notRequired(),
})


const formName = 'geriWhForm'

const GeriWhForm = (props) => {
  const { patientId } = useContext(FormContext)
  const [loading, setLoading] = useState(false)
  const { changeTab, nextTab } = props
  const [initialValues, setInitialValues] = useState({
    WH1: '',
    WH2shortAns: '',
  })
  const navigate = useNavigate()

  useEffect(() => {
    const fetchData = async () => {
      const savedData = await getSavedData(patientId, formName)
      setInitialValues({
        WH1: savedData.WH1 || '',
        WH2shortAns: savedData.WH2shortAns || '',
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
              <h1>Whispering Hearts</h1>
              <h3>Patient has signed up for referral with Whispering Hearts.</h3>
              <div role='group' aria-labelledby='WH1'>
                {radioOptions.map((opt) => (
                  <label key={opt.value} style={{ marginRight: 16 }}>
                    <Field type='radio' name='WH1' value={opt.value} /> {opt.label}
                  </label>
                ))}
                <ErrorMessage name='WH1' component='div' className='error' />
              </div>
              <h3>Address of referral</h3>
              <Field as='textarea' name='WH2shortAns' className='form-control' />
              <ErrorMessage name='WH2shortAns' component='div' className='error' />
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

export default GeriWhForm