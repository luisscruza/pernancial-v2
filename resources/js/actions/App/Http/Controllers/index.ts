import AccountController from './AccountController'
import OnboardingController from './OnboardingController'
import OnboardingCategoryController from './OnboardingCategoryController'
import OnboardingAccountController from './OnboardingAccountController'
import Settings from './Settings'
import GoogleOAuthController from './GoogleOAuthController'
import Auth from './Auth'

const Controllers = {
    AccountController: Object.assign(AccountController, AccountController),
    OnboardingController: Object.assign(OnboardingController, OnboardingController),
    OnboardingCategoryController: Object.assign(OnboardingCategoryController, OnboardingCategoryController),
    OnboardingAccountController: Object.assign(OnboardingAccountController, OnboardingAccountController),
    Settings: Object.assign(Settings, Settings),
    GoogleOAuthController: Object.assign(GoogleOAuthController, GoogleOAuthController),
    Auth: Object.assign(Auth, Auth),
}

export default Controllers