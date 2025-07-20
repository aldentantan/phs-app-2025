import React, { useContext, useEffect, useState } from 'react'
import { 
  Divider, 
  Paper, 
  CircularProgress, 
  Box, 
  Button,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormHelperText,
  Typography
} from '@mui/material'
import { Formik, Form, Field } from 'formik'
import * as Yup from 'yup'
import { submitForm } from '../../api/api.jsx'
import { FormContext } from '../../api/utils.js'
import { getSavedData } from '../../services/mongoDB'
import '../fieldPadding.css'
import '../forms.css'

const validationSchema = Yup.object({
  geriAmtQ1: Yup.string().oneOf(['Yes (Answered correctly)', 'No (Answered incorrectly)']).required('Required'),
  geriAmtQ2: Yup.string().oneOf(['Yes (Answered correctly)', 'No (Answered incorrectly)']).required('Required'),
  geriAmtQ3: Yup.string().oneOf(['Yes (Answered correctly)', 'No (Answered incorrectly)']).required('Required'),
  geriAmtQ4: Yup.string().oneOf(['Yes (Answered correctly)', 'No (Answered incorrectly)']).required('Required'),
  geriAmtQ5: Yup.string().oneOf(['Yes (Answered correctly)', 'No (Answered incorrectly)']).required('Required'),
  geriAmtQ6: Yup.string().oneOf(['Yes (Answered correctly)', 'No (Answered incorrectly)']).required('Required'),
  geriAmtQ7: Yup.string().oneOf(['Yes (Answered correctly)', 'No (Answered incorrectly)']).required('Required'),
  geriAmtQ8: Yup.string().oneOf(['Yes (Answered correctly)', 'No (Answered incorrectly)']).required('Required'),
  geriAmtQ9: Yup.string().oneOf(['Yes (Answered correctly)', 'No (Answered incorrectly)']).required('Required'),
  geriAmtQ10: Yup.string().oneOf(['Yes (Answered correctly)', 'No (Answered incorrectly)']).required('Required'),
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

function getScore(values) {
  let score = 0
  for (let i = 1; i <= 10; i++) {
    if (values[`geriAmtQ${i}`] === 'Yes (Answered correctly)') score += 1
  }
  return score
}

const formName = 'geriAmtForm'

const GeriAmtForm = (props) => {
  const { patientId } = useContext(FormContext)
  const [loading, setLoading] = useState(false)
  const { changeTab, nextTab } = props
  const [initialValues, setInitialValues] = useState({
    geriAmtQ1: '',
    geriAmtQ2: '',
    geriAmtQ3: '',
    geriAmtQ4: '',
    geriAmtQ5: '',
    geriAmtQ6: '',
    geriAmtQ7: '',
    geriAmtQ8: '',
    geriAmtQ9: '',
    geriAmtQ10: '',
  })

  useEffect(() => {
    const fetchData = async () => {
      const savedData = await getSavedData(patientId, formName)
      setInitialValues({
        geriAmtQ1: savedData.geriAmtQ1 || '',
        geriAmtQ2: savedData.geriAmtQ2 || '',
        geriAmtQ3: savedData.geriAmtQ3 || '',
        geriAmtQ4: savedData.geriAmtQ4 || '',
        geriAmtQ5: savedData.geriAmtQ5 || '',
        geriAmtQ6: savedData.geriAmtQ6 || '',
        geriAmtQ7: savedData.geriAmtQ7 || '',
        geriAmtQ8: savedData.geriAmtQ8 || '',
        geriAmtQ9: savedData.geriAmtQ9 || '',
        geriAmtQ10: savedData.geriAmtQ10 || '',
      })
    }
    fetchData()
  }, [patientId])

  const options = [
    { label: 'Yes (Answered correctly)', value: 'Yes (Answered correctly)' },
    { label: 'No (Answered incorrectly)', value: 'No (Answered incorrectly)' },
  ]

  return (
    <Paper elevation={2} p={0} m={0}>
      <Formik
        enableReinitialize
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={async (values, { setSubmitting }) => {
          setLoading(true)
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
        {({ values, isSubmitting }) => (
          <Form className='fieldPadding'>
            <div className='form--div'>
              <h1>ABBREVIATED MENTAL TEST (for dementia)</h1>
              <h2>
                Please select &apos;Yes&apos; if participant answered correctly or &apos;No&apos; if participant answered incorrectly.
              </h2>
              
              <h3>1) What is the year? 请问今是什么年份？</h3>
              <Typography variant="body2" gutterBottom>Was Q1 answered correctly?</Typography>
              <Field 
                name="geriAmtQ1" 
                component={RadioField} 
                label="Question 1 - Year" 
                options={options} 
              />
              
              <h3>2) About what time is it? (within 1 hour) 请问现在大约是几点钟 （一在一个小时之内）？</h3>
              <Typography variant="body2" gutterBottom>Was Q2 answered correctly?</Typography>
              <Field 
                name="geriAmtQ2" 
                component={RadioField} 
                label="Question 2 - Time" 
                options={options} 
              />
              
              <h3>Ask volunteer to memorise memory phase: &quot; 37 Bukit Timah Road &quot;<br />请您记住以下这个地址， 我将在数分钟后要您重复一遍：37 号， 武吉支马路</h3>
              
              <h3>3) What is your age? 请问您今年几岁？</h3>
              <Typography variant="body2" gutterBottom>Was Q3 answered correctly?</Typography>
              <Field 
                name="geriAmtQ3" 
                component={RadioField} 
                label="Question 3 - Age" 
                options={options} 
              />
              
              <h3>4) What is your date of birth? 请问您的出生日期或生日？ • 几月 • 几号</h3>
              <Typography variant="body2" gutterBottom>Was Q4 answered correctly?</Typography>
              <Field 
                name="geriAmtQ4" 
                component={RadioField} 
                label="Question 4 - Date of birth" 
                options={options} 
              />
              
              <h3>5) What is your home address?<br />请问您的（住家）地址是在什么地方？<br />(1) 门牌; (2)几楼或哪一层; (3)大牌; (4)路名</h3>
              <Typography variant="body2" gutterBottom>Was Q5 answered correctly?</Typography>
              <Field 
                name="geriAmtQ5" 
                component={RadioField} 
                label="Question 5 - Home address" 
                options={options} 
              />
              
              <h3>6) Where are we now? (The name of building or the nature of the building e.g. hospital, day centre etc)<br />请问我们现在正在什么地方？（例：建筑名称或用途）</h3>
              <Typography variant="body2" gutterBottom>Was Q6 answered correctly?</Typography>
              <Field 
                name="geriAmtQ6" 
                component={RadioField} 
                label="Question 6 - Current location" 
                options={options} 
              />
              
              <h3>7) Who is our country&apos;s Prime Minister?<br />请问新加坡现任总理是哪位？</h3>
              <Typography variant="body2" gutterBottom>Was Q7 answered correctly?</Typography>
              <Field 
                name="geriAmtQ7" 
                component={RadioField} 
                label="Question 7 - Prime Minister" 
                options={options} 
              />
              
              <h3>8) What is his/her job? (show picture)<br />请问图片里的人士很有可能是从事哪种行业？</h3>
              <Typography variant="body2" gutterBottom>Was Q8 answered correctly?</Typography>
              <Field 
                name="geriAmtQ8" 
                component={RadioField} 
                label="Question 8 - Job identification" 
                options={options} 
              />
              
              <h3>9) Count backwards from 20 to 1. 请您从二十开始，倒数到一。</h3>
              <Typography variant="body2" gutterBottom>Was Q9 answered correctly?</Typography>
              <Field 
                name="geriAmtQ9" 
                component={RadioField} 
                label="Question 9 - Count backwards" 
                options={options} 
              />
              
              <h3>10) Recall memory phase 请您把刚才我要您记住的地址重复一遍。</h3>
              <Typography variant="body2" gutterBottom>Was Q10 answered correctly?</Typography>
              <Field 
                name="geriAmtQ10" 
                component={RadioField} 
                label="Question 10 - Recall memory phrase" 
                options={options} 
              />
              
              <h4>
                AMT Total Score: {getScore(values)} /10
              </h4>
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
        )}
      </Formik>
    </Paper>
  )
}

export default GeriAmtForm