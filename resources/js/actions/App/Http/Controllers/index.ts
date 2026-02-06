import AccountController from './AccountController'
import TransactionController from './TransactionController'
import FinanceChatController from './FinanceChatController'
import CategoryController from './CategoryController'
import CurrencyController from './CurrencyController'
import CurrencyRateController from './CurrencyRateController'
import BudgetPeriodController from './BudgetPeriodController'
import BudgetPeriodDuplicateController from './BudgetPeriodDuplicateController'
import BudgetController from './BudgetController'
import OnboardingController from './OnboardingController'
import OnboardingCategoryController from './OnboardingCategoryController'
import OnboardingAccountController from './OnboardingAccountController'
import TelegramWebhookController from './TelegramWebhookController'
import Settings from './Settings'
import GoogleOAuthController from './GoogleOAuthController'
import Auth from './Auth'

const Controllers = {
    AccountController: Object.assign(AccountController, AccountController),
    TransactionController: Object.assign(TransactionController, TransactionController),
    FinanceChatController: Object.assign(FinanceChatController, FinanceChatController),
    CategoryController: Object.assign(CategoryController, CategoryController),
    CurrencyController: Object.assign(CurrencyController, CurrencyController),
    CurrencyRateController: Object.assign(CurrencyRateController, CurrencyRateController),
    BudgetPeriodController: Object.assign(BudgetPeriodController, BudgetPeriodController),
    BudgetPeriodDuplicateController: Object.assign(BudgetPeriodDuplicateController, BudgetPeriodDuplicateController),
    BudgetController: Object.assign(BudgetController, BudgetController),
    OnboardingController: Object.assign(OnboardingController, OnboardingController),
    OnboardingCategoryController: Object.assign(OnboardingCategoryController, OnboardingCategoryController),
    OnboardingAccountController: Object.assign(OnboardingAccountController, OnboardingAccountController),
    TelegramWebhookController: Object.assign(TelegramWebhookController, TelegramWebhookController),
    Settings: Object.assign(Settings, Settings),
    GoogleOAuthController: Object.assign(GoogleOAuthController, GoogleOAuthController),
    Auth: Object.assign(Auth, Auth),
}

export default Controllers