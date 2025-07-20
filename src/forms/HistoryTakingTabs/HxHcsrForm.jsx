import { Button, CircularProgress, Divider, Paper, TextField, Typography } from '@mui/material'
import { Field, Form, Formik } from 'formik'
import { useContext, useEffect, useState } from 'react'
import * as Yup from 'yup'
import { submitForm } from '../../api/api.jsx'
import { FormContext } from '../../api/utils.js'
import CustomRadioGroup from '../../components/form-components/CustomRadioGroup'
import { getSavedData } from '../../services/mongoDB'
import PopupText from '../../utils/popupText.jsx'

const formName = 'hxHcsrForm'

const initialValues = {
  hxHcsrQ1: '',
  hxHcsrQ2: '',
  hxHcsrQ3: '',
  hxHcsrShortAnsQ3: '',
  hxHcsrQ4: '',
  hxHcsrShortAnsQ4: '',
  hxHcsrQ5: '',
  hxHcsrQ6: '',
  hxHcsrQ7: '',
  hxHcsrShortAnsQ7: '',
  hxhcsrQ8: '',
}

const validationSchema = Yup.object({
  hxHcsrQ1: Yup.string().required('Required'),
  hxHcsrQ2: Yup.string().required('Required'),
  hxHcsrQ3: Yup.string().required('Required'),
  hxHcsrQ6: Yup.string().required('Required'),
  hxHcsrQ7: Yup.string().required('Required'),
})

const formOptions = {
  hxHcsrQ3: [
    { label: 'Yes', value: 'Yes' },
    { label: 'No', value: 'No' },
  ],
  hxHcsrQ4: [
    { label: 'Yes', value: 'Yes' },
    { label: 'No', value: 'No' },
  ],
  hxHcsrQ6: [
    { label: 'Yes', value: 'Yes' },
    { label: 'No', value: 'No' },
  ],
  hxHcsrQ5: [
    { label: 'Yes', value: 'Yes' },
    { label: 'No', value: 'No' },
    { label: 'Not Applicable (under 60)', value: 'Not Applicable (under 60)' },
  ],
  hxHcsrQ7: [
    { label: 'Yes', value: 'Yes' },
    { label: 'No', value: 'No' },
  ],
}

