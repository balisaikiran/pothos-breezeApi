import BreezeAPIClient from '../utils/api-client.js';
import { API_CONFIG, ENDPOINTS } from '../config/api-config.js';

class LiveDataService {
  constructor() {
    this.client = new BreezeAPIClient();
    this.symbol = API_CONFIG.targetSymbol;
    this.exchange = API_CONFIG.exchange;
    this.isRunning = false;
  }
  
  // Get current spot price
  async getCurrentSpotPrice() {
    console.log(`📍 Fetching current spot price for ${this.symbol}...`);
    
    const params = {
      stock_code: this.symbol,
      exchange_code: this.exchange,
      product_type: 'cash'
    };
    
    const result = await this.client.makeRequest(ENDPOINTS.quotes, params);
    
    if (result.success) {
      const spotPrice = result.data?.ltp || result.data?.last_traded_price;
      console.log(`✅ Current spot price: ₹${spotPrice}`);
      return {
        symbol: this.symbol,
        price: spotPrice,
        timestamp: new Date().toISOString(),
        data: result.data
      };
    } else {
      console.error('❌ Failed to fetch spot price:', result.error);
      return null;
    }
  }
  
  // Get current option chain
  async getCurrentOptionChain() {
    console.log(`📊 Fetching current option chain for ${this.symbol}...`);
    
    // First get current spot price to calculate strike ranges
    const spotData = await this.getCurrentSpotPrice();
    if (!spotData) return null;
    
    const spotPrice = spotData.price;
    const range1Lower = Math.round(spotPrice * (1 - API_CONFIG.spotRangePercent1 / 100));
    const range1Upper = Math.round(spotPrice * (1 + API_CONFIG.spotRangePercent1 / 100));
    const range2Lower = Math.round(spotPrice * (1 - API_CONFIG.spotRangePercent2 / 100));
    const range2Upper = Math.round(spotPrice * (1 + API_CONFIG.spotRangePercent2 / 100));
    
    console.log(`Strike ranges: ±5% (${range1Lower}-${range1Upper}), ±10% (${range2Lower}-${range2Upper})`);
    
    const params = {
      stock_code: this.symbol,
      exchange_code: this.exchange,
      product_type: 'options',
      expiry_date: this.getNextExpiryDate(),
      right: 'others'
    };
    
    const result = await this.client.makeRequest(ENDPOINTS.optionChain, params);
    
    if (result.success) {
      // Filter and categorize strikes
      const filteredData = this.categorizeOptionsByRange(
        result.data, 
        spotPrice, 
        range1Lower, 
        range1Upper, 
        range2Lower, 
        range2Upper
      );
      
      console.log(`✅ Retrieved option chain with ${filteredData.total} total options`);
      return {
        spotPrice,
        timestamp: new Date().toISOString(),
        ...filteredData
      };
    } else {
      console.error('❌ Failed to fetch option chain:', result.error);
      return null;
    }
  }
  
  // Get current VIX level
  async getCurrentVIX() {
    console.log('📉 Fetching current VIX level...');
    
    const result = await this.client.makeRequest(ENDPOINTS.vixData);
    
    if (result.success) {
      const vixLevel = result.data?.current_value || result.data?.ltp;
      console.log(`✅ Current VIX: ${vixLevel}`);
      return {
        vix: vixLevel,
        timestamp: new Date().toISOString(),
        data: result.data
      };
    } else {
      console.error('❌ Failed to fetch VIX data:', result.error);
      return null;
    }
  }
  
  // Get current FII/DII data
  async getCurrentFIIDII() {
    console.log('💰 Fetching current FII/DII data...');
    
    const params = {
      stock_code: this.symbol,
      date: moment().format('YYYY-MM-DD')
    };
    
    const result = await this.client.makeRequest(ENDPOINTS.participantData, params);
    
    if (result.success) {
      console.log('✅ Retrieved FII/DII participation data');
      return {
        symbol: this.symbol,
        timestamp: new Date().toISOString(),
        data: result.data
      };
    } else {
      console.error('❌ Failed to fetch FII/DII data:', result.error);
      return null;
    }
  }
  
