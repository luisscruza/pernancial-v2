import AccountController from './AccountController'
import TransactionController from './TransactionController'
import FinanceChatController from './FinanceChatController'
import FinanceChatStreamController from './FinanceChatStreamController'
import FinanceChatResetController from './FinanceChatResetController'
import FinanceChatRenameController from './FinanceChatRenameController'
import FinanceChatDestroyController from './FinanceChatDestroyController'
import CategoryController from './CategoryController'
import CurrencyController from './CurrencyController'
import CurrencyRateController from './CurrencyRateController'
import ContactController from './ContactController'
import ReceivableController from './ReceivableController'
import ReceivablePaymentController from './ReceivablePaymentController'
import PayableController from './PayableController'
import PayablePaymentController from './PayablePaymentController'
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
    FinanceChatStreamController: Object.assign(FinanceChatStreamController, FinanceChatStreamController),
    FinanceChatResetController: Object.assign(FinanceChatResetController, FinanceChatResetController),
    FinanceChatRenameController: Object.assign(FinanceChatRenameController, FinanceChatRenameController),
    FinanceChatDestroyController: Object.assign(FinanceChatDestroyController, FinanceChatDestroyController),
    CategoryController: Object.assign(CategoryController, CategoryController),
    CurrencyController: Object.assign(CurrencyController, CurrencyController),
    CurrencyRateController: Object.assign(CurrencyRateController, CurrencyRateController),
    ContactController: Object.assign(ContactController, ContactController),
    ReceivableController: Object.assign(ReceivableController, ReceivableController),
    ReceivablePaymentController: Object.assign(ReceivablePaymentController, ReceivablePaymentController),
    PayableController: Object.assign(PayableController, PayableController),
    PayablePaymentController: Object.assign(PayablePaymentController, PayablePaymentController),
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