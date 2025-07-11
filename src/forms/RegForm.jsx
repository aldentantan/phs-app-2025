import React, { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Formik, Form, Field, FastField } from 'formik'
import { validationSchema } from './registrationSchema'

import {
  Divider,
  Paper,
  CircularProgress,
  Button,
  FormControl,
  Select,
  MenuItem,
  TextField,
  Typography,
  Box,
} from '@mui/material'

import { submitForm, submitRegClinics } from '../api/api.jsx'
import { FormContext } from '../api/utils.js'
import { getClinicSlotsCollection, getSavedData } from '../services/mongoDB'
import PopupText from 'src/utils/popupText'
import './fieldPadding.css'
import './forms.css'
import CustomTextField from '../components/form-components/CustomTextField'
import CustomCheckbox from '../components/form-components/CustomCheckbox'
import CustomRadioGroup from '../components/form-components/CustomRadioGroup'

const postalCodeToLocations = {
  648886:
    'Dr Koo & Loo Associate, +65 6792 2669: 1 Jurong West Central 2, 01-16a&b Jurong Point, S648886',
  610064: 'Drs Tangs & Partner, +65 6265 6077: Blk 64, Yung Kuang Rd #01- 115, S610064',
  640638:
    'Healthmark Pionner Mall, +65 6861 3100: Blk 638, Jurong West St 61 Pioneer Mall #02-08, S640638',
  641518: 'Lakeside FMC, +65 6262 6434: Blk 518A, Jurong West St 52 #01-02, S641518',
  640762:
    'Lee Family Clinic, +65 6794 0217: Blk 762 Jurong West St 75 #02-262 Gek Poh Shopping Ctr, S640762',
  None: 'None',
}

export const defaultSlots = {
  648886: 50,
  610064: 50,
  640638: 50,
  641518: 50,
  640762: 50,
  None: 10000,
}

const formName = 'registrationForm'

