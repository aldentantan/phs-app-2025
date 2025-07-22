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
import pic1 from '../icons/pic1-forma';
import pic2 from '../icons/pic2-forma';
import pic3 from '../icons/pic3-forma';
import pic4 from '../icons/pic4-forma';
import pic5 from '../icons/pic5-forma';
import { checkedBox, uncheckedBox } from '../icons/checked';

import pdfMake from 'pdfmake/build/pdfmake'
import pdfFonts from 'pdfmake/build/vfs_fonts'
pdfMake.vfs = pdfFonts.vfs

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
  const generatePDFRef = useRef(() => { })

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

      function eligibilitySection() {

        const col1Labels = [
          '4', '5', '6', '7', '8', '', '', '', '', '9', '10', '11', '12',
          '13', '14', '15', '16', '17', '18', '19'
        ];

        const col2Texts = [
          'Healther SG Booth',
          'Lung Function Testing',
          'Womens Cancer Education',
          'Podiatry',
          'Geriatic Screening',
          'Cognitive Function',
          'Mobility',
          '',
          '',
          'Visual Acuity',
          'Dietitians Consult',
          'Social Services',
          'Mental Health',
          'Dental Health',
          'Mammobus',
          'HPV On-Site Testing',
          'Vaccination',
          'Audiometry',
          'Doctors Station',
          'Screening Review',
        ];


        const col5Texts = [
          {
            stack: [
              {
                columns: [
                  { image: uncheckedBox, width: 10, margin: [0, 0, 5, 0] },
                  { text: 'Have not previously been enrolled in HSG', fontSize: 8 }
                ]
              }
            ]
          },
          {text: ''},
          {text: 'If the participant is eligible for HPV On-Site Testing, please indicate below in the cell OUTLINED with a double border', fontSize: 8},
          {text: ''},
          {
            stack: [
              {
                columns: [
                  { image: uncheckedBox, width: 10, margin: [0, 0, 5, 0] },
                  { text: '>= 60 years old', fontSize: 8 }
                ]
              }
            ]
          },
          {text: ''},
          {
            stack: [
              {
                columns: [
                  { image: uncheckedBox, width: 10, margin: [0, 0, 2, 0] },
                  { text: 'OT Questionnaire (HOMEFAST)', fontSize: 8 },
                  { image: uncheckedBox, width: 10, margin: [2, 0, 2, 0] },
                  { text: 'PT Questionnaire (PAL Qx)', fontSize: 8 }
                ]
              },
              {
                columns: [
                  { image: uncheckedBox, width: 10, margin: [0, 0, 2, 0] },
                  { text: 'Physical Tests (SPPB)', fontSize: 8 },
                ]
              },
              {
                columns: [
                  { text: 'Recommended for:', margin: [0, 0, 2, 0], fontSize: 8 },
                  { image: uncheckedBox, width: 10, margin: [0, 0, 2, 0] },
                  { text: 'PT Consult', fontSize: 8 },
                  { image: uncheckedBox, width: 10, margin: [2, 0, 2, 0] },
                  { text: 'OT Consult', fontSize: 8 }
                ]
              }
            ]
          },
          {text: ''},
          {text: ''},
          {text: ''},
          {text: ''},
          {text: ''},
          {text: ''},
          {text: ''},
          {text: ''},
          {text: ''},
          {text: ''},
          {text: 'Part of Geriatric Screening', fontSize: 8},
          {text: 'Please refer above to part 15A for details on reason(s) for recommendation', fontSize: 8},
          {text: ''},
        ];

        const col3Eligible = col2Texts.map((_, i) => {
          if (i >= 5 && i <= 8) {
            return '';
          } else {
            return 'YES / NO';
          }
        });
        const col4Eligible = col2Texts.map((_, i) => {
          if (i == 7) {
            return 'PT Consult:\n YES / NO';
          } else if (i == 8) {
            return 'OT Consult:\n YES / NO';
          } else {
            return 'YES / NO';
          }
        });



        const sectionTable = {
          table: {
            widths: ['5%', '19%', '15%', '15%', '46%'],
            body: [
              // Header row
              [
                { text: '', bold: true, fontSize: 9, },
                { text: 'Modality', bold: true, fontSize: 9, },
                { text: 'ELIGIBLE?', bold: true, fontSize: 9, },
                { text: 'COMPLETED?', bold: true, fontSize: 9, },
                { text: 'Details', bold: true, fontSize: 9, }
              ],
              // 20 rows with placeholders
              ...col1Labels.map((label, index) => [
                { text: label, fontSize: 9, },
                { text: col2Texts[index] || '', fontSize: 9, },
                { text: col3Eligible[index] || '', fontSize: 9, },
                { text: col4Eligible[index] || '', fontSize: 9, },
                col5Texts[index] || { text: '', fontSize: 8 }
              ])
            ]
          },
          layout: {
            hLineWidth: () => 0.5,
            vLineWidth: () => 0.5,
            hLineColor: () => 'black',
            vLineColor: () => 'black',
          },
          margin: [0, 10, 0, 10]
        };
        return sectionTable;
      }

      function chasStatusSection() {
        const chasStatus = reg?.chasStatus || 'none'; // Default to 'none' if not specified
        const chasOptions = {
          blue: chasStatus === 'blue' ? checkedBox : uncheckedBox,
          orange: chasStatus === 'orange' ? checkedBox : uncheckedBox,
          none: chasStatus === 'none' ? checkedBox : uncheckedBox,
        };

        // CHAS Status Section
        const chasSection = {
          stack: [
            {
              columns: [
                {
                  text: 'FORM A',
                  bold: true,
                  fontSize: 14,
                  margin: [0,0,0,10],
                  alignment: 'center'
                }
              ],
              width: 'auto'
            },
            {
              columns: [
                {
                  columns: [
                    {
                      text: 'CHAS Status:',
                      style: 'sectionSubheader',
                    }
                  ],
                  width: 'auto'
                },
                {
                  columns: [
                    { image: `${chasOptions.blue} `, width: 10 },
                    { text: 'CHAS Blue', style: 'checkboxLabel' }
                  ],
                  width: 'auto'
                },
                {
                  columns: [
                    { image: `${chasOptions.orange} `, width: 10 },
                    { text: 'CHAS Orange', style: 'checkboxLabel' }
                  ],
                  width: 'auto'
                },
                {
                  columns: [
                    { image: `${chasOptions.none} `, width: 10 },
                    { text: 'No CHAS', style: 'checkboxLabel' }
                  ],
                  width: 'auto'
                }
              ],
              columnGap: 15,
              // margin: [15, 0, 0, 10]
            }
          ],
          margin: [0, 0, 0, 20]
        };
        return chasSection;
      }

      function pioneerGenSection() {
        const isPioneerGen = true; // Default to 'none' if not specified
        const isPioneerGenOptions = {
          isPioneer: isPioneerGen === true ? checkedBox : uncheckedBox,
          isNotPioneer: isPioneerGen === false ? checkedBox : uncheckedBox,
        };

        // CHAS Status Section
        const pioneerSection = {
          stack: [
            {
              columns: [
                {
                  columns: [
                    {
                      text: 'Pioneer Generation:',
                      style: 'sectionSubheader',
                    }
                  ],
                  width: 'auto'
                },
                {
                  columns: [
                    { image: `${isPioneerGenOptions.isPioneer} `, width: 10 },
                    { text: 'Yes', style: 'checkboxLabel' }
                  ],
                  width: 'auto'
                },
                {
                  columns: [
                    { image: `${isPioneerGenOptions.isNotPioneer} `, width: 10 },
                    { text: 'No', style: 'checkboxLabel' }
                  ],
                  width: 'auto'
                },

              ],
              columnGap: 15,
              // margin: [15, 0, 0, 10]
            }
          ],
          margin: [0, 0, 0, 10]
        };
        return pioneerSection;
      }

      function triageTableSection() {
        const sampleTable = {
          table: {
            widths: ['15%', '25%', '30%', '30%'], // Adjust widths as needed
            body: [
              // Row 1
              [
                { text: '2. TRIAGE', colSpan: 2 },
                {}, // Empty cell due to colSpan
                { text: '15A. Reasons for recommendation to Doctors Station', colSpan: 2 },
                {}
              ],
              // Row 2
              [
                {
                  text: 'WEIGHT: ____ kg\nHEIGHT: ____ m\nBMI: ____ kg/m2',
                  alignment: 'left',
                  fontSize: 8,
                  margin: [0, 5, 0, 5]
                },
                {
                  text:
                    '1st BP: ___ / ___   2nd BP: ___ / ___\n' +
                    '3rd BP: ___ / ___   AVE. BP: _____ / _____\n' +
                    'Waist circumference: _____ cm',
                  fontSize: 8,
                  margin: [0, 5, 0, 5]
                },
                {
                  text: 'Referred from:\n' + 'Reason:\n',
                  alignment: 'left',
                  fontSize: 8,
                  margin: [0, 5, 0, 5]
                },
                {
                  text: 'Referred from:\n' + 'Reason:\n',
                  alignment: 'left',
                  fontSize: 8,
                  margin: [0, 5, 0, 5]
                },
              ]
            ]
          },
          layout: {
            hLineWidth: () => 0.5,
            vLineWidth: () => 0.5,
            hLineColor: () => 'black',
            vLineColor: () => 'black',
          },
          margin: [0, 0, 0, 20]
        };
        return sampleTable;
      }

      let formAImages = [pic1, pic2, pic3, pic4, pic5];

      function picSections() {
        return formAImages
          .filter(img => !!img)
          .map((img, index) => ({
            pageBreak: index === 0 ? 'before' : 'before',
            stack: [
              {
                image: img,
                width: 500,
              }
            ]
          }));
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
        content.push(chasStatusSection())
        content.push(pioneerGenSection())
        content.push(triageTableSection())
        content.push(eligibilitySection())
        content.push(...picSections())

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
