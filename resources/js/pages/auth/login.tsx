import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { motion } from 'motion/react';

import { Button } from '@/components/ui/button';
import AuthLayout from '@/layouts/auth-layout';

interface LoginProps {
    status?: string;
}

export default function Login({ status }: LoginProps) {
    const [isLoading, setIsLoading] = useState(false);

    const handleGoogleLogin = () => {
        setIsLoading(true);
        window.location.href = route('auth.google');
    };

    return (
        <AuthLayout title="Welcome to Pernancial" description="Log into your account to get started.">
            <Head title="Log in" />

            <div className="flex flex-col gap-6 w-full">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="bg-white/5 backdrop-blur-sm p-6 rounded-xl border border-gray-100/10 shadow-sm dark:border-gray-800/50"
                >
          

                    <Button
                        type="button"
                        variant="outline"
                        className="w-full rounded-full relative py-5 border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 dark:border-gray-700 dark:hover:bg-gray-800/50"
                        onClick={handleGoogleLogin}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <motion.div
                                className="absolute inset-0 flex items-center justify-center"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.2 }}
                            >
                                <svg className="animate-spin h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            </motion.div>
                        ) : (
                            <>
                                <svg className="mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                                    <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
                                    <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
                                    <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
                                    <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
                                </svg>
                                <motion.span
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.2 }}
                                    className="font-medium"
                                >
                                    Continue with Google
                                </motion.span>
                            </>
                        )}
                    </Button>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4, duration: 0.5 }}
                        className="mt-5 text-center text-xs text-gray-500"
                    >
                        By continuing, you agree to our
                        <a href="#" className="text-blue-500 hover:underline ml-1">Terms of Service</a> and
                        <a href="#" className="text-blue-500 hover:underline ml-1">Privacy Policy</a>
                    </motion.div>
                </motion.div>
            </div>

            {status && (
                <motion.div
                    className="mt-4 text-center text-sm font-medium text-green-600 bg-green-50 p-3 rounded-lg border border-green-100 dark:bg-green-900/20 dark:border-green-800/30 dark:text-green-400"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    {status}
                </motion.div>
            )}
        </AuthLayout>
    );
}
