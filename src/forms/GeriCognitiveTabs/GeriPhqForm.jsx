import React, { Fragment, useContext, useEffect, useState } from 'react'
import * as Yup from 'yup'
import { useFormik } from 'formik'
import {
  FormControlLabel,
  TextField,
  RadioGroup,
  Radio,
  Button,
  CircularProgress,
  Typography,
  Paper,
} from '@mui/material'

import { submitForm } from '../../api/api.jsx'
import { FormContext } from '../../api/utils.js'
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
  PHQextra9: Yup.string().oneOf(yesNo).optional(),
  PHQ10: Yup.number().optional(),
  PHQ11: Yup.string().oneOf(yesNo).required('Required'),
  PHQShortAns11: Yup.string().optional(),
})

const formName = 'geriPhqForm'

const disabledRadioStyles = {
  '& .MuiSvgIcon-root': {
    color: 'rgba(0, 0, 0, 0.38)',
  },
  '& .Mui-checked .MuiSvgIcon-root': {
    color: 'rgba(0, 0, 0, 0.38)',
  },
}

const GetScore = ({ formik }) => {
  const pointsMap = {
    '0 - Not at all': 0,
    '1 - Several days': 1,
    '2 - More than half the days': 2,
    '3 - Nearly everyday': 3,
  }

  const questions = ['PHQ1', 'PHQ2', 'PHQ3', 'PHQ4', 'PHQ5', 'PHQ6', 'PHQ7', 'PHQ8', 'PHQ9']
  const score = questions.reduce((sum, q) => sum + (pointsMap[formik.values[q]] || 0), 0)

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

const GeriPhqForm = (props) => {
  const { patientId } = useContext(FormContext)
  const { changeTab, nextTab } = props
  const [loading, setLoading] = useState(false)
  const [savedData, setSavedData] = useState({})

  useEffect(() => {
    const fetchData = async () => {
      const savedData = await getSavedData(patientId, formName)
      if (savedData) setSavedData(savedData)
    }
    fetchData()
  }, [patientId])

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      PHQ1: savedData?.PHQ1 || '',
      PHQ2: savedData?.PHQ2 || '',
      PHQ3: savedData?.PHQ3 || '',
      PHQ4: savedData?.PHQ4 || '',
      PHQ5: savedData?.PHQ5 || '',
      PHQ6: savedData?.PHQ6 || '',
      PHQ7: savedData?.PHQ7 || '',
      PHQ8: savedData?.PHQ8 || '',
      PHQ9: savedData?.PHQ9 || '',
      PHQextra9: savedData?.PHQextra9 || '',
      PHQ10: savedData?.PHQ10 || 0,
      PHQ11: savedData?.PHQ11 || '',
      PHQShortAns11: savedData?.PHQShortAns11 || '',
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      setLoading(true)
      const score = questions.reduce((sum, q) => sum + (pointsMap[values[q]] || 0), 0)
      values.PHQ10 = score
      const response = await submitForm(values, patientId, formName)
      setLoading(false)
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
    },
  })

  const PopupText = ({ qnNo, triggerValue, children, formik }) => {
    if (!formik) return null

    const value = formik.values[qnNo]

    const shouldShow = Array.isArray(triggerValue)
      ? triggerValue.includes(value)
      : value === triggerValue

    return shouldShow ? <div>{children}</div> : null
  }

  return (
    <Paper elevation={2} p={0} m={0}>
      <form onSubmit={formik.handleSubmit}>
        <div className='form--div'>
          <h2>
            Over the last 2 weeks, how often have you been bothered by any of the following
            problems?
          </h2>
          <h3>1. Little interest or pleasure in doing things</h3>
          <RadioGroup name='PHQ1' value={formik.values.PHQ1} sx={disabledRadioStyles}>
            {dayRangeFormOptions.map(({ label, value }) => (
              <FormControlLabel key={value} value={value} control={<Radio />} label={label} />
            ))}
          </RadioGroup>

          <h3>2. Feeling down, depressed or hopeless</h3>
          <RadioGroup name='PHQ2' value={formik.values.PHQ2} sx={disabledRadioStyles}>
            {dayRangeFormOptions.map(({ label, value }) => (
              <FormControlLabel key={value} value={value} control={<Radio />} label={label} />
            ))}
          </RadioGroup>

          <h3>3. Trouble falling asleep or staying asleep, or sleeping too much</h3>
          <RadioGroup name='PHQ3' value={formik.values.PHQ3} sx={disabledRadioStyles}>
            {dayRangeFormOptions.map(({ label, value }) => (
              <FormControlLabel key={value} value={value} control={<Radio />} label={label} />
            ))}
          </RadioGroup>

          <h3>4. Feeling tired or having little energy</h3>
          <RadioGroup name='PHQ4' value={formik.values.PHQ4} sx={disabledRadioStyles}>
            {dayRangeFormOptions.map(({ label, value }) => (
              <FormControlLabel key={value} value={value} control={<Radio />} label={label} />
            ))}
          </RadioGroup>

          <h3>5. Poor appetite or overeating</h3>
          <RadioGroup name='PHQ5' value={formik.values.PHQ5} sx={disabledRadioStyles}>
            {dayRangeFormOptions.map(({ label, value }) => (
              <FormControlLabel key={value} value={value} control={<Radio />} label={label} />
            ))}
          </RadioGroup>

          <h3>
            6. Feeling bad about yourself, or that you are a failure or have let yourself or your
            family down
          </h3>
          <RadioGroup name='PHQ6' value={formik.values.PHQ6} sx={disabledRadioStyles}>
            {dayRangeFormOptions.map(({ label, value }) => (
              <FormControlLabel key={value} value={value} control={<Radio />} label={label} />
            ))}
          </RadioGroup>

          <h3>7. Trouble concentrating on things, such as reading the newspaper or television</h3>
          <RadioGroup name='PHQ7' value={formik.values.PHQ7} sx={disabledRadioStyles}>
            {dayRangeFormOptions.map(({ label, value }) => (
              <FormControlLabel key={value} value={value} control={<Radio />} label={label} />
            ))}
          </RadioGroup>

          <h3>
            8. Moving or speaking so slowly that other people have noticed? Or the opposite, being
            so fidgety or restless that you have been moving around a lot more than usual
          </h3>
          <RadioGroup name='PHQ8' value={formik.values.PHQ8} sx={disabledRadioStyles}>
            {dayRangeFormOptions.map(({ label, value }) => (
              <FormControlLabel key={value} value={value} control={<Radio />} label={label} />
            ))}
          </RadioGroup>

          <h3>9. Thoughts that you would be better off dead or hurting yourself in some way</h3>
          <RadioGroup name='PHQ9' value={formik.values.PHQ9} sx={disabledRadioStyles}>
            {dayRangeFormOptions.map(({ label, value }) => (
              <FormControlLabel key={value} value={value} control={<Radio />} label={label} />
            ))}
          </RadioGroup>

          <PopupText
            qnNo='PHQ9'
            formik={formik}
            triggerValue={[
              '1 - Several days',
              '2 - More than half the days',
              '3 - Nearly everyday',
            ]}
          >
            <h3>*Do you want to take your life now?*</h3>
            <RadioGroup name='PHQextra9' value={formik.values.PHQextra9} sx={disabledRadioStyles}>
              {yesNoFormOptions.map(({ label, value }) => (
                <FormControlLabel key={value} value={value} control={<Radio />} label={label} />
              ))}
            </RadioGroup>
          </PopupText>

          <PopupText qnNo='PHQextra9' triggerValue='Yes' formik={formik}>
            <font color='red'>
              <b>*Patient requires urgent attention, please escalate*</b>
            </font>
          </PopupText>
          <h3>Score:</h3>
          <GetScore formik={formik} />
          <h3>Do you feel like the patient will benefit from counselling? Specify why.</h3>
          <RadioGroup name='PHQ11' value={formik.values.PHQ11} sx={disabledRadioStyles}>
            {yesNoFormOptions.map(({ label, value }) => (
              <FormControlLabel key={value} value={value} control={<Radio />} label={label} />
            ))}
          </RadioGroup>

          <h4>Please specify.</h4>
          <TextField
            name='PHQShortAns11'
            label='PHQ11'
            multiline
            minRows={2}
            fullWidth
            value={formik.values.PHQShortAns11}
            sx={{ mt: 2, ...disabledRadioStyles }}
          />

          <br />
          <Button
            type='submit'
            variant='contained'
            color='primary'
            disabled={formik.isSubmitting || loading}
            sx={{ mt: 2 }}
          >
            {loading ? <CircularProgress size={24} /> : 'Submit'}
          </Button>
        </div>
      </form>
    </Paper>
  )
}

GeriPhqForm.contextType = FormContext
export default GeriPhqForm
