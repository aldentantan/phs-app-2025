import React, { Fragment, useContext, useEffect, useState } from 'react'
import * as Yup from 'yup'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import {
  RadioGroup,
  Radio,
  FormControlLabel,
  FormControl,
  FormLabel,
  Checkbox,
  TextField,
  FormHelperText,
} from '@mui/material'
import Divider from '@mui/material/Divider'
import Paper from '@mui/material/Paper'
import CircularProgress from '@mui/material/CircularProgress'
import Button from '@mui/material/Button'
import { submitForm } from '../api/api.js'
import { FormContext } from '../api/utils.js'
import { getSavedData } from '../services/mongoDB'
import './fieldPadding.css'
import Grid from '@mui/material/Grid'
import allForms from './forms.json'
import { useNavigate } from 'react-router-dom'

const validationSchema = Yup.object().shape({
  geriAudiometryQ1: Yup.string()
    .oneOf(['Yes', 'No'], 'Please select an option')
    .required('This field is required'),
  geriAudiometryQ2: Yup.string().oneOf(['Pass', 'Refer']),
  geriAudiometryQ3: Yup.string().oneOf(['Pass', 'Refer']),
  geriAudiometryQ4: Yup.string().oneOf(['Pass', 'Refer']),
  geriAudiometryQ5: Yup.array().of(Yup.string().oneOf(['500Hz', '1000Hz', '2000Hz', '4000Hz'])),
  geriAudiometryQ6: Yup.array().of(Yup.string().oneOf(['500Hz', '1000Hz', '2000Hz', '4000Hz'])),
  geriAudiometryQ7: Yup.array().of(Yup.string().oneOf(['500Hz', '1000Hz', '2000Hz', '4000Hz'])),
  geriAudiometryQ8: Yup.array().of(Yup.string().oneOf(['500Hz', '1000Hz', '2000Hz', '4000Hz'])),
  geriAudiometryQ9: Yup.string().oneOf(['Yes', 'No']),
  geriAudiometryQ10: Yup.string(),
  geriAudiometryQ11: Yup.string().oneOf(['Yes', 'No']),
  geriAudiometryQ12: Yup.string(),
  geriAudiometryQ13: Yup.string()
    .oneOf([
      'There is some hearing loss detected. This test is not diagnostic, and the participant needs to undergo a more comprehensive hearing assessment.',
      "There is no hearing loss detected, the participant's hearing is normal.",
    ])
    .required('This field is required'),
})

