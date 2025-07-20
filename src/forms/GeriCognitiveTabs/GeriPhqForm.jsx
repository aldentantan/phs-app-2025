import React, { useState, useEffect, useContext, Fragment } from 'react'
import { 
  Divider, 
  Paper, 
  CircularProgress, 
  Box, 
  Button, 
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormHelperText,
  Alert
} from '@mui/material'
import { Formik, Form, Field } from 'formik'
import * as Yup from 'yup'
import { submitForm } from '../../api/api.jsx'
import { FormContext } from '../../api/utils.js'
import PopupText from 'src/utils/popupText'
import { getSavedData } from '../../services/mongoDB'
import '../fieldPadding.css'

const dayRange = [
  '0 - Not at all',
  '1 - Several days',
  '2 - More than half the days',
  '3 - Nearly everyday',
]

const dayRangeFormOptions = [
  { label: '0 - Not at all', value: '0 - Not at all' },
  { label: '1 - Several days', value: '1 - Several days' },
  { label: '2 - More than half the days', value: '2 - More than half the days' },
  { label: '3 - Nearly everyday', value: '3 - Nearly everyday' },
]

const validationSchema = Yup.object({
  PHQ1: Yup.string().oneOf(dayRange).required('Required'),
  PHQ2: Yup.string().oneOf(dayRange).required('Required'),
  PHQ3: Yup.string().oneOf(dayRange).required('Required'),
  PHQ4: Yup.string().oneOf(dayRange).required('Required'),
  PHQ5: Yup.string().oneOf(dayRange).required('Required'),
  PHQ6: Yup.string().oneOf(dayRange).required('Required'),
  PHQ7: Yup.string().oneOf(dayRange).required('Required'),
  PHQ8: Yup.string().oneOf(dayRange).required('Required'),
  PHQ9: Yup.string().oneOf(dayRange).required('Required'),
  PHQextra9: Yup.string().oneOf(['Yes', 'No']).notRequired(),
  PHQ10: Yup.number().notRequired(),
  PHQ11: Yup.string().oneOf(['Yes', 'No']).required('Required'),
  PHQShortAns11: Yup.string().notRequired(),
})

// Custom Radio Field Component
const RadioField = ({ field, form, options, label, ...props }) => {
  const { name } = field
  const hasError = form.touched[name] && form.errors[name]
  
  return (
    <FormControl component="fieldset" error={hasError} margin="normal" fullWidth>
      <FormLabel component="legend">{label}</FormLabel>
      <RadioGroup {...field} {...props}>
        {options.map((option) => (
          <FormControlLabel
            key={option.value}
            value={option.value}
            control={<Radio />}
            label={option.label}
          />
        ))}
      </RadioGroup>
      {hasError && (
        <FormHelperText>{form.errors[name]}</FormHelperText>
      )}
    </FormControl>
  )
}

const formName = 'geriPhqForm'

function getScore(values) {
  const points = {
    '0 - Not at all': 0,
    '1 - Several days': 1,
    '2 - More than half the days': 2,
    '3 - Nearly everyday': 3,
  }
  let score = 0
  for (let i = 1; i <= 9; i++) {
    score += points[values[`PHQ${i}`]] || 0
  }
  return score
}

