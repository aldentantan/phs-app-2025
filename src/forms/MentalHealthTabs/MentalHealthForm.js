import React, { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import SimpleSchema from 'simpl-schema'

import * as Yup from 'yup'
import { Formik, Form, Field, ErrorMessage, useFormikContext } from 'formik'
import {
  Checkbox,
  FormControlLabel,
  TextField,
  RadioGroup,
  Radio,
  FormLabel,
  Button,
  CircularProgress,
  Typography,
  Box,
  Divider,
  Paper,
} from '@mui/material'

import Grid from '@mui/material/Grid'

import { submitForm } from '../../api/api.js'
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

const schema = new SimpleSchema({
  SAMH1: Yup.string().oneOf(yesNo).required('Required'),
  SAMH2: Yup.string().oneOf(yesNo).required('Required'),
})

// const schema = Yup.object({
//   SAMH1: {
//     type: String,
//     allowedValues: ['Yes', 'No'],
//     optional: false,
//   },
//   SAMH2: {
//     type: String,
//     allowedValues: ['Yes', 'No'],
//     optional: false,
//   },
// })

const formName = 'mentalHealthForm'

const RadioField = ({ name, label, options }) => {
  const { values, handleChange } = useFormikContext()
  return (
    <div>
      <FormLabel>{label}</FormLabel>
      <RadioGroup name={name} value={values[name]} onChange={handleChange} row>
        {options.map((opt) => (
          <FormControlLabel
            key={opt.value}
            value={opt.value}
            control={<Radio />}
            label={opt.label}
          />
        ))}
      </RadioGroup>
      <ErrorMessage name={name} component='div' style={{ color: 'red' }} />
    </div>
  )
}

const MentalHealthForm = () => {
  const { patientId } = useContext(FormContext)
  const [loadingSidePanel, isLoadingSidePanel] = useState(true)
  const [initialValues, setInitialValues] = useState({
    SAMH1: '',
    SAMH2: '',
  })

  const [regi, setReg] = useState({})
  const [phq, setPHQ] = useState({})

  const navigate = useNavigate()

  useEffect(() => {
    const fetchData = async () => {
      const savedData = await getSavedData(patientId, formName)
      setInitialValues(savedData)

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

  const newForm = () => (
    <Formik
      validationSchema={schema}
      enableReinitialize
      initialValues={initialValues}
      onSubmit={async (values, { setSubmitting }) => {
        setSubmitting(true)
        const response = await submitForm(values, patientId, formName)
        if (response.result) {
          setSubmitting(false)
          setTimeout(() => {
            alert('Successfully submitted form')
            navigate('/app/dashboard', { replace: true })
          }, 80)
        } else {
          setSubmitting(false)
          setTimeout(() => {
            alert(`Unsuccessful. ${response.error}`)
          }, 80)
        }
      }}
    >
      {({ isSubmitting }) => (
        <Form>
          <div className='form--div'>
            <h3>Patient has attended mental health consultation?</h3>
            <RadioField name='SAMH1' label='SAMH1' options={formOptions.SAMH1} />
            <h3>Patient has signed up for follow-up with SAMH?</h3>
            <RadioField name='SAMH2' label='SAMH2' options={formOptions.SAMH2} />
          </div>
          <br />
          {isSubmitting ? (
            <CircularProgress />
          ) : (
            <Button type='submit' variant='contained' color='primary'>
              Submit
            </Button>
          )}
          <br />
          <Divider />
        </Form>
      )}
    </Formik>
  )

  return (
    <Paper elevation={2} p={0} m={0}>
      <Grid display='flex' flexDirection='row'>
        <Grid xs={9}>
          <Paper elevation={2} p={0} m={0}>
            {newForm()}
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

              <p className='blue'>DOC11: UNKNOWN DATA</p>

              <p className='blue'>DOC12: UNKNOWN DATA</p>

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
