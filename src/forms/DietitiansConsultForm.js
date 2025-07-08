import React, { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Formik, Form, Field } from 'formik'
import * as Yup from 'yup'

import Divider from '@mui/material/Divider'
import Paper from '@mui/material/Paper'
import Grid from '@mui/material/Grid'
import CircularProgress from '@mui/material/CircularProgress'
import TextField from '@mui/material/TextField'
import FormControl from '@mui/material/FormControl'
import FormControlLabel from '@mui/material/FormControlLabel'
import FormLabel from '@mui/material/FormLabel'
import Radio from '@mui/material/Radio'
import RadioGroup from '@mui/material/RadioGroup'
import Checkbox from '@mui/material/Checkbox'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'

import { submitForm } from '../api/api.js'
import { FormContext } from '../api/utils.js'
import { getSavedData } from '../services/mongoDB'
import allForms from './forms.json'
import './fieldPadding.css'

// Yup validation schema
const validationSchema = Yup.object({
  dietitiansConsultQ1: Yup.string().required("Dietitian's name is required"),
  dietitiansConsultQ2: Yup.string(),
  dietitiansConsultQ3: Yup.string(),
  dietitiansConsultQ4: Yup.string(),
  dietitiansConsultQ5: Yup.boolean(),
  dietitiansConsultQ6: Yup.string(),
  dietitiansConsultQ7: Yup.string()
    .oneOf(['Yes', 'No'], 'Please select Yes or No')
    .required('This field is required'),
  dietitiansConsultQ8: Yup.string()
    .oneOf(['Yes', 'No'], 'Please select Yes or No')
    .required('This field is required'),
})

// Initial form values
const initialValues = {
  dietitiansConsultQ1: '',
  dietitiansConsultQ2: '',
  dietitiansConsultQ3: '',
  dietitiansConsultQ4: '',
  dietitiansConsultQ5: false,
  dietitiansConsultQ6: '',
  dietitiansConsultQ7: '',
  dietitiansConsultQ8: '',
}

const formName = 'dietitiansConsultForm'