export default function HxHcsrForm({ changeTab, nextTab }) {
  const { patientId } = useContext(FormContext)
  const [savedData, setSavedData] = useState(initialValues)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      const res = await getSavedData(patientId, formName)
      setSavedData({ ...initialValues, ...res })
    }

    fetchData()
  }, [patientId])

  const handleSubmit = async (values, { setSubmitting }) => {
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
  }

  return (
    <Paper elevation={2}>
      <Formik
        initialValues={savedData}
        validationSchema={validationSchema}
        enableReinitialize
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <Form className='fieldPadding'>
            <Typography variant='h4' gutterBottom>
              <strong>PARTICIPANT IDENTIFICATION</strong>
            </Typography>
            <Typography gutterBottom>
              <span style={{ color: 'error', fontWeight: 'bold' }}>
                Please verify participant&apos;s identity using:
                <ol type='A'>
                  <li>APP ID on wristband</li>
                  <li>INITIALS</li>
                </ol>
              </span>{' '}
            </Typography>

            <Typography variant='h6'>
              Booth number and History-taker&apos;s surname followed by initials
            </Typography>
            <Field
              name='hxHcsrQ1'
              as={TextField}
              label='hxHcsrQ1'
              fullWidth
              multiline
              margin='normal'
            />

            <Typography variant='h5' sx={{ fontWeight: 'bold' }}>
              HISTORY TAKING PART 1: HEALTH CONCERNS AND SYSTEMS REVIEW
              <br />
              1. HEALTH CONCERNS
            </Typography>

            <Typography sx={{ fontWeight: 'bold' }} gutterBottom>
              If the participant has any <u>presenting complaints or concern(s)</u>, please take a
              brief history. (Please write NIL if otherwise).
            </Typography>
            <Typography gutterBottom>
              &quot;Do you have any health issues that you are currently concerned about?&quot;
              <br />
              &quot;最近有没有哪里不舒服&quot;
            </Typography>
            <Field
              name='hxHcsrQ2'
              as={TextField}
              label='hxHcsrQ2'
              fullWidth
              multiline
              margin='normal'
            />

            <Typography variant='subtitle1' fontWeight='bold' color='error'>
              Please advise that there will be no diagnosis or prescription made at our screening.
              <br />
              Kindly advise the participant to see a GP/polyclinic instead if he/she is expecting
              treatment for their problems.
            </Typography>

            <Typography variant='subtitle1' fontWeight='bold'>
              Do you have any vision problems? Please specify if yes. Exclude complaints like
              unspecific itchy eyes etc.
            </Typography>
            <Field
              name='hxHcsrQ3'
              label='hxHcsrQ3'
              component={CustomRadioGroup}
              options={formOptions.hxHcsrQ3}
              row
            />

            <Typography variant='subtitle1' fontWeight='bold'>
              Please specify:
            </Typography>
            <Field
              name='hxHcsrShortAnsQ3'
              as={TextField}
              label='hxHcsrShortAnsQ3'
              fullWidth
              multiline
              sx={{ mb: 3, mt: 1 }}
            />

            <Typography variant='subtitle1' fontWeight='bold'>
              Do you have any hearing problems? Please specify if yes.
            </Typography>
            <Field
              name='hxHcsrQ4'
              label='hxHcsrQ4'
              component={CustomRadioGroup}
              options={formOptions.hxHcsrQ4}
              row
            />

            <Typography variant='subtitle1' fontWeight='bold'>
              Please specify:
            </Typography>
            <Field
              name='hxHcsrShortAnsQ4'
              as={TextField}
              label='hxHcsrShortAnsQ4'
              fullWidth
              multiline
              sx={{ mb: 3, mt: 1 }}
            />
            <PopupText qnNo="hxHcsrQ4" triggerValue="Yes">
            <Typography variant='subtitle1' fontWeight='bold'>
              If you are 60 and above, do you currently use hearing aids/have been detected to
              require hearing aids?
            </Typography>
            <Field
              name='hxHcsrQ5'
              label='hxHcsrQ5'
              component={CustomRadioGroup}
              options={formOptions.hxHcsrQ5}
              row
            />
            </PopupText>

            <Typography variant='subtitle1' fontWeight='bold'>
              Please tick to highlight if you feel SYSTEMS REVIEW require closer scrutiny by doctors
              later or if participant strongly insists.
            </Typography>
            <Field
              name='hxHcsrQ6'
              label='hxHcsrQ6'
              component={CustomRadioGroup}
              options={formOptions.hxHcsrQ6}
              row
            />

            <Typography variant='subtitle1' fontWeight='bold'>
              Please indicate if you feel that HEALTH CONCERNS require closer scrutiny by doctors
              later or if participant strongly insists.
            </Typography>
            <Field
              name='hxHcsrQ7'
              label='hxHcsrQ7'
              component={CustomRadioGroup}
              options={formOptions.hxHcsrQ7}
              row
            />

            <Typography variant='subtitle1' fontWeight='bold'>
              Please specify:
            </Typography>
            <Field
              name='hxHcsrShortAnsQ7'
              as={TextField}
              label='hxHcsrShortAnsQ7'
              fullWidth
              multiline
              sx={{ mb: 3, mt: 1 }}
            />

            <Typography variant='subtitle1' fontWeight='bold'>
              Below is a non-exhaustive list of possible red flags:
            </Typography>
            <ul>
              <li>
                <u>Constitutional Symptoms:</u> LOA, LOW, Fever
              </li>
              <li>
                <u>CVS:</u> Chest pain, Palpitations
              </li>
              <li>
                <u>Respi:</u> SOB, Haemoptysis, Night Sweat, Cough
              </li>
              <li>
                <u>GI:</u> change in BO habits, PR bleed, Haematemesis
              </li>
              <li>Frequent falls</li>
            </ul>

            <Typography variant='subtitle1' fontWeight='bold'>
              Based on&nbsp;
              <span style={{ color: 'red', textDecoration: 'underline' }}>
                participant&apos;s health concerns,
              </span>
              &nbsp;please rule out red flags <b>(Please write NIL if otherwise)</b>
            </Typography>
            <Field
              name='hxhcsrQ8'
              as={TextField}
              label='hxhcsrQ8'
              fullWidth
              multiline
              sx={{ mb: 3, mt: 1 }}
            />

            <div style={{ marginTop: 16, display: 'flex', justifyContent: 'center' }}>
              {loading || isSubmitting ? (
                <CircularProgress />
              ) : (
                <Button type='submit' variant='contained' color='primary'>
                  Submit
                </Button>
              )}
            </div>

            <br />
            <Divider />
          </Form>
        )}
      </Formik>
    </Paper>
  )
}
