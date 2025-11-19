import { query } from '../config/database.js';

// Control LED (on/off)
export const controlLed = async (req, res) => {
  try {
    const { action } = req.body;

    if (!action || !['on', 'off'].includes(action)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid action. Use "on" or "off"'
      });
    }

    const status = action === 'on' ? 1 : 0;

    // Guardar el estado del LED en la base de datos
    const sql = `
      INSERT INTO led_states (status, timestamp)
      VALUES (?, NOW())
    `;

    await query(sql, [status]);

    // Aquí deberías agregar la lógica para controlar el LED físico
    // Por ejemplo, enviando una señal MQTT o HTTP a tu Raspberry Pi
    // await sendToRaspberryPi(action);

    res.json({
      success: true,
      message: `LED turned ${action}`,
      status: action,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error controlling LED:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to control LED'
    });
  }
};

// Get current LED status
export const getLedStatus = async (req, res) => {
  try {
    const sql = `
      SELECT status, timestamp
      FROM led_states
      ORDER BY timestamp DESC
      LIMIT 1
    `;

    const results = await query(sql);

    if (results.length === 0) {
      return res.json({
        success: true,
        status: 'off',
        message: 'No LED status found, defaulting to off'
      });
    }

    const ledState = results[0];

    res.json({
      success: true,
      status: ledState.status === 1 ? 'on' : 'off',
      timestamp: ledState.timestamp
    });
  } catch (error) {
    console.error('Error fetching LED status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch LED status'
    });
  }
};
