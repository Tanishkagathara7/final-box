// Test script to check grounds in database
import mongoose from 'mongoose';
import Ground from './server/models/Ground.js';

const MONGODB_URI = 'mongodb+srv://rag123456:rag123456@cluster0.qipvo.mongodb.net/boxcricket?retryWrites=true&w=majority';

async function testGrounds() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Get all grounds
    const allGrounds = await Ground.find({});
    console.log(`\n📊 Total grounds in database: ${allGrounds.length}`);
    
    // Get active grounds
    const activeGrounds = await Ground.find({ status: 'active' });
    console.log(`✅ Active grounds: ${activeGrounds.length}`);
    
    // Get verified grounds
    const verifiedGrounds = await Ground.find({ isVerified: true });
    console.log(`✅ Verified grounds: ${verifiedGrounds.length}`);
    
    // Get active AND verified grounds
    const activeVerifiedGrounds = await Ground.find({ status: 'active', isVerified: true });
    console.log(`✅ Active AND verified grounds: ${activeVerifiedGrounds.length}`);
    
    console.log('\n📋 All grounds:');
    allGrounds.forEach((ground, index) => {
      console.log(`${index + 1}. ${ground.name} - Status: ${ground.status}, Verified: ${ground.isVerified}`);
    });
    
    console.log('\n📋 Active and verified grounds (what users see):');
    activeVerifiedGrounds.forEach((ground, index) => {
      console.log(`${index + 1}. ${ground.name} - Status: ${ground.status}, Verified: ${ground.isVerified}`);
    });
    
    console.log('\n📋 Grounds that admin should see (all):');
    allGrounds.forEach((ground, index) => {
      console.log(`${index + 1}. ${ground.name} - Status: ${ground.status}, Verified: ${ground.isVerified}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

testGrounds(); 