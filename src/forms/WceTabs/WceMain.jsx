import React from 'react'
import PropTypes from 'prop-types'
import { styled } from '@mui/system'
import { AppBar, Tabs, Tab, Typography, Box, Paper } from '@mui/material'

import { ScrollTopContext } from '../../api/utils.js'
import WceForm from './WceForm.jsx'
import GynaeForm from './GynaeForm.jsx'

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
          <Typography component='div'>{children}</Typography>
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

const WceWrapper = styled('div')(({ theme }) => ({
  flexGrow: 1,
  backgroundColor: theme.palette.background.paper,
}))

export default function WceTabs() {
  const [value, setValue] = React.useState(0)
  const { scrollTop } = React.useContext(ScrollTopContext)

  const handleChange = (event, newValue) => {
    scrollTop()
    setValue(newValue)
  }

  return (
    <WceWrapper>
      <AppBar position='static' color='default'>
        <Tabs value={value} onChange={handleChange} aria-label='WCE tabs'>
          <Tab label='WCE' {...a11yProps(0)} />
          <Tab label='Gynae' {...a11yProps(1)} />
        </Tabs>
      </AppBar>
      <Paper elevation={2}>
        <TabPanel value={value} index={0}>
          <WceForm />
        </TabPanel>
        <TabPanel value={value} index={1}>
          <GynaeForm />
        </TabPanel>
      </Paper>
    </WceWrapper>
  )
}
