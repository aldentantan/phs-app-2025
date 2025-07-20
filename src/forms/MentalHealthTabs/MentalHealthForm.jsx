import React, { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import * as Yup from 'yup'
import { useFormik } from 'formik'
import {
  FormControlLabel,
  RadioGroup,
  Radio,
  Button,
  CircularProgress,
  Typography,
  Paper,
} from '@mui/material'

import Grid from '@mui/material/Grid'

import { submitForm } from '../../api/api.jsx'
import { FormContext } from '../../api/utils.js'
import { getSavedData } from '../../services/mongoDB.js'
import allForms from '../forms.json'
import '../fieldPadding.css'

const dayRangeFormOptions = [
  { label: '0 - Not at all', value: '0 - Not at all' },
  { label: '1 - Several days', value: '1 - Several days' },
  { label: '2 - More than half the days', value: '2 - More than half the days' },
  { label: '3 - Nearly everyday', value: '3 - Nearly everyday' },
]
const yesNo = ['Yes', 'No']

const formName = 'mentalHealthForm'

const validationSchema = Yup.object({
  SAMH1: Yup.string().oneOf(yesNo).required('Required'),
  SAMH2: Yup.string().oneOf(yesNo).required('Required'),
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
      // const docData = getSavedData(patientId, allForms.triageForm)
      const phqData = getSavedData(patientId, allForms.geriPhqForm)

      Promise.all([regData, phqData]).then((result) => {
        setReg(result[0]),
          // setHxFamily(result[1])
          setPHQ(result[1])
        isLoadingSidePanel(false)
      })
    }
    fetchData()
  }, [])

  const formOptions = {
    PHQ1: dayRangeFormOptions,
    PHQ2: dayRangeFormOptions,
    PHQ3: dayRangeFormOptions,
    PHQ4: dayRangeFormOptions,
    PHQ5: dayRangeFormOptions,
    PHQ6: dayRangeFormOptions,
    PHQ7: dayRangeFormOptions,
    PHQ8: dayRangeFormOptions,
    PHQ9: dayRangeFormOptions,
    PHQ11: [
      {
        label: 'Yes',
        value: 'Yes',
      },
      { label: 'No', value: 'No' },
    ],
    SAMH1: [
      {
        label: 'Yes',
        value: 'Yes',
      },
      { label: 'No', value: 'No' },
    ],
    SAMH2: [
      {
        label: 'Yes',
        value: 'Yes',
      },
      { label: 'No', value: 'No' },
    ],
  }

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      SAMH1: savedData?.SAMH1 || '',
      SAMH2: savedData?.SAMH2 || '',
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
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
    },
  })

  return (
    <Paper elevation={2} p={0} m={0}>
      <Grid display='flex' flexDirection='row'>
        <Grid xs={9}>
          <Paper elevation={2} p={0} m={0}>
            <form onSubmit={formik.handleSubmit}>
              <div className='form--div'>
                <h3>Patient has attended mental health consultation?</h3>
                <RadioGroup name='SAMH1' value={formik.values.SAMH1} onChange={formik.handleChange}>
                  {formOptions.SAMH1.map(({ label, value }) => (
                    <FormControlLabel key={value} value={value} control={<Radio />} label={label} />
                  ))}
                </RadioGroup>
                {formik.touched.SAMH1 && formik.errors.SAMH1 && (
                  <Typography color='error'>{formik.errors.SAMH1}</Typography>
                )}
                <h3>Patient has signed up for follow-up with SAMH?</h3>
                <RadioGroup name='SAMH2' value={formik.values.SAMH2} onChange={formik.handleChange}>
                  {formOptions.SAMH2.map(({ label, value }) => (
                    <FormControlLabel key={value} value={value} control={<Radio />} label={label} />
                  ))}
                </RadioGroup>
                {formik.touched.SAMH2 && formik.errors.SAMH2 && (
                  <Typography color='error'>{formik.errors.SAMH2}</Typography>
                )}
              </div>
              <br />
              <div>
                {loading ? (
                  <CircularProgress />
                ) : (
                  <Button type='submit' variant='contained' color='primary'>
                    Submit
                  </Button>
                )}
              </div>
            </form>
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
              <p className='blue'>{phq.PHQ11},</p>
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
