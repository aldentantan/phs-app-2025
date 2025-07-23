import { Navigate } from 'react-router-dom'
import DashboardLayout from 'src/components/DashboardLayout'
import MainLayout from 'src/components/MainLayout'
import Queue from './pages/Queue'
import Dashboard from 'src/pages/Dashboard'
import Login from 'src/pages/Login'
import Reset from 'src/pages/Reset'
import NotFound from 'src/pages/NotFound'
import Register from 'src/pages/Register'
import Registration from 'src/pages/Registration'
import Settings from 'src/pages/Settings'
import DoctorsConsultForm from 'src/forms/DoctorsConsultForm'
import DietitiansConsultForm from 'src/forms/DietitiansConsultForm'
import OralHealthForm from 'src/forms/OralHealthForm'
import RegForm from 'src/forms/RegForm'
import TriageForm from 'src/forms/TriageForm'
import SocialServiceForm from 'src/forms/SocialServiceForm'
import HxTabs from './forms/HistoryTakingTabs/HistoryTaking'
import ManageVolunteers from 'src/pages/ManageVolunteers'
import DoctorAdmin from 'src/pages/DoctorAdmin'
import Edit from 'src/pages/EditForms'
import SummaryForm from 'src/forms/SummaryForm'
import React from 'react'

import HsgForm from './forms/HsgForm'
import LungFnForm from './forms/LungFnForm'
import OsteoForm from './forms/OsteoForm'
import MentalHealthForm from './forms/MentalHealthTabs/MentalHealthMain'
import HpvForm from './forms/HpvForm'
import VaccineForm from './forms/VaccineForm'
import WceTabs from './forms/WceTabs/WceMain'
import GeriAudiometryForm from './forms/GeriAudiometryForm'
import GeriVisionForm from './forms/GeriVisionForm'
import GeriMobilityTabs from './forms/GeriMobilityTabs/GeriMobility'
import GeriCognitiveTabs from './forms/GeriCognitiveTabs/GeriCognitive'
import MammobusForm from './forms/MammobusForm'
import PodiatryForm from './forms/PodiatryForm'

import Eligibility from './pages/Eligibility'

const routes = [
  {
    path: 'app',
    element: <DashboardLayout />,
    children: [
      { path: 'registration', element: <Registration /> },
      { path: 'dashboard', element: <Dashboard /> },
      { path: 'settings', element: <Settings /> },
      { path: 'doctorsconsult', element: <DoctorsConsultForm /> },
      { path: 'summary', element: <SummaryForm /> },
      { path: 'lungfn', element: <LungFnForm /> },
      { path: 'gerimobility', element: <GeriMobilityTabs /> },
      { path: 'hxtaking', element: <HxTabs /> },
      { path: 'reg', element: <RegForm /> },
      { path: 'vax', element: <VaccineForm /> },
      { path: 'hsg', element: <HsgForm /> },
      { path: 'geriaudio', element: <GeriAudiometryForm /> },
      { path: 'gerivision', element: <GeriVisionForm /> },
      { path: 'gericog', element: <GeriCognitiveTabs /> },
      { path: 'triage', element: <TriageForm /> },
      { path: 'osteoporosis', element: <OsteoForm /> },
      { path: 'dietitiansconsultation', element: <DietitiansConsultForm /> },
      { path: 'socialservice', element: <SocialServiceForm /> },
      { path: 'mentalhealth', element: <MentalHealthForm /> },
      { path: 'oralhealth', element: <OralHealthForm /> },
      { path: 'hpv', element: <HpvForm /> },
      { path: 'manage', element: <ManageVolunteers /> },
      { path: 'edit', element: <Edit /> },
      { path: 'wce', element: <WceTabs /> },
      { path: 'queue', element: <Queue /> },
      { path: 'eligibility', element: <Eligibility /> },
      { path: '*', element: <Navigate to='/404' /> },
      { path: 'docadmin', element: <DoctorAdmin /> },
      { path: 'mammobus', element: <MammobusForm /> },
      { path: 'podiatry', element: <PodiatryForm /> },
    ],
  },
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { path: 'login', element: <Login /> },
      { path: 'reset', element: <Reset /> },
      { path: 'register', element: <Register /> },
      { path: '404', element: <NotFound /> },
      { path: '/', element: <Navigate to='/login' /> },
      { path: '*', element: <Navigate to='/404' /> },
    ],
  },
]

export default routes
