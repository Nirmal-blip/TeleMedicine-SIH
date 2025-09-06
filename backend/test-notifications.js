const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testNotificationFlow() {
  try {
    console.log('🧪 Testing Notification System...\n');

    // Test 1: Create a notification for a doctor
    console.log('1. Creating a test notification...');
    const notificationData = {
      recipient: '507f1f77bcf86cd799439011', // Replace with actual doctor ID
      recipientType: 'Doctor',
      sender: '507f1f77bcf86cd799439012', // Replace with actual patient ID
      senderType: 'Patient',
      title: 'New Appointment Request',
      message: 'John Doe has requested an appointment for tomorrow at 2 PM.',
      type: 'appointment_booked',
      priority: 'High',
      actionUrl: '/doctor/appointments',
      actionText: 'View Appointment'
    };

    const createResponse = await axios.post(`${BASE_URL}/api/notifications`, notificationData);
    console.log('✅ Notification created:', createResponse.data._id);

    // Test 2: Get notifications for doctor
    console.log('\n2. Fetching notifications for doctor...');
    const getResponse = await axios.get(`${BASE_URL}/api/notifications`, {
      headers: {
        'Cookie': 'token=your-jwt-token-here' // Replace with actual JWT token
      }
    });
    console.log('✅ Notifications fetched:', getResponse.data.length, 'notifications');

    // Test 3: Mark notification as read
    if (getResponse.data.length > 0) {
      console.log('\n3. Marking notification as read...');
      const notificationId = getResponse.data[0]._id;
      const markReadResponse = await axios.patch(
        `${BASE_URL}/api/notifications/${notificationId}/read`,
        {},
        {
          headers: {
            'Cookie': 'token=your-jwt-token-here' // Replace with actual JWT token
          }
        }
      );
      console.log('✅ Notification marked as read');
    }

    // Test 4: Get unread count
    console.log('\n4. Getting unread count...');
    const unreadResponse = await axios.get(`${BASE_URL}/api/notifications/unread-count`, {
      headers: {
        'Cookie': 'token=your-jwt-token-here' // Replace with actual JWT token
      }
    });
    console.log('✅ Unread count:', unreadResponse.data.unreadCount);

    console.log('\n🎉 All tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Test appointment notification creation
async function testAppointmentNotification() {
  try {
    console.log('\n🧪 Testing Appointment Notification Creation...\n');

    const appointmentData = {
      appointmentId: '507f1f77bcf86cd799439013',
      doctorId: '507f1f77bcf86cd799439011',
      patientId: '507f1f77bcf86cd799439012',
      doctorName: 'Dr. Smith',
      patientName: 'John Doe',
      appointmentDate: new Date('2024-02-15T14:00:00Z'),
      type: 'appointment_booked'
    };

    const response = await axios.post(`${BASE_URL}/api/notifications/appointment`, appointmentData);
    console.log('✅ Appointment notifications created:', response.data.length, 'notifications');

  } catch (error) {
    console.error('❌ Appointment notification test failed:', error.response?.data || error.message);
  }
}

// Test emergency notification creation
async function testEmergencyNotification() {
  try {
    console.log('\n🧪 Testing Emergency Notification Creation...\n');

    const emergencyData = {
      patientId: '507f1f77bcf86cd799439012',
      doctorId: '507f1f77bcf86cd799439011',
      patientName: 'John Doe',
      message: 'Severe chest pain, difficulty breathing'
    };

    const response = await axios.post(`${BASE_URL}/api/notifications/emergency`, emergencyData);
    console.log('✅ Emergency notification created:', response.data._id);

  } catch (error) {
    console.error('❌ Emergency notification test failed:', error.response?.data || error.message);
  }
}

// Run all tests
async function runAllTests() {
  await testNotificationFlow();
  await testAppointmentNotification();
  await testEmergencyNotification();
}

runAllTests();
