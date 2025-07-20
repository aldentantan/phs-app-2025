import React, { useContext, useEffect, useState } from 'react'
import { Paper, Divider, Typography, CircularProgress, Button } from '@mui/material'
import { Formik, Form, Field, FastField } from 'formik'
import * as Yup from 'yup'
import { FormContext } from '../../api/utils.js'
import { getSavedData } from '../../services/mongoDB'
import { submitForm } from '../../api/api.jsx'
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
})

const formOptions = {
  GYNAE1: [
    { label: 'Yes', value: 'Yes' },
    { label: 'No', value: 'No' },
  ],
  GYNAE2: [
    { label: 'Yes', value: 'Yes' },
    { label: 'No', value: 'No' },
  ],
  GYNAE3: [
    { label: 'Yes', value: 'Yes' },
    { label: 'No', value: 'No' },
  ],
  GYNAE4: [
    { label: 'Yes', value: 'Yes' },
    { label: 'No', value: 'No' },
  ],
  GYNAE5: [
    { label: 'Yes', value: 'Yes' },
    { label: 'No', value: 'No' },
  ],
  GYNAE6: [
    { label: 'Yes', value: 'Yes' },
    { label: 'No', value: 'No' },
  ],
  GYNAE7: [
    { label: 'Yes', value: 'Yes' },
    { label: 'No', value: 'No' },
  ],
  GYNAE8: [
    { label: 'Yes', value: 'Yes' },
    { label: 'No', value: 'No' },
  ],
  GYNAE9: [
    { label: 'Yes', value: 'Yes' },
    { label: 'No', value: 'No' },
  ],
  GYNAE10: [
    { label: 'Yes', value: 'Yes' },
    { label: 'No', value: 'No' },
  ],
  GYNAE11: [
    { label: 'Yes', value: 'Yes' },
    { label: 'No', value: 'No' },
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
      {({ isSubmitting }) => (
        <Form className='fieldPadding'>
          <Typography variant='h6' gutterBottom>
            GYNECOLOGY
          </Typography>
          <Typography fontWeight='bold' color='error'>
            This form should only be submitted for female participants
          </Typography>

          <Typography variant='subtitle1' fontWeight='bold'>
            Are you menopaused?
          </Typography>
          <Typography variant='body2'>i.e. &gt; 1 year from your last menstrual period</Typography>
          <FastField
            name='GYNAE1'
            label='GYNAE1'
            component={CustomRadioGroup}
            options={formOptions.GYNAE1}
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
              options={formOptions.GYNAE2}
              row
            />

            <Typography variant='subtitle2'>Please specify:</Typography>
            <Field
              name='GYNAEShortAns2'
              label='GYNAEShortAns2'
              component={CustomTextField}
              fullWidth
              multiline
              sx={{ mb: 3, mt: 1 }}
            />
          </PopupText>

          <Typography variant='subtitle1' fontWeight='bold'>
            Do you have any abnormal per vaginal bleeding?
          </Typography>
          <Typography variant='body2'>
            e.g. bleeding between periods, prolonged menses, bleeding after intercourse
          </Typography>
          <FastField
            name='GYNAE3'
            label='GYNAE3'
            component={CustomRadioGroup}
            options={formOptions.GYNAE3}
            row
          />

          <Typography variant='subtitle2'>Please specify:</Typography>
          <FastField
            name='GYNAEShortAns3'
            label='GYNAEShortAns3'
            component={CustomTextField}
            fullWidth
            multiline
            sx={{ mb: 3, mt: 1 }}
          />

          <Typography variant='subtitle1' fontWeight='bold'>
            Do you have irregular periods or less than 4 menstrual cycles a year?
          </Typography>
          <FastField
            name='GYNAE4'
            label='GYNAE4'
            component={CustomRadioGroup}
            options={formOptions.GYNAE4}
            row
          />
          <Typography variant='subtitle2'>Please specify:</Typography>
          <Field
            name='GYNAEShortAns4'
            label='GYNAEShortAns4'
            component={CustomTextField}
            fullWidth
            multiline
            sx={{ mb: 3, mt: 1 }}
          />

          <Typography variant='subtitle1' fontWeight='bold'>
            Do you have any menstrual concerns?
          </Typography>
          <FastField
            name='GYNAE5'
            label='GYNAE5'
            component={CustomRadioGroup}
            options={formOptions.GYNAE5}
            row
          />
          <Typography variant='subtitle2'>Please specify:</Typography>
          <FastField
            name='GYNAEShortAns5'
            label='GYNAEShortAns5'
            component={CustomTextField}
            fullWidth
            multiline
            sx={{ mb: 3, mt: 1 }}
          />

          <Typography variant='subtitle1' fontWeight='bold'>
            Do you feel any abnormal abdominal masses?
          </Typography>
          <FastField
            name='GYNAE6'
            label='GYNAE6'
            component={CustomRadioGroup}
            options={formOptions.GYNAE6}
            row
          />
          <Typography variant='subtitle2'>Please specify:</Typography>
          <Field
            name='GYNAEShortAns6'
            label='GYNAEShortAns6'
            component={CustomTextField}
            fullWidth
            multiline
            sx={{ mb: 3, mt: 1 }}
          />

          <Typography variant='subtitle1' fontWeight='bold'>
            Do you have any new onset abdominal pain/bloatedness?
          </Typography>
          <FastField
            name='GYNAE7'
            label='GYNAE7'
            component={CustomRadioGroup}
            options={formOptions.GYNAE7}
            row
          />
          <Typography variant='subtitle2'>Please specify:</Typography>
          <FastField
            name='GYNAEShortAns7'
            label='GYNAEShortAns7'
            component={CustomTextField}
            fullWidth
            multiline
            sx={{ mb: 3, mt: 1 }}
          />

          <Typography variant='subtitle1' fontWeight='bold'>
            Do you have fertility concerns?
          </Typography>
          <FastField
            name='GYNAE8'
            label='GYNAE8'
            component={CustomRadioGroup}
            options={formOptions.GYNAE8}
            row
          />
          <Typography variant='subtitle2'>Please specify:</Typography>
          <FastField
            name='GYNAEShortAns8'
            label='GYNAEShortAns8'
            component={CustomTextField}
            fullWidth
            multiline
            sx={{ mb: 3, mt: 1 }}
          />

          <PopupText qnNo='GYNAE8' triggerValue='Yes'>
            <Typography variant='subtitle1' fontWeight='bold'>
              Are you keen to investigate for subfertility?
            </Typography>
            <FastField
              name='GYNAE9'
              label='GYNAE9'
              component={CustomRadioGroup}
              options={formOptions.GYNAE9}
              row
            />
          </PopupText>

          <Typography variant='subtitle1' fontWeight='bold'>
            Do you have any urinary symptoms?
          </Typography>
          <FastField
            name='GYNAE10'
            label='GYNAE10'
            component={CustomRadioGroup}
            options={formOptions.GYNAE10}
            row
          />
          <Typography variant='subtitle2'>Please specify:</Typography>
          <FastField
            name='GYNAEShortAns10'
            label='GYNAEShortAns10'
            component={CustomTextField}
            fullWidth
            multiline
            sx={{ mb: 3, mt: 1 }}
          />

          <Typography variant='subtitle1' fontWeight='bold'>
            Do you feel any lump in vagina or pelvic organ prolapse?
          </Typography>
          <FastField
            name='GYNAE11'
            label='GYNAE11'
            component={CustomRadioGroup}
            options={formOptions.GYNAE11}
            row
          />
          <Typography variant='subtitle2'>Please specify:</Typography>
          <FastField
            name='GYNAEShortAns11'
            label='GYNAEShortAns11'
            component={CustomTextField}
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
  )

  return (
    <Paper elevation={2}>
      {renderForm()}
    </Paper>
  )
}
