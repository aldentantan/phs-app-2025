import React, { useContext, useEffect, useState } from 'react'
import { Formik, Form, FastField } from 'formik'
import * as Yup from 'yup'

import { Divider, Paper, CircularProgress, Typography, Box, Button } from '@mui/material'

import { submitForm } from '../../api/api.jsx'
import { FormContext } from '../../api/utils.js'
import { getSavedData } from '../../services/mongoDB'
import '../fieldPadding.css'

import CustomRadioGroup from '../../components/form-components/CustomRadioGroup.jsx'
import CustomCheckboxGroup from '../../components/form-components/CustomCheckboxGroup.jsx'
import CustomTextField from '../../components/form-components/CustomTextField.jsx'

const formName = 'geriPhysicalActivityLevelForm'

const formOptions = {
  geriPhysicalActivityLevelQ1: [
    { label: 'Nil', value: 'Nil' },
    { label: '1-2x/ week', value: '1-2x/ week' },
    { label: '3-4x/ week', value: '3-4x/ week' },
    { label: '5x/ week or more', value: '5x/ week or more' },
  ],
  geriPhysicalActivityLevelQ2: [
    { label: 'Nil', value: 'Nil' },
    { label: '<15 min', value: '<15 min' },
    { label: '< 15-30 min', value: '< 15-30 min' },
    { label: '30 min or more', value: '30 min or more' },
  ],
  geriPhysicalActivityLevelQ4: [
    { label: 'Light Intensity', value: 'Light Intensity' },
    { label: 'Moderate Intensity', value: 'Moderate Intensity' },
    { label: 'Vigorous Intensity', value: 'Vigorous Intensity' },
    { label: 'Unsure', value: 'Unsure' },
  ],
  geriPhysicalActivityLevelQ5: [
    { label: 'Yes', value: 'Yes' },
    { label: 'No', value: 'No' },
  ],
  geriPhysicalActivityLevelQ6: [
    { label: '< 150min of mod intensity per week', value: '< 150min of mod intensity per week' },
    { label: 'unsure about qns 1-4', value: 'unsure about qns 1-4' },
    { label: 'yes to qn 5', value: 'yes to qn 5' },
    { label: 'nil - regular advice', value: 'nil - regular advice' },
  ],
  geriPhysicalActivityLevelQ8: [
    { label: 'No fall', value: 'No fall' },
    { label: '1 fall', value: '1 fall' },
    { label: '2 or more falls', value: '2 or more falls' },
  ],
  geriPhysicalActivityLevelQ9: [
    { label: 'Yes', value: 'Yes' },
    { label: 'No', value: 'No' },
  ],
}

const validationSchema = Yup.object({
  geriPhysicalActivityLevelQ1: Yup.string()
    .oneOf(formOptions.geriPhysicalActivityLevelQ1.map((opt) => opt.value))
    .required(),
  geriPhysicalActivityLevelQ2: Yup.string()
    .oneOf(formOptions.geriPhysicalActivityLevelQ2.map((opt) => opt.value))
    .required(),
  geriPhysicalActivityLevelQ3: Yup.string().required(),
  geriPhysicalActivityLevelQ4: Yup.string()
    .oneOf(formOptions.geriPhysicalActivityLevelQ4.map((opt) => opt.value))
    .required(),
  geriPhysicalActivityLevelQ5: Yup.string()
    .oneOf(formOptions.geriPhysicalActivityLevelQ5.map((opt) => opt.value))
    .required(),
  geriPhysicalActivityLevelQ6: Yup.array()
    .of(Yup.string().oneOf(formOptions.geriPhysicalActivityLevelQ6.map((opt) => opt.value)))
    .min(1)
    .required(),
  geriPhysicalActivityLevelQ8: Yup.string()
    .oneOf(formOptions.geriPhysicalActivityLevelQ8.map((opt) => opt.value))
    .required(),
  geriPhysicalActivityLevelQ9: Yup.string()
    .oneOf(formOptions.geriPhysicalActivityLevelQ9.map((opt) => opt.value))
    .required(),
  geriPhysicalActivityLevelQ10: Yup.string(),
  geriPhysicalActivityLevelQ7: Yup.string(),
})