const DietitiansConsultForm = () => {
  const { patientId } = useContext(FormContext)
  const [loading, isLoading] = useState(false)
  const [loadingSidePanel, isLoadingSidePanel] = useState(true)
  const [saveData, setSaveData] = useState(initialValues)

  // forms to retrieve for side panel
  const [doctorConsult, setDoctorConsult] = useState({})
  const [triage, setTriage] = useState({})
  const [hxSocial, setSocial] = useState({})

  const navigate = useNavigate()

  useEffect(() => {
    const fetchData = async () => {
      const savedData = await getSavedData(patientId, formName)
      const loadPastForms = async () => {
        const doctorConsultData = getSavedData(patientId, allForms.doctorConsultForm)
        const triageData = getSavedData(patientId, allForms.triageForm)
        const socialData = getSavedData(patientId, allForms.hxSocialForm)

        Promise.all([doctorConsultData, triageData, socialData]).then((result) => {
          setDoctorConsult(result[0])
          setTriage(result[1])
          setSocial(result[2])
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

  // Custom Field Components
  const FormikTextField = ({ field, form, ...props }) => (
    <TextField
      {...field}
      {...props}
      fullWidth
      margin='normal'
      error={form.touched[field.name] && Boolean(form.errors[field.name])}
      helperText={form.touched[field.name] && form.errors[field.name]}
    />
  )

  const FormikRadioGroup = ({ field, form, options, label, ...props }) => (
    <FormControl
      component='fieldset'
      margin='normal'
      error={form.touched[field.name] && Boolean(form.errors[field.name])}
    >
      <FormLabel component='legend'>{label}</FormLabel>
      <RadioGroup
        {...field}
        {...props}
        value={field.value || ''}
        onChange={(event) => form.setFieldValue(field.name, event.target.value)}
      >
        {options.map((option) => (
          <FormControlLabel
            key={option.value}
            value={option.value}
            control={<Radio />}
            label={option.label}
          />
        ))}
      </RadioGroup>
      {form.touched[field.name] && form.errors[field.name] && (
        <Typography variant='caption' color='error'>
          {form.errors[field.name]}
        </Typography>
      )}
    </FormControl>
  )

  const FormikCheckbox = ({ field, form, label, ...props }) => (
    <FormControlLabel
      control={
        <Checkbox
          {...field}
          {...props}
          checked={field.value || false}
          onChange={(event) => form.setFieldValue(field.name, event.target.checked)}
        />
      }
      label={label}
    />
  )

  const radioOptions = {
    dietitiansConsultQ7: [
      { label: 'Yes', value: 'Yes' },
      { label: 'No', value: 'No' },
    ],
    dietitiansConsultQ8: [
      { label: 'Yes', value: 'Yes' },
      { label: 'No', value: 'No' },
    ],
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
            <Typography variant='h4' component='h1' gutterBottom>
              Dietitian&apos;s Consultation
            </Typography>

            <Typography variant='h6' component='h3' gutterBottom>
              Has the participant visited the Dietitian&apos;s Consult station?
            </Typography>
            <Field
              name='dietitiansConsultQ7'
              component={FormikRadioGroup}
              options={radioOptions.dietitiansConsultQ7}
            />

            <Typography variant='h6' component='h3' gutterBottom>
              Dietitian&apos;s Name:
            </Typography>
            <Field
              name='dietitiansConsultQ1'
              component={FormikTextField}
              label="Dietitian's Name"
              multiline
              rows={2}
            />

            <Typography variant='h6' component='h3' gutterBottom>
              Dietitian&apos;s Notes:
            </Typography>
            <Field
              name='dietitiansConsultQ3'
              component={FormikTextField}
              label="Dietitian's Notes"
              multiline
              rows={4}
            />

            <Typography variant='h6' component='h3' gutterBottom>
              Notes for participant (if applicable):
            </Typography>
            <Field
              name='dietitiansConsultQ4'
              component={FormikTextField}
              label='Notes for participant'
              multiline
              rows={4}
            />

            <Typography variant='h6' component='h3' gutterBottom>
              Does the participant require urgent follow up?
            </Typography>
            <Field name='dietitiansConsultQ5' component={FormikCheckbox} label='Yes' />

            <Typography variant='h6' component='h3' gutterBottom>
              Reasons for urgent follow up:
            </Typography>
            <Field
              name='dietitiansConsultQ6'
              component={FormikTextField}
              label='Reasons for urgent follow up'
              multiline
              rows={4}
            />

            <Typography variant='h6' component='h3' gutterBottom>
              Referred to Polyclinic for follow-up?
            </Typography>
            <Field
              name='dietitiansConsultQ8'
              component={FormikRadioGroup}
              options={radioOptions.dietitiansConsultQ8}
            />
          </div>

          <Box mt={2} mb={2}>
            {loading || isSubmitting ? (
              <CircularProgress />
            ) : (
              <Button type='submit' variant='contained' color='primary' disabled={isSubmitting}>
                Submit Form
              </Button>
            )}
          </Box>

          <Divider />
        </Form>
      )}
    </Formik>
  )

  return (
    <Paper elevation={2} p={0} m={0}>
      <Grid display='flex' flexDirection='row'>
        <Grid item xs={9}>
          <Paper elevation={2} sx={{ p: 2 }}>
            {renderForm()}
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
              <h2>Doctor&apos;s Consult</h2>
              <p className='underlined'>Reasons for referral from Doctor&apos;s Consult</p>
              {doctorConsult ? <p className='blue'>{doctorConsult.doctorSConsultQ5}</p> : null}
              {
                // DOC6???
              }
              <Divider />
              <h2>Blood Pressure</h2>
              <p className='underlined'>Average Reading Systolic (average of closest 2 readings)</p>
              Systolic BP:
              {triage ? <p className='blue'>{triage.triageQ7}</p> : null}
              <p className='underlined'>
                Average Reading Diastolic (average of closest 2 readings)
              </p>
              Diastolic BP:
              {triage ? <p className='blue'>{triage.triageQ8}</p> : null}
              <Divider />
              <h2>BMI</h2>
              <p className='underlined'>BMI</p>
              {triage ? <p className='blue'>{triage.triageQ12}</p> : null}
              <p className='underlined'>Waist Circumference (in cm)</p>
              {triage ? <p className='blue'>{triage.triageQ13}</p> : null}
              <Divider />
              <h2>Smoking History</h2>
              <p className='underlined'>participant Currently smokes?</p>
              {hxSocial ? <p className='blue'>{hxSocial.SOCIAL10}</p> : null}
              <p className='underlined'>Pack years:</p>
              {hxSocial ? <p className='blue'>{hxSocial.SOCIALShortAns10}</p> : null}
              <p className='underlined'>
                participant has smoked before? For how long and when did they stop?
              </p>
              {hxSocial ? <p className='blue'>{hxSocial.SOCIAL11}</p> : null}
              <p className='underlined'>participant specifies:</p>
              {hxSocial ? <p className='blue'>{hxSocial.SOCIALShortAns11}</p> : null}
              <Divider />
              <h2>Alcohol history</h2>
              <p className='underlined'>Alcohol consumption</p>
              {hxSocial ? <p className='blue'>{hxSocial.SOCIAL12}</p> : null}
              <Divider />
              <h2>Diet</h2>
              <p className='underlined'>
                Does participant consciously try to the more fruits, vegetables, whole grain &
                cereals?
              </p>
              {hxSocial ? <p className='blue'>{hxSocial.SOCIAL13}</p> : null}
              {hxSocial ? <p className='blue'>Fruits: {hxSocial.SOCIALExtension13A}</p> : null}
              {hxSocial ? <p className='blue'>Vegetables: {hxSocial.SOCIALExtension13B}</p> : null}
              {hxSocial ? (
                <p className='blue'>Whole grain and cereals: {hxSocial.SOCIALExtension13C}</p>
              ) : null}
              <p className='underlined'>
                Does the participant exercise in any form of moderate physical activity for at least
                150 minutes OR intense physical activity at least 75 minutes throuhgout the week?
              </p>
              {hxSocial ? <p className='blue'>{hxSocial.SOCIAL14}</p> : null}
            </div>
          )}
        </Grid>
      </Grid>
    </Paper>
  )
}

DietitiansConsultForm.contextType = FormContext

export default DietitiansConsultForm
