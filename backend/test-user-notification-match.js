const { MongoClient } = require('mongodb');

const MONGODB_URI = 'mongodb+srv://prithraj120_db_user:b9zzQBKCNJP7PZ76@cluster1.zuncx72.mongodb.net/?retryWrites=true&w=majority&appName=Cluster1';
const DATABASE_NAME = 'TeleMedicine';

async function testUserNotificationMatch() {
    console.log('🔍 Testing User-Notification ID Matching');
    console.log('=' .repeat(50));

    let client;
    try {
        client = new MongoClient(MONGODB_URI);
        await client.connect();
        console.log('✅ Connected to MongoDB');

        const db = client.db(DATABASE_NAME);

        // Get the notification you mentioned
        console.log('\n📋 Checking the specific notification...');
        const { ObjectId } = require('mongodb');
        const notification = await db.collection('notifications').findOne({
            "_id": new ObjectId("68bc39a6ea254ed3d4d60be9")
        });

        if (!notification) {
            console.log('❌ Notification not found');
            return;
        }

        console.log('📄 Notification found:');
        console.log(`  ID: ${notification._id}`);
        console.log(`  Recipient: ${notification.recipient}`);
        console.log(`  Recipient Type: ${notification.recipientType}`);
        console.log(`  Title: ${notification.title}`);
        console.log(`  Type: ${notification.type}`);

        // Find the doctor with this ID
        console.log('\n👨‍⚕️ Looking for doctor with this ID...');
        const doctor = await db.collection('doctors').findOne({
            "_id": new ObjectId(notification.recipient)
        });

        if (doctor) {
            console.log('✅ Doctor found:');
            console.log(`  ID: ${doctor._id}`);
            console.log(`  Name: ${doctor.fullname}`);
            console.log(`  Email: ${doctor.email}`);
        } else {
            console.log('❌ Doctor not found with this ID');
            
            // Try to find doctors and their IDs
            console.log('\n📊 All doctors in database:');
            const doctors = await db.collection('doctors').find({}).toArray();
            doctors.forEach((doc, index) => {
                console.log(`  ${index + 1}. ${doc.fullname} (${doc.email}) - ID: ${doc._id}`);
            });
        }

        // Check all notifications for doctors
        console.log('\n📋 All notifications for doctors:');
        const doctorNotifications = await db.collection('notifications')
            .find({ recipientType: 'Doctor' })
            .sort({ createdAt: -1 })
            .toArray();

        console.log(`Found ${doctorNotifications.length} notifications for doctors:`);
        doctorNotifications.forEach((notif, index) => {
            console.log(`  ${index + 1}. ${notif.title} - Recipient: ${notif.recipient} - Read: ${notif.isRead}`);
        });

        // Test the exact query the NotificationService would use
        console.log('\n🔍 Testing exact service query...');
        const testUserId = notification.recipient;
        const testUserType = 'Doctor';
        
        console.log(`Testing query: { recipient: "${testUserId}", recipientType: "${testUserType}" }`);
        
        const serviceResults = await db.collection('notifications')
            .find({ 
                recipient: testUserId, 
                recipientType: testUserType 
            })
            .sort({ createdAt: -1 })
            .toArray();

        console.log(`📊 Service query result: ${serviceResults.length} notifications`);
        serviceResults.forEach((notif, index) => {
            console.log(`  ${index + 1}. ${notif.title} (${notif.type}) - ${notif.isRead ? 'Read' : 'Unread'}`);
        });

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        if (client) {
            await client.close();
            console.log('\n📡 Disconnected from MongoDB');
        }
    }

    console.log('\n' + '=' .repeat(50));
    console.log('💡 Next Steps:');
    console.log('1. Start the backend server: npm run start:dev:nestjs');
    console.log('2. Login as the doctor whose ID matches the notification recipient');
    console.log('3. Check the browser dev console for debug logs');
    console.log('4. Visit: http://localhost:5173/doctor/notifications');
}

testUserNotificationMatch().catch(console.error);
