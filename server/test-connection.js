import dotenv from 'dotenv';
import { testConnection, query } from './config/database.js';

dotenv.config();

const runTests = async () => {
  console.log('🧪 Testing database connection...\n');

  try {
    // Test 1: Connection
    console.log('Test 1: Database Connection');
    await testConnection();
    console.log('✅ Connection successful\n');

    // Test 2: Query sensor data
    console.log('Test 2: Fetching sensor data');
    const sensorData = await query(`
      SELECT temperature, humidity, recorded_at
      FROM sensor_temp
      ORDER BY recorded_at DESC
      LIMIT 5
    `);
    console.log(`✅ Found ${sensorData.length} sensor readings`);
    if (sensorData.length > 0) {
      console.log('Latest reading:', sensorData[0]);
    }
    console.log('');

    // Test 3: Check if led_states table exists
    console.log('Test 3: Checking LED states table');
    try {
      const ledStates = await query(`
        SELECT * FROM led_states
        ORDER BY timestamp DESC
        LIMIT 1
      `);
      console.log('✅ LED states table exists');
      if (ledStates.length > 0) {
        console.log('Current LED state:', ledStates[0].status === 1 ? 'ON' : 'OFF');
      }
    } catch (error) {
      console.log('⚠️  LED states table does not exist yet');
      console.log('   Run: mysql -h 78.12.149.93 -u proyecto_iot -p bienestar_db < database/schema.sql');
    }
    console.log('');

    // Test 4: Database statistics
    console.log('Test 4: Database Statistics');
    const stats = await query(`
      SELECT
        COUNT(*) as total_readings,
        AVG(temperature) as avg_temp,
        AVG(humidity) as avg_humidity,
        MIN(recorded_at) as first_reading,
        MAX(recorded_at) as last_reading
      FROM sensor_temp
    `);
    console.log('📊 Statistics:', stats[0]);

    console.log('\n✅ All tests completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  }
};

runTests();
