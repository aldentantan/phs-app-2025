import React, { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import * as Yup from 'yup'
import { Button, CircularProgress, Paper, Grid } from '@mui/material'
import { Formik, Form, FastField } from 'formik'

import { submitForm } from '../../api/api.jsx'
import { FormContext } from '../../api/utils.js'
import { getSavedData } from '../../services/mongoDB.js'
import allForms from '../forms.json'
import '../fieldPadding.css'

import CustomRadioGroup from '../../components/form-components/CustomRadioGroup'

const dayRangeFormOptions = [
  { label: '0 - Not at all', value: '0 - Not at all' },
  { label: '1 - Several days', value: '1 - Several days' },
  { label: '2 - More than half the days', value: '2 - More than half the days' },
  { label: '3 - Nearly everyday', value: '3 - Nearly everyday' },
]

const yesNoOptions = [
  { label: 'Yes', value: 'Yes' },
  { label: 'No', value: 'No' },
]

const formName = 'mentalHealthForm'

const validationSchema = Yup.object({
  SAMH1: Yup.string().oneOf(['Yes', 'No']).required('Required'),
  SAMH2: Yup.string().oneOf(['Yes', 'No']).required('Required'),
})

const MentalHealthForm = () => {
  const { patientId } = useContext(FormContext)
  const [loadingSidePanel, isLoadingSidePanel] = useState(true)
  const [loading, setLoading] = useState(false)
  const [savedData, setSavedData] = useState({})

  const [regi, setReg] = useState({})
  const [phq, setPHQ] = useState({})
  const navigate = useNavigate()

  useEffect(() => {
    const fetchData = async () => {
      const savedData = await getSavedData(patientId, formName)
      setSavedData(savedData)

      const regData = getSavedData(patientId, allForms.registrationForm)
      const phqData = getSavedData(patientId, allForms.geriPhqForm)

      Promise.all([regData, phqData]).then((result) => {
        setReg(result[0])
        setPHQ(result[1])
        isLoadingSidePanel(false)
      })
    }

    fetchData()
  }, [])

  const handleSubmit = async (values, { setSubmitting }) => {
    setLoading(true)
    const response = await submitForm(values, patientId, formName)
    setLoading(false)
    if (response.result) {
      alert('Successfully submitted form')
      navigate('/app/dashboard', { replace: true })
    } else {
      alert(`Unsuccessful. ${response.error}`)
    }
    setSubmitting(false)
  }

  return (
    <Paper elevation={2}>
      <Grid display='flex' flexDirection='row'>
        <Grid xs={9}>
          <Paper elevation={2}>
            <Formik
              initialValues={{
                SAMH1: savedData?.SAMH1 || '',
                SAMH2: savedData?.SAMH2 || '',
              }}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
              enableReinitialize={true}
            >
              {({ isValid }) => (
                <Form className='fieldPadding'>
                  <div className='form--div'>
                    <h3>Patient has attended mental health consultation?</h3>
                    <FastField
                      name='SAMH1'
                      label='SAMH1'
                      component={CustomRadioGroup}
                      options={yesNoOptions}
                      row
                    />

                    <h3>Patient has signed up for follow-up with SAMH?</h3>
                    <FastField
                      name='SAMH2'
                      label='SAMH2'
                      component={CustomRadioGroup}
                      options={yesNoOptions}
                      row
                    />
                  </div>
                  <br />
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
              <h2>Patient Info</h2>
              {regi && regi.registrationQ4 ? (
                <p className='blue'>Age: {regi.registrationQ4}</p>
              ) : (
                <p className='blue'>Age: nil</p>
              )}

              <p className='blue'>PHQ Score: {phq.PHQ10}</p>
              <p className='underlined'>Would the patient benefit from counselling:</p>
              <p className='blue'>{phq.PHQ11}</p>
              <p className='blue'>{phq.PHQShortAns11}</p>
            </div>
          )}
        </Grid>
      </Grid>
    </Paper>
  )
}

MentalHealthForm.contextType = FormContext

export default MentalHealthForm
