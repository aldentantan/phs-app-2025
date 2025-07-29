import React, { useState, useContext, useEffect, useRef } from 'react'
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
import CircularProgress from '@mui/material/CircularProgress'
import { Helmet } from 'react-helmet-async'
import pic1 from '../icons/pic1-forma';
import pic2 from '../icons/pic2-forma';
import pic3 from '../icons/pic3-forma';
import pic4 from '../icons/pic4-forma';
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
      const [
        pmhx, hxsocial, reg, hxfamily, triage, hcsr, hxoral, wce, phq, hxm4m5, hxgynae
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
        getSavedData(patientId, allForms.hxM4M5ReviewForm),
        getSavedData(patientId, allForms.hxGynaeForm)
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
        hxm4m5: hxm4m5 || {},
        hxgynae: hxgynae || {},
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
      function eligibilitySection() {

        const col1Labels = [
          '4', '5', '6', '7', '8', '9', '', '', '', '', '10', '11', '12',
          '13', '14', '15', '16', '17', '18', '19'
        ];

        const col2Texts = [
          { label: 'Healthier SG Booth', eligibilityKey: 'Healthier SG Booth' },
          { label: 'Lung Function Testing', eligibilityKey: 'Lung Function Testing' },
          { label: 'Womens Cancer Education', eligibilityKey: "Women's Cancer Education" },
          { label: 'Podiatry', eligibilityKey: 'Podiatry' },
          { label: 'Dietitians Consult', eligibilityKey: "Dietitian's Consult" },
          { label: 'Geriatic Screening', eligibilityKey: 'Geriatric Screening' },
          { label: '    Cognitive Function', eligibilityKey: 'Geriatric Screening' }, // grouped under GS
          { label: '    Mobility', eligibilityKey: 'Geriatric Screening' },
          { label: '', eligibilityKey: '' },
          { label: '', eligibilityKey: '' },
          { label: 'Visual Acuity', eligibilityKey: 'Ophthalmology' },
          { label: 'Dental Health', eligibilityKey: 'Oral Health' },
          { label: 'Social Services', eligibilityKey: 'Social Services' },
          { label: 'Mental Health', eligibilityKey: 'Mental Health' },
          { label: 'Mammobus', eligibilityKey: 'Mammobus' },
          { label: 'HPV On-Site Testing', eligibilityKey: 'HPV On-Site Testing' },
          { label: 'Audiometry', eligibilityKey: 'Audiometry' },
          { label: 'Vaccination', eligibilityKey: 'Vaccination' },
          { label: 'Doctors Station', eligibilityKey: "Doctor's Station" },
          { label: 'Screening Review', eligibilityKey: '' }, // no eligibility tracking
        ];


        const col5Texts = [
          {
            stack: [
              {
                columns: [
                  { image: uncheckedBox, width: 10, margin: [-2, 0, 5, 0] },
                  { text: 'Have not previously been enrolled in HSG', fontSize: 9 },
                ]
              }
            ]
          },          
          {text: ''},
          {text: ''},
          {text: ''},
          {text: ''},
          {
            stack: [
              {
                columns: [
                  { image: uncheckedBox, width: 10, margin: [-2, 0, 5, 0] },
                  { text: '>= 60 years old', fontSize: 9 }
                ]
              }
            ]
          },
          {text: ''},
          {
            rowSpan: 3,
            stack: [
              {
                columns: [
                  { image: uncheckedBox, width: 10, margin: [-2, 0, 2, 0] },
                  { text: 'OT Questionnaire (HOMEFAST)', fontSize: 9, margin: [0, 0, 0, 4] },
                  { image: uncheckedBox, width: 10, margin: [-2, 0, 2, 0] },
                  { text: 'PT Questionnaire (PAL Qx)', fontSize: 9, margin: [0, 0, 0, 4] }
                ]
              },
              {
                columns: [
                  { image: uncheckedBox, width: 10, margin: [-2, 0, 2, 0] },
                  { text: 'Physical Tests (SPPB)', fontSize: 9, margin: [0, 0, 0, 4] },
                ]
              },
              {
                columns: [
                  { text: 'Recommended for:', margin: [-2, 0, 2, 0], fontSize: 9 },
                  { image: uncheckedBox, width: 10, margin: [-2, 0, 2, 0] },
                  { text: 'PT Consult', fontSize: 9 },
                  { image: uncheckedBox, width: 10, margin: [-2, 0, 2, 0] },
                  { text: 'OT Consult', fontSize: 9 }
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
          {text: 'Part of Geriatric Screening', fontSize: 9},
          {text: ''},
          {text: 'Please refer above to part 15A for details on reason(s) for recommendation', fontSize: 9},
          {text: ''},
        ];

        const col3Eligible = col2Texts.map(({ eligibilityKey }, i) => {
          if (i >= 6 && i <= 9) { // Geri screening merged cells
            return '';
          }
          if (i === 19) { // Screening review
            return { text: "YES", alignment: 'center', color: 'blue'};
          }
          const eligibility = eligibilityRows.find((r) => r.name === eligibilityKey)?.eligibility;
          return {
            text: eligibility,
            alignment: 'center',
            color: eligibility === 'YES' ? 'blue' : 'red',
          };
        });
        
        const col4Eligible = col2Texts.map((_, i) => {
          if (i == 8) {
            return 'PT Consult:    YES   /   NO';
          } else if (i == 9) {
            return 'OT Consult:    YES   /   NO';
          } else {
            return { text: 'YES          /          NO', alignment: 'center' };
          }
        });



        const sectionTable = {
          table: {
            widths: ['3%', '19%', '15%', '15%', '48%'],
            body: [
              // Header row
              [
                { text: '', bold: true, fontSize: 10, },
                { text: 'Modality', bold: true, fontSize: 9, },
                { text: 'ELIGIBLE?', bold: true, fontSize: 9, alignment: 'center' },
                { text: 'COMPLETED?', bold: true, fontSize: 9, alignment: 'center' },
                { text: 'Details', bold: true, fontSize: 9, }
              ],
              // Rows 0–4: normal
              ...[0, 1, 2, 3, 4].map((i) => [
                { text: col1Labels[i], fontSize: 10 },
                { text: col2Texts[i].label, fontSize: 11 },
                { text: col3Eligible[i], fontSize: 9 },
                { text: col4Eligible[i], fontSize: 9 },
                col5Texts[i]
              ]),
              // Row 5 (Geriatric Screening) with ELIGIBLE? rowSpan=5
              [
                { text: 9, fontSize: 10, rowSpan: 5},
                { text: col2Texts[5].label, fontSize: 11 },
                { ...col3Eligible[5], fontSize: 9, alignment: 'center', rowSpan: 5 },
                { text: col4Eligible[5], fontSize: 9 },
                col5Texts[5]
              ],
              // Row 6 (Cognitive Function)
              [
                { text: '', fontSize: 10 },
                { text: col2Texts[6].label, fontSize: 9, preserveLeadingSpaces: true },
                '', // skip because of rowSpan
                { text: col4Eligible[6], fontSize: 9 },
                col5Texts[6]
              ],
              // Row 7 (Mobility) with rowSpan=3
              [
                { text: '', fontSize: 10 },
                { text: col2Texts[7].label, fontSize: 9, rowSpan: 3, preserveLeadingSpaces: true },
                '', // skip
                { text: col4Eligible[7], fontSize: 9 },
                col5Texts[7]
              ],
              // Rows 8–19: normal
              ...[8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19].map((i) => [
                { text: col1Labels[i], fontSize: 9 },
                { text: col2Texts[i].label, fontSize: 11 },
                { text: col3Eligible[i], fontSize: 9 },
                { text: col4Eligible[i], fontSize: 9 },
                col5Texts[i]
              ])
            ]
          },
          layout: {
            hLineWidth: () => 0.5,
            vLineWidth: () => 0.5,
            hLineColor: () => 'black',
            vLineColor: () => 'black',
          },
          margin: [0, 5, 0, 5]
        };
        return sectionTable;
      }

      function chasStatusSection() {
        const chasStatus = reg?.registrationQ12
        const chasOptions = {
          blue: chasStatus === 'CHAS Blue' ? checkedBox : uncheckedBox,
          orange: chasStatus === 'CHAS Orange' ? checkedBox : uncheckedBox,
          green: chasStatus === 'CHAS Green' ? checkedBox : uncheckedBox,
          none: chasStatus === 'No CHAS' ? checkedBox : uncheckedBox,
        };

        // CHAS Status Section
        const chasSection = {
          stack: [
            {
              columns: [
                {
                  text: 'FORM A',
                  bold: true,
                  fontSize: 20,
                  margin: [0,-35,0,5],
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
                  width: 'auto',
                  margin: [0, -5, 0, -5]
                },
                {
                  columns: [
                    { image: `${chasOptions.blue} `, width: 10 },
                    { text: 'CHAS Blue', style: 'checkboxLabel' }
                  ],
                  width: 'auto',
                  margin: [0, -5, 0, -5]
                },
                {
                  columns: [
                    { image: `${chasOptions.orange} `, width: 10 },
                    { text: 'CHAS Orange', style: 'checkboxLabel' }
                  ],
                  width: 'auto',
                  margin: [0, -5, 0, -5]
                },
                {
                  columns: [
                    { image: `${chasOptions.green} `, width: 10 },
                    { text: 'CHAS Green', style: 'checkboxLabel' }
                  ],
                  width: 'auto',
                  margin: [0, -5, 0, -5]
                },
                {
                  columns: [
                    { image: `${chasOptions.none} `, width: 10 },
                    { text: 'No CHAS', style: 'checkboxLabel' }
                  ],
                  width: 'auto',
                  margin: [0, -5, 0, -5]
                },
              ],
              columnGap: 15,
              // margin: [15, 0, 0, 10]
            }
          ],
          margin: [0, -5, 0, 15]
        };
        return chasSection;
      }

      function pioneerGenSection() {
        const isPioneerGen = reg?.registrationQ13 === 'Pioneer generation card holder'; // Default to 'none' if not specified
        const isPioneerGenOptions = {
          isPioneer: isPioneerGen === true ? checkedBox : uncheckedBox,
          isNotPioneer: isPioneerGen === false ? checkedBox : uncheckedBox,
        };

        // Pioneer Section
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
              margin: [0, 0, 0, -5]
            }
          ],
          margin: [0, 0, 0, 10]
        };
        return pioneerSection;
      }

      function formatTriage(triage = {}) {
        const {
          triageQ1, triageQ2, triageQ3, triageQ4,
          triageQ5, triageQ6, triageQ10, triageQ11,
          triageQ12, triageQ13, triageQ7, triageQ8
        } = triage
      
        return {
          weightStr: triageQ11 ? `${triageQ11} kg` : '____ kg',
          heightStr: triageQ10 ? `${triageQ10} cm` : '____ cm',
          bmiStr: triageQ12 ? `${triageQ12} kg/m\u00B2` : '____',
          bp1: `${triageQ1 ?? '___'} / ${triageQ2 ?? '___'}`,
          bp2: `${triageQ3 ?? '___'} / ${triageQ4 ?? '___'}`,
          bp3: `${triageQ5 ?? '___'} / ${triageQ6 ?? '___'}`,
          avgBP: `${triageQ7 ?? '____'} / ${triageQ8 ?? '____'}`,
          waist: triageQ13 ? `${triageQ13} cm` : '____ cm'
        }
      }

      function triageTableSection(triage = {}) {
        const {
          weightStr, heightStr, bmiStr,
          bp1, bp2, bp3, avgBP, waist
        } = formatTriage(triage)

        return {
          table: {
            widths: ['15%', '25%', '30%', '30%'], // Adjust widths as needed
            body: [
              [
                { text: '2. TRIAGE', colSpan: 2, bold: true }, {},
                { text: '15A. Reasons for recommendation to Doctors Station', colSpan: 2, bold: true }, {}
              ],
              [
                {
                  stack: [
                    {
                      columns: [
                        { text: 'WEIGHT:', bold: true, fontSize: 9 },
                        { text: weightStr, fontSize: 9,}
                      ],
                      margin: [0, 2, 0, 2]
                    },
                    {
                      columns: [
                        { text: 'HEIGHT:', bold: true, fontSize: 9 },
                        { text: heightStr, fontSize: 9,}
                      ],
                      margin: [0, 2, 0, 2]
                    },
                    {
                      columns: [
                        { text: 'BMI:', bold: true, fontSize: 9 },
                        { text: bmiStr, fontSize: 9,}
                      ],
                      margin: [0, 2, 0, 2]
                    }
                  ],
                  margin: [0, 4, 0, 4]
                },
                // Middle column: BP and waist
                {
                  stack: [
                    {
                      text: [
                        { text: '1st BP: ', bold: true, fontSize: 9 },
                        { text: `${bp1}      `, fontSize: 9 },
                        { text: '2nd BP: ', bold: true, fontSize: 9 },
                        { text: `${bp2}`, fontSize: 9 }
                      ], 
                      margin:[0, 2, 0, 2]
                    },
                    {
                      text: [
                        { text: '3rd BP: ', bold: true, fontSize: 9 },
                        { text: `${bp3}      `, fontSize: 9 },
                        { text: 'AVE. BP: ', bold: true, fontSize: 9 },
                        { text: `${avgBP}`, fontSize: 9 }
                      ],
                      margin: [0, 2, 0, 2]
                    },
                    { text: `Waist circumference: ${waist}`, fontSize: 9, margin: [0, 2, 0, 2]},
                  ],
                  margin: [0, 4, 0, 4]
                },
                {
                  stack: [
                    { text: 'Referred from:', fontSize: 9, margin: [0, 2, 0, 2] },
                    { text: 'Reason:', fontSize: 9, margin: [0, 2, 0, 2] }
                  ], 
                  margin: [0, 4, 0, 4], 
                },             
                {
                  stack: [
                    { text: 'Referred from:', fontSize: 9, margin: [0, 2, 0, 2] },
                    { text: 'Reason:', fontSize: 9, margin: [0, 2, 0, 2] }
                  ],
                  margin: [0, 4, 0, 4], 
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
          margin: [0, 0, 0, 5]
        }
      }
        

      let formAImages = [pic1, pic2, pic3, pic4];

      function picSections() {
        return formAImages
          .filter(img => !!img)
          .map((img, index) => ({
            pageBreak: index === 0 ? 'before' : 'before',
            stack: [
              {
                image: img,
                width: 700,
                alignment: 'center',
              }
            ],
          }));
      }

      generatePDFRef.current = () => {
        let content = []
        const docDefinition = {
          pageOrientation: 'landscape',
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
        content.push(triageTableSection(triage))
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