const formName = 'geriAudiometryForm'
const GeriAudiometryForm = () => {
  const { patientId } = useContext(FormContext)
  const [loading, setLoading] = useState(false)
  const [loadingSidePanel, setLoadingSidePanel] = useState(true)
  const [saveData, setSaveData] = useState({})
  const [hcsr, setHcsr] = useState({})
  const [pmhx, setPMHX] = useState({})
  const navigate = useNavigate()

  useEffect(() => {
    const loadForms = async () => {
      const savedData = getSavedData(patientId, formName)
      const hcsrData = getSavedData(patientId, allForms.hxHcsrForm)
      const pmhxData = getSavedData(patientId, allForms.hxNssForm)

      Promise.all([savedData, hcsrData, pmhxData]).then((result) => {
        setSaveData(result[0])
        setHcsr(result[1])
        setPMHX(result[2])
        setLoadingSidePanel(false)
      })
    }
    loadForms()
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
      console.error('Submission error:', error)
      alert('An error occurred during submission')
    } finally {
      setLoading(false)
      setSubmitting(false)
    }
  }

  return (
    <Paper elevation={2} p={0} m={0}>
      <Grid display='flex' flexDirection='row'>
        <Grid xs={9}>
          <Paper elevation={2} p={0} m={0}>
            <Formik
              initialValues={{
                geriAudiometryQ1: saveData.geriAudiometryQ1 || '',
                geriAudiometryQ2: saveData.geriAudiometryQ2 || '',
                geriAudiometryQ3: saveData.geriAudiometryQ3 || '',
                geriAudiometryQ4: saveData.geriAudiometryQ4 || '',
                geriAudiometryQ5: saveData.geriAudiometryQ5 || [],
                geriAudiometryQ6: saveData.geriAudiometryQ6 || [],
                geriAudiometryQ7: saveData.geriAudiometryQ7 || [],
                geriAudiometryQ8: saveData.geriAudiometryQ8 || [],
                geriAudiometryQ9: saveData.geriAudiometryQ9 || '',
                geriAudiometryQ10: saveData.geriAudiometryQ10 || '',
                geriAudiometryQ11: saveData.geriAudiometryQ11 || '',
                geriAudiometryQ12: saveData.geriAudiometryQ12 || '',
                geriAudiometryQ13: saveData.geriAudiometryQ13 || '',
              }}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
              enableReinitialize
            >
              {({ errors, touched, isSubmitting }) => (
                <Form className='fieldPadding'>
                  <div className='form--div'>
                    <h1>AUDIOMETRY</h1>
                    <h3>Did participant visit Audiometry Booth by NUS audiology team?</h3>
                    <FormControl
                      component='fieldset'
                      error={touched.geriAudiometryQ1 && !!errors.geriAudiometryQ1}
                    >
                      <RadioGroup name='geriAudiometryQ1'>
                        <FormControlLabel value='Yes' control={<Radio />} label='Yes' />
                        <FormControlLabel value='No' control={<Radio />} label='No' />
                      </RadioGroup>
                      <FormHelperText>
                        {touched.geriAudiometryQ1 && errors.geriAudiometryQ1}
                      </FormHelperText>
                    </FormControl>

                    <h2>External Ear Examination</h2>
                    <h3>Visual Ear Examination (Left Ear):</h3>
                    <FormControl component='fieldset'>
                      <RadioGroup name='geriAudiometryQ2'>
                        <FormControlLabel value='Pass' control={<Radio />} label='Pass' />
                        <FormControlLabel value='Refer' control={<Radio />} label='Refer' />
                      </RadioGroup>
                    </FormControl>

                    <h3>Visual Ear Examination (Right Ear)</h3>
                    <FormControl component='fieldset'>
                      <RadioGroup name='geriAudiometryQ3'>
                        <FormControlLabel value='Pass' control={<Radio />} label='Pass' />
                        <FormControlLabel value='Refer' control={<Radio />} label='Refer' />
                      </RadioGroup>
                    </FormControl>

                    <h2>Hearing Test</h2>
                    <h3>Practice Tone (500Hz at 60dB in &quot;better&quot; ear):</h3>
                    <FormControl component='fieldset'>
                      <RadioGroup name='geriAudiometryQ4'>
                        <FormControlLabel value='Pass' control={<Radio />} label='Pass' />
                        <FormControlLabel value='Refer' control={<Radio />} label='Refer' />
                      </RadioGroup>
                    </FormControl>

                    <h3>Pure Tone Screening at 25dB for Left Ear: </h3>
                    <p>(Tick checkbox for Response, DO NOT tick checkbox if NO response):</p>
                    <FormControl component='fieldset'>
                      <FormLabel component='legend'>Select frequencies</FormLabel>
                      {['500Hz', '1000Hz', '2000Hz', '4000Hz'].map((freq) => (
                        <FormControlLabel
                          key={freq}
                          control={
                            <Field
                              type='checkbox'
                              name='geriAudiometryQ5'
                              value={freq}
                              as={Checkbox}
                            />
                          }
                          label={freq}
                        />
                      ))}
                    </FormControl>

                    <h3>Pure Tone Screening at 25dB for Right Ear:</h3>
                    <p>(Tick checkbox for Response, DO NOT tick checkbox if NO response):</p>
                    <FormControl component='fieldset'>
                      <FormLabel component='legend'>Select frequencies</FormLabel>
                      {['500Hz', '1000Hz', '2000Hz', '4000Hz'].map((freq) => (
                        <FormControlLabel
                          key={freq}
                          control={
                            <Field
                              type='checkbox'
                              name='geriAudiometryQ6'
                              value={freq}
                              as={Checkbox}
                            />
                          }
                          label={freq}
                        />
                      ))}
                    </FormControl>

                    <h3>Pure Tone Screening at 40dB for Left Ear:</h3>
                    <p>(Tick checkbox for Response, DO NOT tick checkbox if NO response):</p>
                    <FormControl component='fieldset'>
                      <FormLabel component='legend'>Select frequencies</FormLabel>
                      {['500Hz', '1000Hz', '2000Hz', '4000Hz'].map((freq) => (
                        <FormControlLabel
                          key={freq}
                          control={
                            <Field
                              type='checkbox'
                              name='geriAudiometryQ7'
                              value={freq}
                              as={Checkbox}
                            />
                          }
                          label={freq}
                        />
                      ))}
                    </FormControl>

                    <h3>Pure Tone Screening at 40dB for Right Ear:</h3>
                    <p>(Tick checkbox for Response, DO NOT tick checkbox if NO response):</p>
                    <FormControl component='fieldset'>
                      <FormLabel component='legend'>Select frequencies</FormLabel>
                      {['500Hz', '1000Hz', '2000Hz', '4000Hz'].map((freq) => (
                        <FormControlLabel
                          key={freq}
                          control={
                            <Field
                              type='checkbox'
                              name='geriAudiometryQ8'
                              value={freq}
                              as={Checkbox}
                            />
                          }
                          label={freq}
                        />
                      ))}
                    </FormControl>

                    <h4>
                      When senior is found to have abnormal hearing results, please ask the
                      following questions:
                    </h4>
                    <h3>
                      Do you have an upcoming appointment with your ear specialist or audiologist?
                    </h3>
                    <FormControl component='fieldset'>
                      <RadioGroup name='geriAudiometryQ9'>
                        <FormControlLabel value='Yes' control={<Radio />} label='Yes' />
                        <FormControlLabel value='No' control={<Radio />} label='No' />
                      </RadioGroup>
                    </FormControl>

                    <h4>If yes, please specify:</h4>
                    <Field
                      as={TextField}
                      name='geriAudiometryQ10'
                      label='Specify appointment details'
                      fullWidth
                      variant='outlined'
                      margin='normal'
                    />

                    <h3>Referred to Doctor&apos;s Consult?</h3>
                    <FormControl component='fieldset'>
                      <RadioGroup name='geriAudiometryQ11'>
                        <FormControlLabel value='Yes' control={<Radio />} label='Yes' />
                        <FormControlLabel value='No' control={<Radio />} label='No' />
                      </RadioGroup>
                    </FormControl>

                    <h3>
                      Please document significant findings from audiometry test and recommended
                      course of action for participant:
                    </h3>
                    <Field
                      as={TextField}
                      name='geriAudiometryQ12'
                      label='Findings and recommendations'
                      fullWidth
                      variant='outlined'
                      margin='normal'
                      multiline
                      rows={4}
                    />

                    <FormControl
                      component='fieldset'
                      error={touched.geriAudiometryQ13 && !!errors.geriAudiometryQ13}
                    >
                      <RadioGroup name='geriAudiometryQ13'>
                        <FormControlLabel
                          value='There is some hearing loss detected. This test is not diagnostic, and the participant needs to undergo a more comprehensive hearing assessment.'
                          control={<Radio />}
                          label='There is some hearing loss detected. This test is not diagnostic, and the participant needs to undergo a more comprehensive hearing assessment.'
                        />
                        <FormControlLabel
                          value="There is no hearing loss detected, the participant's hearing is normal."
                          control={<Radio />}
                          label="There is no hearing loss detected, the participant's hearing is normal."
                        />
                      </RadioGroup>
                      <FormHelperText>
                        {touched.geriAudiometryQ13 && errors.geriAudiometryQ13}
                      </FormHelperText>
                    </FormControl>
                  </div>

                  <ErrorMessage name='form' component='div' className='error' />
                  <div>
                    {loading ? (
                      <CircularProgress />
                    ) : (
                      <Button
                        type='submit'
                        variant='contained'
                        color='primary'
                        disabled={isSubmitting}
                      >
                        Submit
                      </Button>
                    )}
                  </div>
                  <Divider />
                </Form>
              )}
            </Formik>
          </Paper>
        </Grid>
        <Grid
          p={1}
          width='50%'
          display='flex'
          flexDirection='column'
          alignItems={loadingSidePanel ? 'center' : 'left'}
        >
          {loadingSidePanel ? (
            <CircularProgress />
          ) : (
            <div className='summary--question-div'>
              <h2>Hearing Issues</h2>
              <p className='underlined'>Hearing problems</p>
              {hcsr && hcsr.hxHcsrQ8 ? (
                <p className='blue'>{hcsr.hxHcsrQ8}</p>
              ) : (
                <p className='blue'>nil</p>
              )}
              {hcsr && hcsr.hxHcsrQ9 ? (
                <p className='blue'>{hcsr.hxHcsrQ9}</p>
              ) : (
                <p className='blue'>nil</p>
              )}
              {<p className='underlined'>Has participant seen an ENT Specialist before?</p>}
              {hcsr && hcsr.hxHcsrQ13 ? (
                <p className='blue'>{hcsr.hxHcsrQ13}</p>
              ) : (
                <p className='blue'>nil</p>
              )}
              {hcsr && hcsr.hxHcsrQ14 ? (
                <p className='blue'>{hcsr.hxHcsrQ14}</p>
              ) : (
                <p className='blue'>nil</p>
              )}
              {<p className='underlined'>Does participant use any hearing aids?</p>}
              {hcsr && hcsr.hxHcsrQ15 ? (
                <p className='blue'>{hcsr.hxHcsrQ15}</p>
              ) : (
                <p className='blue'>nil</p>
              )}
              {hcsr && hcsr.hxHcsrQ16 ? (
                <p className='blue'>{hcsr.hxHcsrQ16}</p>
              ) : (
                <p className='blue'>nil</p>
              )}

              {pmhx ? (
                <>
                  <p className='underlined'>
                    If participant is 60 and above, do they currently use hearing aids/have been
                    detected to require hearing aids?
                  </p>
                  <p className='blue'>{pmhx.PMHX13}</p>

                  <p className='underlined'>
                    For geriatric participants, has the senior seen an ENT specialist before?
                  </p>
                  <p className='blue'>{pmhx.PMHX14}</p>
                  <p className='blue'>{pmhx.PMHXShortAns14}</p>

                  <p className='underlined'>
                    <span className='red'>For geriatric participants,</span> did he/she answer yes
                    to any of the following questions?
                  </p>
                  <ol type='a'>
                    <li>Have you had your hearing aids for more than 5 years?</li>
                    <li>
                      Has it been 3 years or more since you used your hearing aids (i.e. did not use
                      the hearing aids for more than 3 years)?
                    </li>
                    <li>Are your hearing aids spoilt/not working?</li>
                  </ol>
                  <p className='blue'>{pmhx.PMHX15}</p>
                  <p className='blue'>{pmhx.PMHXShortAns15}</p>
                </>
              ) : (
                <p className='red'>nil pmhx data</p>
              )}
            </div>
          )}
        </Grid>
      </Grid>
    </Paper>
  )
}

GeriAudiometryForm.contextType = FormContext

export default GeriAudiometryForm
