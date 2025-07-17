import { Field, Form, Formik } from 'formik'
import { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import * as Yup from 'yup'

import { Button, Checkbox, CircularProgress, Divider, FormControlLabel, Grid, Paper, TextField, Typography } from '@mui/material'

import { submitForm } from '../api/api.jsx'
import { FormContext } from '../api/utils.js'
import { getPdfQueueCollection, getSavedData } from '../services/mongoDB.js'
import './fieldPadding.css'
import allForms from './forms.json'

const validationSchema = Yup.object().shape({
  doctorSConsultQ1: Yup.string().required('This field is required'),
  doctorSConsultQ2: Yup.string().required('This field is required'),
  doctorSConsultQ3: Yup.string().required('This field is required'),
  doctorSConsultQ4: Yup.boolean(),
  doctorSConsultQ5: Yup.string().when('doctorSConsultQ4', {
    is: true,
    then: (schema) => schema.required('Reason is required when referral is selected'),
    otherwise: (schema) => schema.notRequired(),
  }),
  doctorSConsultQ6: Yup.boolean(),
  doctorSConsultQ7: Yup.string().when('doctorSConsultQ6', {
    is: true,
    then: (schema) => schema.required('Reason is required when referral is selected'),
    otherwise: (schema) => schema.notRequired(),
  }),
  doctorSConsultQ13: Yup.boolean(),
  doctorSConsultQ8: Yup.boolean(),
  doctorSConsultQ9: Yup.string().when('doctorSConsultQ8', {
    is: true,
    then: (schema) => schema.required('Reason is required when referral is selected'),
    otherwise: (schema) => schema.notRequired(),
  }),
  doctorSConsultQ10: Yup.boolean(),
  doctorSConsultQ11: Yup.boolean(),
})

const initialValues = {
  doctorSConsultQ1: '',
  doctorSConsultQ2: '',
  doctorSConsultQ3: '',
  doctorSConsultQ4: false,
  doctorSConsultQ5: '',
  doctorSConsultQ6: false,
  doctorSConsultQ7: '',
  doctorSConsultQ8: false,
  doctorSConsultQ9: '',
  doctorSConsultQ10: false,
  doctorSConsultQ11: false,
  doctorSConsultQ13: false,
}

const formName = 'doctorConsultForm'

const DoctorsConsultForm = () => {
  const { patientId } = useContext(FormContext)
  const [loading, setLoading] = useState(false)
  const [loadingSidePanel, setLoadingSidePanel] = useState(true)
  const [saveData, setSaveData] = useState(initialValues)

  // forms to retrieve for side panel
  const [hcsr, setHcsr] = useState({})
  const [geriVision, setGeriVision] = useState({})
  const [geriAudio, setGeriAudio] = useState({})
  const [geriPHQ, setPHQ] = useState({})
  const [lung, setLung] = useState({})
  const [triage, setTriage] = useState({})
  const [osteo, setOsteo] = useState({})
  const [pmhx, setPMHX] = useState({})
  const [social, setSocial] = useState({})
  const [family, setFamily] = useState({})

  const navigate = useNavigate()

  useEffect(() => {
    const fetchData = async () => {
      const savedData = await getSavedData(patientId, formName)
      setSaveData(savedData || initialValues)

      const loadPastForms = async () => {
        const hcsrData = getSavedData(patientId, allForms.hxHcsrForm)
        const geriVisionData = getSavedData(patientId, allForms.geriVisionForm)
        const geriAudioData = getSavedData(patientId, allForms.geriAudiometryForm)
        const lungData = getSavedData(patientId, allForms.lungForm)
        const PHQDATA = getSavedData(patientId, allForms.geriPhqForm)
        const triageData = getSavedData(patientId, allForms.triageForm)
        const osteoData = getSavedData(patientId, allForms.osteoForm)
        const pmhxData = getSavedData(patientId, allForms.hxNssForm)
        const socialData = getSavedData(patientId, allForms.hxSocialForm)
        const familyData = getSavedData(patientId, allForms.hxFamilyForm)

        Promise.all([
          hcsrData,
          geriVisionData,
          geriAudioData,
          lungData,
          PHQDATA,
          triageData,
          osteoData,
          pmhxData,
          socialData,
          familyData,
        ]).then((result) => {
          setHcsr(result[0])
          setGeriVision(result[1])
          setGeriAudio(result[2])
          setLung(result[3])
          setPHQ(result[4])
          setTriage(result[5])
          setOsteo(result[6])
          setPMHX(result[7])
          setSocial(result[8])
          setFamily(result[9])
          setLoadingSidePanel(false)
        })
      }
      loadPastForms()
    }
    fetchData()
  }, [patientId])

  const handleSubmit = async (values, { setSubmitting }) => {
    setLoading(true)
    try {
      const response = await submitForm(values, patientId, formName)

      if (response.result) {
        const collection = getPdfQueueCollection()
        await collection.insertOne({
          patientId: patientId,
          doctorName: values.doctorSConsultQ1, // Using doctor's name from Q1
          printed: false,
          createdAt: new Date(),
        })

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
      alert(`Error: ${error.message}`)
    } finally {
      setLoading(false)
      setSubmitting(false)
    }
  }

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

  return (
    <Paper elevation={2} p={0} m={0}>
      <Grid display='flex' flexDirection='row'>
        <Grid xs={9}>
          <Paper elevation={2} p={0} m={0}>
            <Formik
              initialValues={{
                doctorSConsultQ1: saveData.doctorSConsultQ1 || '',
                doctorSConsultQ2: saveData.doctorSConsultQ2 || '',
                doctorSConsultQ3: saveData.doctorSConsultQ3 || '',
                doctorSConsultQ4: saveData.doctorSConsultQ4 || false,
                doctorSConsultQ5: saveData.doctorSConsultQ5 || '',
                doctorSConsultQ6: saveData.doctorSConsultQ6 || false,
                doctorSConsultQ7: saveData.doctorSConsultQ7 || '',
                doctorSConsultQ8: saveData.doctorSConsultQ8 || false,
                doctorSConsultQ9: saveData.doctorSConsultQ9 || '',
                doctorSConsultQ10: saveData.doctorSConsultQ10 || false,
                doctorSConsultQ11: saveData.doctorSConsultQ11 || false,
                doctorSConsultQ13: saveData.doctorSConsultQ13 || false,
              }}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
              enableReinitialize
            >
              {({ values, errors, touched, isSubmitting }) => (
                <Form className='fieldPadding'>
                  <div className='form--div'>
                    <h1>Doctor&apos;s Station</h1>
                    <Typography variant='h6' component='h3' gutterBottom>
                      Doctor&apos;s Name
                    </Typography>
                    <Field
                      as={TextField}
                      name='doctorSConsultQ1'
                      label="Doctor's Name"
                      fullWidth
                      multiline
                      rows={2}
                      variant='outlined'
                      error={touched.doctorSConsultQ1 && Boolean(errors.doctorSConsultQ1)}
                      helperText={touched.doctorCConsultQ1 && errors.doctorSConsultQ1}
                    />
                    <Typography variant='h6' component='h3' gutterBottom>
                      Clinical Findings
                    </Typography>
                    <Field
                      as={TextField}
                      name='doctorSConsultQ2'
                      label="Doctor's Clinical Findings"
                      fullWidth
                      multiline
                      rows={4}
                      variant='outlined'
                      error={touched.doctorSConsultQ2 && Boolean(errors.doctorSConsultQ2)}
                      helperText={touched.doctorSConsultQ2 && errors.doctorSConsultQ2}
                    />
                    <Typography variant='h6' component='h3' gutterBottom>
                      Doctor&apos;s Memo
                    </Typography>
                    <Field
                      as={TextField}
                      name='doctorSConsultQ3'
                      label="Doctor's Memo"
                      fullWidth
                      multiline
                      rows={6}
                      variant='outlined'
                      error={touched.doctorSConsultQ3 && Boolean(errors.doctorSConsultQ3)}
                      helperText={touched.doctorSConsultQ3 && errors.doctorSConsultQ3}
                    />
                    <Typography variant='h6' component='h3' gutterBottom>
                      Refer to dietitian?
                    </Typography>
                    <Field name='doctorSConsultQ4' component={FormikCheckbox} label='Yes' />

                    {values.doctorSConsultQ4 && (
                      <>
                        <Typography variant='h6' component='h3' gutterBottom>
                          Reason for referral
                        </Typography><br />
                        <Field
                          as={TextField}
                          name='doctorSConsultQ5'
                          label="Doctor's Station Q5"
                          fullWidth
                          multiline
                          rows={2}
                          variant='outlined'
                          error={touched.doctorSConsultQ5 && Boolean(errors.doctorSConsultQ5)}
                          helperText={touched.doctorSConsultQ5 && errors.doctorSConsultQ5}
                        />
                      </>
                    )}
                    <h3>Refer to Social Support?</h3>
                    <Field component={FormikCheckbox} name='doctorSConsultQ6' label='Yes' />

                    {values.doctorSConsultQ6 && (
                      <>
                        <Typography variant='h6' component='h3' gutterBottom>
                          Reason for referral
                        </Typography><br />
                        <Field
                          as={TextField}
                          name='doctorSConsultQ7'
                          label="Doctor's Station Q7"
                          fullWidth
                          multiline
                          rows={2}
                          variant='outlined'
                          error={touched.doctorSConsultQ7 && Boolean(errors.doctorSConsultQ7)}
                          helperText={touched.doctorSConsultQ7 && errors.doctorSConsultQ7}
                        />
                      </>
                    )}
                    <h3>Refer to Mental Health? (and indicated on Form A)</h3>
                    <Field component={FormikCheckbox} name='doctorSConsultQ13' label='Yes' />

                    <h3>Refer to Dental?</h3>
                    <Field component={FormikCheckbox} name='doctorSConsultQ8' label='Yes' />
                    {values.doctorSConsultQ8 && (
                      <>
                        <Typography variant='h6' component='h3' gutterBottom>
                          Reason for referral
                        </Typography><br />
                        <Field
                          as={TextField}
                          name='doctorSConsultQ9'
                          label="Doctor's Station Q9"
                          fullWidth
                          multiline
                          rows={2}
                          variant='outlined'
                          error={touched.doctorSConsultQ9 && Boolean(errors.doctorSConsultQ9)}
                          helperText={touched.doctorSConsultQ9 && errors.doctorSConsultQ9}
                        />
                      </>
                    )}
                    <h3>Does patient require urgent follow up</h3>
                    <Field component={FormikCheckbox} name='doctorSConsultQ10' label='Yes' />
                    <h3>
                      Completed Doctor&apos;s Consult station. Please check that Form A is filled.
                    </h3>
                    <Field component={FormikCheckbox} name='doctorSConsultQ11' label='Yes' />
                  </div>

                  <div>
                    {loading ? (
                      <CircularProgress />
                    ) : (
                      <Button
                        type='submit'
                        variant='contained'
                        color='primary'
                        disabled={isSubmitting}
                      >
                        Submit
                      </Button>
                    )}
                  </div>
                  <Divider />
                </Form>
              )}
            </Formik>
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
              <h2>Patient Requires Referrals For: </h2>
              <ul>
                {!lung ? <p className='red'>nil lung data!</p> : <></>}
                {lung && lung.LUNG14 == 'Yes' ? (
                  <li>
                    <p>
                      Patient has <strong>{lung.LUNG13}</strong>
                    </p>
                    <p>Lung Function Results</p>
                    <table style={{ border: '1px solid black', borderCollapse: 'collapse' }}>
                      <tr style={{ border: '1px solid black' }}>
                        <td colSpan={2} style={{ border: '1px solid black' }}>
                          Pre-Bronchodilator
                        </td>
                      </tr>
                      <tr style={{ border: '1px solid black' }}>
                        <td style={{ border: '1px solid black' }}>FVC (L)</td>
                        <td style={{ border: '1px solid black' }}>{lung.LUNG3}</td>
                      </tr>
                      <tr style={{ border: '1px solid black' }}>
                        <td style={{ border: '1px solid black' }}>FEV1 (L)</td>
                        <td style={{ border: '1px solid black' }}>{lung.LUNG4}</td>
                      </tr>
                      <tr style={{ border: '1px solid black' }}>
                        <td style={{ border: '1px solid black' }}>FVC (%pred)</td>
                        <td style={{ border: '1px solid black' }}>{lung.LUNG5}</td>
                      </tr>
                      <tr style={{ border: '1px solid black' }}>
                        <td style={{ border: '1px solid black' }}>FEV1 (%pred)</td>
                        <td style={{ border: '1px solid black' }}>{lung.LUNG6}</td>
                      </tr>
                      <tr style={{ border: '1px solid black' }}>
                        <td style={{ border: '1px solid black' }}>FEV1/FVC (%)</td>
                        <td style={{ border: '1px solid black' }}>{lung.LUNG7}</td>
                      </tr>
                    </table>
                  </li>
                ) : null}

                {!geriPHQ ? <p className='red'>nil geriPHQ data!</p> : <></>}
                <li>
                  {geriPHQ && geriPHQ.PHQ10 ? (
                    <p>
                      Patient scores <strong>{geriPHQ.PHQ10}</strong> in the PHQ.
                    </p>
                  ) : (
                    <p className='red'>nil PHQ10 data!</p>
                  )}
                  <ul>
                    <li>
                      {geriPHQ && geriPHQ.PHQ9 ? (
                        <p>
                          The patient answered: <strong>{geriPHQ.PHQ9}</strong> to &apos;Thoughts
                          that you would be better off dead or hurting yourself in some way&apos;.
                        </p>
                      ) : (
                        <p className='red'>nil PHQ9 data!</p>
                      )}
                    </li>
                    <li>
                      {geriPHQ && geriPHQ.PHQextra9 ? (
                        <p>
                          When asked &apos;Do you want to take your life now&apos;, patient said{' '}
                          <strong>{geriPHQ.PHQextra9}</strong>
                        </p>
                      ) : (
                        <p className='red'>nil PHQextra9 data!</p>
                      )}
                    </li>
                  </ul>
                </li>

                {!triage ? <p className='red'>nil triage data!</p> : <></>}
                {triage.triageQ9 ? (
                  <li>
                    <p>
                      Patient had blood pressure of{' '}
                      <strong>
                        {triage.triageQ7}/{triage.triageQ8}
                      </strong>
                    </p>
                  </li>
                ) : null}

                {!geriVision ? <p className='red'>nil geriVision data!</p> : <></>}
                {geriVision.geriVisionQ9 ? (
                  <li>
                    <p>Visual Check Results.</p>
                    <ul>
                      <li>
                        <p>Visual Acuity</p>
                        <table
                          style={{
                            border: '1px solid black',
                            width: '100%',
                            borderCollapse: 'collapse',
                            minWidth: '60%',
                          }}
                        >
                          <tr style={{ border: '1px solid black' }}>
                            <th style={{ border: '1px solid black' }}></th>
                            <th style={{ border: '1px solid black' }}>Right Eye</th>
                            <th style={{ border: '1px solid black' }}>Left Eye</th>
                          </tr>
                          <tr style={{ border: '1px solid black' }}>
                            <td style={{ border: '1px solid black' }}>Without Pinhole Occluder</td>
                            <td style={{ border: '1px solid black' }}>
                              6/{geriVision.geriVisionQ3}
                            </td>
                            <td style={{ border: '1px solid black' }}>
                              6/{geriVision.geriVisionQ4}
                            </td>
                          </tr>
                          <tr style={{ border: '1px solid black' }}>
                            <td style={{ border: '1px solid black' }}>With Pinhole Occluder</td>
                            <td style={{ border: '1px solid black' }}>
                              6/{geriVision.geriVisionQ5}
                            </td>
                            <td style={{ border: '1px solid black' }}>
                              6/{geriVision.geriVisionQ6}
                            </td>
                          </tr>
                        </table>
                      </li>
                      <li>
                        <p>
                          Type of vision error, if any: <strong>{geriVision.geriVisionQ8}</strong>
                        </p>
                        <p>
                          Previous eye surgery or condition:{' '}
                          <strong>{geriVision.geriVisionQ1}</strong>
                        </p>
                        <p>
                          Is currently on any eye review/ consulting any eye specialist:{' '}
                          <strong>{geriVision.geriVisionQ10}</strong>
                        </p>
                        <p>
                          <strong>{geriVision.geriVisionQ11}</strong>
                        </p>
                        {hcsr ? (
                          <p>
                            Patient&apos;s history indicated: <strong>{hcsr.hxHcsrQ3}</strong>
                          </p>
                        ) : (
                          <p className='red'>nil hcsr data!</p>
                        )}
                      </li>
                    </ul>
                  </li>
                ) : null}

                {!geriAudio ? <p className='red'>nil geriAudio data!</p> : <></>}
                {geriAudio ? (
                  <li>
                    <p>Patient&apos;s audiometry results, if any:</p>
                    <ul>
                      <li>
                        <p>
                          <strong>{geriAudio.geriAudiometryQ13}</strong>
                        </p>
                        <p>
                          Details: <strong>{geriAudio.geriAudiometryQ12}</strong>
                        </p>
                        {hcsr ? (
                          <p>
                            Patient&apos;s history indicated: <strong>{hcsr.hxHcsrQ4}</strong>
                          </p>
                        ) : (
                          <p className='red'>nil hcsr data!</p>
                        )}
                      </li>
                    </ul>
                  </li>
                ) : null}

                {!osteo ? <p className='red'>nil osteo data!</p> : <></>}
                {osteo ? (
                  <li>
                    <p>
                      Patient&apos;s OSTA risk is <strong>{osteo.BONE1}</strong>
                    </p>
                    <ul>
                      <li>
                        <p>
                          FRAX Hip Fracture Score is <strong>{osteo.BONE3}</strong>
                        </p>
                      </li>
                      <li>
                        <p>
                          Patient requires a follow up: <strong>{osteo.BONE2}</strong>
                        </p>
                      </li>
                    </ul>
                  </li>
                ) : null}

                <h2>Patient&apos;s Relevant History: </h2>
                {triage ? (
                  <li>
                    <p>Biodata</p>
                    <ul>
                      <li>
                        <p>
                          BMI: <strong>{triage.triageQ12}</strong>
                        </p>
                      </li>
                      <li>
                        <p>
                          Waist Circumference: <strong>{triage.triageQ13}</strong>
                        </p>
                      </li>
                    </ul>
                  </li>
                ) : (
                  <p className='red'>nil triage data!</p>
                )}

                {hcsr ? (
                  <li>
                    <p>Presenting Complaints</p>
                    <ul>
                      <li>
                        <p>
                          Health Concerns: <strong>{hcsr.hxHcsrQ7}</strong>
                          <br></br>
                          <strong>{hcsr.hxHcsrShortAnsQ7}</strong>
                        </p>
                      </li>
                      <li>
                        <p>
                          Red Flags: <strong>{hcsr.hxhcsrQ8}</strong>
                        </p>
                      </li>
                    </ul>
                  </li>
                ) : (
                  <p className='red'>nil hcsr data!</p>
                )}

                {pmhx ? (
                  <li>
                    <p>Past Medical History</p>
                    <ul>
                      <li>
                        <p>
                          Chronic conditions: <strong>{pmhx.PMHX1}</strong>
                        </p>
                      </li>
                      <li>
                        <p>
                          Long term medications and compliance: <strong>{pmhx.PMHX2}</strong>
                        </p>
                      </li>
                      <li>
                        <p>
                          Drug allergies: <strong>{pmhx.PMHX3}</strong>
                          <br></br>
                          <strong>{pmhx.PMHXShortAns3}</strong>
                        </p>
                      </li>
                      <li>
                        <p>
                          Alternative medicine: <strong>{pmhx.PMHX4}</strong>
                          <br></br>
                          <strong>{pmhx.PMHXShortAns4}</strong>
                        </p>
                      </li>
                      <li>
                        <p>
                          Regular screening: <strong>{pmhx.PMHX6}</strong>
                        </p>
                      </li>
                      <li>
                        <p>
                          Reason for referral: <strong>{pmhx.PMHXShortAns7}</strong>
                        </p>
                      </li>
                    </ul>
                  </li>
                ) : (
                  <p className='red'>nil pmhx data!</p>
                )}

                {social ? (
                  <li>
                    <p>Social History</p>
                    <ul>
                      <li>
                        <p>
                          Smoking: <strong>{social.SOCIAL10}</strong>
                          <br></br>
                          <strong>{social.SOCIALShortAns10}</strong>
                        </p>
                        <p>
                          Past Smoking: <strong>{social.SOCIAL11}</strong>
                          <br></br>
                          <strong>{social.SOCIALShortAns11}</strong>
                        </p>
                      </li>
                      <li>
                        <p>
                          Alcohol: <strong>{social.SOCIAL12}</strong>
                        </p>
                      </li>
                      <li>
                        <p>
                          Exercise: <strong>{social.SOCIAL14}</strong>
                        </p>
                      </li>
                    </ul>
                  </li>
                ) : (
                  <p className='red'>nil social data!</p>
                )}

                {family && family.FAMILY1 ? (
                  <li>
                    <p>Family History</p>
                    <ul>
                      <li>
                        <p>Cancers:</p>
                        <ul>
                          {family.FAMILY1.map((c) => (
                            <li key={c}>{c}</li>
                          ))}
                        </ul>
                      </li>
                      <li>
                        <p>
                          Others: <strong>{family.FAMILY2}</strong>
                        </p>
                      </li>
                    </ul>
                  </li>
                ) : (
                  <p className='red'>nil family data!</p>
                )}
              </ul>
            </div>
          )}
        </Grid>
      </Grid>
    </Paper>
  )
}

DoctorsConsultForm.contextType = FormContext

export default function DoctorsConsultform(props) {
  const navigate = useNavigate()
  return <DoctorsConsultForm {...props} navigate={navigate} />
}
