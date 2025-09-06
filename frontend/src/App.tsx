import React from 'react'
import { Route, Routes } from 'react-router-dom'
import LandingPage from './Pages/LandingPage'

import Appointments from "./Pages/Patient/Appointments"
import ConsultationHistory from "./Pages/Patient/ConsultationHistory"
import DoctorsList from "./Pages/Patient/DoctorsList"
import MedicineRecommendation from './Pages/Patient/MedicineRecommendation'
import PatientDashboard from './Pages/Patient/PatientDashboard'
import PatientSupport from './Pages/Patient/PatientSupport'
import Prescription from './Pages/Patient/Prescription'
import VideoConsultation from './Pages/Patient/VideoConsultation'
import Settings from './Pages/Patient/Settings'
import Notifications from './Pages/Patient/Notifications'
import SignupPage from './Pages/SignupPage'
import SigninPage from './Pages/SigninPage'

import DoctorDashboard from './Pages/DoctorDashboard'

const App: React.FC = () => {
  return (
    <>
        <Routes>
            <Route path='/' element={<LandingPage />}></Route>
            <Route path='/signup' element={<SignupPage />}></Route>
            <Route path='/signin' element={<SigninPage />}></Route>

            <Route path='/appointments' element={<Appointments />}></Route>
            <Route path='/consultation-history' element={<ConsultationHistory />}></Route>
            <Route path='/doctors-list' element={<DoctorsList />}></Route>
            <Route path='/medicine-recommendation' element={<MedicineRecommendation />}></Route>
            <Route path='/patient-dashboard' element={<PatientDashboard />}></Route>
            <Route path='/patient-support' element={<PatientSupport />}></Route>
            <Route path='/prescription' element={<Prescription />}></Route>
            <Route path='/video-consultation' element={<VideoConsultation />}></Route>
            <Route path='/settings' element={<Settings />}></Route>
            <Route path='/notifications' element={<Notifications />}></Route>

            <Route path='/doctor-dashboard' element={<DoctorDashboard />}></Route>
        </Routes>
    </>
  )
}

export default App
