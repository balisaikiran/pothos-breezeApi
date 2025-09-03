import HistoricalDataService from './services/historical-data-service.js';
import DataExportService from './services/data-export-service.js';
import { API_CONFIG } from './config/api-config.js';

async function collectHistoricalData() {
  console.log('🚀 Starting Historical Data Collection for Gamma Shorting AI');
  console.log('=' .repeat(60));
  console.log(`Target Symbol: ${API_CONFIG.targetSymbol}`);
  console.log(`Historical Period: ${API_CONFIG.historicalYears} years`);
  console.log(`Strike Ranges: ±${API_CONFIG.spotRangePercent1}%, ±${API_CONFIG.spotRangePercent2}%`);
  console.log('=' .repeat(60));
  
  const historicalService = new HistoricalDataService();
  const exportService = new DataExportService();
  
  try {
    // Test API connection first
    const connectionTest = await historicalService.client.testConnection();
    if (!connectionTest) {
      console.log('❌ Cannot proceed without API connection. Please check your credentials in .env file.');
      return;
    }
    
    // Collect all historical data
    console.log('\n📥 Collecting historical data...');
    const results = await historicalService.collectAllHistoricalData();
    
    // Export data to CSV files
    console.log('\n📤 Exporting data to CSV files...');
    
    if (results.spotPrices) {
      await exportService.exportSpotPrices(results.spotPrices, API_CONFIG.targetSymbol);
    }
    
    if (results.optionChains && results.optionChains.length > 0) {
      await exportService.exportOptionChains(results.optionChains, API_CONFIG.targetSymbol);
    }
    
    if (results.vixData) {
      await exportService.exportVIXData(results.vixData);
    }
    
    if (results.fiiDiiData) {
      await exportService.exportFIIDIIData(results.fiiDiiData, API_CONFIG.targetSymbol);
    }
    
    // Generate summary
    console.log('\n📊 HISTORICAL DATA COLLECTION SUMMARY');
    console.log('=' .repeat(50));
    console.log(`Spot Price Records: ${results.spotPrices?.length || 0}`);
    console.log(`VIX Records: ${results.vixData?.length || 0}`);
    console.log(`Option Chain Days: ${results.optionChains?.length || 0}`);
    console.log(`FII/DII Records: ${results.fiiDiiData?.length || 0}`);
    console.log(`Errors Encountered: ${results.errors?.length || 0}`);
    
    if (results.errors && results.errors.length > 0) {
      console.log('\n⚠️ Errors:');
      results.errors.forEach(error => console.log(`  - ${error}`));
    }
    
    console.log('\n✅ Historical data collection completed!');
    console.log('📁 Check the ./data-output directory for exported CSV files.');
    
  } catch (error) {
    console.error('❌ Fatal error in historical data collection:', error);
  }
}

// Run the historical data collection
collectHistoricalData();