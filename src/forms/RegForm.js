import React, { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import { registrationValidationSchema } from './registrationSchema'

import Divider from '@mui/material/Divider'
import Paper from '@mui/material/Paper'
import CircularProgress from '@mui/material/CircularProgress'
import {
  Button,
  FormControl,
  FormControlLabel,
  RadioGroup,
  Radio,
  Select,
  MenuItem,
  TextField,
  Checkbox,
  Typography,
  Box,
  Alert
} from '@mui/material'

import { submitForm, submitRegClinics } from '../api/api.js'
import { FormContext } from '../api/utils.js'
import {
  getClinicSlotsCollection,
  getSavedData,
} from '../services/mongoDB'
import './fieldPadding.css'
import './forms.css'

const postalCodeToLocations = {
  648886:
    'Dr Koo & Loo Associate, +65 6792 2669: 1 Jurong West Central 2, 01-16a&b Jurong Point, S648886',
  610064:
    'Drs Tangs & Partner, +65 6265 6077: Blk 64, Yung Kuang Rd #01- 115, S610064',
  640638:
    'Healthmark Pionner Mall, +65 6861 3100: Blk 638, Jurong West St 61 Pioneer Mall #02-08, S640638',
  641518:
    'Lakeside FMC, +65 6262 6434: Blk 518A, Jurong West St 52 #01-02, S641518',
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
      value: item
    }))
  }

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
      { label: 'Singapore Permanent Resident (PR) \n新加坡永久居民', value: 'Singapore Permanent Resident (PR) \n新加坡永久居民' },
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

  const handleSubmit = async (values) => {
    isLoading(true)
    values.registrationQ4 = patientAge

    const location = values.registrationQ18
    if (location) {
      const postalCode = values.registrationQ18 === 'None' ? 'None' : values.registrationQ18.trim().slice(-6)

      const counterResponse = await submitRegClinics(postalCode, patientId)
      if (!counterResponse.result) {
        isLoading(false)
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
  }

  return (
    <Paper elevation={2} p={0} m={0}>
      <Formik
        initialValues={initialValues}
        validationSchema={registrationValidationSchema}
        onSubmit={handleSubmit}
        enableReinitialize={true}
        key={patientId} // Force re-render when patient changes
      >
        {({ values, errors, touched, setFieldValue }) => (
          <Form className='fieldPadding'>
            <div className='form--div'>
              <h2>Registration</h2>
              
              <h3>Salutation 称谓</h3>
              <FormControl fullWidth error={touched.registrationQ1 && !!errors.registrationQ1}>
                <Field name="registrationQ1">
                  {({ field }) => (
                    <Select {...field} displayEmpty>
                      {formOptions.registrationQ1.map(option => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  )}
                </Field>
                <ErrorMessage name="registrationQ1" component="div" style={{ color: 'red' }} />
              </FormControl>

              <h3>Initials (e.g Chen Ren Ying - Chen R Y, Christie Tan En Ning - Christie T E N)</h3>
              <Field name="registrationQ2">
                {({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    multiline
                    rows={2}
                    error={touched.registrationQ2 && !!errors.registrationQ2}
                    helperText={touched.registrationQ2 && errors.registrationQ2}
                  />
                )}
              </Field>

              <h3>Birthday</h3>
              <Field name="registrationQ3">
                {({ field }) => (
                  <TextField
                    {...field}
                    type="date"
                    fullWidth
                    error={touched.registrationQ3 && !!errors.registrationQ3}
                    helperText={touched.registrationQ3 && errors.registrationQ3}
                    value={field.value instanceof Date ? field.value.toISOString().split('T')[0] : field.value}
                    onChange={(e) => {
                      const date = new Date(e.target.value)
                      const calculatedAge = calculateAge(date)
                      setFieldValue('registrationQ3', date)
                      setFieldValue('registrationQ4', calculatedAge)
                    }}
                  />
                )}
              </Field>

              <h3>Age</h3>
              <Typography className='blue'>{patientAge}</Typography>

              <h3>Gender</h3>
              <FormControl error={touched.registrationQ5 && !!errors.registrationQ5}>
                <Field name="registrationQ5">
                  {({ field }) => (
                    <RadioGroup {...field} row>
                      {formOptions.registrationQ5.map(option => (
                        <FormControlLabel
                          key={option.value}
                          value={option.value}
                          control={<Radio />}
                          label={option.label}
                        />
                      ))}
                    </RadioGroup>
                  )}
                </Field>
                <ErrorMessage name="registrationQ5" component="div" style={{ color: 'red' }} />
              </FormControl>

              <h3>Race 种族</h3>
              <FormControl error={touched.registrationQ6 && !!errors.registrationQ6}>
                <Field name="registrationQ6">
                  {({ field }) => (
                    <RadioGroup {...field}>
                      {formOptions.registrationQ6.map(option => (
                        <FormControlLabel
                          key={option.value}
                          value={option.value}
                          control={<Radio />}
                          label={option.label}
                        />
                      ))}
                    </RadioGroup>
                  )}
                </Field>
                <ErrorMessage name="registrationQ6" component="div" style={{ color: 'red' }} />
              </FormControl>

              {values.registrationQ6 === 'Others 其他' && (
                <Field name="registrationShortAnsQ6">
                  {({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      multiline
                      rows={2}
                      placeholder="Please specify"
                      error={touched.registrationShortAnsQ6 && !!errors.registrationShortAnsQ6}
                      helperText={touched.registrationShortAnsQ6 && errors.registrationShortAnsQ6}
                    />
                  )}
                </Field>
              )}

              <h3>Nationality 国籍</h3>
              <p>Please Note: Non Singapore Citizens/ Non-PRs are unfortunately not eligible for this health screening</p>
              <FormControl error={touched.registrationQ7 && !!errors.registrationQ7}>
                <Field name="registrationQ7">
                  {({ field }) => (
                    <RadioGroup {...field}>
                      {formOptions.registrationQ7.map(option => (
                        <FormControlLabel
                          key={option.value}
                          value={option.value}
                          control={<Radio />}
                          label={option.label}
                        />
                      ))}
                    </RadioGroup>
                  )}
                </Field>
                <ErrorMessage name="registrationQ7" component="div" style={{ color: 'red' }} />
              </FormControl>

              <h3>Marital Status 婚姻状况</h3>
              <FormControl fullWidth error={touched.registrationQ8 && !!errors.registrationQ8}>
                <Field name="registrationQ8">
                  {({ field }) => (
                    <Select {...field} displayEmpty>
                      {formOptions.registrationQ8.map(option => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  )}
                </Field>
                <ErrorMessage name="registrationQ8" component="div" style={{ color: 'red' }} />
              </FormControl>

              <h3>Occupation 工作</h3>
              <Field name="registrationQ9">
                {({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    error={touched.registrationQ9 && !!errors.registrationQ9}
                    helperText={touched.registrationQ9 && errors.registrationQ9}
                  />
                )}
              </Field>

              <h3>
                GRC/SMC Subdivision{' '}
                <a href='https://www.parliament.gov.sg/mps/find-my-mp' target='_blank' rel='noreferrer'>
                  [https://www.parliament.gov.sg/mps/find-my-mp]
                </a>
              </h3>
              <FormControl fullWidth error={touched.registrationQ10 && !!errors.registrationQ10}>
                <Field name="registrationQ10">
                  {({ field }) => (
                    <Select {...field} displayEmpty>
                      {formOptions.registrationQ10.map(option => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  )}
                </Field>
                <ErrorMessage name="registrationQ10" component="div" style={{ color: 'red' }} />
              </FormControl>

              <h3>Are you currently part of HealthierSG?</h3>
              <FormControl error={touched.registrationQ11 && !!errors.registrationQ11}>
                <Field name="registrationQ11">
                  {({ field }) => (
                    <RadioGroup {...field} row>
                      {formOptions.registrationQ11.map(option => (
                        <FormControlLabel
                          key={option.value}
                          value={option.value}
                          control={<Radio />}
                          label={option.label}
                        />
                      ))}
                    </RadioGroup>
                  )}
                </Field>
                <ErrorMessage name="registrationQ11" component="div" style={{ color: 'red' }} />
              </FormControl>

              <h3>CHAS Status 社保援助计划</h3>
              <FormControl fullWidth error={touched.registrationQ12 && !!errors.registrationQ12}>
                <Field name="registrationQ12">
                  {({ field }) => (
                    <Select {...field} displayEmpty>
                      {formOptions.registrationQ12.map(option => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  )}
                </Field>
                <ErrorMessage name="registrationQ12" component="div" style={{ color: 'red' }} />
              </FormControl>

              <h3>Pioneer Generation Status 建国一代配套</h3>
              <FormControl error={touched.registrationQ13 && !!errors.registrationQ13}>
                <Field name="registrationQ13">
                  {({ field }) => (
                    <RadioGroup {...field}>
                      {formOptions.registrationQ13.map(option => (
                        <FormControlLabel
                          key={option.value}
                          value={option.value}
                          control={<Radio />}
                          label={option.label}
                        />
                      ))}
                    </RadioGroup>
                  )}
                </Field>
                <ErrorMessage name="registrationQ13" component="div" style={{ color: 'red' }} />
              </FormControl>

              <h3>Preferred Language for Health Report</h3>
              <FormControl error={touched.registrationQ14 && !!errors.registrationQ14}>
                <Field name="registrationQ14">
                  {({ field }) => (
                    <RadioGroup {...field}>
                      {formOptions.registrationQ14.map(option => (
                        <FormControlLabel
                          key={option.value}
                          value={option.value}
                          control={<Radio />}
                          label={option.label}
                        />
                      ))}
                    </RadioGroup>
                  )}
                </Field>
                <ErrorMessage name="registrationQ14" component="div" style={{ color: 'red' }} />
              </FormControl>

              <h2>Going for Phlebotomy?</h2>
              <h3>
                Conditions:
                <br />
                1) Singaporeans ONLY
                <br />
                2) Not enrolled under HealthierSG
                <br />
                3) Have not undergone a government screening for the past 3 years
                <br />
                4) Have not been diagnosed with diabetes, hyperlipidemia or high blood pressure
              </h3>
              <FormControl error={touched.registrationQ15 && !!errors.registrationQ15}>
                <Field name="registrationQ15">
                  {({ field }) => (
                    <RadioGroup {...field} row>
                      {formOptions.registrationQ15.map(option => (
                        <FormControlLabel
                          key={option.value}
                          value={option.value}
                          control={<Radio />}
                          label={option.label}
                        />
                      ))}
                    </RadioGroup>
                  )}
                </Field>
                <ErrorMessage name="registrationQ15" component="div" style={{ color: 'red' }} />
              </FormControl>

              {values.registrationQ15 === 'Yes' && (
                <Box>
                  <h2>Phlebotomy Eligibility</h2>
                  <p>
                    Before entering our screening, do note the following eligibility criteria for Phlebotomy:
                    <ol type='A'>
                      <li>NOT previously diagnosed with Diabetes/ High Cholesterol/ High Blood Pressure.</li>
                      <li>Have not done a blood test within the past 3 years.</li>
                    </ol>
                  </p>
                  <p>
                    Rationale: PHS aims to reach out to undiagnosed people. Patients that are already aware of
                    their condition would have regular follow-ups with the GPs/polyclinics/hospitals. This
                    information is available in our publicity material. Please approach our registration
                    volunteers should you have any queries. We are happy to explain further. Thank you!
                  </p>
                  <p>
                    抽血合格标准:
                    <br />
                    1) 在过去的三年内沒有验过血。
                    <br />
                    2) 没有糖尿病, 高血压, 高胆固醇。
                  </p>
                  <FormControlLabel
                    control={
                      <Field name="registrationQ16">
                        {({ field }) => (
                          <Checkbox
                            {...field}
                            checked={field.value}
                            onChange={(e) => setFieldValue('registrationQ16', e.target.checked)}
                          />
                        )}
                      </Field>
                    }
                    label="I have read and acknowledged the eligibility criteria for Phlebotomy. 我知道抽血的合格标准。"
                  />
                  <ErrorMessage name="registrationQ16" component="div" style={{ color: 'red' }} />
                </Box>
              )}

              <br />

              <h2>Compliance to PDPA 同意书</h2>
              <p>
                I hereby give consent to having photos and/or videos taken of me for publicity purposes. I
                hereby give my consent to the Public Health Service Executive Committee to collect my
                personal information for the purpose of participating in the Public Health Service (hereby
                called &quot;PHS&quot;) and its related events, and to contact me via calls, SMS, text messages or
                emails regarding the event and follow-up process.
              </p>
              <p>
                Should you wish to withdraw your consent for us to contact you for the purposes stated
                above, please notify a member of the PHS Executive Committee at &nbsp;
                <a href='mailto:ask.phs@gmail.com'>ask.phs@gmail.com</a> &nbsp; in writing. We will then
                remove your personal information from our database. Please allow 3 business days for your
                withdrawal of consent to take effect. All personal information will be kept confidential,
                will only be disseminated to members of the PHS Executive Committee, and will be strictly
                used by these parties for the purposes stated.
              </p>
              <FormControlLabel
                control={
                  <Field name="registrationQ17">
                    {({ field }) => (
                      <Checkbox
                        {...field}
                        checked={field.value}
                        onChange={(e) => setFieldValue('registrationQ17', e.target.checked)}
                      />
                    )}
                  </Field>
                }
                label="I agree and consent to the above."
              />
              <ErrorMessage name="registrationQ17" component="div" style={{ color: 'red' }} />

              <h2>Follow up at GP Clinics</h2>
              <p>
                Your Health Report & Blood Test Results (if applicable) will be mailed out to the GP you
                have selected <b>4-6 weeks</b> after the screening.
              </p>
              <h4>
                All results, included those that are normal, have to be collected from the GP clinic via an
                appointment
              </h4>
              <br />
              {displayVacancy}
              
              <FormControl error={touched.registrationQ18 && !!errors.registrationQ18}>
                <Field name="registrationQ18">
                  {({ field }) => (
                    <RadioGroup {...field}>
                      {displayLocations().map(option => (
                        <FormControlLabel
                          key={option.value}
                          value={option.value}
                          control={<Radio />}
                          label={option.label}
                        />
                      ))}
                    </RadioGroup>
                  )}
                </Field>
                <ErrorMessage name="registrationQ18" component="div" style={{ color: 'red' }} />
              </FormControl>

              <h3>
                Patient consented to being considered for participation in Long Term Follow-Up (LTFU)?
                (Patient has to sign and tick Form C)
              </h3>
              <FormControl error={touched.registrationQ19 && !!errors.registrationQ19}>
                <Field name="registrationQ19">
                  {({ field }) => (
                    <RadioGroup {...field} row>
                      {formOptions.registrationQ19.map(option => (
                        <FormControlLabel
                          key={option.value}
                          value={option.value}
                          control={<Radio />}
                          label={option.label}
                        />
                      ))}
                    </RadioGroup>
                  )}
                </Field>
                <ErrorMessage name="registrationQ19" component="div" style={{ color: 'red' }} />
              </FormControl>

              <h3>
                Participant consent to participation in Research? (Participant has to sign IRB Consent Form)
              </h3>
              <FormControl error={touched.registrationQ20 && !!errors.registrationQ20}>
                <Field name="registrationQ20">
                  {({ field }) => (
                    <RadioGroup {...field} row>
                      {formOptions.registrationQ20.map(option => (
                        <FormControlLabel
                          key={option.value}
                          value={option.value}
                          control={<Radio />}
                          label={option.label}
                        />
                      ))}
                    </RadioGroup>
                  )}
                </Field>
                <ErrorMessage name="registrationQ20" component="div" style={{ color: 'red' }} />
              </FormControl>
            </div>

            {/* Display form-level errors */}
            {Object.keys(errors).length > 0 && (
              <Alert severity="error" sx={{ mt: 2 }}>
                Please fix the following errors before submitting:
                <ul>
                  {Object.entries(errors).map(([field, error]) => (
                    <li key={field}>{error}</li>
                  ))}
                </ul>
              </Alert>
            )}

            <Box sx={{ mt: 2, mb: 2 }}>
              {loading ? (
                <CircularProgress />
              ) : (
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  size="large"
                  disabled={Object.keys(errors).length > 0}
                >
                  Submit
                </Button>
              )}
            </Box>

            <Divider />
          </Form>
        )}
      </Formik>
    </Paper>
  )
}

export default RegForm