const RegForm = () => {
  const { patientId, updatePatientId, updatePatientInfo } = useContext(FormContext)
  const [loading, isLoading] = useState(false)
  const navigate = useNavigate()
  const [saveData, setSaveData] = useState({})
  const [birthday, setBirthday] = useState(new Date())
  const [slots, setSlots] = useState(defaultSlots)
  const [patientAge, setPatientAge] = useState(0)

  useEffect(() => {
    const fetchData = async () => {
      console.log('Patient ID: ' + patientId)
      const savedData = await getSavedData(patientId, formName)

      const phlebCountersCollection = getClinicSlotsCollection()
      const phlebCounters = await phlebCountersCollection.find()
      const temp = { ...defaultSlots }
      for (const { postalCode, counterItems } of phlebCounters) {
        if (postalCode && counterItems) {
          temp[postalCode] -= counterItems.length
        }
      }

      // Set date to current date if no birthday was previously saved
      if (patientId == -1) {
        savedData.registrationQ3 = birthday
      }

      // Calculate age if birthday exists in saved data
      if (savedData.registrationQ3) {
        const calculatedAge = calculateAge(savedData.registrationQ3)
        setPatientAge(calculatedAge)
      }

      setSlots(temp)
      setSaveData(savedData)
    }
    fetchData()
  }, [patientId])

  const calculateAge = (birthDate) => {
    const today = new Date()
    if (birthDate) {
      const birth = new Date(birthDate)
      let age = today.getFullYear() - birth.getFullYear()
      const monthDiff = today.getMonth() - birth.getMonth()

      // Adjust age if birthday hasn't occurred this year yet
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--
      }

      setBirthday(birth)
      setPatientAge(age)
      return age
    }
    return 0
  }

  const handleSubmit = async (values, { setSubmitting }) => {
    isLoading(true)
    setSubmitting(true)
    values.registrationQ4 = patientAge

    const location = values.registrationQ18
    if (location) {
      const postalCode =
        values.registrationQ18 === 'None' ? 'None' : values.registrationQ18.trim().slice(-6)

      const counterResponse = await submitRegClinics(postalCode, patientId)
      if (!counterResponse.result) {
        isLoading(false)
        setSubmitting(false)
        setTimeout(() => {
          alert(`Unsuccessful. ${counterResponse.error}`)
        }, 80)
        return
      }
    }

    console.log('Patient ID: ' + patientId)
    const response = await submitForm(values, patientId, formName)

    console.log('test  _' + response.result + ' ' + patientAge)
    if (response.result) {
      setTimeout(() => {
        console.log('response data: ' + response.qNum)
        alert('Successfully submitted form')
        console.log('Successfully submitted form')
        updatePatientInfo(response.data)
        updatePatientId(response.qNum)
        navigate('/app/dashboard', { replace: true })
      }, 80)
    } else {
      setTimeout(() => {
        console.log('Form submission failed')
        alert(`Unsuccessful. ${response.error}`)
      }, 80)
    }

    isLoading(false)
    setSubmitting(false)
  }

  // Custom Field Components
  const FormikSelect = ({ field, form, options, ...props }) => (
    <FormControl
      fullWidth
      margin='normal'
      error={form.touched[field.name] && Boolean(form.errors[field.name])}
    >
      <Select {...field} {...props} displayEmpty value={field.value || ''}>
        {options.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
      {form.touched[field.name] && form.errors[field.name] && (
        <Typography variant='caption' color='error'>
          {form.errors[field.name]}
        </Typography>
      )}
    </FormControl>
  )

  const FormikDateField = ({ field, form, ...props }) => (
    <TextField
      {...field}
      {...props}
      type='date'
      fullWidth
      margin='normal'
      error={form.touched[field.name] && Boolean(form.errors[field.name])}
      helperText={form.touched[field.name] && form.errors[field.name]}
      value={field.value instanceof Date ? field.value.toISOString().split('T')[0] : field.value}
      onChange={(e) => {
        const date = new Date(e.target.value)
        form.setFieldValue(field.name, date)
      }}
      onBlur={(e) => {
        const date = new Date(e.target.value)
        const calculatedAge = calculateAge(date)
        form.setFieldValue('registrationQ4', calculatedAge)
      }}
    />
  )

  const formOptions = {
    registrationQ1: [
      { label: 'Mr', value: 'Mr' },
      { label: 'Ms', value: 'Ms' },
      { label: 'Mrs', value: 'Mrs' },
      { label: 'Dr', value: 'Dr' },
    ],
    registrationQ5: [
      { label: 'Male', value: 'Male' },
      { label: 'Female', value: 'Female' },
    ],
    registrationQ6: [
      { label: 'Chinese 华裔', value: 'Chinese 华裔' },
      { label: 'Malay 巫裔', value: 'Malay 巫裔' },
      { label: 'Indian 印裔', value: 'Indian 印裔' },
      { label: 'Eurasian 欧亚裔', value: 'Eurasian 欧亚裔' },
      { label: 'Others 其他', value: 'Others 其他' },
    ],
    registrationQ7: [
      { label: 'Singapore Citizen 新加坡公民', value: 'Singapore Citizen 新加坡公民' },
      {
        label: 'Singapore Permanent Resident (PR) \n新加坡永久居民',
        value: 'Singapore Permanent Resident (PR) \n新加坡永久居民',
      },
    ],
    registrationQ8: [
      { label: 'Single 单身', value: 'Single 单身' },
      { label: 'Married 已婚', value: 'Married 已婚' },
      { label: 'Widowed 已寡', value: 'Widowed 已寡' },
      { label: 'Separated 已分居', value: 'Separated 已分居' },
      { label: 'Divorced 已离婚', value: 'Divorced 已离婚' },
    ],
    registrationQ10: [
      { label: 'Jurong', value: 'Jurong' },
      { label: 'Yuhua', value: 'Yuhua' },
      { label: 'Bukit Batok', value: 'Bukit Batok' },
      { label: 'Pioneer', value: 'Pioneer' },
      { label: 'West Coast', value: 'West Coast' },
      { label: 'Hong Kah North', value: 'Hong Kah North' },
      { label: 'Others', value: 'Others' },
    ],
    registrationQ11: [
      { label: 'Yes', value: 'Yes' },
      { label: 'No', value: 'No' },
      { label: 'Unsure', value: 'Unsure' },
    ],
    registrationQ12: [
      { label: 'CHAS Orange', value: 'CHAS Orange' },
      { label: 'CHAS Green', value: 'CHAS Green' },
      { label: 'CHAS Blue', value: 'CHAS Blue' },
      { label: 'No CHAS', value: 'No CHAS' },
    ],
    registrationQ13: [
      { label: 'Pioneer generation card holder', value: 'Pioneer generation card holder' },
      { label: 'Merdeka generation card holder', value: 'Merdeka generation card holder' },
      { label: 'None', value: 'None' },
    ],
    registrationQ14: [
      { label: 'English', value: 'English' },
      { label: 'Mandarin', value: 'Mandarin' },
      { label: 'Malay', value: 'Malay' },
      { label: 'Tamil', value: 'Tamil' },
    ],
    registrationQ15: [
      { label: 'Yes', value: 'Yes' },
      { label: 'No', value: 'No' },
    ],
    registrationQ19: [
      { label: 'Yes', value: 'Yes' },
      { label: 'No', value: 'No' },
    ],
    registrationQ20: [
      { label: 'Yes', value: 'Yes' },
      { label: 'No', value: 'No' },
    ],
  }

  const displayVacancy = Object.entries(slots).map(([postalCode, n], i) => {
    return (
      <div key={i} className='paragraph--text'>
        {postalCodeToLocations[postalCode]}
        <b> Slots: {n}</b>
      </div>
    )
  })

  const displayLocations = () => {
    return Object.values(postalCodeToLocations).map((item) => ({
      label: item,
      value: item,
    }))
  }

  const initialValues = {
    registrationQ1: saveData.registrationQ1 || 'Mr',
    registrationQ2: saveData.registrationQ2 || '',
    registrationQ3: saveData.registrationQ3 || new Date(),
    registrationQ4: saveData.registrationQ4 || patientAge,
    registrationQ5: saveData.registrationQ5 || '',
    registrationQ6: saveData.registrationQ6 || '',
    registrationQ7: saveData.registrationQ7 || '',
    registrationQ8: saveData.registrationQ8 || '',
    registrationQ9: saveData.registrationQ9 || '',
    registrationQ10: saveData.registrationQ10 || '',
    registrationQ11: saveData.registrationQ11 || '',
    registrationQ12: saveData.registrationQ12 || '',
    registrationQ13: saveData.registrationQ13 || '',
    registrationQ14: saveData.registrationQ14 || '',
    registrationQ15: saveData.registrationQ15 || '',
    registrationQ16: saveData.registrationQ16 || false,
    registrationQ17: saveData.registrationQ17 || false,
    registrationQ18: saveData.registrationQ18 || '',
    registrationQ19: saveData.registrationQ19 || '',
    registrationQ20: saveData.registrationQ20 || '',
    registrationShortAnsQ6: saveData.registrationShortAnsQ6 || '',
  }

  const renderForm = () => (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
      enableReinitialize={true}
    >
      {({ isSubmitting, submitCount, ...formikProps }) => (
        <Form className='fieldPadding'>
          <div className='form--div'>
            <Typography variant='h4' component='h1' gutterBottom>
              Registration
            </Typography>

            <Typography variant='h6' component='h3' gutterBottom>
              Salutation 称谓
            </Typography>
            <FastField
              name='registrationQ1'
              component={FormikSelect}
              options={formOptions.registrationQ1}
            />

            <Typography variant='h6' component='h3' gutterBottom>
              Initials (e.g Chen Ren Ying - Chen R Y, Christie Tan En Ning - Christie T E N)
            </Typography>
            <FastField name='registrationQ2' component={CustomTextField} multiline />

            <Typography variant='h6' component='h3' gutterBottom>
              Birthday
            </Typography>
            <FastField name='registrationQ3' component={FormikDateField} />

            <Typography variant='h6' component='h3' gutterBottom>
              Age
            </Typography>
            <Typography className='blue'>{patientAge}</Typography>

            <Typography variant='h6' component='h3' gutterBottom>
              Gender
            </Typography>
            <FastField
              name='registrationQ5'
              component={CustomRadioGroup}
              options={formOptions.registrationQ5}
              row
            />

            <Typography variant='h6' component='h3' gutterBottom>
              Race 种族
            </Typography>
            <FastField
              name='registrationQ6'
              component={CustomRadioGroup}
              options={formOptions.registrationQ6}
            />

            <PopupText qnNo='registrationQ6' triggerValue='Others 其他'>
              <Field
                name='registrationShortAnsQ6'
                component={CustomTextField}
                multiline
                rows={2}
                placeholder='Please specify'
              />
            </PopupText>

            <Typography variant='h6' component='h3' gutterBottom>
              Nationality 国籍
            </Typography>
            <Typography>
              Please Note: Non Singapore Citizens/ Non-PRs are unfortunately not eligible for this
              health screening
            </Typography>
            <FastField
              name='registrationQ7'
              component={CustomRadioGroup}
              options={formOptions.registrationQ7}
            />

            <Typography variant='h6' component='h3' gutterBottom>
              Marital Status 婚姻状况
            </Typography>
            <FastField
              name='registrationQ8'
              component={FormikSelect}
              options={formOptions.registrationQ8}
            />

            <Typography variant='h6' component='h3' gutterBottom>
              Occupation 工作
            </Typography>
            <FastField name='registrationQ9' component={CustomTextField} />

            <Typography variant='h6' component='h3' gutterBottom>
              GRC/SMC Subdivision{' '}
              <a
                href='https://www.parliament.gov.sg/mps/find-my-mp'
                target='_blank'
                rel='noreferrer'
              >
                [https://www.parliament.gov.sg/mps/find-my-mp]
              </a>
            </Typography>
            <FastField
              name='registrationQ10'
              component={FormikSelect}
              options={formOptions.registrationQ10}
            />

            <Typography variant='h6' component='h3' gutterBottom>
              Are you currently part of HealthierSG?
            </Typography>
            <FastField
              name='registrationQ11'
              component={CustomRadioGroup}
              options={formOptions.registrationQ11}
              row
            />

            <Typography variant='h6' component='h3' gutterBottom>
              CHAS Status 社保援助计划
            </Typography>
            <FastField
              name='registrationQ12'
              component={FormikSelect}
              options={formOptions.registrationQ12}
            />

            <Typography variant='h6' component='h3' gutterBottom>
              Pioneer Generation Status 建国一代配套
            </Typography>
            <FastField
              name='registrationQ13'
              component={CustomRadioGroup}
              options={formOptions.registrationQ13}
            />

            <Typography variant='h6' component='h3' gutterBottom>
              Preferred Language for Health Report
            </Typography>
            <FastField
              name='registrationQ14'
              component={CustomRadioGroup}
              options={formOptions.registrationQ14}
            />

            <Typography variant='h4' component='h2' gutterBottom sx={{ mt: 4 }}>
              Compliance to PDPA 同意书
            </Typography>
            <Typography paragraph>
              I hereby give consent to having photos and/or videos taken of me for publicity
              purposes. I hereby give my consent to the Public Health Service Executive Committee to
              collect my personal information for the purpose of participating in the Public Health
              Service (hereby called &quot;PHS&quot;) and its related events, and to contact me via
              calls, SMS, text messages or emails regarding the event and follow-up process.
            </Typography>
            <Typography paragraph>
              Should you wish to withdraw your consent for us to contact you for the purposes stated
              above, please notify a member of the PHS Executive Committee at &nbsp;
              <a href='mailto:ask.phs@gmail.com'>ask.phs@gmail.com</a> &nbsp; in writing. We will
              then remove your personal information from our database. Please allow 3 business days
              for your withdrawal of consent to take effect. All personal information will be kept
              confidential, will only be disseminated to members of the PHS Executive Committee, and
              will be strictly used by these parties for the purposes stated.
            </Typography>
            <Field
              name='registrationQ17'
              component={CustomCheckbox}
              label='I agree and consent to the above.'
            />

            <Typography variant='h4' component='h2' gutterBottom sx={{ mt: 4 }}>
              Follow up at GP Clinics
            </Typography>
            <Typography paragraph>
              Your Health Report & Blood Test Results (if applicable) will be mailed out to the GP
              you have selected <b>4-6 weeks</b> after the screening.
            </Typography>
            <Typography variant='h6' component='h4' gutterBottom>
              All results, included those that are normal, have to be collected from the GP clinic
              via an appointment
            </Typography>
            <br />
            {displayVacancy}

            <Field
              name='registrationQ18'
              component={CustomRadioGroup}
              options={displayLocations()}
            />

            <Typography variant='h6' component='h3' gutterBottom>
              Patient consented to being considered for participation in Long Term Follow-Up (LTFU)?
              (Patient has to sign and tick Form C)
            </Typography>
            <FastField
              name='registrationQ19'
              component={CustomRadioGroup}
              options={formOptions.registrationQ19}
              row
            />

            <Typography variant='h6' component='h3' gutterBottom>
              Participant consent to participation in Research? (Participant has to sign IRB Consent
              Form)
            </Typography>
            <FastField
              name='registrationQ20'
              component={CustomRadioGroup}
              options={formOptions.registrationQ20}
              row
            />
          </div>

          <Box mt={2} mb={2}>
            {submitCount > 0 && Object.keys(formikProps.errors || {}).length > 0 && (
              <Typography color='error' variant='body2' sx={{ mb: 1 }}>
                Please fill in all required fields correctly.
              </Typography>
            )}
            {loading || isSubmitting ? (
              <CircularProgress />
            ) : (
              <Button
                type='submit'
                variant='contained'
                color='primary'
                size='large'
                disabled={isSubmitting}
              >
                Submit
              </Button>
            )}
          </Box>

          <Divider />
        </Form>
      )}
    </Formik>
  )

  return (
    <Paper elevation={2} p={0} m={0}>
      {renderForm()}
    </Paper>
  )
}

export default RegForm
