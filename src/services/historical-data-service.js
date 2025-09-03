import BreezeAPIClient from '../utils/api-client.js';
import { API_CONFIG, ENDPOINTS } from '../config/api-config.js';
import moment from 'moment';

class HistoricalDataService {
  constructor() {
    this.client = new BreezeAPIClient();
    this.symbol = API_CONFIG.targetSymbol;
    this.exchange = API_CONFIG.exchange;
  }
  
  // Get historical spot prices for the last 3 years
  async getHistoricalSpotPrices() {
    console.log(`📈 Fetching historical spot prices for ${this.symbol}...`);
    
    const endDate = moment();
    const startDate = moment().subtract(API_CONFIG.historicalYears, 'years');
    
    const params = {
      stock_code: this.symbol,
      exchange_code: this.exchange,
      product_type: 'cash',
      expiry_date: '',
      right: '',
      strike_price: '',
      from_date: startDate.format('YYYY-MM-DD'),
      to_date: endDate.format('YYYY-MM-DD'),
      interval: '1day'
    };
    
    const result = await this.client.makeRequest(ENDPOINTS.historicalData, params);
    
    if (result.success) {
      console.log(`✅ Retrieved ${result.data?.length || 0} historical price records`);
      return result.data;
    } else {
      console.error('❌ Failed to fetch historical spot prices:', result.error);
      return null;
    }
  }
  
  // Get historical option chains with IV data
  async getHistoricalOptionChains(spotPrice, date) {
    console.log(`📊 Fetching option chain for ${this.symbol} on ${date}...`);
    
    // Calculate strike ranges
    const range1Lower = Math.round(spotPrice * (1 - API_CONFIG.spotRangePercent1 / 100));
    const range1Upper = Math.round(spotPrice * (1 + API_CONFIG.spotRangePercent1 / 100));
    const range2Lower = Math.round(spotPrice * (1 - API_CONFIG.spotRangePercent2 / 100));
    const range2Upper = Math.round(spotPrice * (1 + API_CONFIG.spotRangePercent2 / 100));
    
    console.log(`Strike ranges: ±5% (${range1Lower}-${range1Upper}), ±10% (${range2Lower}-${range2Upper})`);
    
    const params = {
      stock_code: this.symbol,
      exchange_code: this.exchange,
      product_type: 'options',
      expiry_date: this.getNextExpiryDate(date),
      right: 'others', // Both calls and puts
      strike_price: '',
      from_date: date,
      to_date: date
    };
    
    const result = await this.client.makeRequest(ENDPOINTS.optionChain, params);
    
    if (result.success) {
      // Filter strikes within our range
      const filteredData = this.filterOptionsByStrike(result.data, range2Lower, range2Upper);
      console.log(`✅ Retrieved option chain with ${filteredData?.length || 0} strikes`);
      return filteredData;
    } else {
      console.error('❌ Failed to fetch option chain:', result.error);
      return null;
    }
  }
  
  // Get historical VIX data
  async getHistoricalVIXData() {
    console.log('📉 Fetching historical VIX data...');
    
    const endDate = moment();
    const startDate = moment().subtract(API_CONFIG.historicalYears, 'years');
    
    const params = {
      from_date: startDate.format('YYYY-MM-DD'),
      to_date: endDate.format('YYYY-MM-DD'),
      interval: '1day'
    };
    
    const result = await this.client.makeRequest(ENDPOINTS.vixData, params);
    
    if (result.success) {
      console.log(`✅ Retrieved ${result.data?.length || 0} VIX records`);
      return result.data;
    } else {
      console.error('❌ Failed to fetch VIX data:', result.error);
      return null;
    }
  }
  
  // Get FII/DII participation data
  async getFIIDIIData() {
    console.log('💰 Fetching FII/DII participation data...');
    
    const endDate = moment();
    const startDate = moment().subtract(API_CONFIG.historicalYears, 'years');
    
    const params = {
      stock_code: this.symbol,
      from_date: startDate.format('YYYY-MM-DD'),
      to_date: endDate.format('YYYY-MM-DD')
    };
    
    const result = await this.client.makeRequest(ENDPOINTS.participantData, params);
    
    if (result.success) {
      console.log(`✅ Retrieved FII/DII data`);
      return result.data;
    } else {
      console.error('❌ Failed to fetch FII/DII data:', result.error);
      return null;
    }
  }
  
  // Helper methods
  filterOptionsByStrike(optionData, lowerStrike, upperStrike) {
    if (!optionData || !Array.isArray(optionData)) return [];
    
    return optionData.filter(option => {
      const strike = parseFloat(option.strike_price);
      return strike >= lowerStrike && strike <= upperStrike;
    });
  }
  
  getNextExpiryDate(fromDate) {
    // Calculate next monthly expiry (last Thursday of the month)
    const date = moment(fromDate);
    const lastDay = date.clone().endOf('month');
    
    // Find last Thursday
    while (lastDay.day() !== 4) { // 4 = Thursday
      lastDay.subtract(1, 'day');
    }
    
    return lastDay.format('YYYY-MM-DD');
  }
  
  // Comprehensive historical data collection
  async collectAllHistoricalData() {
    console.log('🚀 Starting comprehensive historical data collection...');
    
    const results = {
      spotPrices: null,
      vixData: null,
      fiiDiiData: null,
      optionChains: [],
      errors: []
    };
    
    try {
      // 1. Get historical spot prices
      results.spotPrices = await this.getHistoricalSpotPrices();
      
      // 2. Get VIX data
      results.vixData = await this.getHistoricalVIXData();
      
      // 3. Get FII/DII data
      results.fiiDiiData = await this.getFIIDIIData();
      
      // 4. Get option chains for key dates (sample approach)
      if (results.spotPrices && results.spotPrices.length > 0) {
        console.log('📊 Sampling option chains for key dates...');
        
        // Sample every 30 days to avoid overwhelming the API
        const sampleDates = this.getSampleDates(results.spotPrices);
        
        for (const dateData of sampleDates) {
          const optionChain = await this.getHistoricalOptionChains(
            dateData.close, 
            dateData.date
          );
          
          if (optionChain) {
            results.optionChains.push({
              date: dateData.date,
              spotPrice: dateData.close,
              options: optionChain
            });
          }
          
          // Rate limiting - wait 1 second between requests
          await this.sleep(1000);
        }
      }
      
      return results;
      
    } catch (error) {
      console.error('❌ Error in historical data collection:', error);
      results.errors.push(error.message);
      return results;
    }
  }
  
  getSampleDates(spotData) {
    // Sample every 30 days to get representative data
    const samples = [];
    for (let i = 0; i < spotData.length; i += 30) {
      samples.push(spotData[i]);
    }
    return samples.slice(0, 36); // Limit to ~3 years of monthly samples
  }
  
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default HistoricalDataService;