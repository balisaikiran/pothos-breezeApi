# Strike Range Calculator for Gamma Shorting

## 🎯 Quick Reference

When testing option chains, you need to calculate strike ranges based on current spot price.

### For ITC (Update based on current price):

**Current ITC Spot**: ~₹450 (check current price first)

**±5% Range**:
- Lower: ₹427 (450 × 0.95)
- Upper: ₹472 (450 × 1.05)

**±10% Range**:
- Lower: ₹405 (450 × 0.90)  
- Upper: ₹495 (450 × 1.10)

## 📝 How to Update Postman Requests

1. **Get Current Spot Price**: Run "Current Spot Price - ITC" request first
2. **Calculate Ranges**: Use the formulas above with actual spot price
3. **Update Strike Filters**: Modify these parameters in option chain requests:
   - `strike_price_from`: Lower bound
   - `strike_price_to`: Upper bound

## 🔄 Dynamic Testing Workflow

### Step 1: Get Current Data
```
GET /quotes?stock_code=ITC&exchange_code=NSE&product_type=cash
```
→ Note the `ltp` (Last Traded Price)

### Step 2: Calculate Ranges
- **5% Range**: LTP × 0.95 to LTP × 1.05
- **10% Range**: LTP × 0.90 to LTP × 1.10

### Step 3: Test Option Chains
```
GET /optionchain?stock_code=ITC&exchange_code=NSE&product_type=options&expiry_date=2024-12-26&right=others&strike_price_from=427&strike_price_to=472
```

## 🎯 Gamma Shorting Focus Areas

**Primary Strikes**: ATM ± 5% (highest gamma exposure)
**Secondary Strikes**: ATM ± 10% (broader opportunity set)
**Greeks to Monitor**:
- **Gamma**: Peak around ATM strikes
- **Theta**: Time decay acceleration
- **Vega**: Volatility sensitivity
- **Delta**: Directional exposure

## 📊 Expected Option Counts

For ITC with ₹450 spot:
- **±5% Range**: ~9-10 strikes (427, 430, 435, 440, 445, 450, 455, 460, 465, 470, 472)
- **±10% Range**: ~18-20 strikes (405 to 495 in ₹5 increments)

This gives you sufficient options for gamma shorting while keeping the dataset manageable for AI analysis.