import { supabase } from '@/lib/supabase';
import type { SignUpCredentials, SignInCredentials, AuthResponse, User } from '@/types/auth';

export const authService = {
  /**
   * Sign up a new user with email and password
   */
  async signUp(credentials: SignUpCredentials): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
        options: {
          data: {
            username: credentials.username || credentials.email.split('@')[0],
          },
        },
      });

      if (error) {
        return { user: null, error };
      }

      if (data.user) {
        const user: User = {
          id: data.user.id,
          email: data.user.email || '',
          username: data.user.user_metadata?.username,
          created_at: data.user.created_at,
        };
        return { user, error: null };
      }

      return { user: null, error: new Error('Sign up failed') };
    } catch (error) {
      return {
        user: null,
        error: error instanceof Error ? error : new Error('An unexpected error occurred'),
      };
    }
  },

  /**
   * Sign in an existing user with email and password
   */
  async signIn(credentials: SignInCredentials): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) {
        return { user: null, error };
      }

      if (data.user) {
        const user: User = {
          id: data.user.id,
          email: data.user.email || '',
          username: data.user.user_metadata?.username,
          created_at: data.user.created_at,
        };
        return { user, error: null };
      }

      return { user: null, error: new Error('Sign in failed') };
    } catch (error) {
      return {
        user: null,
        error: error instanceof Error ? error : new Error('An unexpected error occurred'),
      };
    }
  },

  /**
   * Sign out the current user
   */
  async signOut(): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase.auth.signOut();
      return { error: error || null };
    } catch (error) {
      return {
        error: error instanceof Error ? error : new Error('An unexpected error occurred'),
      };
    }
  },

  /**
   * Get the current session and user
   */
  async getSession(): Promise<{ user: User | null; error: Error | null }> {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        return { user: null, error };
      }

      if (session?.user) {
        const user: User = {
          id: session.user.id,
          email: session.user.email || '',
          username: session.user.user_metadata?.username,
          created_at: session.user.created_at,
        };
        return { user, error: null };
      }

      return { user: null, error: null };
    } catch (error) {
      return {
        user: null,
        error: error instanceof Error ? error : new Error('An unexpected error occurred'),
      };
    }
  },

  /**
   * Get the current user from the session
   */
  async getCurrentUser(): Promise<User | null> {
    const { user } = await this.getSession();
    return user;
  },
};

