import React from 'react'
import { Route, Routes } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import LandingPage from './Pages/LandingPage'

// Patient Pages
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

// Doctor Pages
import DoctorDashboard from './Pages/Doctor/DoctorDashboard'
import PatientList from './Pages/Doctor/PatientList'
import DoctorVideoConsultation from './Pages/Doctor/VideoConsultation'
import PrescribedPatients from './Pages/Doctor/PrescribedPatients'
import DoctorConsultationHistory from './Pages/Doctor/ConsultationHistory'
import DoctorNotifications from './Pages/Doctor/Notifications'
import DoctorVideoCallNotifications from './Pages/Doctor/VideoCallNotifications'

// Auth Pages
import SignupPage from './Pages/SignupPage'
import SigninPage from './Pages/SigninPage'

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
            <Route path='/patient/doctors' element={<ProtectedRoute><DoctorsList /></ProtectedRoute>}></Route>
            <Route path='/medicine-recommendation' element={<ProtectedRoute><MedicineRecommendation /></ProtectedRoute>}></Route>
            <Route path='/patient-dashboard' element={<ProtectedRoute><PatientDashboard /></ProtectedRoute>}></Route>
            <Route path='/patient-support' element={<ProtectedRoute><PatientSupport /></ProtectedRoute>}></Route>
            <Route path='/prescription' element={<ProtectedRoute><Prescription /></ProtectedRoute>}></Route>
            <Route path='/video-consultation' element={<ProtectedRoute><VideoConsultation /></ProtectedRoute>}></Route>
            <Route path='/settings' element={<ProtectedRoute><Settings /></ProtectedRoute>}></Route>
            <Route path='/notifications' element={<ProtectedRoute><Notifications /></ProtectedRoute>}></Route>

            {/* Doctor routes */}
            <Route path='/doctor-dashboard' element={<ProtectedRoute><DoctorDashboard /></ProtectedRoute>}></Route>
            <Route path='/doctor/patient-list' element={<ProtectedRoute><PatientList /></ProtectedRoute>}></Route>
            <Route path='/doctor/video-consultation' element={<ProtectedRoute><DoctorVideoConsultation /></ProtectedRoute>}></Route>
            <Route path='/doctor/prescribed-patients' element={<ProtectedRoute><PrescribedPatients /></ProtectedRoute>}></Route>
            <Route path='/doctor/consultation-history' element={<ProtectedRoute><DoctorConsultationHistory /></ProtectedRoute>}></Route>
            <Route path='/doctor/notifications' element={<ProtectedRoute><DoctorNotifications /></ProtectedRoute>}></Route>
            <Route path='/doctor/video-call-notifications' element={<ProtectedRoute><DoctorVideoCallNotifications /></ProtectedRoute>}></Route>
        </Routes>
        <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
        />
    </>
  )
}

export default App
