# Gamma Shorting AI - Breeze API Data Explorer

This tool helps you understand what data is available from the Breeze API for building your gamma shorting AI enhancement system.

## 🎯 Project Overview

Based on your project scope document, this system will:
- Analyze 3 years of historical data for volatility patterns
- Monitor live option chains for gamma shorting opportunities
- Track VIX and FII/DII data for market context
- Focus on ITC as the initial target asset

## 🚀 Quick Start

1. **Setup Environment**
   ```bash
   cp .env.example .env
   # Edit .env with your Breeze API credentials
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Run Complete Data Audit**
   ```bash
   npm run dev
   ```

## 📊 Available Scripts

- `npm run dev` - Run complete data audit
- `npm run test-endpoints` - Test all API endpoints
- `npm run historical` - Collect 3 years of historical data
- `npm run live` - Start live data monitoring

## 📋 Data Collection Scope

### Historical Data (3 Years)
- ✅ **Spot Prices**: Daily OHLCV for ITC
- ✅ **Option Chains**: IV data for ±5% and ±10% strikes
- ✅ **VIX Data**: Daily volatility index
- ✅ **FII/DII Data**: Institutional participation

### Live Data (5-minute refresh)
- ✅ **Current Spot Price**: Real-time ITC price
- ✅ **Live Option Chains**: Current IV levels
- ✅ **Live VIX**: Current volatility
- ✅ **Live FII/DII**: Current institutional flow

## 🎯 Target Metrics (From Project Scope)

- **Primary Goal**: 15% Sharpe ratio improvement
- **Risk Target**: 25% reduction in max drawdowns
- **Accuracy Target**: >70% directional accuracy
- **System Uptime**: 99.5% during market hours

## 📁 Output Structure

```
data-output/
├── ITC_historical_spot_prices.csv
├── ITC_historical_option_chains.csv
├── historical_vix_data.csv
├── ITC_fii_dii_data.csv
├── live_snapshot_[timestamp].json
├── api_test_report.json
└── data_collection_summary.json
```

## 🔧 Configuration

Edit `.env` file to customize:
- API credentials
- Target symbol (default: ITC)
- Historical period (default: 3 years)
- Strike ranges (default: ±5%, ±10%)
- Refresh interval (default: 5 minutes)

## 📈 Next Steps

After running this data explorer:

1. **Analyze Data Quality**: Review the generated reports
2. **Validate Data Completeness**: Ensure all required data is available
3. **Proceed with AI Development**: Use the collected data for model training
4. **Implement Volatility Analysis Engine**: As per project scope Phase 1

## 🚨 Important Notes

- This tool focuses on **data exploration** only
- No automated trading - human oversight required
- Rate limiting implemented to respect API limits
- All data exported for offline analysis

## 📞 Support

For issues with:
- **API Connectivity**: Check Breeze API documentation
- **Data Quality**: Review the generated summary reports
- **Missing Data**: Check API endpoint test results