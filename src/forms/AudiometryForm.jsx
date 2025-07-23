import { Divider, Paper, CircularProgress, Button, Grid, Typography } from '@mui/material'
import { FastField, Form, Formik } from 'formik'
import React, { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import * as Yup from 'yup'
import { submitForm } from '../api/api.jsx'
import { FormContext } from '../api/utils.js'
import { getSavedData } from '../services/mongoDB'
import './fieldPadding.css'
import allForms from './forms.json'

import PopupText from 'src/utils/popupText'
import CustomRadioGroup from '../components/form-components/CustomRadioGroup'
import CustomTextField from '../components/form-components/CustomTextField'
import CustomCheckboxGroup from '../components/form-components/CustomCheckboxGroup'

const YesNo = [
  { value: 'Yes', label: 'Yes' },
  { value: 'No', label: 'No' },
]

const PassRefer = [
  { value: 'Pass', label: 'Pass' },
  { value: 'Refer', label: 'Refer' },
]

const FreqAudible = [
  { value: '500Hz', label: '500Hz' },
  { value: '1000Hz', label: '1000Hz' },
  { value: '2000Hz', label: '2000Hz' },
  { value: '4000Hz', label: '4000Hz' },
]

const formOptions = {
  AudiometryQ1: YesNo,
  AudiometryQ2: PassRefer,
  AudiometryQ3: PassRefer,
  AudiometryQ4: PassRefer,
  AudiometryQ5: FreqAudible,
  AudiometryQ6: FreqAudible,
  AudiometryQ7: FreqAudible,
  AudiometryQ8: FreqAudible,
  AudiometryQ9: YesNo,
  AudiometryQ11: YesNo,
  AudiometryQ13: [
    {
      value:
        'There is some hearing loss detected. This test is not diagnostic, and the participant needs to undergo a more comprehensive hearing assessment.',
      label:
        'There is some hearing loss detected. This test is not diagnostic, and the participant needs to undergo a more comprehensive hearing assessment.',
    },
    {
      value: "There is no hearing loss detected, the participant's hearing is normal.",
      label: "There is no hearing loss detected, the participant's hearing is normal.",
    },
  ],
}

const validationSchema = Yup.object().shape({
  AudiometryQ1: Yup.string().required(),
  AudiometryQ2: Yup.string().required(),
  AudiometryQ3: Yup.string().required(),
  AudiometryQ4: Yup.string().required(),
  AudiometryQ5: Yup.array().required().of(Yup.string()),
  AudiometryQ6: Yup.array().required().of(Yup.string()),
  AudiometryQ7: Yup.array().required().of(Yup.string()),
  AudiometryQ8: Yup.array().required().of(Yup.string()),
  AudiometryQ9: Yup.string().required(),
  AudiometryQ10: Yup.string(),
  AudiometryQ11: Yup.string().required(),
  AudiometryQ12: Yup.string().required(),
  AudiometryQ13: Yup.string().required(),
})

const formName = 'AudiometryForm'

const AudiometryForm = () => {
  const { patientId } = useContext(FormContext)
  const navigate = useNavigate()

  const [saveData, setSaveData] = useState({})
  const [hcsr, setHcsr] = useState({})
  const [pmhx, setPMHX] = useState({})
  const [loading, setLoading] = useState(false)
  const [loadingSidePanel, setLoadingSidePanel] = useState(true)
  const [dataLoaded, setDataLoaded] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      const savedDataPromise = getSavedData(patientId, formName)
      const hcsrDataPromise = getSavedData(patientId, allForms.hxHcsrForm)
      const pmhxDataPromise = getSavedData(patientId, allForms.hxNssForm)

      const [savedResult, hcsrResult, pmhxResult] = await Promise.all([
        savedDataPromise,
        hcsrDataPromise,
        pmhxDataPromise,
      ])

      setSaveData(savedResult || {})
      setHcsr(hcsrResult || {})
      setPMHX(pmhxResult || {})

      setDataLoaded(true)
      setLoadingSidePanel(false)
    }
    fetchData()
  }, [patientId])

  const initialValues = {
    AudiometryQ1: saveData.AudiometryQ1 || '',
    AudiometryQ2: saveData.AudiometryQ2 || '',
    AudiometryQ3: saveData.AudiometryQ3 || '',
    AudiometryQ4: saveData.AudiometryQ4 || '',
    AudiometryQ5: saveData.AudiometryQ5 || [],
    AudiometryQ6: saveData.AudiometryQ6 || [],
    AudiometryQ7: saveData.AudiometryQ7 || [],
    AudiometryQ8: saveData.AudiometryQ8 || [],
    AudiometryQ9: saveData.AudiometryQ9 || '',
    AudiometryQ10: saveData.AudiometryQ10 || '',
    AudiometryQ11: saveData.AudiometryQ11 || '',
    AudiometryQ12: saveData.AudiometryQ12 || '',
    AudiometryQ13: saveData.AudiometryQ13 || '',
  }

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      enableReinitialize
      onSubmit={async (values, { setSubmitting }) => {
        setLoading(true)
        const response = await submitForm(values, patientId, formName)
        setTimeout(() => {
          setLoading(false)
          setSubmitting(false)
          if (response.result) {
            alert('Successfully submitted form')
            navigate('/app/dashboard', { replace: true })
          } else {
            alert(`Unsuccessful. ${response.error}`)
          }
        }, 80)
      }}
    >
      {({ errors, submitCount }) => (
        <Paper elevation={2} p={0} m={0}>
          <Grid display='flex' flexDirection='row'>
            <Grid xs={9}>
              <Paper elevation={2} p={0} m={0}>
                <Form className='fieldPadding'>
                  <div className='form--div'>
                    <h1>AUDIOMETRY</h1>
                    <h3>Did participant visit Audiometry Booth by NUS audiology team?</h3>
                    <FastField
                      name='AudiometryQ1'
                      label='AudiometryQ1'
                      component={CustomRadioGroup}
                      options={formOptions.AudiometryQ1}
                      row
                    />
                    <h2>External Ear Examination</h2>
                    <h3>Visual Ear Examination (Left Ear):</h3>
                    <FastField
                      name='AudiometryQ2'
                      label='AudiometryQ2'
                      component={CustomRadioGroup}
                      options={formOptions.AudiometryQ2}
                      row
                    />

                    <h3>Visual Ear Examination (Right Ear)</h3>
                    <FastField
                      name='AudiometryQ3'
                      label='AudiometryQ3'
                      component={CustomRadioGroup}
                      options={formOptions.AudiometryQ3}
                      row
                    />

                    <h2>Hearing Test</h2>
                    <h3>Practice Tone (500Hz at 60dB in &quot;better&quot; ear):</h3>
                    <FastField
                      name='AudiometryQ4'
                      label='AudiometryQ4'
                      component={CustomRadioGroup}
                      options={formOptions.AudiometryQ4}
                      row
                    />

                    <h3>Pure Tone Screening at 25dB for Left Ear: </h3>
                    <p>(Tick checkbox for Response, DO NOT tick checkbox if NO response):</p>
                    <p>Select frequencies</p>
                    <FastField
                      name='AudiometryQ5'
                      label='AudiometryQ5'
                      component={CustomCheckboxGroup}
                      options={formOptions.AudiometryQ5}
                    />

                    <h3>Pure Tone Screening at 25dB for Right Ear:</h3>
                    <p>(Tick checkbox for Response, DO NOT tick checkbox if NO response):</p>
                    <p>Select frequencies</p>
                    <FastField
                      name='AudiometryQ6'
                      label='AudiometryQ6'
                      component={CustomCheckboxGroup}
                      options={formOptions.AudiometryQ6}
                    />

                    <h3>Pure Tone Screening at 40dB for Left Ear:</h3>
                    <p>(Tick checkbox for Response, DO NOT tick checkbox if NO response):</p>
                    <p>Select frequencies</p>
                    <FastField
                      name='AudiometryQ7'
                      label='AudiometryQ7'
                      component={CustomCheckboxGroup}
                      options={formOptions.AudiometryQ7}
                    />

                    <h3>Pure Tone Screening at 40dB for Right Ear:</h3>
                    <p>(Tick checkbox for Response, DO NOT tick checkbox if NO response):</p>
                    <p>Select frequencies</p>
                    <FastField
                      name='AudiometryQ8'
                      label='AudiometryQ8'
                      component={CustomCheckboxGroup}
                      options={formOptions.AudiometryQ8}
                    />

                    <h4>
                      When senior is found to have abnormal hearing results, please ask the
                      following questions:
                    </h4>
                    <h3>
                      Do you have an upcoming appointment with your ear specialist or audiologist?
                    </h3>
                    <FastField
                      name='AudiometryQ9'
                      label='AudiometryQ9'
                      component={CustomRadioGroup}
                      options={formOptions.AudiometryQ9}
                      row
                    />

                    <PopupText qnNo='AudiometryQ9' triggerValue='Yes'>
                      <h4>If yes, please specify:</h4>
                      <FastField
                        name='AudiometryQ10'
                        label='AudiometryQ10'
                        component={CustomTextField}
                        fullWidth
                      />
                    </PopupText>

                    <h3>Referred to Doctor&apos;s Consult?</h3>
                    <FastField
                      name='AudiometryQ11'
                      label='AudiometryQ11'
                      component={CustomRadioGroup}
                      options={formOptions.AudiometryQ11}
                      row
                    />

                    <h3>
                      Please document significant findings from audiometry test and recommended
                      course of action for participant:
                    </h3>
                    <FastField
                      name='AudiometryQ12'
                      label='AudiometryQ12'
                      component={CustomTextField}
                      fullWidth
                      multiline
                      rows={3}
                    />

                    <FastField
                      name='AudiometryQ13'
                      label='Assessment Result'
                      component={CustomRadioGroup}
                      options={formOptions.AudiometryQ13}
                      row
                    />
                  </div>

                  {submitCount > 0 && Object.keys(errors || {}).length > 0 && (
                    <Typography color='error' variant='body2' sx={{ mb: 1 }}>
                      Please fill in all required fields correctly.
                    </Typography>
                  )}

                  <div>
                    {loading ? (
                      <CircularProgress />
                    ) : (
                      <Button type='submit' variant='contained' color='primary'>
                        Submit
                      </Button>
                    )}
                  </div>
                  <Divider />
                </Form>
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
                  {hcsr && hcsr.hxHcsrQ4 ? (
                    <p className='blue'>{hcsr.hxHcsrQ4}</p>
                  ) : (
                    <p className='blue'>nil</p>
                  )}
                  {hcsr && hcsr.hxHcsrShortAnsQ4 ? (
                    <p className='blue'>{hcsr.hxHcsrShortAnsQ4}</p>
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
                      <p className='blue'>{pmhx.PMHX8}</p>
                      <p className='blue'>{pmhx.PMHXShortAns8}</p>

                      <p className='underlined'>
                        <span className='red'>For geriatric participants,</span> did he/she answer
                        yes to any of the following questions?
                      </p>
                      <ol type='a'>
                        <li>Have you had your hearing aids for more than 5 years?</li>
                        <li>
                          Has it been 3 years or more since you used your hearing aids (i.e. did not
                          use the hearing aids for more than 3 years)?
                        </li>
                        <li>Are your hearing aids spoilt/not working?</li>
                      </ol>
                      <p className='blue'>{pmhx.PMHX9}</p>
                      <p className='blue'>{pmhx.PMHXShortAns9}</p>
                    </>
                  ) : (
                    <p className='red'>nil pmhx data</p>
                  )}
                </div>
              )}
            </Grid>
          </Grid>
        </Paper>
      )}
    </Formik>
  )
}

AudiometryForm.contextType = FormContext

export default AudiometryForm