const GeriPhysicalActivityLevelForm = ({ changeTab, nextTab }) => {
  const { patientId } = useContext(FormContext)
  const [loading, setLoading] = useState(false)
  const [initialValues, setInitialValues] = useState({
    geriPhysicalActivityLevelQ1: '',
    geriPhysicalActivityLevelQ2: '',
    geriPhysicalActivityLevelQ3: '',
    geriPhysicalActivityLevelQ4: '',
    geriPhysicalActivityLevelQ5: '',
    geriPhysicalActivityLevelQ6: [],
    geriPhysicalActivityLevelQ7: '',
    geriPhysicalActivityLevelQ8: '',
    geriPhysicalActivityLevelQ9: '',
    geriPhysicalActivityLevelQ10: '',
  })

  useEffect(() => {
    const fetchData = async () => {
      const saved = await getSavedData(patientId, formName)
      setInitialValues(saved || initialValues)
    }
    fetchData()
  }, [])

  return (
    <Formik
      initialValues={initialValues}
      enableReinitialize
      validationSchema={validationSchema}
      onSubmit={async (values, actions) => {
        setLoading(true)
        const response = await submitForm(values, patientId, formName)
        setLoading(false)
        if (response.result) {
          alert('Successfully submitted form')
          changeTab(null, nextTab)
        } else {
          alert(`Unsuccessful. ${response.error}`)
        }
        actions.setSubmitting(false)
      }}
    >
      {(handleSubmit, errors, submitCount) => (
        <Paper elevation={2} p={0} m={0}>
          <Form className='fieldPadding'>
            <div className='form--div'>
              <h1>PHYSICAL ACTIVITY SECTION</h1>
              <h2>PHYSICAL ACTIVITY LEVELS</h2>

              <h3>1. How often do you exercise in a week?</h3>
              <p>
                If &lt; 3x/week and would like to start exercising more, suggest physiotherapist
                consultation.
              </p>
              <FastField
                name='geriPhysicalActivityLevelQ1'
                label='Geri - Physical Activity Level Q1'
                component={CustomRadioGroup}
                options={formOptions.geriPhysicalActivityLevelQ1}
                row
              />

              <h3>2. How long do you exercise each time?</h3>
              <p>
                If &lt; 30minutes per session and would like to increase, suggest physiotherapist
                consultation.
              </p>
              <FastField
                name='geriPhysicalActivityLevelQ2'
                label='Geri - Physical Activity Level Q2'
                component={CustomRadioGroup}
                options={formOptions.geriPhysicalActivityLevelQ2}
                row
              />

              <h3>3. What do you do for exercise?</h3>
              <ul className='decrease-left-margin'>
                <li>Take down salient points.</li>
                <li>
                  Dangerous/ inappropriate exercises are defined to the participants as exercises
                  that cause pain or difficulty to perform.
                </li>
                <li>
                  If exercises are dangerous or deemed inappropriate, REFER FOR PHYSIOTHERAPIST
                  CONSULTATION.
                </li>
              </ul>
              <FastField
                name='geriPhysicalActivityLevelQ3'
                label='Geri - Physical Activity Level Q3'
                component={CustomTextField}
                multiline
                fullWidth
              />

              <h3>
                4. Using the following scale, can you rate the level of exertion when you exercise?
              </h3>
              <b>PT to note:</b>
              <ol>
                <li>Achieves less than 150 min moderate intensity per week OR</li>
                <li>Unsure about any of the 4 questions above.</li>
              </ol>
              <img
                src='/images/geri-physical-activity-level/intensity.jpg'
                alt='Intensity Scale'
                style={{ maxWidth: '100%' }}
              />
              <FastField
                name='geriPhysicalActivityLevelQ4'
                label='Geri - Physical Activity Level Q4'
                component={CustomRadioGroup}
                options={formOptions.geriPhysicalActivityLevelQ4}
                row
              />

              <h3>
                5. Do you have significant difficulties going about your regular exercise regime? Or
                do you not know how to start exercising?
              </h3>
              <p>If yes, REFER FOR PHYSIOTHERAPIST CONSULTATION.</p>
              <FastField
                name='geriPhysicalActivityLevelQ5'
                label='Geri - Physical Activity Level Q5'
                component={CustomRadioGroup}
                options={formOptions.geriPhysicalActivityLevelQ5}
                row
              />

              <h3>
                6. Do you have any history of falls in the past 1 year? If yes, how many falls?
              </h3>
              <FastField
                name='geriPhysicalActivityLevelQ8'
                label='Geri - Physical Activity Level Q8'
                component={CustomRadioGroup}
                options={formOptions.geriPhysicalActivityLevelQ8}
                row
              />

              <h3>7. If yes, were any of the falls injurious?</h3>
              <p>
                If participant had 2 or more falls, or 1 fall with injury, REFER TO DOCTOR'S
                CONSULTATION
              </p>
              <FastField
                name='geriPhysicalActivityLevelQ9'
                label='Geri - Physical Activity Level Q9'
                component={CustomRadioGroup}
                options={formOptions.geriPhysicalActivityLevelQ9}
                row
              />

              <h4>
                Please elaborate below on the injuries and whether there was medical treatment e.g.
                seeing Dr/ED dept.
              </h4>
              <FastField
                name='geriPhysicalActivityLevelQ10'
                label='Geri - Physical Activity Level Q10'
                component={CustomTextField}
                multiline
                fullWidth
              />

              <h4>Notes:</h4>
              <FastField
                name='geriPhysicalActivityLevelQ7'
                label='Geri - Physical Activity Level Q7'
                component={CustomTextField}
                multiline
                fullWidth
              />

              <h3 className='red'>Referral to Physiotherapist Consult</h3>
              <FastField
                name='geriPhysicalActivityLevelQ6'
                label='Geri - Physical Activity Level Q6'
                component={CustomCheckboxGroup}
                options={formOptions.geriPhysicalActivityLevelQ6.map((o) => o.value)}
              />
            </div>

            {submitCount > 0 && Object.keys(errors || {}).length > 0 && (
              <Typography color='error' variant='body2' sx={{ mb: 1 }}>
                Please fill in all required fields correctly.
              </Typography>
            )}

            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
              {loading ? (
                <CircularProgress />
              ) : (
                <Button type='submit' variant='contained' color='primary'>
                  Submit
                </Button>
              )}
            </Box>

            <br />
            <Divider />
          </Form>
        </Paper>
      )}
    </Formik>
  )
}

export default GeriPhysicalActivityLevelForm
