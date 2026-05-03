import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, handleFirestoreError } from './firebase';

interface AuthContextType {
  user: any | null;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, workspaceName: string) => Promise<void>;
  token: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const login = async () => {
    if (isLoggingIn) return;
    
    try {
      setIsLoggingIn(true);
      setAuthError(null);
      const { signInWithGoogle } = await import('./firebase');
      await signInWithGoogle();
    } catch (error: any) {
      // Don't show error if user just closed the popup
      if (error?.code === 'auth/popup-closed-by-user' || error?.code === 'auth/cancelled-popup-request') {
        process.env.NODE_ENV !== 'production' && console.log('User cancelled sign-in');
        return;
      }
      
      console.error('Login failed:', error);
      
      let message = 'Authentication failed. Please try again.';
      if (error?.code === 'auth/popup-blocked') {
        message = 'Login popup was blocked by your browser. Please allow popups for this site.';
        alert(message);
      } else if (error?.code === 'auth/internal-error') {
        message = 'A connection error occurred. Please try again or open in a new tab.';
      }
      
      setAuthError(message);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const logout = async () => {
    try {
      setAuthError(null);
      localStorage.removeItem('operator_token');
      localStorage.removeItem('operator_user');
      setUser(null);
      setToken(null);
      const { logOut } = await import('./firebase');
      await logOut();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const loginWithEmail = async (email: string, password: string) => {
    try {
      setLoading(true);
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Login failed');

      localStorage.setItem('operator_token', data.token);
      localStorage.setItem('operator_user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
    } catch (error: any) {
      setAuthError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, workspaceName: string) => {
    try {
      setLoading(true);
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, workspaceName })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Registration failed');

      localStorage.setItem('operator_token', data.token);
      localStorage.setItem('operator_user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
    } catch (error: any) {
      setAuthError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const [token, setToken] = useState<string | null>(localStorage.getItem('operator_token'));

  useEffect(() => {
    const savedUser = localStorage.getItem('operator_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setLoading(false);
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      // Keep Firebase user for backward compatibility or if using Google login
      if (firebaseUser && !token) {
        setUser(firebaseUser as any);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, [token]);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, loginWithEmail, register, token }}>
      {children}
      {authError && (
        <div className="fixed bottom-4 right-4 z-[9999] animate-in fade-in slide-in-from-bottom-2">
          <div className="bg-red-500/10 border border-red-500/20 backdrop-blur-xl px-4 py-3 rounded-2xl flex items-center gap-3 shadow-2xl">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <p className="text-sm font-medium text-red-100">{authError}</p>
            <button 
              onClick={() => setAuthError(null)}
              className="text-red-400 hover:text-white transition-colors ml-2"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
