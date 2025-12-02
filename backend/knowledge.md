# Amy AI Knowledge Base

## About Deriv & Trading

### What is Deriv?
Deriv is an online trading platform that offers various financial instruments including forex, commodities, cryptocurrencies, and synthetic indices. The platform allows traders to speculate on price movements using different contract types.

### Synthetic Indices (Volatility Indices)
Synthetic indices are unique to Deriv - they simulate real-world market volatility but are not affected by real-world events. They're available 24/7 and include:
- **Volatility 10 Index (V10)**: Low volatility, smaller price movements
- **Volatility 25 Index (V25)**: Low-medium volatility
- **Volatility 50 Index (V50)**: Medium volatility
- **Volatility 75 Index (V75)**: Medium-high volatility
- **Volatility 100 Index (V100)**: High volatility, larger price movements

Higher volatility = bigger potential gains but also bigger potential losses.

---

## Rise/Fall Contracts

### What are Rise/Fall Contracts?
Rise/Fall is the simplest form of binary options trading:
- **Rise (CALL)**: You predict the price will go UP
- **Fall (PUT)**: You predict the price will go DOWN

If your prediction is correct at contract end, you win a payout (typically ~95% profit). If wrong, you lose your stake.

### Key Terms
- **Stake**: The amount you're risking on the trade
- **Payout**: The amount you receive if you win (stake + profit)
- **Duration**: How long until the contract expires (measured in ticks)
- **Tick**: A single price update from the market
- **Entry Spot**: The price when your contract starts
- **Exit Spot**: The price when your contract ends

### Example
- Stake: $10
- Contract: Rise on V100
- Duration: 5 ticks
- If price goes up after 5 ticks: Win ~$19.50 (payout)
- If price goes down: Lose $10 (stake)

---

## Platform Components Guide

### Price Chart
**What it does**: Shows real-time price movements as a candlestick chart.
**How to use**:
1. Select your trading instrument from the dropdown
2. Watch the live price updates
3. Analyze patterns to make trading decisions

**Tips**:
- Green candles = price went up in that period
- Red candles = price went down
- The chart updates in real-time with live prices

### Order Panel
**What it does**: Place Rise/Fall trades.
**How to use**:
1. Enter your stake amount (minimum $0.35)
2. Select duration in ticks (5, 10, 15, or 20)
3. Click "Rise" if you think price will go up
4. Click "Fall" if you think price will go down

**Tips**:
- Start with small stakes while learning
- The potential payout shows before you trade
- You need to be logged in to place real trades

### Open Positions
**What it does**: Shows your active trades with live profit/loss.
**How to use**:
1. View all your running contracts
2. See real-time P/L updates
3. Close positions early if needed (click X)

**Colors**:
- Green = position is profitable
- Red = position is at a loss

### Watchlist
**What it does**: Quick access to different trading instruments.
**How to use**:
1. Browse available synthetic indices
2. Click any symbol to switch to it
3. See live prices for each instrument

### Portfolio
**What it does**: Shows your account balance and trading summary.
**Information shown**:
- Available balance
- Total invested in open positions
- Overall profit/loss
- Number of profitable vs losing positions

### World Clock
**What it does**: Shows times in major financial centers.
**Why it matters**: 
- Green dot = market is typically open
- Helps coordinate trading sessions
- Synthetic indices are 24/7 so always available

### Calculator
**What it does**: Helps calculate potential profits and losses.
**Modes**:
1. **Position Size**: Calculate profit/loss for a single trade
2. **Profit Calc**: Estimate results over multiple trades based on win rate

---

## Step-by-Step Guides

### How to Place Your First Trade

**Step 1: Check the Chart**
Look at the Price Chart to see current market conditions. Notice if the price is trending up, down, or sideways.

**Step 2: Choose Your Stake**
In the Order Panel, enter how much you want to risk. Start small (e.g., $5-10) while learning.

**Step 3: Select Duration**
Choose how many ticks until your contract expires. 5 ticks is fastest, 20 ticks gives more time.

**Step 4: Make Your Prediction**
- Click **Rise** if you think the price will be HIGHER
- Click **Fall** if you think the price will be LOWER

**Step 5: Watch Your Position**
Your trade appears in Open Positions with live P/L updates.

### How to Connect Your Account

**Step 1**: Click the "Connect" button in the top-right header
**Step 2**: Go to Deriv API Settings (link provided)
**Step 3**: Create a new API token with trading permissions
**Step 4**: Copy the token and paste it in our platform
**Step 5**: Click Connect - you'll see your balance appear

### How to Monitor Positions

**Step 1**: Make sure the Positions panel is visible (ask me to show it if hidden)
**Step 2**: Each position shows:
   - Contract type (Rise/Fall)
   - Symbol being traded
   - Buy price (your stake)
   - Current profit/loss
**Step 3**: Watch the P/L update in real-time
**Step 4**: Positions close automatically at expiry, or click X to close early

---

## Trading Tips

### For Beginners
1. **Start with Demo**: Practice with virtual money first
2. **Small Stakes**: Risk only what you can afford to lose
3. **Learn the Charts**: Spend time watching price movements before trading
4. **Use Lower Volatility**: V10 or V25 are more predictable for learning
5. **Set Limits**: Decide beforehand how much you'll trade per session

### Risk Management
- Never risk more than 1-5% of your balance on a single trade
- Don't chase losses with bigger bets
- Take breaks after losing streaks
- Keep a trading journal

### Understanding Probability
- Rise/Fall is essentially 50/50 on direction
- The ~95% payout means you need >51% win rate to profit long-term
- No strategy guarantees wins - trading involves real risk

---

## Common Questions

**Q: Why can't I place a trade?**
A: You need to connect your Deriv account first. Click "Connect" in the header.

**Q: What's the minimum stake?**
A: The minimum stake is $0.35 USD.

**Q: How long do trades last?**
A: Tick-based contracts last 5-20 ticks (usually seconds to a minute).

**Q: Can I close a trade early?**
A: Yes, click the X on any open position to sell it early at current value.

**Q: What are the green/red colors?**
A: Green = profit/price going up. Red = loss/price going down.

**Q: Is this real money?**
A: If you connect a real Deriv account, yes. Demo accounts use virtual money.

---

## UI Customization

### Available Layouts
- **Trading**: Optimized for active trading (Chart + Order + Positions)
- **Minimal**: Just essentials (Chart + Order Panel)
- **Analysis**: For research (Chart + Watchlist + News + Overview)
- **Monitoring**: Watch positions (Large Positions + Chart + Portfolio)

### I Can Help You
- Show or hide any component
- Make components bigger or smaller
- Switch between dark and light themes
- Change the accent color
- Switch languages (including Arabic RTL)
- Set up preset layouts
- Guide you through any trading operation step-by-step

