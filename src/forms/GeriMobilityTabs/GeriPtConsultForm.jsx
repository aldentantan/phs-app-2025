import React, { useContext, useEffect, useState } from 'react'
import { Formik, FastField } from 'formik'
import * as Yup from 'yup'

import { Divider, Paper, CircularProgress, Button, Typography } from '@mui/material'

import { submitForm, calculateSppbScore } from '../../api/api.jsx'
import { FormContext } from '../../api/utils.js'
import { getSavedData } from '../../services/mongoDB'
import '../fieldPadding.css'
import allForms from '../forms.json'
import Grid from '@mui/material/Grid'
import '../forms.css'

import CustomRadioGroup from '../../components/form-components/CustomRadioGroup'
import CustomTextField from '../../components/form-components/CustomTextField'
import CustomCheckboxGroup from '../../components/form-components/CustomCheckboxGroup'

const formName = 'geriPtConsultForm'

const formOptions = {
  geriPtConsultQ2: [
    { label: 'Yes', value: 'Yes' },
    { label: 'No', value: 'No' },
  ],
  geriPtConsultQ3: [
    {
      label: 'Fall risk (i.e. 2 or more falls/1 fall with injury in the past 1 year)',
      value: 'Fall risk (i.e. 2 or more falls/1 fall with injury in the past 1 year)',
    },
    {
      label: 'Reduced functional mobility (i.e. Short Physical Performance Battery <10)',
      value: 'Reduced functional mobility (i.e. Short Physical Performance Battery <10)',
    },
    { label: 'Others (please specify:)', value: 'Others (please specify:)' },
  ],
  geriPtConsultQ4: [
    { label: 'Yes', value: 'Yes' },
    { label: 'No', value: 'No' },
  ],
}

const validationSchema = Yup.object({
  geriPtConsultQ1: Yup.string().required(),
  geriPtConsultQ2: Yup.string()
    .oneOf(formOptions.geriPtConsultQ2.map((option) => option.value))
    .required(),
  geriPtConsultQ3: Yup.array()
    .of(Yup.string().oneOf(formOptions.geriPtConsultQ3.map((option) => option.value)))
    .nullable(),
  geriPtConsultQ4: Yup.string()
    .oneOf(formOptions.geriPtConsultQ4.map((option) => option.value))
    .required(),
  geriPtConsultQ5: Yup.string(),
  geriPtConsultQ8: Yup.string(),
})

function GetSppbScore(q2, q6, q8) {
  let score = 0
  if (q2 !== undefined) {
    score += parseInt(q2.slice(0))
  }
  if (q6 !== undefined) {
    const num = parseInt(q6.slice(0))
    if (!Number.isNaN(num)) {
      score += num
    }
  }
  if (q8 !== undefined) {
    score += parseInt(q8.slice(0))
  }
  return score
}

const getTotalFrailScaleScore = (doc) => {
  let sum = 0
  try {
    if (doc.geriFrailScaleQ1 !== undefined) {
      sum += parseInt(doc.geriFrailScaleQ1)
    }
    if (doc.geriFrailScaleQ2 !== undefined) {
      sum += parseInt(doc.geriFrailScaleQ2)
    }

    if (doc.geriFrailScaleQ3 !== undefined) {
      sum += parseInt(doc.geriFrailScaleQ3)
    }

    if (doc.geriFrailScaleQ4 !== undefined) {
      const length = doc.geriFrailScaleQ4.length
      const score = length > 4 ? 1 : 0
      sum += score
    }

    if (doc.geriFrailScaleQ5 !== undefined) {
      const weightPercent = parseInt(doc.geriFrailScaleQ5)
      const score = weightPercent > 5 ? 1 : 0
      sum += score
    }
    return sum
  } catch (e) {
    return 'error calculating score'
  }
}

