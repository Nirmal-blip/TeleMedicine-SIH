import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../../Components/Sidebar'
import { 
  FaCog, 
  FaUser, 
  FaBell, 
  FaLock, 
  FaKey, 
  FaPalette, 
  FaEdit, 
  FaSave, 
  FaEye, 
  FaEyeSlash,
  FaTrash,
  FaDownload,
  FaToggleOn,
  FaToggleOff
} from 'react-icons/fa'

interface ProfileData {
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address: string;
  emergencyContact: string;
  bloodType: string;
  allergies: string;
}

interface NotificationSettings {
  emailNotifications: boolean;
  smsNotifications: boolean;
  appointmentReminders: boolean;
  prescriptionReminders: boolean;
  healthTips: boolean;
  promotionalEmails: boolean;
}

interface PrivacySettings {
  profileVisibility: 'public' | 'private';
  shareDataForResearch: boolean;
  allowDataExport: boolean;
  twoFactorAuth: boolean;
}

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [profileData, setProfileData] = useState<ProfileData>({
    fullName: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    dateOfBirth: '1990-01-15',
    address: '123 Main St, City, State 12345',
    emergencyContact: '+1 (555) 987-6543',
    bloodType: 'O+',
    allergies: 'None'
  });

  const [notifications, setNotifications] = useState<NotificationSettings>({
    emailNotifications: true,
    smsNotifications: true,
    appointmentReminders: true,
    prescriptionReminders: true,
    healthTips: false,
    promotionalEmails: false
  });

  const [privacy, setPrivacy] = useState<PrivacySettings>({
    profileVisibility: 'private',
    shareDataForResearch: false,
    allowDataExport: true,
    twoFactorAuth: false
  });

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleProfileUpdate = () => {
    setIsEditing(false);
    alert('Profile updated successfully!');
  };

  const handlePasswordChange = () => {
    if (newPassword !== confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    alert('Password updated successfully!');
  };

  const handleNotificationToggle = (key: keyof NotificationSettings) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handlePrivacyToggle = (key: keyof PrivacySettings) => {
    setPrivacy(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleDeleteAccount = () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete your account? This action cannot be undone.'
    );
    if (confirmed) {
      alert('Account deletion initiated. You will receive a confirmation email.');
    }
  };

  const handleDataExport = () => {
    alert('Your data export has been initiated. You will receive a download link via email.');
  };

  const settingSections = [
    { id: 'profile', label: 'Profile', icon: FaUser },
    { id: 'notifications', label: 'Notifications', icon: FaBell },
    { id: 'privacy', label: 'Privacy & Security', icon: FaLock },
    { id: 'account', label: 'Account', icon: FaCog },
    { id: 'preferences', label: 'Preferences', icon: FaPalette }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
        <Sidebar />
      <main className="lg:ml-80 p-4 lg:p-8 xl:p-12 overflow-y-auto min-h-screen">
        {/* Settings Header Card */}
        <section className="mb-8">
          <div className="relative overflow-hidden gradient-bg-primary rounded-3xl p-6 shadow-xl">
            <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <FaCog className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white mb-1 font-secondary">Settings</h1>
                  <p className="text-emerald-100">Manage your account preferences and privacy settings</p>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="flex gap-4 text-white/90 text-sm">
                <span>Profile: {profileData.fullName}</span>
                <span>•</span>
                <span>Notifications: {Object.values(notifications).filter(Boolean).length} enabled</span>
                <span>•</span>
                <span>Security: {privacy.twoFactorAuth ? 'Enhanced' : 'Standard'}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Settings Navigation */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 bg-white/80 backdrop-blur-sm p-1 rounded-2xl shadow-lg border border-emerald-100">
            {settingSections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`px-4 py-3 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 ${
                  activeSection === section.id
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg'
                    : 'text-gray-600 hover:text-emerald-600 hover:bg-emerald-50'
                }`}
              >
                <section.icon className="w-4 h-4" />
                {section.label}
              </button>
            ))}
          </div>
        </div>

        {/* Settings Content */}
        <div className="space-y-6">
          {/* Profile Settings */}
          {activeSection === 'profile' && (
            <div className="card card-hover p-6 rounded-2xl">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
                    <FaUser className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">Profile Information</h2>
                    <p className="text-gray-600">Update your personal details</p>
                  </div>
                </div>
                <button
                  onClick={() => isEditing ? handleProfileUpdate() : setIsEditing(true)}
                  className="btn-primary flex items-center gap-2"
                >
                  {isEditing ? <FaSave className="w-4 h-4" /> : <FaEdit className="w-4 h-4" />}
                  {isEditing ? 'Save Changes' : 'Edit Profile'}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={profileData.fullName}
                    onChange={(e) => setProfileData(prev => ({ ...prev, fullName: e.target.value }))}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-300 disabled:bg-gray-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-300 disabled:bg-gray-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-300 disabled:bg-gray-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                  <input
                    type="date"
                    value={profileData.dateOfBirth}
                    onChange={(e) => setProfileData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-300 disabled:bg-gray-50"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                  <input
                    type="text"
                    value={profileData.address}
                    onChange={(e) => setProfileData(prev => ({ ...prev, address: e.target.value }))}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-300 disabled:bg-gray-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Emergency Contact</label>
                  <input
                    type="tel"
                    value={profileData.emergencyContact}
                    onChange={(e) => setProfileData(prev => ({ ...prev, emergencyContact: e.target.value }))}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-300 disabled:bg-gray-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Blood Type</label>
                  <select
                    value={profileData.bloodType}
                    onChange={(e) => setProfileData(prev => ({ ...prev, bloodType: e.target.value }))}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-300 disabled:bg-gray-50"
                  >
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Allergies</label>
                  <textarea
                    value={profileData.allergies}
                    onChange={(e) => setProfileData(prev => ({ ...prev, allergies: e.target.value }))}
                    disabled={!isEditing}
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-300 disabled:bg-gray-50"
                    placeholder="List any known allergies..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* Notification Settings */}
          {activeSection === 'notifications' && (
            <div className="card card-hover p-6 rounded-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
                  <FaBell className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">Notification Preferences</h2>
                  <p className="text-gray-600">Choose how you want to be notified</p>
                </div>
              </div>

              <div className="space-y-4">
                {Object.entries(notifications).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <h3 className="font-medium text-gray-800 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {key === 'emailNotifications' && 'Receive notifications via email'}
                        {key === 'smsNotifications' && 'Receive notifications via SMS'}
                        {key === 'appointmentReminders' && 'Get reminded about upcoming appointments'}
                        {key === 'prescriptionReminders' && 'Get reminded to take medications'}
                        {key === 'healthTips' && 'Receive health tips and wellness advice'}
                        {key === 'promotionalEmails' && 'Receive promotional offers and updates'}
                      </p>
                    </div>
                    <button
                      onClick={() => handleNotificationToggle(key as keyof NotificationSettings)}
                      className="text-2xl transition-colors duration-300"
                    >
                      {value ? (
                        <FaToggleOn className="text-emerald-500" />
                      ) : (
                        <FaToggleOff className="text-gray-400" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Privacy & Security Settings */}
          {activeSection === 'privacy' && (
            <div className="space-y-6">
              {/* Privacy Settings */}
              <div className="card card-hover p-6 rounded-2xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
                    <FaLock className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">Privacy Settings</h2>
                    <p className="text-gray-600">Control your data privacy and visibility</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <h3 className="font-medium text-gray-800">Profile Visibility</h3>
                      <p className="text-sm text-gray-600">Control who can see your profile information</p>
                    </div>
                    <select
                      value={privacy.profileVisibility}
                      onChange={(e) => setPrivacy(prev => ({ ...prev, profileVisibility: e.target.value as 'public' | 'private' }))}
                      className="px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-emerald-500"
                    >
                      <option value="private">Private</option>
                      <option value="public">Public</option>
                    </select>
                  </div>

                  {Object.entries(privacy).filter(([key]) => key !== 'profileVisibility').map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div>
                        <h3 className="font-medium text-gray-800 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {key === 'shareDataForResearch' && 'Allow anonymized data to be used for medical research'}
                          {key === 'allowDataExport' && 'Allow exporting your personal data'}
                          {key === 'twoFactorAuth' && 'Enable two-factor authentication for enhanced security'}
                        </p>
                      </div>
                      <button
                        onClick={() => handlePrivacyToggle(key as keyof PrivacySettings)}
                        className="text-2xl transition-colors duration-300"
                      >
                        {value ? (
                          <FaToggleOn className="text-emerald-500" />
                        ) : (
                          <FaToggleOff className="text-gray-400" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Password Change */}
              <div className="card card-hover p-6 rounded-2xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
                    <FaKey className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">Change Password</h2>
                    <p className="text-gray-600">Update your account password</p>
                  </div>
                </div>

                <div className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full px-4 py-3 pr-12 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-300"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-300"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-300"
                    />
                  </div>

                  <button
                    onClick={handlePasswordChange}
                    className="btn-primary"
                    disabled={!currentPassword || !newPassword || !confirmPassword}
                  >
                    Update Password
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Account Settings */}
          {activeSection === 'account' && (
            <div className="card card-hover p-6 rounded-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
                  <FaCog className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">Account Management</h2>
                  <p className="text-gray-600">Manage your account data and settings</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-blue-800">Export Your Data</h3>
                      <p className="text-sm text-blue-600">Download a copy of all your personal data</p>
                    </div>
                    <button
                      onClick={handleDataExport}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-300 flex items-center gap-2"
                    >
                      <FaDownload className="w-4 h-4" />
                      Export Data
                    </button>
                  </div>
                </div>

                <div className="p-4 bg-red-50 rounded-xl border border-red-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-red-800">Delete Account</h3>
                      <p className="text-sm text-red-600">Permanently delete your account and all data</p>
                    </div>
                    <button
                      onClick={handleDeleteAccount}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-300 flex items-center gap-2"
                    >
                      <FaTrash className="w-4 h-4" />
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Preferences Settings */}
          {activeSection === 'preferences' && (
            <div className="card card-hover p-6 rounded-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
                  <FaPalette className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">App Preferences</h2>
                  <p className="text-gray-600">Customize your app experience</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="font-medium text-gray-800 mb-3">Language</h3>
                  <select className="px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-300">
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                  </select>
                </div>

                <div>
                  <h3 className="font-medium text-gray-800 mb-3">Time Zone</h3>
                  <select className="px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-300">
                    <option value="UTC-8">Pacific Time (UTC-8)</option>
                    <option value="UTC-7">Mountain Time (UTC-7)</option>
                    <option value="UTC-6">Central Time (UTC-6)</option>
                    <option value="UTC-5">Eastern Time (UTC-5)</option>
                  </select>
                </div>

                <div>
                  <h3 className="font-medium text-gray-800 mb-3">Date Format</h3>
                  <select className="px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-300">
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      </div>
  )
}

export default Settings
