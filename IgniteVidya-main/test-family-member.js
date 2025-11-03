// Test script to verify the add family member functionality
// Run this with: node test-family-member.js

const testAddFamilyMember = async () => {
  try {
    const testData = {
      name: "Test Member",
      relation: "Brother",
      email: "test@gmail.com",
      phone: "9876543210",
      photo: null,
      customFields: {
        field1: "01/01/1990", // Birth Date
        field2: "Bangalore", // Birth Place
        field3: "Software Engineer", // Occupation
        field4: "B.Tech", // Education
        field5: "9876543210", // Phone Number
        field6: "Bangalore, India", // Address
        field7: "Reading, Coding", // Hobbies
        field8: "Best Employee Award", // Achievements
        field9: "Very friendly person", // Notes
        field10: "Loves cricket" // Additional Info
      },
      addedBy: "Ramesh Kumar",
      addedById: "user-123"
    };

    console.log('Testing Add Family Member API...');
    console.log('Test Data:', JSON.stringify(testData, null, 2));

    const response = await fetch('http://localhost:3000/api/add-family-member', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    const result = await response.json();
    
    console.log('\n--- API Response ---');
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(result, null, 2));

    if (result.success) {
      console.log('\n✅ SUCCESS: Family member added successfully!');
      console.log(`✅ Member ID: ${result.data.memberId}`);
      console.log(`✅ Email notification: ${result.message.includes('Email') ? 'Sent' : 'Not sent'}`);
    } else {
      console.log('\n❌ FAILED:', result.message);
    }

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
  }
};

// Run the test
testAddFamilyMember();