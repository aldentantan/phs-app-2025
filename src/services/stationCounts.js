import allForms from '../forms/forms.json'
import { getSavedData, getSavedPatientData, updateStationCounts } from './mongoDB'

export const getEligibilityRows = (forms = {}) => {
  const {
    reg = {},
    pmhx = {},
    hxsocial = {},
    // hxfamily = {},
    triage = {},
    hcsr = {},
    hxoral = {},
    phq = {},
  } = forms

  const createData = (name, isEligible) => ({
    name,
    eligibility: isEligible ? 'YES' : 'NO'
  })

  const isVaccinationEligible = reg?.registrationQ4 >= 65 && reg?.registrationQ7 === 'Singapore Citizen 新加坡公民'
  const isHealthierSGEligible = reg?.registrationQ11 !== 'Yes'
  const isLungFunctionEligible = hxsocial?.SOCIAL10 === 'Yes, (please specify how many pack-years)' || hxsocial?.SOCIAL11 === 'Yes, (please specify)'
  const isWomenCancerEducationEligible = reg?.registrationQ5 === 'Female'
  const isOsteoporosisEligible =
    (reg?.registrationQ5 === 'Female' && reg?.registrationQ4 >= 45) ||
    (reg?.registrationQ5 === 'Male' && reg?.registrationQ4 >= 55)

  const isMentalHealthEligible = (phq?.PHQ10 >= 10 && reg?.registrationQ4 < 60) || phq?.PHQ11 === 'Yes'
  const isAudiometryEligible = reg?.registrationQ4 >= 60 && pmhx?.PMHX13 === 'No'
  const isGeriatricScreeningEligible = reg?.registrationQ4 >= 60

  const isDoctorStationEligible = triage?.triageQ9 === 'Yes' ||
    hcsr?.hxHcsrQ7 === 'Yes' ||
    hcsr?.hxHcsrQ6 === 'Yes' ||
    pmhx?.PMHX12 === 'Yes' ||
    //phq?.PHQ9 !== '0 - Not at all'
    // NOTE^ this makes Doctor's Station Eligible with phq?.PHQ9 !== '0 - Not at all'
    phq?.PHQ10 >= 10 ||
    phq?.PHQ9 == '1 - Several days' ||
    phq?.PHQ9 == '2 - More than half the days' ||
    phq?.PHQ9 == '3 - Nearly everyday'

  const isDietitianEligible = hxsocial?.SOCIAL15 === 'Yes'
  const isSocialServicesEligible = hxsocial?.SOCIAL6 === 'Yes' ||
    hxsocial?.SOCIAL7 === 'Yes, (please specify)' ||
    (hxsocial?.SOCIAL8 === 'Yes' && hxsocial?.SOCIAL9 === 'No')

  const isDentalEligible = hxoral?.ORAL5 === 'Yes'

  return [
    createData('Healthier SG Booth', isHealthierSGEligible),
    createData('Lung Function Testing', isLungFunctionEligible),
    createData("Women's Cancer Education", isWomenCancerEducationEligible),
    createData('Osteoporosis', isOsteoporosisEligible),
    createData('Mental Health', isMentalHealthEligible),
    createData('Vaccination', isVaccinationEligible),
    createData('Geriatric Screening', isGeriatricScreeningEligible),
    createData('Audiometry', isAudiometryEligible),
    { name: 'HPV On-Site Testing', eligibility: 'Determined at another station' },
    createData("Doctor's Station", isDoctorStationEligible),
    createData("Dietitian's Consult", isDietitianEligible),
    createData('Oral Health', isDentalEligible),
    createData('Social Services', isSocialServicesEligible),
  ]
}

