import React, { useContext, useEffect, useState } from 'react'
import { Paper, Divider, Typography, CircularProgress, Button, Box, Alert } from '@mui/material'
import { Formik, Form, Field, FastField } from 'formik'
import * as Yup from 'yup'
import { FormContext } from '../../api/utils.js'
import { getSavedData } from '../../services/mongoDB'
import { submitForm, checkFormA } from '../../api/api.jsx'
import PopupText from 'src/utils/popupText.jsx'
import CustomRadioGroup from '../../components/form-components/CustomRadioGroup'
import CustomTextField from '../../components/form-components/CustomTextField'
import '../fieldPadding.css'
import '../forms.css'

const formName = 'gynaeForm'

const initialValues = {
  GYNAE1: '',
  GYNAE2: '',
  GYNAEShortAns2: '',
  GYNAE3: '',
  GYNAEShortAns3: '',
  GYNAE4: '',
  GYNAEShortAns4: '',
  GYNAE5: '',
  GYNAEShortAns5: '',
  GYNAE6: '',
  GYNAEShortAns6: '',
  GYNAE7: '',
  GYNAEShortAns7: '',
  GYNAE8: '',
  GYNAEShortAns8: '',
  GYNAE9: '',
  GYNAE10: '',
  GYNAEShortAns10: '',
  GYNAE11: '',
  GYNAEShortAns11: '',
}

const validationSchema = Yup.object({
  GYNAE1: Yup.string().required('Required'),
  GYNAE2: Yup.string(),
  GYNAE3: Yup.string().required('Required'),
  GYNAE4: Yup.string().required('Required'),
  GYNAE5: Yup.string().required('Required'),
  GYNAE6: Yup.string().required('Required'),
  GYNAE7: Yup.string().required('Required'),
  GYNAE8: Yup.string().required('Required'),
  GYNAE9: Yup.string(),
  GYNAE10: Yup.string().required('Required'),
  GYNAE11: Yup.string().required('Required'),
  GYNAE12: Yup.string().required('Required'),
  GYNAE13: Yup.string().required('Required'),
  GYNAE14: Yup.string().required('Required'),
  GYNAE15: Yup.string().required('Required'),
  GYNAE16: Yup.string().required('Required'),
  GYNAE17: Yup.string().required('Required'),
  GYNAE18: Yup.string().required('Required'),
})

const formOptions = {
  YESNO: [
    { label: 'Yes', value: 'Yes' },
    { label: 'No', value: 'No' },
  ],
  GYNAE12: [
    { label: 'Never before', value: 'Never before' },
    { label: 'Less than 5 years ago', value: 'Less than 5 years ago' },
    { label: '5 years or longer', value: '5 years or longer' },
  ],
  GYNAE13: [
    { label: 'Never before', value: 'Never before' },
    { label: 'Within the last 3 years', value: 'Within the last 3 years' },
    { label: '3 years or longer', value: '3 years or longer' },
  ],
  GYNAE17: [
    { label: 'Yes', value: 'Yes' },
    { label: 'No', value: 'No' },
    { label: 'Not Applicable', value: 'Not Applicable' },
  ],
}

