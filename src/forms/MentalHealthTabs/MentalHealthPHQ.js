import React, { Fragment, useContext, useEffect, useState } from 'react'
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

import { submitForm } from '../../api/api.js'
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

const yesNo = ['Yes', 'No']

const dayRangeFormOptions = dayRange.map((d) => ({ label: d, value: d }))
const yesNoFormOptions = yesNo.map((d) => ({ label: d, value: d }))

const schema = Yup.object({
  PHQ1: Yup.string().oneOf(dayRange).required('Required'),
  PHQ2: Yup.string().oneOf(dayRange).required('Required'),
  PHQ3: Yup.string().oneOf(dayRange).required('Required'),
  PHQ4: Yup.string().oneOf(dayRange).required('Required'),
  PHQ5: Yup.string().oneOf(dayRange).required('Required'),
  PHQ6: Yup.string().oneOf(dayRange).required('Required'),
  PHQ7: Yup.string().oneOf(dayRange).required('Required'),
  PHQ8: Yup.string().oneOf(dayRange).required('Required'),
  PHQ9: Yup.string().oneOf(dayRange).required('Required'),
  PHQextra9: Yup.string().oneOf(yesNo).optional(),
  PHQ11: Yup.string().oneOf(yesNo).required('Required'),
  PHQShortAns11: Yup.string().optional(),
})

const formName = 'geriPhqForm'

const RadioField = ({ name, label, options }) => {
  const { values, handleChange } = useFormikContext()
  return (
    <div>
      <FormLabel>{label}</FormLabel>
      <RadioGroup name={name} value={values[name]} onChange={handleChange}>
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

const GetScore = () => {
  const { values } = useFormikContext()
  const pointsMap = {
    '0 - Not at all': 0,
    '1 - Several days': 1,
    '2 - More than half the days': 2,
    '3 - Nearly everyday': 3,
  }
  const questions = ['PHQ1', 'PHQ2', 'PHQ3', 'PHQ4', 'PHQ5', 'PHQ6', 'PHQ7', 'PHQ8', 'PHQ9']
  const score = questions.reduce((sum, q) => sum + (pointsMap[values[q]] || 0), 0)
  return (
    <Fragment>
      <p className='blue'>{score} / 27</p>
      {score >= 10 && (
        <font color='red'>
          <b>Patient fails PHQ, score is 10 and above</b>
        </font>
      )}
      <br />
    </Fragment>
  )
}

const MentalPhqForm = (props) => {
  const { patientId } = useContext(FormContext)
  const { changeTab, nextTab } = props
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
    PHQ11: '',
    PHQShortAns11: '',
  })

  useEffect(() => {
    const fetchData = async () => {
      const savedData = await getSavedData(patientId, formName)
      if (savedData) setInitialValues(savedData)
    }
    fetchData()
  }, [patientId])

  return (
    <Paper elevation={2} p={0} m={0}>
      <Formik
        initialValues={initialValues}
        enableReinitialize
        validationSchema={schema}
        onSubmit={async (values, { setSubmitting }) => {
          setSubmitting(true)
          const pointsMap = {
            '0 - Not at all': 0,
            '1 - Several days': 1,
            '2 - More than half the days': 2,
            '3 - Nearly everyday': 3,
          }
          values.PHQ10 = [
            'PHQ1',
            'PHQ2',
            'PHQ3',
            'PHQ4',
            'PHQ5',
            'PHQ6',
            'PHQ7',
            'PHQ8',
            'PHQ9',
          ].reduce((sum, q) => sum + (pointsMap[values[q]] || 0), 0)

          const response = await submitForm(values, patientId, formName)
          setSubmitting(false)
          if (response.result) {
            setTimeout(() => {
              alert('Successfully submitted form')
              changeTab(null, nextTab)
            }, 80)
          } else {
            setTimeout(() => {
              alert(`Unsuccessful. ${response.error}`)
            }, 80)
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <div className='form--div'>
              <h2>
                **When asking these questions, please let patient know that it can be sensitive**
              </h2>
              <br />
              <h2>
                Over the last 2 weeks, how often have you been bothered by any of the following
                problems?
              </h2>
              <h3>1. Little interest or pleasure in doing things</h3>
              <RadioField name='PHQ1' label='PHQ1' options={dayRangeFormOptions} />
              <h3>2. Feeling down, depressed or hopeless</h3>
              <RadioField name='PHQ2' label='PHQ2' options={dayRangeFormOptions} />
              <h3>3. Trouble falling asleep or staying asleep, or sleeping too much</h3>
              <RadioField name='PHQ3' label='PHQ3' options={dayRangeFormOptions} />
              <h3>4. Feeling tired or having little energy</h3>
              <RadioField name='PHQ4' label='PHQ4' options={dayRangeFormOptions} />
              <h3>5. Poor appetite or overeating</h3>
              <RadioField name='PHQ5' label='PHQ5' options={dayRangeFormOptions} />
              <h3>
                6. Feeling bad about yourself, or that you are a failure or have let yourself or
                your family down
              </h3>
              <RadioField name='PHQ6' label='PHQ6' options={dayRangeFormOptions} />
              <h3>
                7. Trouble concentrating on things, such as reading the newspaper or television
              </h3>
              <RadioField name='PHQ7' label='PHQ7' options={dayRangeFormOptions} />
              <h3>
                8. Moving or speaking so slowly that other people have noticed? Or the opposite,
                being so fidgety or restless that you have been moving around a lot more than usual
              </h3>
              <RadioField name='PHQ8' label='PHQ8' options={dayRangeFormOptions} />
              <h3>9. Thoughts that you would be better off dead or hurting yourself in some way</h3>
              <RadioField name='PHQ9' label='PHQ9' options={dayRangeFormOptions} />
              <PopupText
                qnNo='PHQ9'
                triggerValue={[
                  '1 - Several days',
                  '2 - More than half the days',
                  '3 - Nearly everyday',
                ]}
              >
                <h3>*Do you want to take your life now?*</h3>
                <RadioField name='PHQextra9' label='PHQextra9' options={yesNoFormOptions} />
              </PopupText>
              <PopupText qnNo='PHQextra9' triggerValue='Yes'>
                <font color='red'>
                  <b>*Patient requires urgent attention, please escalate*</b>
                </font>
              </PopupText>
              <h3>Score:</h3>
              <GetScore />
              <h3>Do you feel like the patient will benefit from counselling? Specify why.</h3>
              <RadioField name='PHQ11' label='PHQ11' options={yesNoFormOptions} />
              <h4>Please specify.</h4>
              <Field
                name='PHQShortAns11'
                as={TextField}
                label='PHQ11'
                fullWidth
                multiline
                minRows={2}
              />
              <ErrorMessage name='PHQShortAns11' component='div' style={{ color: 'red' }} />
              <br />
            </div>
            <br />
            <div>
              {isSubmitting ? (
                <CircularProgress />
              ) : (
                <Button type='submit' variant='contained' color='primary'>
                  Submit
                </Button>
              )}
            </div>
            <Divider />
          </Form>
        )}
      </Formik>
    </Paper>
  )
}

MentalPhqForm.contextType = FormContext
export default MentalPhqForm