const GeriPhqForm = (props) => {
  const { patientId } = useContext(FormContext)
  const { changeTab, nextTab } = props
  const [loading, setLoading] = useState(false)
  const [initialValues, setInitialValues] = useState({
    PHQ1: '',
    PHQ2: '',
    PHQ3: '',
    PHQ4: '',
    PHQ5: '',
    PHQ6: '',
    PHQ7: '',
    PHQ8: '',
    PHQ9: '',
    PHQextra9: '',
    PHQ10: 0,
    PHQ11: '',
    PHQShortAns11: '',
  })

  useEffect(() => {
    const fetchData = async () => {
      const savedData = await getSavedData(patientId, formName)
      setInitialValues({
        PHQ1: savedData.PHQ1 || '',
        PHQ2: savedData.PHQ2 || '',
        PHQ3: savedData.PHQ3 || '',
        PHQ4: savedData.PHQ4 || '',
        PHQ5: savedData.PHQ5 || '',
        PHQ6: savedData.PHQ6 || '',
        PHQ7: savedData.PHQ7 || '',
        PHQ8: savedData.PHQ8 || '',
        PHQ9: savedData.PHQ9 || '',
        PHQextra9: savedData.PHQextra9 || '',
        PHQ10: savedData.PHQ10 || 0,
        PHQ11: savedData.PHQ11 || '',
        PHQShortAns11: savedData.PHQShortAns11 || '',
      })
    }
    fetchData()
  }, [patientId])

  const yesNoOptions = [
    { label: 'Yes', value: 'Yes' },
    { label: 'No', value: 'No' },
  ]

  return (
    <Paper elevation={2} p={0} m={0}>
      <Formik
        enableReinitialize
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={async (values, { setSubmitting }) => {
          setLoading(true)
          const score = getScore(values)
          values.PHQ10 = score
          const response = await submitForm(values, patientId, formName)
          setLoading(false)
          setSubmitting(false)
          if (response.result) {
            const event = null
            setTimeout(() => {
              alert('Successfully submitted form')
              changeTab(event, nextTab)
            }, 80)
          } else {
            setTimeout(() => {
              alert(`Unsuccessful. ${response.error}`)
            }, 80)
          }
        }}
      >
        {({ values, errors, touched, isSubmitting }) => {
          const score = getScore(values)
          return (
            <Form className='fieldPadding'>
              <div className='form--div'>
                <h2>
                  Over the last 2 weeks, how often have you been bothered by any of the following problems?
                </h2>
                
                <h3>1. Little interest or pleasure in doing things</h3>
                <Field 
                  name="PHQ1" 
                  component={RadioField} 
                  label="Question 1" 
                  options={dayRangeFormOptions} 
                />
                
                <h3>2. Feeling down, depressed or hopeless</h3>
                <Field 
                  name="PHQ2" 
                  component={RadioField} 
                  label="Question 2" 
                  options={dayRangeFormOptions} 
                />
                
                <h3>3. Trouble falling asleep or staying asleep, or sleeping too much</h3>
                <Field 
                  name="PHQ3" 
                  component={RadioField} 
                  label="Question 3" 
                  options={dayRangeFormOptions} 
                />
                
                <h3>4. Feeling tired or having little energy</h3>
                <Field 
                  name="PHQ4" 
                  component={RadioField} 
                  label="Question 4" 
                  options={dayRangeFormOptions} 
                />
                
                <h3>5. Poor appetite or overeating</h3>
                <Field 
                  name="PHQ5" 
                  component={RadioField} 
                  label="Question 5" 
                  options={dayRangeFormOptions} 
                />
                
                <h3>6. Feeling bad about yourself, or that you are a failure or have let yourself or your family down</h3>
                <Field 
                  name="PHQ6" 
                  component={RadioField} 
                  label="Question 6" 
                  options={dayRangeFormOptions} 
                />
                
                <h3>7. Trouble concentrating on things, such as reading the newspaper or television</h3>
                <Field 
                  name="PHQ7" 
                  component={RadioField} 
                  label="Question 7" 
                  options={dayRangeFormOptions} 
                />
                
                <h3>8. Moving or speaking so slowly that other people have noticed? Or the opposite, being so fidgety or restless that you have been moving around a lot more than usual</h3>
                <Field 
                  name="PHQ8" 
                  component={RadioField} 
                  label="Question 8" 
                  options={dayRangeFormOptions} 
                />
                
                <h3>9. Thoughts that you would be better off dead or hurting yourself in some way</h3>
                <Field 
                  name="PHQ9" 
                  component={RadioField} 
                  label="Question 9" 
                  options={dayRangeFormOptions} 
                />
                
                <PopupText qnNo='PHQ9' triggerValue={['1 - Several days', '2 - More than half the days', '3 - Nearly everyday']}>
                  <h3>*Do you want to take your life now?*</h3>
                  <Field 
                    name="PHQextra9" 
                    component={RadioField} 
                    label="Suicidal ideation" 
                    options={yesNoOptions} 
                  />
                </PopupText>
                
                <PopupText qnNo='PHQextra9' triggerValue='Yes'>
                  <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
                    <strong>*Patient requires urgent attention, please escalate*</strong>
                  </Alert>
                </PopupText>
                
                <h3>Score:</h3>
                {score >= 10 ? (
                  <Fragment>
                    <p className='blue'>{score} / 27</p>
                    <Alert severity="error" sx={{ mt: 1, mb: 2 }}>
                      <strong>Patient fails PHQ, score is 10 and above</strong>
                    </Alert>
                  </Fragment>
                ) : (
                  <p className='blue'>{score} / 27</p>
                )}
                
                <h3>Do you feel like the patient will benefit from counselling? Specify why.</h3>
                <Field 
                  name="PHQ11" 
                  component={RadioField} 
                  label="Benefit from counselling?" 
                  options={yesNoOptions} 
                />
                
                <h4>Please specify.</h4>
                <Field
                  as={TextField}
                  name="PHQShortAns11"
                  label="Please specify why patient would benefit from counselling"
                  fullWidth
                  variant="outlined"
                  margin="normal"
                  multiline
                  rows={4}
                  error={touched.PHQShortAns11 && !!errors.PHQShortAns11}
                  helperText={touched.PHQShortAns11 && errors.PHQShortAns11}
                />
              </div>

              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                {loading || isSubmitting ? (
                  <CircularProgress />
                ) : (
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    size="large"
                    disabled={isSubmitting}
                  >
                    Submit
                  </Button>
                )}
              </Box>

              <br />
              <Divider />
            </Form>
          )
        }}
      </Formik>
    </Paper>
  )
}

export default GeriPhqForm