const GeriPtConsultForm = (props) => {
  const { patientId } = useContext(FormContext)
  const { changeTab, nextTab } = props
  const [loading, isLoading] = useState(false)
  const [initialValues, setInitialValues] = useState({
    geriPtConsultQ1: '',
    geriPtConsultQ2: '',
    geriPtConsultQ3: [],
    geriPtConsultQ4: '',
    geriPtConsultQ5: '',
    geriPtConsultQ8: '',
  })
  const [geriParq, setGeriParq] = useState({})
  const [geriPhysicalActivity, setGeriPhysicalActivity] = useState({})
  const [geriFrailScale, setGeriFrailScale] = useState({})
  const [geriSppb, setGeriSppb] = useState({})
  const [geriTug, setGeriTug] = useState({})
  const [loadingSidePanel, isLoadingSidePanel] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      const savedData = getSavedData(patientId, formName)
      const geriParqData = getSavedData(patientId, allForms.geriParQForm)
      const geriPhysicalActivityData = getSavedData(
        patientId,
        allForms.geriPhysicalActivityLevelForm,
      )
      const geriFrailScaleData = getSavedData(patientId, allForms.geriFrailScaleForm)
      const geriSppbData = getSavedData(patientId, allForms.geriSppbForm)
      const geriTugData = getSavedData(patientId, allForms.geriTugForm)

      Promise.all([
        savedData,
        geriParqData,
        geriPhysicalActivityData,
        geriFrailScaleData,
        geriSppbData,
        geriTugData,
      ]).then((result) => {
        setInitialValues(result[0])
        setGeriParq(result[1])
        setGeriPhysicalActivity(result[2])
        setGeriFrailScale(result[3])
        setGeriSppb(result[4])
        setGeriTug(result[5])
        isLoadingSidePanel(false)
      })
    }
    fetchData()
  }, [])

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      enableReinitialize
      onSubmit={async (values, { setSubmitting }) => {
        isLoading(true)
        const response = await submitForm(values, patientId, formName)
        setTimeout(() => {
          isLoading(false)
          setSubmitting(false)
          if (response.result) {
            alert('Successfully submitted form')
            changeTab(null, nextTab)
          } else {
            alert(`Unsuccessful. ${response.error}`)
          }
        }, 80)
      }}
    >
      {({ handleSubmit, errors, submitCount }) => (
        <Paper elevation={2} p={0} m={0}>
          <Grid display='flex' flexDirection='row'>
            <Grid xs={9}>
              <Paper elevation={2} p={0} m={0}>
                <form onSubmit={handleSubmit} className='fieldPadding'>
                  <div className='form--div'>
                    <h1>PT Consult</h1>
                    <h3>Memo (for participant):</h3>
                    <FastField
                      name='geriPtConsultQ1'
                      label='geriPtConsultQ1'
                      component={CustomTextField}
                    />

                    <h3>To be referred for doctor&apos;s consult (PT)?</h3>
                    <FastField
                      name='geriPtConsultQ2'
                      label='geriPtConsultQ2'
                      component={CustomRadioGroup}
                      options={formOptions.geriPtConsultQ2}
                      row
                    />

                    <h4>Reasons for referral to Doctor&apos;s consult (PT):</h4>
                    <FastField
                      name='geriPtConsultQ3'
                      label='geriPtConsultQ3'
                      component={CustomCheckboxGroup}
                      options={formOptions.geriPtConsultQ3}
                    />

                    <h4>Please specify (if others):</h4>
                    <FastField
                      name='geriPtConsultQ8'
                      label='Please specify (if others)'
                      component={CustomTextField}
                    />

                    <h3>To be referred for social support (PT):</h3>
                    <FastField
                      name='geriPtConsultQ4'
                      label='geriPtConsultQ4'
                      component={CustomRadioGroup}
                      options={formOptions.geriPtConsultQ4}
                      row
                    />

                    <h4>Please specify:</h4>
                    <FastField
                      name='geriPtConsultQ5'
                      label='geriPtConsultQ5'
                      component={CustomTextField}
                    />
                  </div>

                  <br />

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

                  <br />
                  <Divider />
                </form>
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
                  <h2>Physical Activity Level Results</h2>
                  <p className='underlined'>How often do you exercise in a week?</p>
                  {geriPhysicalActivity && geriPhysicalActivity.geriPhysicalActivityLevelQ1 ? (
                    <p className='blue'>{geriPhysicalActivity.geriPhysicalActivityLevelQ1}</p>
                  ) : (
                    <p className='blue'>nil</p>
                  )}
                  <p className='underlined'>How long do you exercise each time?</p>
                  {geriPhysicalActivity && geriPhysicalActivity.geriPhysicalActivityLevelQ2 ? (
                    <p className='blue'>{geriPhysicalActivity.geriPhysicalActivityLevelQ2}</p>
                  ) : (
                    <p className='blue'>nil</p>
                  )}
                  <p className='underlined'>What do you do for exercise?</p>
                  {geriPhysicalActivity && geriPhysicalActivity.geriPhysicalActivityLevelQ3 ? (
                    <p className='blue'>{geriPhysicalActivity.geriPhysicalActivityLevelQ3}</p>
                  ) : (
                    <p className='blue'>nil</p>
                  )}
                  <p className='underlined'>
                    How would you rate the level of exertion when you exercise?
                  </p>
                  {geriPhysicalActivity && geriPhysicalActivity.geriPhysicalActivityLevelQ4 ? (
                    <p className='blue'>{geriPhysicalActivity.geriPhysicalActivityLevelQ4}</p>
                  ) : (
                    <p className='blue'>nil</p>
                  )}
                  <p className='underlined'>
                    Do you have significant difficulties going about your regular exercise regime?
                    Or do you not know how to start exercising?
                  </p>
                  {geriPhysicalActivity && geriPhysicalActivity.geriPhysicalActivityLevelQ5 ? (
                    <p className='blue'>{geriPhysicalActivity.geriPhysicalActivityLevelQ5}</p>
                  ) : (
                    <p className='blue'>nil</p>
                  )}
                  <p className='underlined'>
                    History of falls in past 1 year? If yes, how many falls?
                  </p>
                  {geriPhysicalActivity && geriPhysicalActivity.geriPhysicalActivityLevelQ8 ? (
                    <p className='blue'>{geriPhysicalActivity.geriPhysicalActivityLevelQ8}</p>
                  ) : (
                    <p className='blue'>nil</p>
                  )}
                  <p className='underlined'>If yes, were any of the falls injurious?</p>
                  {geriPhysicalActivity && geriPhysicalActivity.geriPhysicalActivityLevelQ9 ? (
                    <p className='blue'>{geriPhysicalActivity.geriPhysicalActivityLevelQ9}</p>
                  ) : (
                    <p className='blue'>nil</p>
                  )}
                  {geriPhysicalActivity && geriPhysicalActivity.geriPhysicalActivityLevelQ10 ? (
                    <p className='blue'>{geriPhysicalActivity.geriPhysicalActivityLevelQ10}</p>
                  ) : (
                    <p className='blue'>nil</p>
                  )}
                  <p className='underlined'>Notes:</p>
                  {geriPhysicalActivity && geriPhysicalActivity.geriPhysicalActivityLevelQ7 ? (
                    <p className='blue'>{geriPhysicalActivity.geriPhysicalActivityLevelQ7}</p>
                  ) : (
                    <p className='blue'>nil</p>
                  )}
                  <p className='underlined'>Reasons for referral to PT Consult:</p>
                  {geriPhysicalActivity && geriPhysicalActivity.geriPhysicalActivityLevelQ6 ? (
                    <p className='blue'>{geriPhysicalActivity.geriPhysicalActivityLevelQ6}</p>
                  ) : (
                    <p className='blue'>nil</p>
                  )}
                  <Divider />
                  <h2>SPPB Scores</h2>
                  <p className='underlined'>
                    Short Physical Performance Battery Score (out of 12):
                  </p>
                  {geriSppb && geriSppb.geriSppbQ2 && geriSppb.geriSppbQ6 && geriSppb.geriSppbQ8 ? (
                    <p className='blue'>
                      {calculateSppbScore(
                        geriSppb.geriSppbQ2,
                        geriSppb.geriSppbQ6,
                        geriSppb.geriSppbQ8,
                      )}
                    </p>
                  ) : (
                    <p className='blue'>nil</p>
                  )}
                  <p className='underlined'>Gait speed (Time taken in seconds):</p>
                  {geriSppb ? (
                    <p className='blue'>{geriSppb.geriSppbQ7}</p>
                  ) : (
                    <p className='blue'>nil</p>
                  )}
                  <p className='underlined'>Gait speed Score (out of 4):</p>
                  {geriSppb ? (
                    <p className='blue'>{geriSppb.geriSppbQ8}</p>
                  ) : (
                    <p className='blue'>nil</p>
                  )}
                  <p className='underlined'>Chair rise (Time taken in seconds):</p>
                  {geriSppb ? (
                    <p className='blue'>{geriSppb.geriSppbQ1}</p>
                  ) : (
                    <p className='blue'>nil</p>
                  )}
                  <p className='underlined'>Number of chairs completed:</p>
                  {geriSppb ? (
                    <p className='blue'>{geriSppb.geriSppbQ13}</p>
                  ) : (
                    <p className='blue'>nil</p>
                  )}
                  <p className='underlined'>5 Chair rise Score (out of 4):</p>
                  {geriSppb ? (
                    <p className='blue'>{geriSppb.geriSppbQ2}</p>
                  ) : (
                    <p className='blue'>nil</p>
                  )}
                  <p className='underlined'>Side to Side (Time taken in seconds):</p>
                  {geriSppb ? (
                    <p className='blue'>{geriSppb.geriSppbQ3}</p>
                  ) : (
                    <p className='blue'>nil</p>
                  )}
                  <p className='underlined'>Semi-tandem Stand (Time taken in seconds):</p>
                  {geriSppb ? (
                    <p className='blue'>{geriSppb.geriSppbQ4}</p>
                  ) : (
                    <p className='blue'>nil</p>
                  )}
                  <p className='underlined'>Tandem Stand (Time taken in seconds):</p>
                  {geriSppb ? (
                    <p className='blue'>{geriSppb.geriSppbQ5}</p>
                  ) : (
                    <p className='blue'>nil</p>
                  )}
                  <p className='underlined'>Balance score (out of 4):</p>
                  {geriSppb ? (
                    <p className='blue'>{geriSppb.geriSppbQ6}</p>
                  ) : (
                    <p className='blue'>nil</p>
                  )}
                  <p className='underlined'>Falls Risk Level: </p>
                  {geriSppb ? (
                    <p className='blue'>{geriSppb.geriSppbQ11}</p>
                  ) : (
                    <p className='blue'>nil</p>
                  )}
                  <p className='underlined'>Notes:</p>
                  {geriSppb && geriSppb.geriSppbQ12 ? (
                    <p className='blue'>{geriSppb.geriSppbQ12}</p>
                  ) : (
                    <p className='blue'>nil</p>
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

export default GeriPtConsultForm
