import React, { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import {
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  TextField,
  Checkbox,
} from '@mui/material'
import Divider from '@mui/material/Divider'
import Paper from '@mui/material/Paper'
import Grid from '@mui/material/Grid'
import CircularProgress from '@mui/material/CircularProgress'
import Button from '@mui/material/Button'

import allForms from '../forms/forms.json'
import PopupText from 'src/utils/popupText'
import { submitForm } from '../api/api.jsx'
import { FormContext } from '../api/utils.js'
import { getSavedData } from '../services/mongoDB'
import './fieldPadding.css'

const validationSchema = Yup.object().shape({
  OphthalQ1: Yup.string()
    .oneOf(['Yes (Specify in textbox )', 'No'], 'Please select an option')
    .required('Required'),
  OphthalQ2: Yup.string().when('OphthalQ1', {
    is: 'Yes (Specify in textbox )',
    then: (schema) => schema.required('Please specify the eye condition or surgery'),
    otherwise: (schema) => schema,
  }),
  OphthalQ3: Yup.string().required('Required'),
  OphthalQ4: Yup.string().required('Required'),
  OphthalQ5: Yup.string(),
  OphthalQ6: Yup.string(),
  OphthalQ7: Yup.string().oneOf(['CF2M', 'CF1M', 'HM', 'LP', 'NLP', 'NIL']),
  OphthalQ8: Yup.array()
    .of(Yup.string().oneOf(['Refractive', 'Non-refractive', 'None']))
    .required('Required'),
  OphthalQ9: Yup.array().of(Yup.string().oneOf(["Referred to Doctor's Consult"])),
  OphthalQ10: Yup.string().oneOf(['Yes', 'No'], 'Please select an option').required('Required'),
  OphthalQ11: Yup.string().when('OphthalQ10', {
    is: 'Yes',
    then: (schema) => schema.required('Please specify'),
    otherwise: (schema) => schema,
  }),
  OphthalQ12: Yup.string().oneOf(['Yes', 'No'], 'Please select an option').required('Required'),
  OphthalQ13: Yup.string().oneOf(['Yes', 'No'], 'Please select an option').required('Required'),
})

const formName = 'OphthalForm'

const OphthalForm = () => {
  const { patientId } = useContext(FormContext)
  const [loading, setLoading] = useState(false)
  const [loadingSidePanel, setLoadingSidePanel] = useState(true)
  const [saveData, setSaveData] = useState({})
  const [hxHCSR, setHxHCSR] = useState({})
  const navigate = useNavigate()

  useEffect(() => {
    const fetchData = async () => {
      const savedData = await getSavedData(patientId, formName)
      setSaveData(savedData)

      const hcsrData = getSavedData(patientId, allForms.hxHcsrForm)

      Promise.all([hcsrData]).then((result) => {
        setHxHCSR(result[0])
        setLoadingSidePanel(false)
      })
    }
    fetchData()
  }, [patientId])

  const handleSubmit = async (values, { setSubmitting }) => {
    setLoading(true)
    const response = await submitForm(values, patientId, formName)
    if (response.result) {
      setLoading(false)
      setTimeout(() => {
        alert('Successfully submitted form')
        navigate('/app/dashboard', { replace: true })
      }, 80)
    } else {
      setLoading(false)
      setTimeout(() => {
        alert(`Unsuccessful. ${response.error}`)
      }, 80)
    }
    setSubmitting(false)
  }

  return (
    <Paper elevation={2} p={0} m={0}>
      <Grid display='flex' flexDirection='row'>
        <Grid xs={9}>
          <Paper elevation={2} p={0} m={0}>
            <Formik
              initialValues={{
                OphthalQ1: saveData.OphthalQ1 || '',
                OphthalQ2: saveData.OphthalQ2 || '',
                OphthalQ3: saveData.OphthalQ3 || '',
                OphthalQ4: saveData.OphthalQ4 || '',
                OphthalQ5: saveData.OphthalQ5 || '',
                OphthalQ6: saveData.OphthalQ6 || '',
                OphthalQ7: saveData.OphthalQ7 || '',
                OphthalQ8: saveData.OphthalQ8 || [],
                OphthalQ9: saveData.OphthalQ9 || [],
                OphthalQ10: saveData.OphthalQ10 || '',
                OphthalQ11: saveData.OphthalQ11 || '',
                OphthalQ12: saveData.OphthalQ12 || '',
                OphthalQ13: saveData.OphthalQ13 || '',
              }}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
              enableReinitialize
            >
              {({ values, setFieldValue }) => (
                <Form className='fieldPadding'>
                  <div className='form--div'>
                    <h1>VISION SCREENING</h1>
                    <h2>Non-Refractive Error</h2>
                    <h3>1. Previous eye condition or surgery</h3>
                    <FormControl component='fieldset'>
                      <RadioGroup
                        name='OphthalQ1'
                        value={values.OphthalQ1}
                        onChange={(e) => setFieldValue('OphthalQ1', e.target.value)}
                      >
                        <FormControlLabel
                          value='Yes (Specify in textbox )'
                          control={<Radio />}
                          label='Yes (Specify in textbox)'
                        />
                        <FormControlLabel value='No' control={<Radio />} label='No' />
                      </RadioGroup>
                      <ErrorMessage name='OphthalQ1' component='div' className='error' />
                    </FormControl>
                    <PopupText qnNo='OphthalQ1' triggerValue='Yes (Specify in textbox )'>
                      <h4>Explanation</h4>
                      <Field
                        as={TextField}
                        name='OphthalQ2'
                        label='Ophthal Q2'
                        fullWidth
                        multiline
                        rows={4}
                        variant='outlined'
                      />
                      <ErrorMessage name='OphthalQ2' component='div' className='error' />
                    </PopupText>
                    <h3>2. Visual acuity (w/o pinhole occluder) - Right Eye 6/__</h3>
                    <Field
                      as={TextField}
                      name='OphthalQ3'
                      label='Ophthal Q3'
                      type='number'
                      fullWidth
                      inputProps={{
                        inputMode: 'numeric',
                        pattern: '[0-9]*',
                      }}
                    />
                    <ErrorMessage name='OphthalQ3' component='div' className='error' />
                    <h3>3. Visual acuity (w/o pinhole occluder) - Left Eye 6/__</h3>
                    <Field
                      as={TextField}
                      name='OphthalQ4'
                      label='Ophthal Q4'
                      type='number'
                      fullWidth
                      inputProps={{
                        inputMode: 'numeric',
                        pattern: '[0-9]*',
                      }}
                    />
                    <ErrorMessage name='OphthalQ4' component='div' className='error' />
                    <h3>
                      4. Visual acuity (with pinhole) *only if VA w/o pinhole is ≥ 6/12 - Right Eye
                      6/__
                    </h3>
                    <Field
                      as={TextField}
                      name='OphthalQ5'
                      label='Ophthal Q5'
                      type='number'
                      fullWidth
                      inputProps={{
                        inputMode: 'numeric',
                        pattern: '[0-9]*',
                      }}
                    />
                    <ErrorMessage name='OphthalQ5' component='div' className='error' />
                    <h3>
                      5. Visual acuity (with pinhole) *only if VA w/o pinhole is ≥ 6/12 - Left Eye
                      6/__
                    </h3>
                    <Field
                      as={TextField}
                      name='OphthalQ6'
                      label='Ophthal Q6'
                      type='number'
                      fullWidth
                      inputProps={{
                        inputMode: 'numeric',
                        pattern: '[0-9]*',
                      }}
                    />
                    <ErrorMessage name='OphthalQ6' component='div' className='error' />
                    <h3>
                      6. Is participant currently on any eye review/ consulting any eye specialist?
                    </h3>
                    <FormControl component='fieldset'>
                      <RadioGroup
                        name='OphthalQ10'
                        value={values.OphthalQ10}
                        onChange={(e) => setFieldValue('OphthalQ10', e.target.value)}
                      >
                        <FormControlLabel value='Yes' control={<Radio />} label='Yes' />
                        <FormControlLabel value='No' control={<Radio />} label='No' />
                      </RadioGroup>
                      <ErrorMessage name='OphthalQ10' component='div' className='error' />
                    </FormControl>
                    <PopupText qnNo='OphthalQ10' triggerValue='Yes'>
                      <h4>Please specify:</h4>
                      <Field
                        as={TextField}
                        name='OphthalQ11'
                        label='Ophthal Q11'
                        fullWidth
                        multiline
                        rows={4}
                        variant='outlined'
                      />
                      <ErrorMessage name='OphthalQ11' component='div' className='error' />
                    </PopupText>
                    <h3>7. Type of vision error?</h3>
                    <FormControl component='fieldset'>
                      <RadioGroup
                        name='OphthalQ8'
                        value={values.OphthalQ8[0] || ''}
                        onChange={(e) => setFieldValue('OphthalQ8', [e.target.value])}
                      >
                        {['Refractive', 'Non-refractive', 'None'].map((option) => (
                          <FormControlLabel
                            key={option}
                            value={option}
                            control={<Radio />}
                            label={option}
                          />
                        ))}
                      </RadioGroup>
                      <ErrorMessage name='OphthalQ8' component='div' className='error' />
                    </FormControl>
                    <h4>
                      Please <u>refer to Doctor&apos;s Consult</u> if pinhole visual acuity is{' '}
                      <u>worse than 6/12</u>
                    </h4>
                    <FormControlLabel
                      control={
                        <Checkbox
                          name='OphthalQ9'
                          checked={values.OphthalQ9.includes("Referred to Doctor's Consult")}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFieldValue('OphthalQ9', ["Referred to Doctor's Consult"])
                            } else {
                              setFieldValue('OphthalQ9', [])
                            }
                          }}
                        />
                      }
                      label="Referred to Doctor's Consult"
                    />
                    <h2>Refractive Error</h2>
                    Senior Citizens are eligible to receiving subsidy for spectacles under the
                    Senior Mobility Fund (SMF) provided they qualify for the following:
                    <ul>
                      <li>
                        Have a household monthly income per person of $2,000 and below OR Annual
                        Value (AV) of residence reflected on NRIC of $13,000 and below for
                        households with no income
                      </li>
                      <li>
                        Be living in the community (not residing in a nursing home or sheltered
                        home).
                      </li>
                      <li>First time SMF applicant</li>
                      <li>
                        Be assessed by a qualified assessor on the type of device required when
                        applicable.
                      </li>
                      <li>
                        Not concurrently receive (or apply for) any other public or private grants,
                        or subsidies.
                      </li>
                    </ul>
                    <h3>1. Does the participant wish to apply for the Senior Mobility Fund?</h3>
                    <FormControl component='fieldset'>
                      <RadioGroup
                        name='OphthalQ12'
                        value={values.OphthalQ12}
                        onChange={(e) => setFieldValue('OphthalQ12', e.target.value)}
                      >
                        <FormControlLabel value='Yes' control={<Radio />} label='Yes' />
                        <FormControlLabel value='No' control={<Radio />} label='No' />
                      </RadioGroup>
                      <ErrorMessage name='OphthalQ12' component='div' className='error' />
                    </FormControl>
                    <h3>2. Referred to Social Services?</h3>
                    <FormControl component='fieldset'>
                      <RadioGroup
                        name='OphthalQ13'
                        value={values.OphthalQ13}
                        onChange={(e) => setFieldValue('OphthalQ13', e.target.value)}
                      >
                        <FormControlLabel value='Yes' control={<Radio />} label='Yes' />
                        <FormControlLabel value='No' control={<Radio />} label='No' />
                      </RadioGroup>
                      <ErrorMessage name='OphthalQ13' component='div' className='error' />
                    </FormControl>
                  </div>

                  <div>
                    {loading ? (
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
              <h2>Patient History</h2>
              {hxHCSR ? (
                <>
                  <p>Does participant complain of any vision problems: {hxHCSR.hxHcsrQ6}</p>
                  <p>participant specified: {hxHCSR.hxHcsrShortAnsQ6}</p>
                </>
              ) : (
                <p className='red'>nil hxHCSR data</p>
              )}
            </div>
          )}
        </Grid>
      </Grid>
    </Paper>
  )
}

OphthalForm.contextType = FormContext

export default OphthalForm
