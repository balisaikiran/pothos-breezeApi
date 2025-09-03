# Breeze API Testing Guide for Gamma Shorting AI

## 🚀 Quick Setup

1. **Import Collection**: Import `Breeze_API_Gamma_Shorting.postman_collection.json` into Postman
2. **Import Environment**: Import `Postman_Environment.json` 
3. **Configure Credentials**: Update environment variables with your Breeze API credentials:
   - `api_key`: Your Breeze API key
   - `secret_key`: Your Breeze secret key
   - `session_token`: Your session token (get from authentication endpoint)

## 📋 Testing Sequence

### Step 1: Authentication
1. **Login & Get Session Token** - Get your session token first
2. **Test Connection** - Verify API connectivity

### Step 2: Historical Data Testing (3 Years)
Test these endpoints to understand historical data availability:

1. **Historical Spot Prices - ITC (3 Years Daily)**
   - Tests: 3 years of OHLCV data for volatility analysis
   - Expected: ~750+ daily records

2. **Historical Option Chain - ITC (Sample Date)**
   - Tests: Option chain structure and IV data availability
   - Expected: Strike prices, premiums, Greeks, IV data

3. **Historical VIX Data (3 Years)**
   - Tests: Volatility index for spike detection
   - Expected: Daily VIX levels for 3 years

4. **FII/DII Participation Data - ITC**
   - Tests: Institutional flow data
   - Expected: Buy/sell/net data by participant type

### Step 3: Live Data Testing (5-min Refresh)
Test real-time data endpoints:

1. **Current Spot Price - ITC**
   - Tests: Real-time pricing
   - Expected: LTP, bid/ask, volume

2. **Live Option Chain - Current Month**
   - Tests: Current IV levels and option pricing
   - Expected: Real-time option data with Greeks

3. **Live Option Chain - Next Month**
   - Tests: Next expiry data for strategy decisions
   - Expected: Next month option chain

4. **Current VIX Level**
   - Tests: Real-time volatility index
   - Expected: Current VIX value

### Step 4: Gamma Shorting Specific Tests
Test strike range filtering:

1. **Strike Range Test - ±5% from Spot**
   - Tests: Options within 5% of current spot
   - Update strike ranges based on current ITC price

2. **Strike Range Test - ±10% from Spot**
   - Tests: Options within 10% of current spot
   - Wider range for gamma shorting opportunities

3. **Greeks Data Test**
   - Tests: Delta, Gamma, Theta, Vega availability
   - Critical for risk management dashboard

## 🎯 Key Data Points to Validate

### For Volatility Analysis Engine:
- [ ] Historical IV data available in option chains
- [ ] VIX data completeness (no missing days)
- [ ] Spot price data quality (no gaps)

### For Strike Selection Optimizer:
- [ ] Option chains include all strikes ±10% from spot
- [ ] Greeks data (Delta, Gamma, Theta, Vega) available
- [ ] Premium data accurate and real-time

### For Risk Management Dashboard:
- [ ] Real-time portfolio Greeks calculation possible
- [ ] Live data refresh rate acceptable (5-minute target)
- [ ] Historical data sufficient for backtesting (3 years)

## 📊 Expected Response Structures

### Spot Price Response:
```json
{
  "ltp": 450.25,
  "open": 448.00,
  "high": 452.10,
  "low": 447.50,
  "volume": 1234567,
  "timestamp": "2024-12-07T10:30:00Z"
}
```

### Option Chain Response:
```json
[
  {
    "strike_price": 450,
    "right": "call",
    "ltp": 12.50,
    "implied_volatility": 18.5,
    "delta": 0.52,
    "gamma": 0.08,
    "theta": -0.15,
    "vega": 0.25,
    "volume": 50000,
    "open_interest": 125000
  }
]
```

### VIX Response:
```json
{
  "current_value": 16.25,
  "open": 15.80,
  "high": 16.50,
  "low": 15.75,
  "timestamp": "2024-12-07T10:30:00Z"
}
```

## ⚠️ Important Notes

1. **Rate Limiting**: Breeze API has rate limits - test gradually
2. **Market Hours**: Some endpoints only work during market hours
3. **Expiry Dates**: Update expiry dates to current/next month
4. **Strike Ranges**: Adjust strike price filters based on current ITC spot price
5. **Data Latency**: Check if 5-minute refresh meets your requirements

## 🎯 Success Criteria

For your 15% Sharpe ratio improvement and 25% drawdown reduction goals, validate:

- [ ] **Data Completeness**: No significant gaps in historical data
- [ ] **Real-time Accuracy**: Live data matches market reality
- [ ] **Greeks Availability**: All Greeks required for risk management
- [ ] **IV Data Quality**: Implied volatility data is accurate and timely
- [ ] **API Reliability**: Consistent response times and uptime

## 📈 Next Steps After Testing

1. **Data Quality Assessment**: Review all responses for completeness
2. **Latency Analysis**: Measure API response times
3. **Cost Analysis**: Estimate data subscription costs
4. **Integration Planning**: Plan the data pipeline architecture
5. **Model Development**: Begin AI model development with validated data structure

This collection covers all the data requirements from your project scope document and will help you determine if Breeze API can support your gamma shorting AI enhancement system goals.