import dotenv from 'dotenv';

dotenv.config();

export const API_CONFIG = {
  apiKey: process.env.BREEZE_API_KEY,
  secretKey: process.env.BREEZE_SECRET_KEY,
  sessionToken: process.env.BREEZE_SESSION_TOKEN,
  baseUrl: process.env.BREEZE_BASE_URL || 'https://api.icicidirect.com/breezeapi/api/v1',
  
  // Target configuration
  targetSymbol: process.env.TARGET_SYMBOL || 'ITC',
  exchange: process.env.EXCHANGE || 'NSE',
  
  // Data parameters
  historicalYears: parseInt(process.env.HISTORICAL_YEARS) || 3,
  spotRangePercent1: parseInt(process.env.SPOT_RANGE_PERCENT_1) || 5,
  spotRangePercent2: parseInt(process.env.SPOT_RANGE_PERCENT_2) || 10,
  refreshInterval: parseInt(process.env.REFRESH_INTERVAL_MINUTES) || 5
};

export const ENDPOINTS = {
  // Authentication
  login: '/customer/authentication',
  
  // Historical data
  historicalData: '/historicalcharts',
  optionChain: '/optionchain',
  
  // Live data
  quotes: '/quotes',
  liveFeeds: '/livestreaming',
  
  // Market data
  marketData: '/marketdata',
  indices: '/indices',
  
  // FII/DII data (if available)
  participantData: '/participantwise',
  
  // VIX data
  vixData: '/vixdata'
};