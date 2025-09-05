import React from 'react';
import Sidebar from '../Components/Sidebar';
import PatientHeader from '../Components/PatientHeader';

const PatientDashboard: React.FC = () => {
    const [patientName, setPatientName] = React.useState<string>('Patient');

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar />
            <div className="flex-1 flex flex-col">
                <main className="flex-1 p-8 lg:p-12">
                    <PatientHeader patientName={patientName} setPatientName={setPatientName} />
                    <div className="mt-12">
                        {/* Dashboard content goes here */}
                        <h2 className="text-3xl font-bold text-gray-800 mb-6">Dashboard Overview</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {/* Example Stats Cards */}
                            <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 hover-lift hover-glow">
                                <h3 className="text-lg font-semibold text-gray-600 mb-2">Upcoming Appointments</h3>
                                <p className="text-4xl font-bold text-emerald-600">3</p>
                            </div>
                            <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 hover-lift hover-glow">
                                <h3 className="text-lg font-semibold text-gray-600 mb-2">New Prescriptions</h3>
                                <p className="text-4xl font-bold text-emerald-600">2</p>
                            </div>
                            <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 hover-lift hover-glow">
                                <h3 className="text-lg font-semibold text-gray-600 mb-2">Messages</h3>
                                <p className="text-4xl font-bold text-emerald-600">5</p>
                            </div>
                             <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 hover-lift hover-glow">
                                <h3 className="text-lg font-semibold text-gray-600 mb-2">Medical Records</h3>
                                <p className="text-4xl font-bold text-emerald-600">12</p>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}

export default PatientDashboard;
