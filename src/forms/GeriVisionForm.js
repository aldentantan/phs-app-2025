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
  MenuItem,
  Checkbox,
  ListItemText,
  Select,
  InputLabel,
} from '@mui/material'
import Divider from '@mui/material/Divider'
import Paper from '@mui/material/Paper'
import Grid from '@mui/material/Grid'
import CircularProgress from '@mui/material/CircularProgress'
import Button from '@mui/material/Button'

import allForms from '../forms/forms.json'
import PopupText from 'src/utils/popupText'
import { submitForm } from '../api/api.js'
import { FormContext } from '../api/utils.js'
import { getSavedData } from '../services/mongoDB'
import './fieldPadding.css'

const validationSchema = Yup.object().shape({
  geriVisionQ1: Yup.string()
    .oneOf(['Yes (Specify in textbox )', 'No'], 'Please select an option')
    .required('Required'),
  geriVisionQ2: Yup.string().when('geriVisionQ1', {
    is: 'Yes (Specify in textbox )',
    then: Yup.string().required('Please specify the eye condition or surgery'),
  }),
  geriVisionQ3: Yup.string().required('Required'),
  geriVisionQ4: Yup.string().required('Required'),
  geriVisionQ5: Yup.string(),
  geriVisionQ6: Yup.string(),
  geriVisionQ7: Yup.string().oneOf(['CF2M', 'CF1M', 'HM', 'LP', 'NLP', 'NIL']),
  geriVisionQ8: Yup.array()
    .of(Yup.string().oneOf(['Refractive', 'Non-refractive', 'None']))
    .required('Required'),
  geriVisionQ9: Yup.array().of(Yup.string().oneOf(["Referred to Doctor's Consult"])),
  geriVisionQ10: Yup.string().oneOf(['Yes', 'No'], 'Please select an option').required('Required'),
  geriVisionQ11: Yup.string().when('geriVisionQ10', {
    is: 'Yes',
    then: Yup.string().required('Please specify'),
  }),
  geriVisionQ12: Yup.string().oneOf(['Yes', 'No'], 'Please select an option').required('Required'),
  geriVisionQ13: Yup.string().oneOf(['Yes', 'No'], 'Please select an option').required('Required'),
})

const formName = 'geriVisionForm'

