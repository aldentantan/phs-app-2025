import React, { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Formik, Form, FastField } from 'formik'
import * as Yup from 'yup'

import { Divider, Paper, Grid, CircularProgress, Button, Typography, Box } from '@mui/material'

import CustomCheckboxGroup from '../components/form-components/CustomCheckboxGroup'
import CustomRadioGroup from '../components/form-components/CustomRadioGroup'
import CustomTextField from '../components/form-components/CustomTextField'
import PopupText from 'src/utils/popupText'

import { submitForm } from '../api/api.jsx'
import { FormContext } from '../api/utils.js'
import { getSavedData } from '../services/mongoDB'
import allForms from './forms.json'
import './fieldPadding.css'

const initialValues = {
  DENT1: [],
  DENT2: '',
  DENTShortAns2: '',
  DENT3: [],
  DENT4: '',
  DENTShortAns4: '',
}

const validationSchema = Yup.object({
  DENT1: Yup.array()
    .of(Yup.string().oneOf(['I have been informed and understand.']))
    .min(1, 'You must check this box to proceed')
    .required('Required'),
  DENT2: Yup.string().oneOf(['Yes', 'No']).required('Required'),
  DENTShortAns2: Yup.string().when('DENT2', {
    is: 'Yes',
    then: (schema) => schema.required('Required'),
    otherwise: (schema) => schema,
  }),
  DENT3: Yup.array()
    .of(Yup.string().oneOf(['Yes']))
    .min(1, 'You must check this box to proceed')
    .required('Required'),
  DENT4: Yup.string().oneOf(['Yes', 'No']).required('Required'),
  DENTShortAns4: Yup.string().when('DENT4', {
    is: 'No',
    then: (schema) => schema.required('Required'),
    otherwise: (schema) => schema,
  }),
})

const formOptions = {
  DENT1: [
    {
      label: 'I have been informed and understand.',
      value: 'I have been informed and understand.',
    },
  ],
  DENT2: [
    { label: 'Yes, (please specify)', value: 'Yes' },
    { label: 'No', value: 'No' },
  ],
  DENT3: [{ label: 'Yes', value: 'Yes' }],
  DENT4: [
    { label: 'Yes', value: 'Yes' },
    { label: 'No, (specify why)', value: 'No' },
  ],
}

const formName = 'oralHealthForm'

