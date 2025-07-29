import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import Typography from '@mui/material/Typography'
import { styled } from '@mui/system'
import PropTypes from 'prop-types'
import React from 'react'
import { ScrollTopContext } from '../../api/utils.js'
import HxFamilyForm from './HxFamilyForm.jsx'
import HxGynaeForm from './HxGynaeForm.jsx'
import HxHcsrForm from './HxHcsrForm.jsx'
import HxM4M5ReviewForm from './HxM4M5ReviewForm.jsx'
import HxNssForm from './HxNssForm.jsx'
import HxOralForm from './HxOralForm.jsx'
import HxPhqForm from './HxPhqForm.jsx'
import HxSocialForm from './HxSocialForm.jsx'

function TabPanel(props) {
  const { children, value, index, ...other } = props

  return (
    <div
      role='tabpanel'
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box p={3}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  )
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired,
}

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  }
}

const HxWrapper = styled('div')(
  ({ theme }) => `
  flex-grow: 1;
  background-color: ${theme.palette.background.paper};
`,
)

export default function HxTabs() {
  const [value, setValue] = React.useState(0)
  const { scrollTop } = React.useContext(ScrollTopContext)

  const handleChange = (event, newValue) => {
    scrollTop()
    setValue(newValue)
  }

  return (
    <HxWrapper>
      <AppBar position='static' color='default'>
        <Tabs value={value} onChange={handleChange} aria-label='simple tabs example'>
          <Tab label='HCSR' {...a11yProps(0)} />
          <Tab label='PMHx' {...a11yProps(1)} />
          <Tab label='Social' {...a11yProps(2)} />
          <Tab label='Oral' {...a11yProps(3)} />
          <Tab label='Family' {...a11yProps(3)} />
          <Tab label='Gynae' {...a11yProps(3)} />
          <Tab label='PHQ' {...a11yProps(3)} />
          <Tab label='M4/M5 Review' {...a11yProps(3)} />
        </Tabs>
      </AppBar>
      <TabPanel value={value} index={0}>
        <HxHcsrForm changeTab={handleChange} nextTab={1} />
      </TabPanel>
      <TabPanel value={value} index={1}>
        <HxNssForm changeTab={handleChange} nextTab={2} />
      </TabPanel>
      <TabPanel value={value} index={2}>
        <HxSocialForm changeTab={handleChange} nextTab={3} />
      </TabPanel>
      <TabPanel value={value} index={3}>
        <HxOralForm changeTab={handleChange} nextTab={4} />
      </TabPanel>
      <TabPanel value={value} index={4}>
        <HxFamilyForm changeTab={handleChange} nextTab={5} />
      </TabPanel>
      <TabPanel value={value} index={5}>
        <HxGynaeForm changeTab={handleChange} nextTab={6} />
      </TabPanel>
      <TabPanel value={value} index={6}>
        <HxPhqForm changeTab={handleChange} nextTab={7} />
      </TabPanel>
      <TabPanel value={value} index={7}>
        <HxM4M5ReviewForm/>
      </TabPanel>
    </HxWrapper>
  )
}
