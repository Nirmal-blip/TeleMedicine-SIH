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

import DoctorDashboard from './Pages/DoctorDashboard'

const App: React.FC = () => {
  return (
    <>
        <Routes>
            <Route path='/' element={<LandingPage />}></Route>

            <Route path='/appointments' element={<Appointments />}></Route>
            <Route path='/consultation-history' element={<ConsultationHistory />}></Route>
            <Route path='/doctors-list' element={<DoctorsList />}></Route>
            <Route path='/medicine-recommendation' element={<MedicineRecommendation />}></Route>
            <Route path='/patient-dashboard' element={<PatientDashboard />}></Route>
            <Route path='/patient-support' element={<PatientSupport />}></Route>
            <Route path='/prescription' element={<Prescription />}></Route>
            <Route path='/video-consultation' element={<VideoConsultation />}></Route>

            <Route path='/doctor-dashboard' element={<DoctorDashboard />}></Route>
        </Routes>
    </>
  )
}

export default App