// groups station keys which are counted as one logical station
export function computeVisitedStationsCount(record) {
  const stationFormMap = {
    hsg: ['hsgForm'],
    lungfn: ['lungFnForm'],
    wce: ['wceForm', 'gynaeForm'],
    osteo: ['osteoForm'],
    mentalhealth: ['mentalHealthForm'],
    vax: ['vaccineForm'],
    geriscreening: ['geriAmtForm', 'geriGraceForm', 'geriWhForm', 'geriInterForm',
      'geriPhysicalActivityLevelForm', 'geriOtQuestionnaireForm', 'geriSppbForm', 'geriPtConsultForm', 'geriOtConsultForm',
      'geriVisionForm'],
    geriaudio: ['geriAudiometryForm'],
    doctorsconsult: ['doctorConsultForm'],
    dietitiansconsult: ['dietitiansConsultForm'],
    oralhealth: ['oralHealthForm'],
    socialservice: ['socialServiceForm'],
    hpv: ['hpvForm'],
  }

  let visitedCount = 0

  for (const [stationKeys, formKeys] of Object.entries(stationFormMap)) {
    console.log(stationKeys)
    const allFilled = formKeys.every((formKey) => {
    const form = record[formKey]
    return form != undefined
  })

    if (allFilled) {
      visitedCount++
    }
  }
  return visitedCount
}

// compute and update visited and eligible station counts
export const updateAllStationCounts = async (patientId) => {
  // fetch patient record (used for visited station logic)
  const patient = await getSavedPatientData(patientId, 'patients')
  const visitedStationsCount = computeVisitedStationsCount(patient)

  // fetch all relevant forms for eligibility
  const [
    pmhx, hxsocial, reg, hxfamily, triage, hcsr, hxoral, wce, phq,
  ] = await Promise.all([
    getSavedData(patientId, allForms.hxNssForm),
    getSavedData(patientId, allForms.hxSocialForm),
    getSavedData(patientId, allForms.registrationForm),
    getSavedData(patientId, allForms.hxFamilyForm),
    getSavedData(patientId, allForms.triageForm),
    getSavedData(patientId, allForms.hxHcsrForm),
    getSavedData(patientId, allForms.hxOralForm),
    getSavedData(patientId, allForms.wceForm),
    getSavedData(patientId, allForms.geriPhqForm),
  ])

  const formData = {
    reg: reg || {},
    pmhx: pmhx || {},
    hxsocial: hxsocial || {},
    hxfamily: hxfamily || {},
    triage: triage || {},
    hcsr: hcsr || {},
    hxoral: hxoral || {},
    wce: wce || {},
    phq: phq || {},
  }

  const rows = getEligibilityRows(formData)
  const eligibleStationsCount = rows.filter((r) => r.eligibility === 'YES').length

  const eligibleStations = getEligibleStationNames(formData)
  const visitedStations = getVisitedStationNames(patient)

  await updateStationCounts(patientId, visitedStationsCount, eligibleStationsCount, visitedStations, eligibleStations)

  console.log('visited:', visitedStationsCount, 'eligible:', eligibleStationsCount)
  console.log('eligible stations:', eligibleStations)
  console.log('visited stations:', visitedStations)
}

export const getEligibleStationNames = (forms = {}) => {
  const eligibleStations = []
  const rows = getEligibilityRows(forms)

  rows.forEach(row => {
    if (row.eligibility === 'YES') {
      eligibleStations.push(row.name)
    }
  })

  return eligibleStations
}

export const getVisitedStationNames = (record) => {
  const visitedStations = []
  const stationFormMap = {
    'Healthier SG Booth': ['hsgForm'],
    'Lung Function Testing': ['lungFnForm'],
    "Women's Cancer Education": ['wceForm', 'gynaeForm'],
    'Osteoporosis': ['osteoForm'],
    'Mental Health': ['mentalHealthForm'],
    'Vaccination': ['vaccineForm'],
    'Geriatric Screening': ['geriAmtForm', 'geriGraceForm', 'geriWhForm', 'geriInterForm',
      'geriPhysicalActivityLevelForm', 'geriOtQuestionnaireForm', 'geriSppbForm', 'geriPtConsultForm', 'geriOtConsultForm',
      'geriVisionForm'],
    'Audiometry': ['geriAudiometryForm'],
    "Doctor's Station": ['doctorConsultForm'],
    "Dietitian's Consult": ['dietitiansConsultForm'],
    'Oral Health': ['oralHealthForm'],
    'Social Services': ['socialServiceForm'],
    'HPV On-Site Testing': ['hpvForm'],
  }

  for (const [stationName, formKeys] of Object.entries(stationFormMap)) {
    const allFilled = formKeys.every((formKey) => {
      return record[formKey] !== undefined
    })

    if (allFilled) {
      visitedStations.push(stationName)
    }
  }

  return visitedStations
}
