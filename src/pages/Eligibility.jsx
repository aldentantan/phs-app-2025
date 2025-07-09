import React, { useState, useContext, useEffect, useRef } from 'react'
import { Helmet } from 'react-helmet-async'
import CircularProgress from '@mui/material/CircularProgress'
import {
  Box,
  TableContainer,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Button,
} from '@mui/material'

import pdfMake from 'pdfmake/build/pdfmake'
import pdfFonts from 'pdfmake/build/vfs_fonts'
pdfMake.vfs = pdfFonts.vfs

import logo from 'src/icons/Icon'
import { parseFromLangKey, setLang } from '../api/langutil'

import { getSavedData, getSavedPatientData, updateStationCounts } from '../services/mongoDB'
import { FormContext } from '../api/utils.js'
import allForms from '../forms/forms.json'
import {
  getEligibilityRows,
  computeVisitedStationsCount,
  getVisitedStationNames,
} from '../services/stationCounts'

const Eligibility = () => {
  const { patientId } = useContext(FormContext)
  const [forms, setForms] = useState(null)
  const [rows, setRows] = useState([])
  const [loadingPrevData, isLoadingPrevData] = useState(true)
  const generatePDFRef = useRef(() => {})

  useEffect(() => {
    const loadAndCompute = async () => {
      isLoadingPrevData(true)
      const [pmhx, hxsocial, reg, hxfamily, triage, hcsr, hxoral, wce, phq] = await Promise.all([
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
      isLoadingPrevData(false)

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

      setForms(formData)

      const patient = await getSavedPatientData(patientId, 'patients')
      const visitedCount = computeVisitedStationsCount(patient)

      const eligibilityRows = getEligibilityRows(formData)
      const eligibleCount = eligibilityRows.filter((r) => r.eligibility === 'YES').length
      setRows(eligibilityRows)

      // NEW: Get the actual station names (not just counts)
      const visitedStationNames = getVisitedStationNames(patient)
      const eligibleStationNames = eligibilityRows
        .filter((r) => r.eligibility === 'YES')
        .map((r) => r.name)

      // Update existing counts and station names
      await updateStationCounts(
        patientId,
        visitedCount,
        eligibleCount,
        visitedStationNames,
        eligibleStationNames,
      )

      console.log('visited:', visitedCount, 'eligible:', eligibleCount)
      console.log('visited stations:', visitedStationNames)
      console.log('eligible stations:', eligibleStationNames)

      //melanie pdf function
      function createData(name, isEligible) {
        const eligibility = isEligible ? 'YES' : 'NO'
        return { name, eligibility }
      }

      const isVaccinationEligible =
        reg?.registrationQ4 >= 65 && reg.registrationQ7 === 'Singapore Citizen 新加坡公民'
      const isHealthierSGEligible = reg.registrationQ11 !== 'Yes'
      const isLungFunctionEligible =
        hxsocial.SOCIAL10 === 'Yes, (please specify how many pack-years)' ||
        hxsocial.SOCIAL11 === 'Yes, (please specify)'
      const isWomenCancerEducationEligible = reg.registrationQ5 === 'Female'
      const isOsteoporosisEligible =
        (reg.registrationQ5 === 'Female' && reg.registrationQ4 >= 45) ||
        (reg.registrationQ5 === 'Male' && reg.registrationQ4 >= 55)

      const isMentalHealthEligible =
        (phq.PHQ10 >= 10 && reg.registrationQ4 < 60) || phq.PHQ11 === 'Yes'
      const isAudiometryEligible = reg.registrationQ4 >= 60 && pmhx.PMHX13 === 'No'
      const isGeriatricScreeningEligible = reg.registrationQ4 >= 60
      const isDoctorStationEligible =
        triage.triageQ9 === 'Yes' ||
        hcsr.hxHcsrQ3 === 'Yes' ||
        hcsr.hxHcsrQ8 === 'Yes' ||
        pmhx.PMHX12 === 'Yes' ||
        phq.PHQ10 >= 10 ||
        phq.PHQ9 !== '0 - Not at all'
      const isDietitianEligible = hxsocial.SOCIAL15 === 'Yes'
      const isSocialServicesEligible =
        hxsocial.SOCIAL6 === 'Yes' ||
        hxsocial.SOCIAL7 === 'Yes, (please specify)' ||
        (hxsocial.SOCIAL8 === 'Yes' && hxsocial.SOCIAL9 === 'No')
      const isDentalEligible = hxoral.ORAL5 === 'Yes'

      const rowsData = [
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

      function patientSection() {
        const salutation = reg.registrationQ1 || 'Dear'

        const mainLogo = {
          image: logo,
          width: 220,
        }

        const thanksNote = [
          { text: `${parseFromLangKey('dear', salutation, patient.initials)}`, style: 'normal' },
          { text: '', margin: [0, 5] },
        ]

        return [
          mainLogo,
          //...title,
          ...thanksNote,
        ]
      }

      function eligibilitySection() {
        return [
          {
            style: 'tableExample',
            table: {
              widths: ['*', '*'],
              body: [
                [
                  { text: 'Modality', style: 'tableHeader', bold: true },
                  { text: 'Eligibility', style: 'tableHeader', bold: true },
                ],
                ...rowsData.map((row) => [
                  { text: row.name },
                  {
                    text: row.eligibility,
                    color: row.eligibility === 'YES' ? 'blue' : 'red', // Conditional color
                    lineHeight: 1.5,
                  },
                ]),
              ],
            },
            layout: {
              hLineWidth: () => 0.5,
              vLineWidth: () => 0.5,
              hLineColor: () => 'black',
              vLineColor: () => 'black',
            },
          },
        ]
      }

      generatePDFRef.current = () => {
        let content = []
        const docDefinition = {
          content: content,
          styles: {
            header: {
              fontSize: 16,
              bold: true,
              margin: [0, 10, 0, 5],
            },
            subheader: {
              fontSize: 11,
              bold: true,
            },
            normal: {
              fontSize: 10,
            },
            italicSmall: {
              italics: true,
              fontSize: 8,
            },
          },
          defaultStyle: {
            fontSize: 10,
          },
          pageMargins: [40, 60, 40, 60],
        }
        content.push(...patientSection())
        content.push(...eligibilitySection())
        let fileName = 'Report.pdf'
        if (patient.initials) {
          fileName = patient.initials.split(' ').join('_') + '_Eligibility_Report.pdf'
        }

        pdfMake.createPdf(docDefinition).download(fileName)
      }
    }

    if (patientId) loadAndCompute()
  }, [patientId])

  return (
    <>
      <Helmet>
        <title>registrationQ5 Eligibility</title>
      </Helmet>
      <Box
        sx={{
          backgroundColor: 'background.default',
          minHeight: '100%',
          py: 3,
        }}
      >
        {loadingPrevData ? (
          <CircularProgress />
        ) : (
          <Button onClick={() => generatePDFRef.current()}>Download Eligibility Report</Button>
        )}
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Modality</TableCell>
                <TableCell>ELIGIBILITY (highlighted in blue)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.name}>
                  <TableCell component='th' scope='row'>
                    {row.name}
                  </TableCell>
                  <TableCell sx={{ color: row.eligibility === 'YES' ? 'blue' : 'red' }}>
                    {row.eligibility}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </>
  )
}

export default Eligibility
