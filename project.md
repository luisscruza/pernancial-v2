
# Personal Finance App Requirements
## Core Features
### Multi-Tenancy
-- Each user has their own accounts, transactions, budgets, categories, etc.
### User Management
-- User needs to define a base currency for their account.
### Account Management
-- Support multiple accounts with different currencies
-- Account types: Savings, Cash, Investment, Credit Card, etc. (Users can create custom account types)
-- Each account must maintain a current balance
-- Balance should update automatically with every transaction
### Currency Management
-- User can create a new currency and define the conversion rate to the base currency...
-- User can define the currency of an account
-- User can define the conversion rate between currencies
-- User can convert amounts between currencies
-- User can see the conversion rate in the transaction history


### Transaction Types
-- Expenses: Money leaving an account (categorizable)
-- Income: Money entering an account (categorizable)
-- Transfers: Money moving between accounts (categorizable -- e.g. "Transfer to savings (this could be a budget)")
-- Must debit source account and credit destination account
-- May involve currency conversion between accounts
### Transaction Requirements
-- User can pick the date of the transaction
-- Each transaction must update account balance in real-time
-- Transaction history should display running balance
-- Editing a transaction must recalculate all subsequent balances
-- Deleting a transaction must recalculate all subsequent balances
-- Each transaction should be categorized
### Budgeting System
-- Support for category-based budgeting
-- Budget types:
-- Period budgets. (We can start with monthly budgets, but should be extendable to weekly, yearly, etc.)
-- One-time budgets. (Period of time defined by the user.)
### Custom accounting periods
-- Define start date for monthly cycles (e.g., 23rd of each month)
-- Budget periods should align with custom accounting periods
-- Example: Jan 23 - Feb 22 for a period starting on the 23rd
-- User can define the start date of the accounting period (can vary from month to month)
### Reporting Requirements
-- Account balance summary
-- Transaction history with running balance
-- Budget vs. actual spending by category
Period-based reporting aligned with custom accounting periods

Data Validation Rules

Cannot spend more than available in non-credit accounts
-- Transfers must have valid source and destination accounts
-- Budget categories must be assigned to all expense transactions

