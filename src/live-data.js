import LiveDataService from './services/live-data-service.js';
import DataExportService from './services/data-export-service.js';
import { API_CONFIG } from './config/api-config.js';

async function startLiveDataCollection() {
  console.log('🔴 Starting Live Data Collection for Gamma Shorting AI');
  console.log('=' .repeat(60));
  console.log(`Target Symbol: ${API_CONFIG.targetSymbol}`);
  console.log(`Refresh Interval: ${API_CONFIG.refreshInterval} minutes`);
  console.log(`Strike Ranges: ±${API_CONFIG.spotRangePercent1}%, ±${API_CONFIG.spotRangePercent2}%`);
  console.log('=' .repeat(60));
  
  const liveService = new LiveDataService();
  const exportService = new DataExportService();
  
  try {
    // Test API connection first
    const connectionTest = await liveService.client.testConnection();
    if (!connectionTest) {
      console.log('❌ Cannot proceed without API connection. Please check your credentials in .env file.');
      return;
    }
    
    // Take initial snapshot
    console.log('\n📸 Taking initial live data snapshot...');
    const initialSnapshot = await liveService.getLiveDataSnapshot();
    
    // Export initial snapshot
    await exportService.exportLiveSnapshot(initialSnapshot);
    
    // Display current market state
    console.log('\n📊 CURRENT MARKET STATE');
    console.log('=' .repeat(30));
    
    if (initialSnapshot.spotPrice) {
      console.log(`${API_CONFIG.targetSymbol} Spot: ₹${initialSnapshot.spotPrice.price}`);
    }
    
    if (initialSnapshot.vix) {
      console.log(`VIX Level: ${initialSnapshot.vix.vix}`);
    }
    
    if (initialSnapshot.optionChain) {
      console.log(`Options Available: ${initialSnapshot.optionChain.total}`);
      console.log(`±5% Range Options: ${initialSnapshot.optionChain.range5Percent?.length || 0}`);
      console.log(`±10% Range Options: ${initialSnapshot.optionChain.range10Percent?.length || 0}`);
    }
    
    if (initialSnapshot.errors && initialSnapshot.errors.length > 0) {
      console.log('\n⚠️ Errors in initial snapshot:');
      initialSnapshot.errors.forEach(error => console.log(`  - ${error}`));
    }
    
    // Start continuous monitoring
    console.log(`\n🔄 Starting continuous monitoring (${API_CONFIG.refreshInterval} min intervals)...`);
    console.log('Press Ctrl+C to stop monitoring\n');
    
    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.log('\n⏹️ Stopping live data monitoring...');
      liveService.stopLiveMonitoring();
      process.exit(0);
    });
    
    // Start monitoring
    await liveService.startLiveMonitoring();
    
  } catch (error) {
    console.error('❌ Fatal error in live data collection:', error);
  }
}

// Run the live data collection
startLiveDataCollection();