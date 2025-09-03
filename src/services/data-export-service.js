import fs from 'fs';
import path from 'path';
import createCsvWriter from 'csv-writer';

class DataExportService {
  constructor() {
    this.outputDir = './data-output';
    this.ensureOutputDirectory();
  }
  
  ensureOutputDirectory() {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
      console.log(`📁 Created output directory: ${this.outputDir}`);
    }
  }
  
  // Export historical spot prices to CSV
  async exportSpotPrices(data, symbol) {
    if (!data || data.length === 0) {
      console.log('⚠️ No spot price data to export');
      return;
    }
    
    const filename = `${symbol}_historical_spot_prices.csv`;
    const filepath = path.join(this.outputDir, filename);
    
    const csvWriter = createCsvWriter.createObjectCsvWriter({
      path: filepath,
      header: [
        { id: 'date', title: 'Date' },
        { id: 'open', title: 'Open' },
        { id: 'high', title: 'High' },
        { id: 'low', title: 'Low' },
        { id: 'close', title: 'Close' },
        { id: 'volume', title: 'Volume' }
      ]
    });
    
    await csvWriter.writeRecords(data);
    console.log(`✅ Exported spot prices to: ${filepath}`);
  }
  
  // Export option chain data to CSV
  async exportOptionChains(data, symbol) {
    if (!data || data.length === 0) {
      console.log('⚠️ No option chain data to export');
      return;
    }
    
    const filename = `${symbol}_historical_option_chains.csv`;
    const filepath = path.join(this.outputDir, filename);
    
    const csvWriter = createCsvWriter.createObjectCsvWriter({
      path: filepath,
      header: [
        { id: 'date', title: 'Date' },
        { id: 'spotPrice', title: 'Spot Price' },
        { id: 'strike', title: 'Strike' },
        { id: 'optionType', title: 'Option Type' },
        { id: 'premium', title: 'Premium' },
        { id: 'impliedVolatility', title: 'Implied Volatility' },
        { id: 'delta', title: 'Delta' },
        { id: 'gamma', title: 'Gamma' },
        { id: 'theta', title: 'Theta' },
        { id: 'vega', title: 'Vega' },
        { id: 'volume', title: 'Volume' },
        { id: 'openInterest', title: 'Open Interest' }
      ]
    });
    
    // Flatten option chain data
    const flattenedData = [];
    data.forEach(dayData => {
      dayData.options.forEach(option => {
        flattenedData.push({
          date: dayData.date,
          spotPrice: dayData.spotPrice,
          strike: option.strike_price,
          optionType: option.right,
          premium: option.ltp,
          impliedVolatility: option.implied_volatility,
          delta: option.delta,
          gamma: option.gamma,
          theta: option.theta,
          vega: option.vega,
          volume: option.volume,
          openInterest: option.open_interest
        });
      });
    });
    
    await csvWriter.writeRecords(flattenedData);
    console.log(`✅ Exported option chains to: ${filepath}`);
  }
  
  // Export VIX data to CSV
  async exportVIXData(data) {
    if (!data || data.length === 0) {
      console.log('⚠️ No VIX data to export');
      return;
    }
    
    const filename = 'historical_vix_data.csv';
    const filepath = path.join(this.outputDir, filename);
    
    const csvWriter = createCsvWriter.createObjectCsvWriter({
      path: filepath,
      header: [
        { id: 'date', title: 'Date' },
        { id: 'vix', title: 'VIX' },
        { id: 'open', title: 'Open' },
        { id: 'high', title: 'High' },
        { id: 'low', title: 'Low' },
        { id: 'close', title: 'Close' }
      ]
    });
    
    await csvWriter.writeRecords(data);
    console.log(`✅ Exported VIX data to: ${filepath}`);
  }
  
  // Export FII/DII data to CSV
  async exportFIIDIIData(data, symbol) {
    if (!data || data.length === 0) {
      console.log('⚠️ No FII/DII data to export');
      return;
    }
    
    const filename = `${symbol}_fii_dii_data.csv`;
    const filepath = path.join(this.outputDir, filename);
    
    const csvWriter = createCsvWriter.createObjectCsvWriter({
      path: filepath,
      header: [
        { id: 'date', title: 'Date' },
        { id: 'fii_buy', title: 'FII Buy' },
        { id: 'fii_sell', title: 'FII Sell' },
        { id: 'fii_net', title: 'FII Net' },
        { id: 'dii_buy', title: 'DII Buy' },
        { id: 'dii_sell', title: 'DII Sell' },
        { id: 'dii_net', title: 'DII Net' }
      ]
    });
    
    await csvWriter.writeRecords(data);
    console.log(`✅ Exported FII/DII data to: ${filepath}`);
  }
  
  // Export live data snapshot to JSON
  async exportLiveSnapshot(data) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `live_snapshot_${timestamp}.json`;
    const filepath = path.join(this.outputDir, filename);
    
    fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
    console.log(`✅ Exported live snapshot to: ${filepath}`);
  }
  
  // Generate summary report
  async generateSummaryReport(historicalResults, liveSnapshot) {
    const timestamp = new Date().toISOString();
    const filename = 'data_collection_summary.json';
    const filepath = path.join(this.outputDir, filename);
    
    const summary = {
      generatedAt: timestamp,
      symbol: API_CONFIG.targetSymbol,
      historicalData: {
        spotPricesCount: historicalResults.spotPrices?.length || 0,
        vixRecordsCount: historicalResults.vixData?.length || 0,
        optionChainDays: historicalResults.optionChains?.length || 0,
        fiiDiiRecordsCount: historicalResults.fiiDiiData?.length || 0,
        errors: historicalResults.errors || []
      },
      liveData: {
        currentSpot: liveSnapshot?.spotPrice?.price || null,
        currentVIX: liveSnapshot?.vix?.vix || null,
        optionsAvailable: liveSnapshot?.optionChain?.total || 0,
        lastUpdated: liveSnapshot?.timestamp || null,
        errors: liveSnapshot?.errors || []
      },
      dataQuality: {
        historicalDataComplete: (historicalResults.spotPrices?.length || 0) > 0,
        liveDataWorking: liveSnapshot?.spotPrice?.price != null,
        optionChainsAvailable: (liveSnapshot?.optionChain?.total || 0) > 0,
        vixDataAvailable: liveSnapshot?.vix?.vix != null
      }
    };
    
    fs.writeFileSync(filepath, JSON.stringify(summary, null, 2));
    console.log(`✅ Generated summary report: ${filepath}`);
    
    return summary;
  }
  
  getNextExpiryDate() {
    const now = new Date();
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    // Find last Thursday
    while (lastDay.getDay() !== 4) {
      lastDay.setDate(lastDay.getDate() - 1);
    }
    
    // If expiry has passed, get next month's expiry
    if (lastDay < now) {
      const nextMonth = new Date(now.getFullYear(), now.getMonth() + 2, 0);
      while (nextMonth.getDay() !== 4) {
        nextMonth.setDate(nextMonth.getDate() - 1);
      }
      return nextMonth.toISOString().split('T')[0];
    }
    
    return lastDay.toISOString().split('T')[0];
  }
}

export default DataExportService;