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
import ProtectedRoute from './Components/ProtectedRoute'

const App: React.FC = () => {
  return (
    <>
        <Routes>
            {/* Public routes */}
            <Route path='/' element={<LandingPage />}></Route>
            <Route path='/signup' element={<SignupPage />}></Route>
            <Route path='/signin' element={<SigninPage />}></Route>

            {/* Protected routes */}
            <Route path='/appointments' element={<ProtectedRoute><Appointments /></ProtectedRoute>}></Route>
            <Route path='/consultation-history' element={<ProtectedRoute><ConsultationHistory /></ProtectedRoute>}></Route>
            <Route path='/doctors-list' element={<ProtectedRoute><DoctorsList /></ProtectedRoute>}></Route>
            <Route path='/medicine-recommendation' element={<ProtectedRoute><MedicineRecommendation /></ProtectedRoute>}></Route>
            <Route path='/patient-dashboard' element={<ProtectedRoute><PatientDashboard /></ProtectedRoute>}></Route>
            <Route path='/patient-support' element={<ProtectedRoute><PatientSupport /></ProtectedRoute>}></Route>
            <Route path='/prescription' element={<ProtectedRoute><Prescription /></ProtectedRoute>}></Route>
            <Route path='/video-consultation' element={<ProtectedRoute><VideoConsultation /></ProtectedRoute>}></Route>
            <Route path='/settings' element={<ProtectedRoute><Settings /></ProtectedRoute>}></Route>
            <Route path='/notifications' element={<ProtectedRoute><Notifications /></ProtectedRoute>}></Route>

            <Route path='/doctor-dashboard' element={<ProtectedRoute><DoctorDashboard /></ProtectedRoute>}></Route>
        </Routes>
    </>
  )
}

export default App