  // Comprehensive live data snapshot
  async getLiveDataSnapshot() {
    console.log('📸 Taking comprehensive live data snapshot...');
    
    const snapshot = {
      timestamp: new Date().toISOString(),
      symbol: this.symbol,
      spotPrice: null,
      optionChain: null,
      vix: null,
      fiiDii: null,
      errors: []
    };
    
    try {
      // Collect all live data in parallel
      const [spotPrice, optionChain, vix, fiiDii] = await Promise.allSettled([
        this.getCurrentSpotPrice(),
        this.getCurrentOptionChain(),
        this.getCurrentVIX(),
        this.getCurrentFIIDII()
      ]);
      
      snapshot.spotPrice = spotPrice.status === 'fulfilled' ? spotPrice.value : null;
      snapshot.optionChain = optionChain.status === 'fulfilled' ? optionChain.value : null;
      snapshot.vix = vix.status === 'fulfilled' ? vix.value : null;
      snapshot.fiiDii = fiiDii.status === 'fulfilled' ? fiiDii.value : null;
      
      // Log any errors
      [spotPrice, optionChain, vix, fiiDii].forEach((result, index) => {
        if (result.status === 'rejected') {
          const dataType = ['spotPrice', 'optionChain', 'vix', 'fiiDii'][index];
          snapshot.errors.push(`${dataType}: ${result.reason}`);
        }
      });
      
      return snapshot;
      
    } catch (error) {
      console.error('❌ Error in live data snapshot:', error);
      snapshot.errors.push(error.message);
      return snapshot;
    }
  }
  
  // Start live data monitoring
  async startLiveMonitoring() {
    if (this.isRunning) {
      console.log('⚠️ Live monitoring is already running');
      return;
    }
    
    console.log(`🔄 Starting live data monitoring (${API_CONFIG.refreshInterval} min intervals)...`);
    this.isRunning = true;
    
    const monitor = async () => {
      if (!this.isRunning) return;
      
      const snapshot = await this.getLiveDataSnapshot();
      console.log('📊 Live Data Update:', {
        time: snapshot.timestamp,
        spot: snapshot.spotPrice?.price,
        vix: snapshot.vix?.vix,
        optionsCount: snapshot.optionChain?.total || 0
      });
      
      // Schedule next update
      setTimeout(monitor, API_CONFIG.refreshInterval * 60 * 1000);
    };
    
    // Start monitoring
    await monitor();
  }
  
  stopLiveMonitoring() {
    console.log('⏹️ Stopping live data monitoring...');
    this.isRunning = false;
  }
  
  // Helper methods
  categorizeOptionsByRange(optionData, spotPrice, r1Lower, r1Upper, r2Lower, r2Upper) {
    if (!optionData || !Array.isArray(optionData)) {
      return { range5Percent: [], range10Percent: [], total: 0 };
    }
    
    const range5Percent = [];
    const range10Percent = [];
    
    optionData.forEach(option => {
      const strike = parseFloat(option.strike_price);
      
      if (strike >= r1Lower && strike <= r1Upper) {
        range5Percent.push(option);
      }
      
      if (strike >= r2Lower && strike <= r2Upper) {
        range10Percent.push(option);
      }
    });
    
    return {
      range5Percent,
      range10Percent,
      total: optionData.length,
      spotPrice
    };
  }
  
  getNextExpiryDate() {
    // Calculate next monthly expiry (last Thursday of current month)
    const now = moment();
    const lastDay = now.clone().endOf('month');
    
    while (lastDay.day() !== 4) { // 4 = Thursday
      lastDay.subtract(1, 'day');
    }
    
    // If expiry has passed, get next month's expiry
    if (lastDay.isBefore(now)) {
      const nextMonth = now.clone().add(1, 'month').endOf('month');
      while (nextMonth.day() !== 4) {
        nextMonth.subtract(1, 'day');
      }
      return nextMonth.format('YYYY-MM-DD');
    }
    
    return lastDay.format('YYYY-MM-DD');
  }
}

export default LiveDataService;