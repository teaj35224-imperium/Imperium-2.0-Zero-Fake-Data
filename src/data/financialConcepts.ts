import { FinancialConceptExplanation } from '../types';

export const FINANCIAL_CONCEPTS: Record<string, FinancialConceptExplanation> = {
  UNREALIZED_PROFIT: {
    term: 'Unrealized Profit',
    title: 'Unrealized Profit (Floating Gain/Loss)',
    simpleExplanation: 'Money you are currently making on paper for stocks you still own. It changes continuously as the stock price moves and is NOT locked in until you sell.',
    whyItMatters: 'Unrealized profit reflects your open risk. If the stock drops before you sell, this profit can shrink or turn into a loss.',
    howNexusUsesIt: 'Nexus and the Trade Supervisor monitor unrealized profit to trigger scale-out targets or tighten trailing stops to protect gains.',
    example: 'You bought 1 share of NVDA at $128.50. It is now trading at $131.45. Your Unrealized Profit is +$2.95 (+2.3%).'
  },
  REALIZED_PROFIT: {
    term: 'Realized Profit',
    title: 'Realized Profit (Settled Gain)',
    simpleExplanation: 'Money you have permanently locked in and added to your cash balance after selling a winning stock position.',
    whyItMatters: 'Realized profit is final cash in your account. It cannot be lost to future price drops of that stock.',
    howNexusUsesIt: 'Realized gains are swept immediately into your available cash reserves so they can be compounded or kept safe.',
    example: 'You sold PLTR at $35.80 after entering at $32.40. You booked a Realized Profit of +$22.40 cash.'
  },
  BUYING_POWER: {
    term: 'Buying Power',
    title: 'Paper Buying Power',
    simpleExplanation: 'The total dollar amount of paper shares you are legally allowed to purchase right now according to brokerage and margin rules.',
    whyItMatters: 'It prevents you from opening orders larger than your verified account capacity.',
    howNexusUsesIt: 'Nexus verifies buying power before sending any paper order and always keeps a substantial buffer in cash.',
    example: 'With $24,800.00 cash in a standard paper margin account, your buying power is $49,600.00 (2x leverage limit).'
  },
  TARGET_PRICE: {
    term: 'Target Price',
    title: 'Profit Target Price',
    simpleExplanation: 'The planned price level where Nexus intends to sell shares to lock in gains because the stock has reached its expected technical or fundamental resistance.',
    whyItMatters: 'Pre-defining targets removes emotion and greed from trading, ensuring you capture profits instead of watching them disappear.',
    howNexusUsesIt: 'The Trade Supervisor monitors price distance to target and prepares a paper exit order when the target is approached or hit.',
    example: 'For NVDA bought at $128.50, our Target Price is $138.00 (+7.4%).'
  },
  STOP_LOSS: {
    term: 'Stop Loss',
    title: 'Hard Stop Loss Boundary',
    simpleExplanation: 'The emergency exit line in the sand. If the stock falls to this price, Nexus immediately sells to protect your account from a larger loss.',
    whyItMatters: 'It caps the maximum amount of money you can lose on any single trade to a small, acceptable fraction of your capital.',
    howNexusUsesIt: 'Central Risk requires a strict invalidation stop on 100% of paper trades before any order is submitted.',
    example: 'For NVDA entered at $128.50, the stop loss is set at $128.00 (-0.39%), limiting the downside.'
  },
  SPREAD: {
    term: 'Bid/Ask Spread',
    title: 'Bid-Ask Spread & Liquidity Cost',
    simpleExplanation: 'The price gap between the highest price a buyer is willing to pay (Bid) and the lowest price a seller will accept (Ask).',
    whyItMatters: 'A wide spread is a hidden tax on every trade. If a spread is 10 cents on a $2 stock, you lose 5% the moment you enter.',
    howNexusUsesIt: 'Chief of Staff and Central Risk block any trade where the spread exceeds strict threshold limits ($0.05 on large caps, 1% on penny stocks).',
    example: 'Bid is $131.44 and Ask is $131.45. Spread is $0.01 (tight and safe for trading).'
  },
  RISK_REWARD: {
    term: 'Risk/Reward Ratio',
    title: 'Reward-to-Risk Ratio (R:R)',
    simpleExplanation: 'A mathematical comparison of how much profit you stand to make versus how much money you risk losing on the trade.',
    whyItMatters: 'If you only take trades with at least a 3:1 ratio, you can be wrong 50% of the time and still grow your account sustainably.',
    howNexusUsesIt: 'Nexus rejects opportunities with an R:R below 2.5:1, even if the stock has high hype.',
    example: 'Risking $2.50 to make $10.00 gives a 4.0:1 Reward-to-Risk ratio.'
  },
  POTENTIAL_PROFIT: {
    term: 'Potential Profit',
    title: 'Potential Profit (Theoretical Sized Return)',
    simpleExplanation: 'The calculated dollar gain you would make if the trade successfully reaches its target price, based on the per-trade allocation cap.',
    whyItMatters: 'It tells you the exact dollar upside before you commit any paper capital.',
    howNexusUsesIt: 'Calculated by taking (Target Price - Entry Price) * (Trade Capital / Entry Price).',
    example: 'With $100 allocated to a trade targeting +15%, the potential profit is $15.00.'
  }
};
