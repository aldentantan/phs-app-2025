import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material'
import CircularProgress from '@mui/material/CircularProgress'
import { useContext, useEffect, useRef, useState } from 'react'
import { Helmet } from 'react-helmet-async'

import pdfMake from 'pdfmake/build/pdfmake'
import pdfFonts from 'pdfmake/build/vfs_fonts'
pdfMake.vfs = pdfFonts.vfs

import logo from 'src/icons/Icon'
import { parseFromLangKey } from '../api/langutil'

import { FormContext } from '../api/utils.js'
import allForms from '../forms/forms.json'
import { getSavedData, getSavedPatientData, updateStationCounts } from '../services/mongoDB'
import {
  computeVisitedStationsCount,
  getEligibilityRows,
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
    }

    if (patientId) loadAndCompute()
  }, [patientId])


  // melanie pdf
  useEffect(() => {
    if (!rows || rows.length === 0 || !forms) return
  
    generatePDFRef.current = () => {
      const initials = forms.reg.registrationQ2 || 'Participant'
      const patientSection = () => {
        const salutation = forms.reg.registrationQ1 || ''
        
        const mainLogo = {
          image: logo,
          width: 220,
        }

        const thanksNote = [
          { text: `${parseFromLangKey('dear', salutation, initials)}`, style: 'normal' },
          { text: '', margin: [0, 5] },
        ]
  
        return [
          mainLogo,
          //...title,
          ...thanksNote,
        ]
      }
  
      const eligibilitySection = () => {
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
                ...rows.map((row) => [
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
      if (initials) {
        fileName = initials.split(' ').join('_') + '_Eligibility_Report.pdf'
      }
  
      pdfMake.createPdf(docDefinition).download(fileName)
    }
  }, [rows, forms])
  

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
