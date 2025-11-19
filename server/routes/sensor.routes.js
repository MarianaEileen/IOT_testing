import express from 'express';
import {
  getSensorData,
  getSensorHistory,
  saveSensorData
} from '../controllers/sensor.controller.js';
import {
  controlLed,
  getLedStatus
} from '../controllers/led.controller.js';

const router = express.Router();

// Sensor routes
router.get('/sensor', getSensorData);
router.get('/sensor/history', getSensorHistory);
router.post('/sensor', saveSensorData);

// LED routes
router.post('/led', controlLed);
router.get('/led', getLedStatus);

export default router;
