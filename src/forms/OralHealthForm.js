import React, { useContext, useEffect, useState } from 'react'
import {
  Checkbox,
  FormControlLabel,
  FormGroup,
  FormLabel,
  Radio,
  RadioGroup,
  TextField,
  CircularProgress,
  Divider,
  Paper,
  Grid,
  Button,
  Typography,
} from '@mui/material'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { useNavigate } from 'react-router-dom'
import { submitForm } from '../api/api.js'
import { FormContext } from '../api/utils.js'
import { getSavedData } from '../services/mongoDB'
import allForms from './forms.json'

const validationSchema = Yup.object({
  DENT1: Yup.array()
    .of(Yup.string().oneOf(['I have been informed and understand.']))
    .min(1, 'You must check this box to proceed')
    .required('Required'),
  DENT2: Yup.string().oneOf(['Yes, (please specify)', 'No']).required('Required'),
  DENTShortAns2: Yup.string().when('DENT2', {
    is: 'Yes, (please specify)',
    then: (schema) => schema.required('Required'),
    otherwise: (schema) => schema,
  }),
  DENT3: Yup.array()
    .of(Yup.string().oneOf(['Yes']))
    .min(1, 'You must check this box to proceed')
    .required('Required'),
  DENT4: Yup.string().oneOf(['Yes', 'No, (specify why)']).required('Required'),
  DENTShortAns4: Yup.string().when('DENT4', {
    is: 'No, (specify why)',
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
    { label: 'Yes, (please specify)', value: 'Yes, (please specify)' },
    { label: 'No', value: 'No' },
  ],
  DENT3: [{ label: 'Yes', value: 'Yes' }],
  DENT4: [
    { label: 'Yes', value: 'Yes' },
    { label: 'No, (specify why)', value: 'No, (specify why)' },
  ],
}

const OralHealthForm = () => {
  const { patientId } = useContext(FormContext)
  const navigate = useNavigate()

  const [loading, setLoading] = useState(false)
  const [loadingSidePanel, setLoadingSidePanel] = useState(true)
  const [saveData, setSaveData] = useState({})
  const [doctorConsult, setDoctorConsult] = useState({})
  const [regi, setRegi] = useState({})
  const [hxOral, setHxOral] = useState({})
  const [social, setSocial] = useState({})
  const [pmhx, setPMHX] = useState({})

  useEffect(() => {
    const fetchData = async () => {
      const saved = await getSavedData(patientId, 'oralHealthForm')
      setSaveData(saved || {})

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
        setLoadingSidePanel(false)
      })
    }
    fetchData()
  }, [patientId])

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      DENT1: saveData?.DENT1 || [],
      DENT2: saveData?.DENT2 || '',
      DENTShortAns2: saveData?.DENTShortAns2 || '',
      DENT3: saveData?.DENT3 || [],
      DENT4: saveData?.DENT4 || '',
      DENTShortAns4: saveData?.DENTShortAns4 || '',
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      setLoading(true)
      const response = await submitForm(values, patientId, 'oralHealthForm')
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
    <Paper elevation={2} sx={{ padding: 2 }}>
      <Grid display='flex' flexDirection='row'>
        <Grid xs={9}>
          <form onSubmit={formik.handleSubmit}>
            <Typography variant='h4' gutterBottom>
              Oral Health
            </Typography>
            <div>
              <h1>Oral Health</h1>
              <h3>I have been informed and understand that: </h3>
              <p>
                <ol type='a'>
                  <li>
                    The oral health screening may be provided by clinical instructors <br />
                    AND/OR postgraduate dental students who are qualified dentists <br />
                    AND/OR undergraduate dental students who are not qualified dentists
                    <ul>
                      <li>
                        ALL undergraduate dental students will be supervised by a clinical
                        instructor and/or postgraduate dental student.
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
              </p>
            </div>
            <FormGroup>
              <FormLabel>DENT1*</FormLabel>
              {formOptions.DENT1.map(({ label, value }) => (
                <FormControlLabel
                  key={value}
                  control={
                    <Checkbox
                      name='DENT1'
                      checked={formik.values.DENT1.includes(value)}
                      onChange={() => {
                        const currentArray = formik.values.DENT1 || []
                        const updated = currentArray.includes(value)
                          ? currentArray.filter((v) => v !== value)
                          : [...currentArray, value]
                        formik.setFieldValue('DENT1', updated)
                      }}
                    />
                  }
                  label={label}
                />
              ))}
              {formik.touched.DENT1 && formik.errors.DENT1 && (
                <Typography color='error'>{formik.errors.DENT1}</Typography>
              )}
            </FormGroup>

            <h3>Are you on any blood thinners or have any bleeding disorders?</h3>
            <FormLabel>DENT2*</FormLabel>
            <RadioGroup name='DENT2' value={formik.values.DENT2} onChange={formik.handleChange}>
              {formOptions.DENT2.map(({ label, value }) => (
                <FormControlLabel key={value} value={value} control={<Radio />} label={label} />
              ))}
            </RadioGroup>
            {formik.touched.DENT2 && formik.errors.DENT2 && (
              <Typography color='error'>{formik.errors.DENT2}</Typography>
            )}
            <br />

            <FormLabel>DENTShortAns2*</FormLabel>
            <TextField
              name='DENTShortAns2'
              label='Please specify:'
              multiline
              minRows={2}
              fullWidth
              value={formik.values.DENTShortAns2}
              onChange={formik.handleChange}
              error={formik.touched.DENTShortAns2 && Boolean(formik.errors.DENTShortAns2)}
              helperText={formik.touched.DENTShortAns2 && formik.errors.DENTShortAns2}
              sx={{ mt: 2 }}
            />

            <FormGroup>
              <h3>Patient has completed Oral Health station.</h3>
              <FormLabel>DENT3*</FormLabel>
              {formOptions.DENT3.map(({ label, value }) => (
                <FormControlLabel
                  key={value}
                  control={
                    <Checkbox
                      name='DENT3'
                      checked={formik.values.DENT3.includes(value)}
                      onChange={() => {
                        const currentArray = formik.values.DENT3 || []
                        const updated = currentArray.includes(value)
                          ? currentArray.filter((v) => v !== value)
                          : [...currentArray, value]
                        formik.setFieldValue('DENT3', updated)
                      }}
                    />
                  }
                  label={label}
                />
              ))}
              {formik.touched.DENT3 && formik.errors.DENT3 && (
                <Typography color='error'>{formik.errors.DENT3}</Typography>
              )}
            </FormGroup>

            <h3>Patient has registered with NUS Dentistry for follow-up. If no, why not.</h3>
            <FormLabel>DENT4*</FormLabel>
            <RadioGroup name='DENT4' value={formik.values.DENT4} onChange={formik.handleChange}>
              {formOptions.DENT4.map(({ label, value }) => (
                <FormControlLabel key={value} value={value} control={<Radio />} label={label} />
              ))}
            </RadioGroup>
            {formik.touched.DENT4 && formik.errors.DENT4 && (
              <Typography color='error'>{formik.errors.DENT4}</Typography>
            )}
            <br />
            <FormLabel>DENTShortAns4*</FormLabel>
            <TextField
              name='DENTShortAns4'
              label='Please specify:'
              multiline
              minRows={2}
              fullWidth
              value={formik.values.DENTShortAns4}
              onChange={formik.handleChange}
              error={formik.touched.DENTShortAns4 && Boolean(formik.errors.DENTShortAns4)}
              helperText={formik.touched.DENTShortAns4 && formik.errors.DENTShortAns4}
              sx={{ mt: 2 }}
            />

            <div style={{ marginTop: 20 }}>
              {loading ? (
                <CircularProgress />
              ) : (
                <Button variant='contained' type='submit'>
                  Submit
                </Button>
              )}
            </div>
          </form>
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
              <h2>Referral:</h2>
              {doctorConsult ? (
                <>
                  <p className='underlined'>Is patient refered to Dental:</p>
                  <p>{doctorConsult.doctorSConsultQ8 ? 'Yes' : 'No'}</p>
                  <p className='underlined'>Reason for referral: </p>
                  <p>{doctorConsult.doctorSConsultQ9}</p>
                  <p className='underlined'>Does patient require urgent follow up?</p>
                  <p>{doctorConsult.doctorSConsultQ10}</p>
                </>
              ) : (
                <p className='red'>nil doctorConsult data!</p>
              )}

              <h2>Patient Info:</h2>
              {regi ? (
                <p>Age: {regi.registrationQ4}</p>
              ) : (
                <p className='red'>nil registration data!</p>
              )}

              <h2>Patient History:</h2>
              {hxOral ? (
                <>
                  <p className='underlined'>Patient&apos;s Oral Health:</p>
                  <p>{hxOral.ORAL1}</p>
                  <p>{hxOral.ORALShortAns1}</p>

                  <p className='underlined'>Does patient wear dentures?: </p>
                  <p>{hxOral.ORAL2}</p>
                  <p className='underlined'>
                    Is patient currently experiencing any pain in their mouth area?:{' '}
                  </p>
                  <p>{hxOral.ORAL3}</p>

                  <p className='underlined'>Has patient visited a dentist in the past 1 year?: </p>
                  <p>{hxOral.ORAL4}</p>
                  <p className='underlined'>Is patient going from a Oral Health Consult?: </p>
                  <p>{hxOral.ORAL5}</p>
                  <p>{hxOral.ORALShortAns5}</p>
                </>
              ) : (
                <p className='red'>nil hxOral data!</p>
              )}

              {social ? (
                <>
                  <p className='underlined'>Does patient currently smoke: </p>
                  <p>{social.SOCIAL10}</p>
                  <p className='underlined'>How many pack-years?: </p>
                  <p>{social.SOCIALShortAns10}</p>

                  <p className='underlined'>
                    Has patient smoked before? For how long and when did they stop?:{' '}
                  </p>
                  <p>{social.SOCIAL11}</p>
                  <p>{social.SOCIALShortAns11}</p>
                </>
              ) : (
                <p className='red'>nil social data!</p>
              )}

              {pmhx && pmhx.PMHX7 ? (
                <>
                  <p className='underlined'>Patient has the following conditions: </p>
                  <ul>
                    {pmhx.PMHX7.map((person) => (
                      <li key={person}>{person}</li>
                    ))}
                  </ul>
                </>
              ) : (
                <p className='red'>nil pmhx7 data!</p>
              )}
            </div>
          )}
        </Grid>
      </Grid>
    </Paper>
  )
}

export default OralHealthForm
