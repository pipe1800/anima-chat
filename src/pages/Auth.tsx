import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { User } from '@supabase/supabase-js';
import { Eye, EyeOff, Check, X } from 'lucide-react';

const Auth = () => {
  const [searchParams] = useSearchParams();
  const [isLogin, setIsLogin] = useState(searchParams.get('mode') !== 'signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successUsername, setSuccessUsername] = useState('');
  const navigate = useNavigate();

  // Password validation state
  const [passwordValidation, setPasswordValidation] = useState({
    length: false,
    number: false,
    special: false,
    touched: false
  });

  useEffect(() => {
    // Check if user is already logged in
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state change:', event, session?.user?.email);
        setUser(session?.user ?? null);
        if (session?.user && !showSuccess) {
          // Check if user has completed onboarding
          const isOnboardingCompleted = session.user.user_metadata?.onboarding_completed;
          
          if (isOnboardingCompleted) {
            // User already completed onboarding, go to dashboard
            navigate('/dashboard');
          } else {
            // New user or incomplete onboarding, go to onboarding
            navigate('/onboarding');
          }
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user && !showSuccess) {
        const isOnboardingCompleted = session.user.user_metadata?.onboarding_completed;
        
        if (isOnboardingCompleted) {
          navigate('/dashboard');
        } else {
          navigate('/onboarding');
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, showSuccess]);

  // Real-time password validation
  useEffect(() => {
    if (password || passwordValidation.touched) {
      setPasswordValidation({
        length: password.length >= 8,
        number: /\d/.test(password),
        special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
        touched: true
      });
    }
  }, [password, passwordValidation.touched]);

  const handleSocialAuth = async (provider: 'google' | 'discord') => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/onboarding`
      }
    });
    
    if (error) {
      setError(error.message);
    }
  };

  const showSuccessMessage = (username: string) => {
    setSuccessUsername(username);
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      navigate('/onboarding');
    }, 3000);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!username.trim()) {
      setError('Username is required');
      setLoading(false);
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username.trim(),
          onboarding_completed: false // Explicitly set to false for new users
        },
        emailRedirectTo: undefined
      }
    });

    if (error) {
      console.log('Signup error:', error.message);
      setError(`Signup failed: ${error.message}. Try using the login form instead if you added a user manually in Supabase.`);
    } else if (data.user) {
      showSuccessMessage(username.trim());
    }
    setLoading(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.log('Login error:', error.message);
      setError(`Login failed: ${error.message}`);
    } else if (rememberMe) {
      // Set session to persist for 30 days if remember me is checked
      localStorage.setItem('supabase.auth.remember', 'true');
    } else {
      // Clear remember flag if not checked
      localStorage.removeItem('supabase.auth.remember');
    }
    setLoading(false);
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center relative overflow-hidden">
        <div className="text-center z-10">
          <div className="mb-8">
            <div className="w-32 h-32 mx-auto mb-6 relative">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#FF7A00] to-[#FF7A00]/70 animate-spin"></div>
              <div className="absolute inset-2 rounded-full bg-[#121212] flex items-center justify-center">
                <Check className="w-12 h-12 text-[#FF7A00]" />
              </div>
            </div>
          </div>
          
          <h1 className="text-4xl font-bold text-white mb-2 animate-pulse">
            Welcome, {successUsername}!
          </h1>
          <p className="text-gray-400 text-lg">
            Account created successfully
          </p>
          
          <div className="mt-8 w-64 mx-auto">
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[#FF7A00] to-[#FF7A00]/70 rounded-full animate-pulse loading-bar"></div>
            </div>
          </div>
        </div>
        
        {/* Glitch effect background */}
        <div className="absolute inset-0 opacity-20">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="absolute bg-[#FF7A00] opacity-30"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${Math.random() * 200 + 50}px`,
                height: '2px',
                animation: `glitch ${0.5 + Math.random() * 1}s infinite`,
                animationDelay: `${Math.random() * 2}s`
              }}
            />
          ))}
        </div>
        
        <style>{`
          @keyframes glitch {
            0%, 100% { transform: translateX(0) scaleX(1); opacity: 0.3; }
            25% { transform: translateX(-10px) scaleX(1.2); opacity: 0.8; }
            50% { transform: translateX(10px) scaleX(0.8); opacity: 0.4; }
            75% { transform: translateX(-5px) scaleX(1.1); opacity: 0.9; }
          }
          
          .loading-bar {
            animation: loading 3s ease-out forwards;
          }
          
          @keyframes loading {
            0% { width: 0%; }
            100% { width: 100%; }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#121212] relative overflow-hidden flex items-center justify-center">
      {/* Logo */}
      <div className="absolute top-6 left-6 z-20">
        <img 
          src="/lovable-uploads/45d0ba23-cfa2-404a-8527-54e83cb321ef.png" 
          alt="Anima AI Chat" 
          className="h-16 w-auto"
        />
      </div>

      {/* Futuristic Background Animation */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-gradient-to-br from-[#FF7A00]/10 via-transparent to-[#1a1a2e]/30"></div>
        <div className="neural-network">
          {/* Neural network nodes */}
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="neural-node"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 4}s`,
                animationDuration: `${4 + Math.random() * 2}s`
              }}
            />
          ))}
          {/* Connection lines */}
          <svg className="absolute inset-0 w-full h-full">
            {Array.from({ length: 15 }).map((_, i) => (
              <line
                key={i}
                x1={`${Math.random() * 100}%`}
                y1={`${Math.random() * 100}%`}
                x2={`${Math.random() * 100}%`}
                y2={`${Math.random() * 100}%`}
                stroke="rgba(255, 122, 0, 0.1)"
                strokeWidth="1"
                className="animate-pulse"
                style={{
                  animationDelay: `${Math.random() * 3}s`,
                  animationDuration: `${3 + Math.random() * 2}s`
                }}
              />
            ))}
          </svg>
        </div>
      </div>

      {/* Auth Form */}
      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="bg-[#1a1a2e]/80 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              {isLogin ? 'Welcome Back' : 'Create Your Account'}
            </h1>
            <p className="text-gray-400">
              {isLogin ? 'Sign in to continue your journey' : 'Join thousands creating their perfect AI companions'}
            </p>
          </div>

          {/* Social Auth Buttons */}
          <div className="space-y-3 mb-6">
            <Button
              type="button"
              onClick={() => handleSocialAuth('discord')}
              className="w-full bg-[#5865F2] hover:bg-[#5865F2]/90 text-white font-medium py-3 rounded-lg transition-all duration-300"
            >
              Continue with Discord
            </Button>
            <Button
              type="button"
              onClick={() => handleSocialAuth('google')}
              className="w-full bg-white hover:bg-gray-100 text-gray-900 font-medium py-3 rounded-lg transition-all duration-300"
            >
              Continue with Google
            </Button>
          </div>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-600/50"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-[#1a1a2e] text-gray-400">
                {isLogin ? 'or' : 'Or sign up with email'}
              </span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={isLogin ? handleLogin : handleSignUp} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Choose Your Handle
                </label>
                <Input
                  type="text"
                  placeholder="e.g., xX_CyberWaifu_Xx"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-[#121212] border-gray-600 text-white placeholder:text-gray-500 focus:border-[#FF7A00] focus:ring-[#FF7A00]/20"
                  required={!isLogin}
                />
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {isLogin ? 'Email' : 'Email'}
              </label>
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-[#121212] border-gray-600 text-white placeholder:text-gray-500 focus:border-[#FF7A00] focus:ring-[#FF7A00]/20"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => !isLogin && setPasswordValidation(prev => ({ ...prev, touched: true }))}
                  className="bg-[#121212] border-gray-600 text-white placeholder:text-gray-500 focus:border-[#FF7A00] focus:ring-[#FF7A00]/20 pr-10"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              
              {/* Password Requirements (Sign-up only) */}
              {!isLogin && passwordValidation.touched && (
                <div className="mt-2 space-y-1">
                  <div className={`text-sm flex items-center ${passwordValidation.length ? 'text-green-400' : 'text-gray-400'}`}>
                    {passwordValidation.length ? <Check className="w-3 h-3 mr-1" /> : <X className="w-3 h-3 mr-1" />}
                    8+ characters
                  </div>
                  <div className={`text-sm flex items-center ${passwordValidation.number ? 'text-green-400' : 'text-gray-400'}`}>
                    {passwordValidation.number ? <Check className="w-3 h-3 mr-1" /> : <X className="w-3 h-3 mr-1" />}
                    1 number
                  </div>
                  <div className={`text-sm flex items-center ${passwordValidation.special ? 'text-green-400' : 'text-gray-400'}`}>
                    {passwordValidation.special ? <Check className="w-3 h-3 mr-1" /> : <X className="w-3 h-3 mr-1" />}
                    1 special character
                  </div>
                </div>
              )}
            </div>

            {/* Login-specific elements */}
            {isLogin && (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  />
                  <label htmlFor="remember" className="text-sm text-gray-300">
                    Remember Me
                  </label>
                </div>
                <button
                  type="button"
                  className="text-sm text-[#FF7A00] hover:text-[#FF7A00]/80 transition-colors"
                >
                  Forgot Password?
                </button>
              </div>
            )}

            {error && (
              <div className="text-red-400 bg-red-900/20 text-sm text-center p-3 rounded-lg">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#FF7A00] hover:bg-[#FF7A00]/90 text-white font-bold py-3 text-lg rounded-lg shadow-lg hover:shadow-[#FF7A00]/25 transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create My Account')}
            </Button>
          </form>

          {/* Toggle */}
          <div className="text-center mt-6">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
                setUsername('');
                setEmail('');
                setPassword('');
                setPasswordValidation({ length: false, number: false, special: false, touched: false });
              }}
              className="text-gray-400 hover:text-[#FF7A00] transition-colors underline-offset-4 hover:underline"
            >
              {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>
          </div>
        </div>
      </div>

      {/* CSS Styles for Neural Network Animation */}
      <style>{`
        .neural-network {
          position: absolute;
          inset: 0;
          overflow: hidden;
        }
        
        .neural-node {
          position: absolute;
          width: 4px;
          height: 4px;
          background: #FF7A00;
          border-radius: 50%;
          animation: float 6s ease-in-out infinite;
          box-shadow: 0 0 10px rgba(255, 122, 0, 0.5);
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) scale(1); opacity: 0.3; }
          50% { transform: translateY(-20px) scale(1.2); opacity: 0.8; }
        }
      `}</style>
    </div>
  );
};

export default Auth;
