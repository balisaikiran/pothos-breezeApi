import BreezeAPIClient from './utils/api-client.js';
import { ENDPOINTS } from './config/api-config.js';

class EndpointTester {
  constructor() {
    this.client = new BreezeAPIClient();
    this.testResults = [];
  }
  
  async testEndpoint(name, endpoint, params = {}) {
    console.log(`\n🔍 Testing ${name}...`);
    console.log(`Endpoint: ${endpoint}`);
    console.log(`Params:`, params);
    
    const startTime = Date.now();
    const result = await this.client.makeRequest(endpoint, params);
    const duration = Date.now() - startTime;
    
    const testResult = {
      name,
      endpoint,
      success: result.success,
      status: result.status,
      duration: `${duration}ms`,
      dataStructure: result.success ? this.analyzeDataStructure(result.data) : null,
      error: result.success ? null : result.error,
      sampleData: result.success ? this.getSampleData(result.data) : null
    };
    
    this.testResults.push(testResult);
    
    if (result.success) {
      console.log(`✅ ${name} - Success (${duration}ms)`);
      console.log(`Data structure:`, testResult.dataStructure);
    } else {
      console.log(`❌ ${name} - Failed:`, result.error);
    }
    
    return testResult;
  }
  
  analyzeDataStructure(data) {
    if (!data) return 'null';
    if (Array.isArray(data)) {
      return `Array[${data.length}] of ${data.length > 0 ? typeof data[0] : 'unknown'}`;
    }
    if (typeof data === 'object') {
      return `Object with keys: [${Object.keys(data).join(', ')}]`;
    }
    return typeof data;
  }
  
  getSampleData(data) {
    if (!data) return null;
    if (Array.isArray(data)) {
      return data.slice(0, 2); // First 2 items
    }
    if (typeof data === 'object') {
      // Return first few key-value pairs
      const keys = Object.keys(data).slice(0, 5);
      const sample = {};
      keys.forEach(key => sample[key] = data[key]);
      return sample;
    }
    return data;
  }
  
  async runAllTests() {
    console.log('🚀 Starting comprehensive Breeze API endpoint testing...\n');
    
    // Test connection first
    const connectionTest = await this.client.testConnection();
    if (!connectionTest) {
      console.log('❌ API connection failed. Please check your credentials.');
      return this.testResults;
    }
    
    // Test basic endpoints
    await this.testEndpoint(
      'Customer Profile',
      '/customer/profile'
    );
    
    await this.testEndpoint(
      'Market Status',
      '/marketdata/status'
    );
    
    // Test historical data endpoints
    await this.testEndpoint(
      'Historical Spot Data (ITC)',
      ENDPOINTS.historicalData,
      {
        stock_code: 'ITC',
        exchange_code: 'NSE',
        product_type: 'cash',
        from_date: '2024-01-01',
        to_date: '2024-01-31',
        interval: '1day'
      }
    );
    
    // Test option chain
    await this.testEndpoint(
      'Option Chain (ITC)',
      ENDPOINTS.optionChain,
      {
        stock_code: 'ITC',
        exchange_code: 'NSE',
        product_type: 'options',
        expiry_date: '2024-12-26',
        right: 'others'
      }
    );
    
    // Test live quotes
    await this.testEndpoint(
      'Live Quotes (ITC)',
      ENDPOINTS.quotes,
      {
        stock_code: 'ITC',
        exchange_code: 'NSE',
        product_type: 'cash'
      }
    );
    
    // Test VIX data
    await this.testEndpoint(
      'VIX Data',
      ENDPOINTS.vixData
    );
    
    // Test FII/DII data
    await this.testEndpoint(
      'FII/DII Data',
      ENDPOINTS.participantData,
      {
        stock_code: 'ITC',
        date: '2024-12-01'
      }
    );
    
    // Test indices
    await this.testEndpoint(
      'Indices Data',
      ENDPOINTS.indices
    );
    
    this.generateTestReport();
    return this.testResults;
  }
  
  generateTestReport() {
    console.log('\n📊 API ENDPOINT TEST SUMMARY');
    console.log('=' .repeat(50));
    
    const successful = this.testResults.filter(r => r.success).length;
    const total = this.testResults.length;
    
    console.log(`Overall Success Rate: ${successful}/${total} (${Math.round(successful/total*100)}%)\n`);
    
    this.testResults.forEach(result => {
      const status = result.success ? '✅' : '❌';
      console.log(`${status} ${result.name}`);
      console.log(`   Endpoint: ${result.endpoint}`);
      console.log(`   Duration: ${result.duration}`);
      
      if (result.success) {
        console.log(`   Data: ${result.dataStructure}`);
      } else {
        console.log(`   Error: ${result.error}`);
      }
      console.log('');
    });
    
    // Save detailed report to file
    const reportPath = path.join('./data-output', 'api_test_report.json');
    fs.writeFileSync(reportPath, JSON.stringify({
      summary: {
        totalTests: total,
        successfulTests: successful,
        successRate: `${Math.round(successful/total*100)}%`,
        timestamp: new Date().toISOString()
      },
      results: this.testResults
    }, null, 2));
    
    console.log(`📄 Detailed report saved to: ${reportPath}`);
  }
}

// Run tests if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const tester = new EndpointTester();
  await tester.runAllTests();
}

export default EndpointTester;