import EndpointTester from './test-endpoints.js';
import HistoricalDataService from './services/historical-data-service.js';
import LiveDataService from './services/live-data-service.js';
import DataExportService from './services/data-export-service.js';
import { API_CONFIG } from './config/api-config.js';

async function main() {
  console.log('🤖 Gamma Shorting AI - Breeze API Data Explorer');
  console.log('=' .repeat(60));
  console.log('This tool will help you understand what data is available from Breeze API');
  console.log('for building your gamma shorting AI enhancement system.\n');
  
  // Check if environment is configured
  if (!API_CONFIG.apiKey || !API_CONFIG.secretKey) {
    console.log('⚠️ SETUP REQUIRED:');
    console.log('1. Copy .env.example to .env');
    console.log('2. Add your Breeze API credentials');
    console.log('3. Run the script again\n');
    return;
  }
  
  console.log('📋 MENU - Choose an option:');
  console.log('1. Test all API endpoints');
  console.log('2. Collect historical data (3 years)');
  console.log('3. Start live data monitoring');
  console.log('4. Take single live snapshot');
  console.log('5. Run complete data audit\n');
  
  // For now, let's run a complete audit by default
  await runCompleteAudit();
}

async function runCompleteAudit() {
  console.log('🔍 Running Complete Data Audit...\n');
  
  const tester = new EndpointTester();
  const historicalService = new HistoricalDataService();
  const liveService = new LiveDataService();
  const exportService = new DataExportService();
  
  try {
    // 1. Test all endpoints
    console.log('STEP 1: Testing API Endpoints');
    console.log('-' .repeat(30));
    await tester.runAllTests();
    
    // 2. Collect sample historical data
    console.log('\nSTEP 2: Collecting Sample Historical Data');
    console.log('-' .repeat(40));
    const historicalResults = await historicalService.collectAllHistoricalData();
    
    // 3. Take live snapshot
    console.log('\nSTEP 3: Taking Live Data Snapshot');
    console.log('-' .repeat(35));
    const liveSnapshot = await liveService.getLiveDataSnapshot();
    
    // 4. Generate comprehensive report
    console.log('\nSTEP 4: Generating Summary Report');
    console.log('-' .repeat(35));
    const summary = await exportService.generateSummaryReport(historicalResults, liveSnapshot);
    
    // 5. Final assessment
    console.log('\n🎯 DATA AVAILABILITY ASSESSMENT');
    console.log('=' .repeat(40));
    
    const assessment = {
      historicalSpotData: summary.dataQuality.historicalDataComplete ? '✅ Available' : '❌ Missing',
      liveSpotData: summary.dataQuality.liveDataWorking ? '✅ Available' : '❌ Missing',
      optionChains: summary.dataQuality.optionChainsAvailable ? '✅ Available' : '❌ Missing',
      vixData: summary.dataQuality.vixDataAvailable ? '✅ Available' : '❌ Missing',
      overallReadiness: summary.dataQuality.historicalDataComplete && 
                       summary.dataQuality.liveDataWorking && 
                       summary.dataQuality.optionChainsAvailable ? '✅ Ready for AI Development' : '⚠️ Needs Attention'
    };
    
    Object.entries(assessment).forEach(([key, value]) => {
      console.log(`${key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}: ${value}`);
    });
    
    console.log('\n📁 All data and reports saved to ./data-output directory');
    console.log('🚀 You can now proceed with AI model development!');
    
  } catch (error) {
    console.error('❌ Error in complete audit:', error);
  }
}

// Run main function
main().catch(console.error);