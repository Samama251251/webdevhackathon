import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { authService } from '@/services/authService';
import type { User, SignUpCredentials, SignInCredentials } from '@/types/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (credentials: SignUpCredentials) => Promise<{ error: Error | null }>;
  signIn: (credentials: SignInCredentials) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const initializeAuth = async () => {
      const { user: currentUser } = await authService.getSession();
      setUser(currentUser);
      setLoading(false);
    };

    initializeAuth();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const currentUser: User = {
          id: session.user.id,
          email: session.user.email || '',
          username: session.user.user_metadata?.username,
          created_at: session.user.created_at,
        };
        setUser(currentUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (credentials: SignUpCredentials) => {
    const { user: newUser, error } = await authService.signUp(credentials);
    if (!error && newUser) {
      setUser(newUser);
    }
    return { error };
  };

  const signIn = async (credentials: SignInCredentials) => {
    const { user: signedInUser, error } = await authService.signIn(credentials);
    if (!error && signedInUser) {
      setUser(signedInUser);
    }
    return { error };
  };

  const signOut = async () => {
    const { error } = await authService.signOut();
    if (!error) {
      setUser(null);
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