const GeriVisionForm = () => {
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
                geriVisionQ1: saveData.geriVisionQ1 || '',
                geriVisionQ2: saveData.geriVisionQ2 || '',
                geriVisionQ3: saveData.geriVisionQ3 || '',
                geriVisionQ4: saveData.geriVisionQ4 || '',
                geriVisionQ5: saveData.geriVisionQ5 || '',
                geriVisionQ6: saveData.geriVisionQ6 || '',
                geriVisionQ7: saveData.geriVisionQ7 || '',
                geriVisionQ8: saveData.geriVisionQ8 || [],
                geriVisionQ9: saveData.geriVisionQ9 || [],
                geriVisionQ10: saveData.geriVisionQ10 || '',
                geriVisionQ11: saveData.geriVisionQ11 || '',
                geriVisionQ12: saveData.geriVisionQ12 || '',
                geriVisionQ13: saveData.geriVisionQ13 || '',
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
                        name='geriVisionQ1'
                        value={values.geriVisionQ1}
                        onChange={(e) => setFieldValue('geriVisionQ1', e.target.value)}
                      >
                        <FormControlLabel
                          value='Yes (Specify in textbox )'
                          control={<Radio />}
                          label='Yes (Specify in textbox)'
                        />
                        <FormControlLabel value='No' control={<Radio />} label='No' />
                      </RadioGroup>
                      <ErrorMessage name='geriVisionQ1' component='div' className='error' />
                    </FormControl>
                    {values.geriVisionQ1 === 'Yes (Specify in textbox )' && (
                      <PopupText qnNo='geriVisionQ1' triggerValue='Yes (Specify in textbox )'>
                        <h4>Explanation</h4>
                        <Field
                          as={TextField}
                          name='geriVisionQ2'
                          label='Geri - Vision Q2'
                          fullWidth
                          multiline
                          rows={4}
                          variant='outlined'
                        />
                        <ErrorMessage name='geriVisionQ2' component='div' className='error' />
                      </PopupText>
                    )}
                    <h3>2. Visual acuity (w/o pinhole occluder) - Right Eye 6/__</h3>
                    <Field
                      as={TextField}
                      name='geriVisionQ3'
                      label='Geri - Vision Q3'
                      type='number'
                      fullWidth
                      inputProps={{
                        inputMode: 'numeric',
                        pattern: '[0-9]*',
                      }}
                    />
                    <ErrorMessage name='geriVisionQ3' component='div' className='error' />
                    <h3>3. Visual acuity (w/o pinhole occluder) - Left Eye 6/__</h3>
                    <Field
                      as={TextField}
                      name='geriVisionQ4'
                      label='Geri - Vision Q4'
                      type='number'
                      fullWidth
                      inputProps={{
                        inputMode: 'numeric',
                        pattern: '[0-9]*',
                      }}
                    />
                    <ErrorMessage name='geriVisionQ4' component='div' className='error' />
                    <h3>
                      4. Visual acuity (with pinhole) *only if VA w/o pinhole is ≥ 6/12 - Right Eye
                      6/__
                    </h3>
                    <Field
                      as={TextField}
                      name='geriVisionQ5'
                      label='Geri - Vision Q5'
                      type='number'
                      fullWidth
                      inputProps={{
                        inputMode: 'numeric',
                        pattern: '[0-9]*',
                      }}
                    />
                    <ErrorMessage name='geriVisionQ5' component='div' className='error' />
                    <h3>
                      5. Visual acuity (with pinhole) *only if VA w/o pinhole is ≥ 6/12 - Left Eye
                      6/__
                    </h3>
                    <Field
                      as={TextField}
                      name='geriVisionQ6'
                      label='Geri - Vision Q6'
                      type='number'
                      fullWidth
                      inputProps={{
                        inputMode: 'numeric',
                        pattern: '[0-9]*',
                      }}
                    />
                    <ErrorMessage name='geriVisionQ6' component='div' className='error' />
                    <h3>
                      6. Is participant currently on any eye review/ consulting any eye specialist?
                    </h3>
                    <FormControl component='fieldset'>
                      <RadioGroup
                        name='geriVisionQ10'
                        value={values.geriVisionQ10}
                        onChange={(e) => setFieldValue('geriVisionQ10', e.target.value)}
                      >
                        <FormControlLabel value='Yes' control={<Radio />} label='Yes' />
                        <FormControlLabel value='No' control={<Radio />} label='No' />
                      </RadioGroup>
                      <ErrorMessage name='geriVisionQ10' component='div' className='error' />
                    </FormControl>
                    {values.geriVisionQ10 === 'Yes' && (
                      <>
                        <h4>Please specify:</h4>
                        <Field
                          as={TextField}
                          name='geriVisionQ11'
                          label='Geri - Vision Q11'
                          fullWidth
                          multiline
                          rows={4}
                          variant='outlined'
                        />
                        <ErrorMessage name='geriVisionQ11' component='div' className='error' />
                      </>
                    )}
                    <h3>7. Type of vision error?</h3>
                    <FormControl fullWidth>
                      <InputLabel>Geri - Vision Q8</InputLabel>
                      <Select
                        name='geriVisionQ8'
                        multiple
                        value={values.geriVisionQ8}
                        onChange={(e) => setFieldValue('geriVisionQ8', e.target.value)}
                        renderValue={(selected) => selected.join(', ')}
                      >
                        {['Refractive', 'Non-refractive', 'None'].map((option) => (
                          <MenuItem key={option} value={option}>
                            <Checkbox checked={values.geriVisionQ8.indexOf(option) > -1} />
                            <ListItemText primary={option} />
                          </MenuItem>
                        ))}
                      </Select>
                      <ErrorMessage name='geriVisionQ8' component='div' className='error' />
                    </FormControl>
                    <h4>
                      Please <u>refer to Doctor&apos;s Consult</u> if pinhole visual acuity is{' '}
                      <u>worse than 6/12</u>
                    </h4>
                    <FormControl fullWidth>
                      <InputLabel>Geri - Vision Q9</InputLabel>
                      <Select
                        name='geriVisionQ9'
                        multiple
                        value={values.geriVisionQ9}
                        onChange={(e) => setFieldValue('geriVisionQ9', e.target.value)}
                        renderValue={(selected) => selected.join(', ')}
                      >
                        <MenuItem value="Referred to Doctor's Consult">
                          <Checkbox
                            checked={
                              values.geriVisionQ9.indexOf("Referred to Doctor's Consult") > -1
                            }
                          />
                          <ListItemText primary="Referred to Doctor's Consult" />
                        </MenuItem>
                      </Select>
                    </FormControl>
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
                        name='geriVisionQ12'
                        value={values.geriVisionQ12}
                        onChange={(e) => setFieldValue('geriVisionQ12', e.target.value)}
                      >
                        <FormControlLabel value='Yes' control={<Radio />} label='Yes' />
                        <FormControlLabel value='No' control={<Radio />} label='No' />
                      </RadioGroup>
                      <ErrorMessage name='geriVisionQ12' component='div' className='error' />
                    </FormControl>
                    <h3>2. Referred to Social Services?</h3>
                    <FormControl component='fieldset'>
                      <RadioGroup
                        name='geriVisionQ13'
                        value={values.geriVisionQ13}
                        onChange={(e) => setFieldValue('geriVisionQ13', e.target.value)}
                      >
                        <FormControlLabel value='Yes' control={<Radio />} label='Yes' />
                        <FormControlLabel value='No' control={<Radio />} label='No' />
                      </RadioGroup>
                      <ErrorMessage name='geriVisionQ13' component='div' className='error' />
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

GeriVisionForm.contextType = FormContext

export default GeriVisionForm