const OralHealthForm = () => {
  const { patientId } = useContext(FormContext)
  const [loading, isLoading] = useState(false)
  const [loadingSidePanel, isLoadingSidePanel] = useState(true)
  const [saveData, setSaveData] = useState(initialValues)

  // forms to retrieve for side panel
  const [doctorConsult, setDoctorConsult] = useState({})
  const [regi, setRegi] = useState({})
  const [hxOral, setHxOral] = useState({})
  const [social, setSocial] = useState({})
  const [pmhx, setPMHX] = useState({})

  const navigate = useNavigate()

  useEffect(() => {
    const fetchData = async () => {
      const savedData = await getSavedData(patientId, formName)
      const loadPastForms = async () => {
        const dcData = getSavedData(patientId, allForms.doctorConsultForm)
        const regiData = getSavedData(patientId, allForms.registrationForm)
        const hxOralData = getSavedData(patientId, allForms.hxOralForm)
        const socialData = getSavedData(patientId, allForms.hxSocialForm)
        const pmhxData = getSavedData(patientId, allForms.hxNssForm)

        Promise.all([dcData, regiData, hxOralData, socialData, pmhxData]).then((result) => {
          setDoctorConsult(result[0] || {})
          setRegi(result[1] || {})
          setHxOral(result[2] || {})
          setSocial(result[3] || {})
          setPMHX(result[4] || {})
        })
        isLoadingSidePanel(false)
      }
      setSaveData(savedData || initialValues)
      loadPastForms()
    }
    fetchData()
  }, [patientId])

  const handleSubmit = async (values, { setSubmitting }) => {
    isLoading(true)
    setSubmitting(true)

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
      setTimeout(() => {
        alert(`Error: ${error.message}`)
      }, 80)
    } finally {
      isLoading(false)
      setSubmitting(false)
    }
  }

  const renderForm = () => (
    <Formik
      initialValues={saveData}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
      enableReinitialize={true}
    >
      {({ isSubmitting }) => (
        <Form className='fieldPadding'>
          <div className='form--div'>
            <Typography variant='h1' gutterBottom>
              <strong>Oral Health</strong>
            </Typography>

            <Typography variant='h4' fontWeight='bold'>
              I have been informed and understand that:
            </Typography>
            <Typography component='div' gutterBottom>
              <ol type='a'>
                <li>
                  The oral health screening may be provided by clinical instructors <br />
                  AND/OR postgraduate dental students who are qualified dentists <br />
                  AND/OR undergraduate dental students who are not qualified dentists
                  <ul>
                    <li>
                      ALL undergraduate dental students will be supervised by a clinical instructor
                      and/or postgraduate dental student.
                    </li>
                  </ul>
                </li>
                <li>
                  The Oral Health Screening only provides a basic assessment of my/my ward&apos;s
                  oral health condition and that it does not take the place of a thorough oral
                  health examination.
                </li>
                <li>
                  I/My ward will be advised on the type(s) of follow-up dental treatment required
                  for my/my ward&apos;s oral health condition after the Oral Health Screening.
                  <ul>
                    <li>
                      I/My ward will be responsible to seek such follow-up dental treatment as
                      advised at my/myward&apos; own cost.
                    </li>
                  </ul>
                </li>
                <li>
                  My decision to participate/let my ward participate in this Oral Health Screening
                  is voluntary.
                </li>
              </ol>
            </Typography>

            <FastField
              name='DENT1'
              label='DENT1'
              component={CustomCheckboxGroup}
              options={formOptions.DENT1}
            />

            <Typography variant='h4' fontWeight='bold'>
              Are you on any blood thinners or have any bleeding disorders?
            </Typography>
            <FastField
              name='DENT2'
              label='DENT2'
              component={CustomRadioGroup}
              options={formOptions.DENT2}
              row
            />

            <PopupText qnNo='DENT2' triggerValue='Yes'>
              <Typography variant='h6' component='h3' fontWeight='bold'>
                Please specify:
              </Typography>
              <FastField
                name='DENTShortAns2'
                label='DENTShortAns2'
                component={CustomTextField}
                multiline
                minRows={2}
              />
            </PopupText>

            <Typography variant='h4' fontWeight='bold'>
              Patient has completed Oral Health station?
            </Typography>
            <FastField
              name='DENT3'
              label='DENT3'
              component={CustomCheckboxGroup}
              options={formOptions.DENT3}
            />

            <Typography variant='h4' fontWeight='bold'>
              Patient has registered with NUS Dentistry for follow-up? If no, why not.
            </Typography>
            <FastField
              name='DENT4'
              label='DENT4'
              component={CustomRadioGroup}
              options={formOptions.DENT4}
              row
            />

            <PopupText qnNo='DENT4' triggerValue='No'>
              <Typography variant='h6' component='h3' gutterBottom>
                Please specify:
              </Typography>
              <FastField
                name='DENTShortAns4'
                label='DENTShortAns4'
                component={CustomTextField}
                multiline
                minRows={2}
              />
            </PopupText>
          </div>

          <Box mt={2} mb={2}>
            {loading || isSubmitting ? (
              <CircularProgress />
            ) : (
              <Button type='submit' variant='contained' color='primary' disabled={isSubmitting}>
                Submit
              </Button>
            )}
          </Box>

          <Divider />
        </Form>
      )}
    </Formik>
  )

  const renderSidePanel = () => (
    <div className='summary--question-div'>
      <h2>Referral:</h2>
      {doctorConsult ? (
        <>
          <p className='underlined'>Is patient refered to Dental:</p>
          <p className='blue'>{doctorConsult.doctorSConsultQ8 ? 'Yes' : 'No'}</p>
          <p className='underlined'>Reason for referral:</p>
          <p className='blue'>{doctorConsult.doctorSConsultQ9}</p>
          <p className='underlined'>Does patient require urgent follow up?</p>
          <p className='blue'>{doctorConsult.doctorSConsultQ10}</p>
        </>
      ) : (
        <p className='red'>nil doctorConsult data!</p>
      )}
      <Divider />

      <h2>Patient Info:</h2>
      {regi ? (
        <p className='blue'>Age: {regi.registrationQ4}</p>
      ) : (
        <p className='red'>nil registration data!</p>
      )}
      <Divider />

      <h2>Patient History:</h2>
      {hxOral ? (
        <>
          <p className='underlined'>Patient&apos;s Oral Health:</p>
          <p className='blue'>{hxOral.ORAL1}</p>
          <p className='blue'>{hxOral.ORALShortAns1}</p>

          <p className='underlined'>Does patient wear dentures?:</p>
          <p className='blue'>{hxOral.ORAL2}</p>
          <p className='underlined'>
            Is patient currently experiencing any pain in their mouth area?:
          </p>
          <p className='blue'>{hxOral.ORAL3}</p>

          <p className='underlined'>Has patient visited a dentist in the past 1 year?:</p>
          <p className='blue'>{hxOral.ORAL4}</p>
          <p className='underlined'>Is patient going from a Oral Health Consult?:</p>
          <p className='blue'>{hxOral.ORAL5}</p>
          <p className='blue'>{hxOral.ORALShortAns5}</p>
        </>
      ) : (
        <p className='red'>nil hxOral data!</p>
      )}
      <Divider />

      {social ? (
        <>
          <p className='underlined'>Does patient currently smoke:</p>
          <p className='blue'>{social.SOCIAL10}</p>
          <p className='underlined'>How many pack-years?:</p>
          <p className='blue'>{social.SOCIALShortAns10}</p>

          <p className='underlined'>
            Has patient smoked before? For how long and when did they stop?:
          </p>
          <p className='blue'>{social.SOCIAL11}</p>
          <p className='blue'>{social.SOCIALShortAns11}</p>
        </>
      ) : (
        <p className='red'>nil social data!</p>
      )}
      <Divider />

      {pmhx && pmhx.PMHX5 ? (
        <>
          <p className='underlined'>Patient has the following conditions:</p>
          <ul>
            {pmhx.PMHX5.map((condition) => (
              <li key={condition} className='blue'>
                {condition}
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p className='red'>nil PMHX5 data!</p>
      )}
    </div>
  )

  return (
    <Paper elevation={2} sx={{ p: 0, m: 0 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={9}>
          {renderForm()}
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper elevation={2} sx={{ p: 2 }}>
            {loadingSidePanel ? <CircularProgress /> : renderSidePanel()}
          </Paper>
        </Grid>
      </Grid>
    </Paper>
  )
}

OralHealthForm.contextType = FormContext

export default OralHealthForm