export default function HxGynaeForm({ changeTab, nextTab }) {
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
      checkFormA(response.qNum)
      alert('Successfully submitted form')
      changeTab(null, nextTab)
    } else {
      alert(`Unsuccessful. ${response.error}`)
    }
  }

  const renderForm = () => (
    <Formik
      initialValues={savedData}
      validationSchema={validationSchema}
      enableReinitialize
      onSubmit={handleSubmit}
    >
      {({ isSubmitting, submitCount, errors }) => (
        <Form className='fieldPadding'>
          <Typography variant='h4'>
            <strong>GYNECOLOGY</strong>
          </Typography>
          <Typography fontWeight='bold' color='error' sx={{ mb: 2}}>
            This form should only be submitted for female participants
          </Typography>

          <Typography variant='subtitle1' fontWeight='bold'>
            Are you menopaused?
          </Typography>
          <Typography variant='subtitle1'>i.e. &gt; 1 year from your last menstrual period</Typography>
          <FastField
            name='GYNAE1'
            label='GYNAE1'
            component={CustomRadioGroup}
            options={formOptions.YESNO}
            row
          />

          <PopupText qnNo='GYNAE1' triggerValue='Yes'>
            <Typography variant='subtitle1' fontWeight='bold'>
              Do you have any postmenopausal bleeding?
            </Typography>
            <FastField
              name='GYNAE2'
              label='GYNAE2'
              component={CustomRadioGroup}
              options={formOptions.YESNO}
              row
            />

            <Typography variant='subtitle1'>Please specify:</Typography>
            <Field
              name='GYNAEShortAns2'
              label='GYNAEShortAns2'
              component={CustomTextField}
              fullWidth
              multiline
            />
          </PopupText>

          <Typography variant='subtitle1' >
            <strong>Do you have any abnormal per vaginal bleeding?</strong><br />
            e.g. bleeding between periods, prolonged menses, bleeding after intercourse
          </Typography>
          <FastField
            name='GYNAE3'
            label='GYNAE3'
            component={CustomRadioGroup}
            options={formOptions.YESNO}
            row
          />

          <Typography variant='subtitle1' >Please specify:</Typography>
          <FastField
            name='GYNAEShortAns3'
            label='GYNAEShortAns3'
            component={CustomTextField}
            fullWidth
            multiline
          />

          <Typography variant='subtitle1'  fontWeight='bold'>
            Do you have irregular periods or less than 4 menstrual cycles a year?
          </Typography>
          <FastField
            name='GYNAE4'
            label='GYNAE4'
            component={CustomRadioGroup}
            options={formOptions.YESNO}
            row
          />
          <Typography variant='subtitle1' >Please specify:</Typography>
          <Field
            name='GYNAEShortAns4'
            label='GYNAEShortAns4'
            component={CustomTextField}
            fullWidth
            multiline
          />

          <Typography variant='subtitle1'  fontWeight='bold'>
            Do you have any menstrual concerns?
          </Typography>
          <FastField
            name='GYNAE5'
            label='GYNAE5'
            component={CustomRadioGroup}
            options={formOptions.YESNO}
            row
          />
          <Typography variant='subtitle1' >Please specify:</Typography>
          <FastField
            name='GYNAEShortAns5'
            label='GYNAEShortAns5'
            component={CustomTextField}
            fullWidth
            multiline
          />

          <Typography variant='subtitle1'  fontWeight='bold'>
            Do you feel any abnormal abdominal masses?
          </Typography>
          <FastField
            name='GYNAE6'
            label='GYNAE6'
            component={CustomRadioGroup}
            options={formOptions.YESNO}
            row
          />
          <Typography variant='subtitle1' >Please specify:</Typography>
          <Field
            name='GYNAEShortAns6'
            label='GYNAEShortAns6'
            component={CustomTextField}
            fullWidth
            multiline
          />

          <Typography variant='subtitle1'  fontWeight='bold'>
            Do you have any new onset abdominal pain/bloatedness?
          </Typography>
          <FastField
            name='GYNAE7'
            label='GYNAE7'
            component={CustomRadioGroup}
            options={formOptions.YESNO}
            row
          />
          <Typography variant='subtitle1' >Please specify:</Typography>
          <FastField
            name='GYNAEShortAns7'
            label='GYNAEShortAns7'
            component={CustomTextField}
            fullWidth
            multiline
          />

          <Typography variant='subtitle1'  fontWeight='bold'>
            Do you have fertility concerns?
          </Typography>
          <FastField
            name='GYNAE8'
            label='GYNAE8'
            component={CustomRadioGroup}
            options={formOptions.YESNO}
            row
          />
          <Typography variant='subtitle1' >Please specify:</Typography>
          <FastField
            name='GYNAEShortAns8'
            label='GYNAEShortAns8'
            component={CustomTextField}
            fullWidth
            multiline
          />

          <PopupText qnNo='GYNAE8' triggerValue='Yes'>
            <Typography variant='subtitle1'  fontWeight='bold'>
              Are you keen to investigate for subfertility?
            </Typography>
            <FastField
              name='GYNAE9'
              label='GYNAE9'
              component={CustomRadioGroup}
              options={formOptions.YESNO}
              row
            />
          </PopupText>

          <Typography variant='subtitle1'  fontWeight='bold'>
            Do you have any urinary symptoms?
          </Typography>
          <FastField
            name='GYNAE10'
            label='GYNAE10'
            component={CustomRadioGroup}
            options={formOptions.YESNO}
            row
          />
          <Typography variant='subtitle1' >Please specify:</Typography>
          <FastField
            name='GYNAEShortAns10'
            label='GYNAEShortAns10'
            component={CustomTextField}
            fullWidth
            multiline
            sx={{ mb: 3, mt: 1 }}
          />

          <Typography variant='subtitle1'  fontWeight='bold'>
            Do you feel any lump in vagina or pelvic organ prolapse?
          </Typography>
          <FastField
            name='GYNAE11'
            label='GYNAE11'
            component={CustomRadioGroup}
            options={formOptions.YESNO}
            row
          />
          <Typography variant='subtitle1' >Please specify:</Typography>
          <FastField
            name='GYNAEShortAns11'
            label='GYNAEShortAns11'
            component={CustomTextField}
            fullWidth
            multiline
          />

          <Typography variant='subtitle1' fontWeight='bold'>
            When, if any, was the last HPV test you have taken? <br />
            (Please verify on HealthHub. HPV is different from Pap Smear, answer Pap Smear in the
            next question)
          </Typography>
          <FastField
            name='GYNAE12'
            label='GYNAE12'
            component={CustomRadioGroup}
            options={formOptions.GYNAE12}
            row
          />

          <Typography variant='subtitle1' fontWeight='bold'>
            When if any, was the last Pap Smear test you have taken? (Please verify on HealthHub)
          </Typography>
          <FastField
            name='GYNAE13'
            label='GYNAE13'
            component={CustomRadioGroup}
            options={formOptions.GYNAE13}
            row
          />

          <Typography variant='subtitle1' fontWeight='bold'>
            I am asking the next few questions to check your eligibility for a Pap Smear. This
            question may be sensitive, but could I ask if you have engaged in sexual intercourse
            before?
          </Typography>
          <FastField
            name='GYNAE14'
            label='GYNAE14'
            component={CustomRadioGroup}
            options={formOptions.YESNO}
            row
          />

          <Typography variant='subtitle1' fontWeight='bold'>Are you pregnant?</Typography>
          <FastField
            name='GYNAE15'
            label='GYNAE15'
            component={CustomRadioGroup}
            options={formOptions.YESNO}
            row
          />

          <Typography variant='subtitle1' fontWeight='bold'>
            Was your last menstrual period within the window where the first day falls between 28 July and 4 Aug 2025? <br />
            If you are post-menopausal or use contraception, please indicate 'yes'
          </Typography>
          <FastField
            name='GYNAE16'
            label='GYNAE16'
            component={CustomRadioGroup}
            options={formOptions.YESNO}
            row
          />

          <Typography variant='subtitle1' fontWeight='bold'>
            Indicated interest for HPV Test under SCS?
          </Typography>
          <FastField
            name='GYNAE17'
            label='GYNAE17'
            component={CustomRadioGroup}
            options={formOptions.GYNAE17}
            row
          />

          <Typography variant='subtitle1' fontWeight='bold'>
            Is patient indicated for on-site testing? Please circle On-Site Testing on Form A as well
          </Typography>
          <FastField
            name='GYNAE18'
            label='GYNAE18'
            component={CustomRadioGroup}
            options={formOptions.YESNO}
            row
          />

          {Object.keys(errors).length > 0 && submitCount > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Alert severity="error">
                        Please correct the errors above before submitting.
                      </Alert>
                    </Box>
                  )}
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
  )

  return <Paper elevation={2}>{renderForm()}</Paper>
}
