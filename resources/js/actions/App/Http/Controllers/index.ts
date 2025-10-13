import AccountController from './AccountController'
import TransactionController from './TransactionController'
import CategoryController from './CategoryController'
import CurrencyController from './CurrencyController'
import CurrencyRateController from './CurrencyRateController'
import OnboardingController from './OnboardingController'
import OnboardingCategoryController from './OnboardingCategoryController'
import OnboardingAccountController from './OnboardingAccountController'
import Settings from './Settings'
import GoogleOAuthController from './GoogleOAuthController'
import Auth from './Auth'

const Controllers = {
    AccountController: Object.assign(AccountController, AccountController),
    TransactionController: Object.assign(TransactionController, TransactionController),
    CategoryController: Object.assign(CategoryController, CategoryController),
    CurrencyController: Object.assign(CurrencyController, CurrencyController),
    CurrencyRateController: Object.assign(CurrencyRateController, CurrencyRateController),
    OnboardingController: Object.assign(OnboardingController, OnboardingController),
    OnboardingCategoryController: Object.assign(OnboardingCategoryController, OnboardingCategoryController),
    OnboardingAccountController: Object.assign(OnboardingAccountController, OnboardingAccountController),
    Settings: Object.assign(Settings, Settings),
    GoogleOAuthController: Object.assign(GoogleOAuthController, GoogleOAuthController),
    Auth: Object.assign(Auth, Auth),
}

export default Controllers