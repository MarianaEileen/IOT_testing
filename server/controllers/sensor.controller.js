import { query } from '../config/database.js';

// Get latest sensor data
export const getSensorData = async (req, res) => {
  try {
    // Query para obtener la última lectura del sensor
    const sql = `
      SELECT temperature, humidity, recorded_at
      FROM sensor_temp
      ORDER BY recorded_at DESC
      LIMIT 1
    `;

    const results = await query(sql);

    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No sensor data found'
      });
    }

    const sensorData = results[0];

    res.json({
      success: true,
      temperature: parseFloat(sensorData.temperature),
      humidity: parseFloat(sensorData.humidity),
      timestamp: sensorData.recorded_at
    });
  } catch (error) {
    console.error('Error fetching sensor data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch sensor data'
    });
  }
};

// Get sensor history (opcional - para gráficos históricos)
export const getSensorHistory = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;

    const sql = `
      SELECT temperature, humidity, recorded_at
      FROM sensor_temp
      ORDER BY recorded_at DESC
      LIMIT ?
    `;

    const results = await query(sql, [limit]);

    res.json({
      success: true,
      data: results.map(row => ({
        temperature: parseFloat(row.temperature),
        humidity: parseFloat(row.humidity),
        timestamp: row.recorded_at
      }))
    });
  } catch (error) {
    console.error('Error fetching sensor history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch sensor history'
    });
  }
};

// Save new sensor reading (para cuando el IoT device envíe datos)
export const saveSensorData = async (req, res) => {
  try {
    const { temperature, humidity } = req.body;

    if (temperature === undefined || humidity === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Temperature and humidity are required'
      });
    }

    const sql = `
      INSERT INTO sensor_temp (temperature, humidity)
      VALUES (?, ?)
    `;

    await query(sql, [temperature, humidity]);

    res.json({
      success: true,
      message: 'Sensor data saved successfully',
      data: {
        temperature: parseFloat(temperature),
        humidity: parseFloat(humidity),
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error saving sensor data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save sensor data'
    });
  }
};
