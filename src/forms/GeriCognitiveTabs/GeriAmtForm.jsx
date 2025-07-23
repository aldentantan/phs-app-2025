import React, { useContext, useEffect, useState } from 'react'
import { Divider, Paper, CircularProgress, Box, Button, Typography } from '@mui/material'
import { Formik, Form, Field } from 'formik'
import * as Yup from 'yup'
import { submitForm } from '../../api/api.jsx'
import { FormContext } from '../../api/utils.js'
import { getSavedData } from '../../services/mongoDB'
import CustomRadioGroup from '../../components/form-components/CustomRadioGroup'
import '../fieldPadding.css'
import '../forms.css'

const formName = 'geriAmtForm'

const validationSchema = Yup.object(
  Object.fromEntries(
    Array.from({ length: 10 }, (_, i) => [
      `geriAmtQ${i + 1}`,
      Yup.string()
        .oneOf(['Yes (Answered correctly)', 'No (Answered incorrectly)'])
        .required('Required'),
    ]),
  ),
)

const options = [
  { label: 'Yes (Answered correctly)', value: 'Yes (Answered correctly)' },
  { label: 'No (Answered incorrectly)', value: 'No (Answered incorrectly)' },
]

const getScore = (values) => {
  return Array.from({ length: 10 }, (_, i) => values[`geriAmtQ${i + 1}`]).filter(
    (v) => v === 'Yes (Answered correctly)',
  ).length
}

const getInitialValues = (savedData) => {
  return Object.fromEntries(
    Array.from({ length: 10 }, (_, i) => [`geriAmtQ${i + 1}`, savedData[`geriAmtQ${i + 1}`] || '']),
  )
}

const GeriAmtForm = ({ changeTab, nextTab }) => {
  const { patientId } = useContext(FormContext)
  const [initialValues, setInitialValues] = useState(() => getInitialValues({}))
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      const savedData = await getSavedData(patientId, formName)
      setInitialValues(getInitialValues(savedData))
    }
    fetchData()
  }, [patientId])

  return (
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
          alert('Successfully submitted form')
          changeTab(null, nextTab)
        } else {
          alert(`Unsuccessful. ${response.error}`)
        }
      }}
    >
      {(formikProps, handleSubmit, errors, submitCount) => (
        <Paper>
          <Form className='fieldPadding'>
            <div className='form--div'>
              <h1>ABBREVIATED MENTAL TEST (for dementia)</h1>
              <h2>
                Please select 'Yes' if participant answered correctly or 'No' if answered
                incorrectly.
              </h2>

              {[...Array(10)].map((_, i) => {
                const qNum = i + 1
                return (
                  <div key={qNum}>
                    <h3>
                      {`${qNum})`} {`Question ${qNum}`} {getQuestionText(qNum)}
                    </h3>
                    <Typography variant='body2' gutterBottom>
                      {`Was Q${qNum} answered correctly?`}
                    </Typography>
                    <Field
                      name={`geriAmtQ${qNum}`}
                      label={`geriAmtQ${qNum}`}
                      component={CustomRadioGroup}
                      options={options}
                      row
                    />
                  </div>
                )
              })}
              <h4>AMT Total Score: {getScore(formikProps.values)} /10</h4>
            </div>

            {submitCount > 0 && Object.keys(errors || {}).length > 0 && (
              <Typography color='error' variant='body2' sx={{ mb: 1 }}>
                Please fill in all required fields correctly.
              </Typography>
            )}

            <br />

            <div>
              {loading ? (
                <CircularProgress />
              ) : (
                <Button type='submit' variant='contained' color='primary'>
                  Submit
                </Button>
              )}
            </div>
          </Form>
        </Paper>
      )}
    </Formik>
  )
}

const getQuestionText = (qNum) => {
  const textMap = {
    1: 'What is the year? 请问今是什么年份？',
    2: 'About what time is it? (within 1 hour) 请问现在大约是几点钟（一在一个小时之内）？',
    3: 'What is your age? 请问您今年几岁？',
    4: 'What is your date of birth? 请问您的出生日期或生日？',
    5: 'What is your home address? 请问您的住家地址是在什么地方？',
    6: 'Where are we now? 请问我们现在正在什么地方？',
    7: "Who is our country's Prime Minister? 请问新加坡现任总理是哪位？",
    8: 'What is his/her job? (show picture) 请问图片里的人士很有可能是从事哪种行业？',
    9: 'Count backwards from 20 to 1. 请您从二十开始，倒数到一。',
    10: 'Recall memory phase 请您把刚才我要您记住的地址重复一遍。',
  }
  return textMap[qNum] || ''
}

export default GeriAmtForm
