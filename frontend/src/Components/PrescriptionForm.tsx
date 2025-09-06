import React, { useState } from 'react'
import { FaPills, FaPlus, FaTimes, FaSave, FaCalendar, FaUser, FaStethoscope, FaExclamationTriangle, FaEye, FaDownload } from 'react-icons/fa'

interface Medication {
  name: string;
  genericName?: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
  quantity: number;
  refills?: number;
}

interface PrescriptionFormData {
  medications: Medication[];
  diagnosis?: string;
  symptoms?: string[];
  doctorNotes?: string;
  patientInstructions?: string;
  issueDate: string;
  expiryDate?: string;
  status: string;
  allergies?: string[];
  warnings?: string[];
  priority: string;
  requiresMonitoring: boolean;
  monitoringInstructions?: string;
  followUpRequired?: boolean;
  followUpDate?: string;
}

interface PrescriptionFormProps {
  isOpen: boolean;
  onClose: () => void;
  patientData?: any;
  doctorData?: any;
  appointmentId?: string;
  onSubmit: (prescriptionData: PrescriptionFormData) => void;
}

const PrescriptionForm: React.FC<PrescriptionFormProps> = ({
  isOpen,
  onClose,
  patientData,
  doctorData,
  appointmentId,
  onSubmit
}) => {
  const [formData, setFormData] = useState<PrescriptionFormData>({
    medications: [{
      name: '',
      genericName: '',
      dosage: '',
      frequency: '',
      duration: '',
      instructions: '',
      quantity: 1,
      refills: 0
    }],
    diagnosis: '',
    symptoms: [],
    doctorNotes: '',
    patientInstructions: '',
    issueDate: new Date().toISOString().split('T')[0],
    expiryDate: '',
    status: 'Active',
    allergies: [],
    warnings: [],
    priority: 'Medium',
    requiresMonitoring: false,
    monitoringInstructions: '',
    followUpRequired: false,
    followUpDate: ''
  });

  const [symptomInput, setSymptomInput] = useState('');
  const [allergyInput, setAllergyInput] = useState('');
  const [warningInput, setWarningInput] = useState('');


  const addMedication = () => {
    setFormData(prev => ({
      ...prev,
      medications: [...prev.medications, {
        name: '',
        genericName: '',
        dosage: '',
        frequency: '',
        duration: '',
        instructions: '',
        quantity: 1,
        refills: 0
      }]
    }));
  };

  const removeMedication = (index: number) => {
    setFormData(prev => ({
      ...prev,
      medications: prev.medications.filter((_, i) => i !== index)
    }));
  };

  const updateMedication = (index: number, field: keyof Medication, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      medications: prev.medications.map((med, i) => 
        i === index ? { ...med, [field]: value } : med
      )
    }));
  };

  const addSymptom = () => {
    if (symptomInput.trim()) {
      setFormData(prev => ({
        ...prev,
        symptoms: [...(prev.symptoms || []), symptomInput.trim()]
      }));
      setSymptomInput('');
    }
  };

  const removeSymptom = (index: number) => {
    setFormData(prev => ({
      ...prev,
      symptoms: prev.symptoms?.filter((_, i) => i !== index) || []
    }));
  };

  const addAllergy = () => {
    if (allergyInput.trim()) {
      setFormData(prev => ({
        ...prev,
        allergies: [...(prev.allergies || []), allergyInput.trim()]
      }));
      setAllergyInput('');
    }
  };

  const removeAllergy = (index: number) => {
    setFormData(prev => ({
      ...prev,
      allergies: prev.allergies?.filter((_, i) => i !== index) || []
    }));
  };

  const addWarning = () => {
    if (warningInput.trim()) {
      setFormData(prev => ({
        ...prev,
        warnings: [...(prev.warnings || []), warningInput.trim()]
      }));
      setWarningInput('');
    }
  };

  const removeWarning = (index: number) => {
    setFormData(prev => ({
      ...prev,
      warnings: prev.warnings?.filter((_, i) => i !== index) || []
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.diagnosis?.trim()) {
      alert('Please enter a diagnosis');
      return;
    }
    
    if (formData.medications.some(med => !med.name || !med.dosage || !med.frequency || !med.duration)) {
      alert('Please fill in all medication details');
      return;
    }
    
    // Validate patient and doctor data
    if (!patientData?._id && !patientData?.id) {
      alert('Patient data is missing. Please start a video consultation first.');
      return;
    }
    
    if (!doctorData?._id && !doctorData?.id) {
      alert('Doctor data is missing. Please check your authentication.');
      return;
    }

    // Generate prescription number
    const prescriptionNumber = `RX-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    // Debug logging
    console.log('=== FRONTEND DEBUG ===');
    console.log('patientData:', patientData);
    console.log('doctorData:', doctorData);
    console.log('appointmentId:', appointmentId);
    console.log('formData:', formData);
    
    const prescriptionData = {
      ...formData,
      patient: patientData?._id || patientData?.id, // MongoDB ObjectId for patient reference
      patientId: patientData?.patientId || `TEMP-${patientData?._id || patientData?.id}`, // Custom patient ID or temporary one
      doctor: doctorData?._id || doctorData?.id, // MongoDB ObjectId for doctor reference
      appointment: appointmentId || undefined,
      prescriptionNumber,
      medications: formData.medications.filter(med => med.name.trim() !== ''),
      issueDate: formData.issueDate, // Send as ISO string, let backend convert
      expiryDate: formData.expiryDate || undefined
    };
    
    console.log('=== SENDING TO BACKEND ===');
    console.log('prescriptionData:', JSON.stringify(prescriptionData, null, 2));
    console.log('========================');
    
    onSubmit(prescriptionData);
  };

  const handlePreview = () => {
    // Generate preview of prescription
    const prescriptionPreview = {
      ...formData,
      prescriptionNumber: `RX-PREVIEW-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    
    console.log('Prescription Preview:', prescriptionPreview);
    alert('Prescription preview generated. Check console for details.');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4" style={{zIndex: 9999}}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <FaPills className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Write Prescription</h2>
                <p className="text-emerald-100">
                  Patient: {patientData?.fullname || patientData?.name || 'Unknown Patient'}
                </p>
                <p className="text-emerald-200 text-sm">
                  ID: {patientData?.patientId || patientData?.id || 'Not Available'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center hover:bg-white/30 transition-colors duration-300"
            >
              <FaTimes className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Form Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Auto-populated Information */}
            <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 mb-6">
              <h3 className="font-semibold text-emerald-800 mb-3">🔄 Auto-populated from Video Call</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <label className="font-medium text-emerald-700">Patient ID:</label>
                  <p className="text-emerald-600">{patientData?.patientId || `TEMP-${patientData?._id}` || 'Not available'}</p>
                </div>
                <div>
                  <label className="font-medium text-emerald-700">Doctor ID:</label>
                  <p className="text-emerald-600">{doctorData?._id || 'Not available'}</p>
                </div>
                <div>
                  <label className="font-medium text-emerald-700">Appointment ID:</label>
                  <p className="text-emerald-600">{appointmentId || 'Not available'}</p>
                </div>
              </div>
            </div>

            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Diagnosis *</label>
                <input
                  type="text"
                  value={formData.diagnosis}
                  onChange={(e) => setFormData(prev => ({ ...prev, diagnosis: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-300"
                  placeholder="Enter primary diagnosis"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-300"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
            </div>

            {/* Symptoms */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Symptoms</label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={symptomInput}
                  onChange={(e) => setSymptomInput(e.target.value)}
                  className="flex-1 px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-300"
                  placeholder="Add symptom"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSymptom())}
                />
                <button
                  type="button"
                  onClick={addSymptom}
                  className="px-4 py-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors duration-300"
                >
                  <FaPlus className="w-4 h-4" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.symptoms?.map((symptom, index) => (
                  <span
                    key={index}
                    className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-lg text-sm flex items-center gap-2"
                  >
                    {symptom}
                    <button
                      type="button"
                      onClick={() => removeSymptom(index)}
                      className="text-emerald-600 hover:text-emerald-800"
                    >
                      <FaTimes className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Medications */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-medium text-gray-700">Medications *</label>
                <button
                  type="button"
                  onClick={addMedication}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors duration-300"
                >
                  <FaPlus className="w-4 h-4" />
                  Add Medication
                </button>
              </div>

              <div className="space-y-4">
                {formData.medications.map((medication, index) => (
                  <div key={index} className="p-4 border-2 border-gray-200 rounded-xl bg-gray-50">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium text-gray-800">Medication {index + 1}</h4>
                      {formData.medications.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeMedication(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <FaTimes className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Medicine Name *</label>
                        <input
                          type="text"
                          value={medication.name}
                          onChange={(e) => updateMedication(index, 'name', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-200"
                          placeholder="e.g., Paracetamol"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Generic Name</label>
                        <input
                          type="text"
                          value={medication.genericName || ''}
                          onChange={(e) => updateMedication(index, 'genericName', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-200"
                          placeholder="e.g., Acetaminophen"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Dosage *</label>
                        <input
                          type="text"
                          value={medication.dosage}
                          onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-200"
                          placeholder="e.g., 500mg"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Frequency *</label>
                        <select
                          value={medication.frequency}
                          onChange={(e) => updateMedication(index, 'frequency', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-200"
                          required
                        >
                          <option value="">Select frequency</option>
                          <option value="Once daily">Once daily</option>
                          <option value="Twice daily">Twice daily</option>
                          <option value="Three times daily">Three times daily</option>
                          <option value="Four times daily">Four times daily</option>
                          <option value="Every 4 hours">Every 4 hours</option>
                          <option value="Every 6 hours">Every 6 hours</option>
                          <option value="Every 8 hours">Every 8 hours</option>
                          <option value="Every 12 hours">Every 12 hours</option>
                          <option value="As needed">As needed</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Duration *</label>
                        <input
                          type="text"
                          value={medication.duration}
                          onChange={(e) => updateMedication(index, 'duration', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-200"
                          placeholder="e.g., 7 days"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                        <input
                          type="number"
                          value={medication.quantity}
                          onChange={(e) => updateMedication(index, 'quantity', parseInt(e.target.value) || 1)}
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-200"
                          min="1"
                          required
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Instructions</label>
                        <input
                          type="text"
                          value={medication.instructions || ''}
                          onChange={(e) => updateMedication(index, 'instructions', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-200"
                          placeholder="e.g., Take after meals"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Refills</label>
                        <input
                          type="number"
                          value={medication.refills || 0}
                          onChange={(e) => updateMedication(index, 'refills', parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-200"
                          min="0"
                          max="5"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Additional Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Doctor Notes</label>
                <textarea
                  value={formData.doctorNotes}
                  onChange={(e) => setFormData(prev => ({ ...prev, doctorNotes: e.target.value }))}
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-300"
                  placeholder="Enter notes for medical records"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Patient Instructions</label>
                <textarea
                  value={formData.patientInstructions}
                  onChange={(e) => setFormData(prev => ({ ...prev, patientInstructions: e.target.value }))}
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-300"
                  placeholder="Instructions for the patient"
                />
              </div>
            </div>

            {/* Allergies and Warnings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Allergies</label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={allergyInput}
                    onChange={(e) => setAllergyInput(e.target.value)}
                    className="flex-1 px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-300"
                    placeholder="Add allergy"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAllergy())}
                  />
                  <button
                    type="button"
                    onClick={addAllergy}
                    className="px-4 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors duration-300"
                  >
                    <FaPlus className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.allergies?.map((allergy, index) => (
                    <span
                      key={index}
                      className="bg-orange-100 text-orange-800 px-3 py-1 rounded-lg text-sm flex items-center gap-2"
                    >
                      {allergy}
                      <button
                        type="button"
                        onClick={() => removeAllergy(index)}
                        className="text-orange-600 hover:text-orange-800"
                      >
                        <FaTimes className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Warnings</label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={warningInput}
                    onChange={(e) => setWarningInput(e.target.value)}
                    className="flex-1 px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-300"
                    placeholder="Add warning"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addWarning())}
                  />
                  <button
                    type="button"
                    onClick={addWarning}
                    className="px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors duration-300"
                  >
                    <FaPlus className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.warnings?.map((warning, index) => (
                    <span
                      key={index}
                      className="bg-red-100 text-red-800 px-3 py-1 rounded-lg text-sm flex items-center gap-2"
                    >
                      {warning}
                      <button
                        type="button"
                        onClick={() => removeWarning(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <FaTimes className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Monitoring and Follow-up */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <input
                    type="checkbox"
                    checked={formData.requiresMonitoring}
                    onChange={(e) => setFormData(prev => ({ ...prev, requiresMonitoring: e.target.checked }))}
                    className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                  />
                  <label className="text-sm font-medium text-gray-700">Requires Monitoring</label>
                </div>
                {formData.requiresMonitoring && (
                  <textarea
                    value={formData.monitoringInstructions}
                    onChange={(e) => setFormData(prev => ({ ...prev, monitoringInstructions: e.target.value }))}
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-300"
                    placeholder="Monitoring instructions"
                  />
                )}
              </div>

              <div>
                <div className="flex items-center gap-2 mb-4">
                  <input
                    type="checkbox"
                    checked={formData.followUpRequired}
                    onChange={(e) => setFormData(prev => ({ ...prev, followUpRequired: e.target.checked }))}
                    className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                  />
                  <label className="text-sm font-medium text-gray-700">Follow-up Required</label>
                </div>
                {formData.followUpRequired && (
                  <input
                    type="date"
                    value={formData.followUpDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, followUpDate: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-300"
                    min={new Date().toISOString().split('T')[0]}
                  />
                )}
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Issue Date</label>
                <input
                  type="date"
                  value={formData.issueDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, issueDate: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-300"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date</label>
                <input
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, expiryDate: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-300"
                  min={formData.issueDate}
                />
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handlePreview}
                className="flex items-center gap-2 px-6 py-3 border border-emerald-600 text-emerald-600 rounded-xl hover:bg-emerald-50 transition-colors duration-300"
              >
                <FaEye className="w-4 h-4" />
                Preview
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors duration-300"
              >
                Cancel
              </button>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleSubmit}
                className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors duration-300"
              >
                <FaSave className="w-4 h-4" />
                Save Prescription
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrescriptionForm;
