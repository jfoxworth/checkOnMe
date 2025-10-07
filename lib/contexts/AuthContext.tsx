import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
  SignUpCommand,
  ConfirmSignUpCommand,
  GetUserCommand,
  ResendConfirmationCodeCommand,
  ForgotPasswordCommand,
  ConfirmForgotPasswordCommand,
} from '@aws-sdk/client-cognito-identity-provider';

import { cognitoClient, cognitoConfig } from '../aws-config';

// Storage keys
const ACCESS_TOKEN_KEY = 'cognito_access_token';
const REFRESH_TOKEN_KEY = 'cognito_refresh_token';
const ID_TOKEN_KEY = 'cognito_id_token';

export interface User {
  id: string;
  email: string;
  emailVerified: boolean;
  name?: string;
  firstName?: string;
  lastName?: string;
  attributes?: Record<string, any>;
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (
    email: string,
    password: string,
    firstName?: string,
    lastName?: string
  ) => Promise<void>;
  confirmSignUp: (email: string, code: string) => Promise<void>;
  resendConfirmationCode: (email: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  confirmForgotPassword: (email: string, code: string, newPassword: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Helper functions for token storage
  const storeTokens = async (tokens: {
    AccessToken: string;
    RefreshToken: string;
    IdToken: string;
  }) => {
    try {
      await AsyncStorage.multiSet([
        [ACCESS_TOKEN_KEY, tokens.AccessToken],
        [REFRESH_TOKEN_KEY, tokens.RefreshToken],
        [ID_TOKEN_KEY, tokens.IdToken],
      ]);
    } catch (error) {
      console.error('Error storing tokens:', error);
    }
  };

  const getStoredTokens = async () => {
    try {
      const tokens = await AsyncStorage.multiGet([
        ACCESS_TOKEN_KEY,
        REFRESH_TOKEN_KEY,
        ID_TOKEN_KEY,
      ]);

      const tokenMap = tokens.reduce(
        (acc, [key, value]) => {
          acc[key] = value;
          return acc;
        },
        {} as Record<string, string | null>
      );

      return {
        accessToken: tokenMap[ACCESS_TOKEN_KEY],
        refreshToken: tokenMap[REFRESH_TOKEN_KEY],
        idToken: tokenMap[ID_TOKEN_KEY],
      };
    } catch (error) {
      console.error('Error retrieving tokens:', error);
      return { accessToken: null, refreshToken: null, idToken: null };
    }
  };

  const clearStoredTokens = async () => {
    try {
      await AsyncStorage.multiRemove([ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY, ID_TOKEN_KEY]);
    } catch (error) {
      console.error('Error clearing tokens:', error);
    }
  };

  // Get current user from stored token
  const refreshToken = async (): Promise<boolean> => {
    try {
      const tokens = await getStoredTokens();
      if (!tokens.refreshToken) {
        return false;
      }

      const command = new InitiateAuthCommand({
        ClientId: cognitoConfig.ClientId,
        AuthFlow: 'REFRESH_TOKEN_AUTH',
        AuthParameters: {
          REFRESH_TOKEN: tokens.refreshToken,
        },
      });

      const response = await cognitoClient.send(command);

      if (response.AuthenticationResult) {
        const { AccessToken, IdToken } = response.AuthenticationResult;

        if (AccessToken && IdToken) {
          // Update stored tokens (refresh token doesn't change)
          await AsyncStorage.multiSet([
            [ACCESS_TOKEN_KEY, AccessToken],
            [ID_TOKEN_KEY, IdToken],
          ]);
          return true;
        }
      }

      return false;
    } catch (error) {
      console.error('Error refreshing token:', error);
      return false;
    }
  };

  const getCurrentUser = async (): Promise<User | null> => {
    try {
      const tokens = await getStoredTokens();
      if (!tokens.accessToken) {
        return null;
      }

      const command = new GetUserCommand({
        AccessToken: tokens.accessToken,
      });

      const response = await cognitoClient.send(command);

      if (response.UserAttributes) {
        const user: User = {
          id: response.UserAttributes.find((attr) => attr.Name === 'sub')?.Value || '',
          email: response.UserAttributes.find((attr) => attr.Name === 'email')?.Value || '',
          emailVerified:
            response.UserAttributes.find((attr) => attr.Name === 'email_verified')?.Value ===
            'true',
          firstName:
            response.UserAttributes.find((attr) => attr.Name === 'given_name')?.Value || '',
          lastName:
            response.UserAttributes.find((attr) => attr.Name === 'family_name')?.Value || '',
          name: response.UserAttributes.find((attr) => attr.Name === 'name')?.Value || '',
          attributes: response.UserAttributes.reduce(
            (acc, attr) => {
              if (attr.Name && attr.Value) {
                acc[attr.Name] = attr.Value;
              }
              return acc;
            },
            {} as Record<string, string>
          ),
        };
        return user;
      }

      return null;
    } catch (error) {
      console.error('Error getting current user:', error);

      // If the access token is expired, try to refresh
      if (error instanceof Error && error.name === 'NotAuthorizedException') {
        console.log('Access token expired, attempting to refresh...');
        const refreshResult = await refreshToken();
        if (refreshResult) {
          // Retry getting user with new token
          return await getCurrentUser();
        }
      }

      // If refresh failed or other error, clear tokens
      await clearStoredTokens();
      return null;
    }
  }; // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const signInWithEmail = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const command = new InitiateAuthCommand({
        ClientId: cognitoConfig.ClientId,
        AuthFlow: 'USER_PASSWORD_AUTH',
        AuthParameters: {
          USERNAME: email,
          PASSWORD: password,
        },
      });

      const response = await cognitoClient.send(command);

      if (response.AuthenticationResult) {
        const { AccessToken, RefreshToken, IdToken } = response.AuthenticationResult;

        if (AccessToken && RefreshToken && IdToken) {
          await storeTokens({ AccessToken, RefreshToken, IdToken });
          const currentUser = await getCurrentUser();
          setUser(currentUser);
          setIsAuthenticated(true);
        }
      } else {
        throw new Error('Authentication failed - no tokens received');
      }
    } catch (error: any) {
      console.error('Sign in error:', error);

      // Provide user-friendly error messages
      if (error.name === 'InvalidParameterException') {
        if (error.message.includes('USER_PASSWORD_AUTH flow not enabled')) {
          throw new Error('Authentication method not supported. Please contact support.');
        }
        throw new Error('Invalid email or password format.');
      } else if (error.name === 'NotAuthorizedException') {
        throw new Error('Invalid email or password.');
      } else if (error.name === 'UserNotFoundException') {
        throw new Error('User account not found.');
      } else if (error.name === 'UserNotConfirmedException') {
        throw new Error('Please check your email and confirm your account.');
      } else {
        throw new Error(error.message || 'Sign in failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const signUpWithEmail = async (
    email: string,
    password: string,
    firstName?: string,
    lastName?: string
  ) => {
    setIsLoading(true);
    try {
      const userAttributes = [
        {
          Name: 'email',
          Value: email,
        },
      ];

      if (firstName) {
        userAttributes.push({
          Name: 'given_name',
          Value: firstName,
        });
      }

      if (lastName) {
        userAttributes.push({
          Name: 'family_name',
          Value: lastName,
        });
      }

      const command = new SignUpCommand({
        ClientId: cognitoConfig.ClientId,
        Username: email,
        Password: password,
        UserAttributes: userAttributes,
      });

      await cognitoClient.send(command);
    } catch (error: any) {
      console.error('Sign up error:', error);
      throw new Error(error.message || 'Sign up failed');
    } finally {
      setIsLoading(false);
    }
  };

  const confirmSignUp = async (email: string, code: string) => {
    setIsLoading(true);
    try {
      const command = new ConfirmSignUpCommand({
        ClientId: cognitoConfig.ClientId,
        Username: email,
        ConfirmationCode: code,
      });

      await cognitoClient.send(command);
    } catch (error: any) {
      console.error('Confirm sign up error:', error);
      throw new Error(error.message || 'Confirmation failed');
    } finally {
      setIsLoading(false);
    }
  };

  const resendConfirmationCode = async (email: string) => {
    setIsLoading(true);
    try {
      const command = new ResendConfirmationCodeCommand({
        ClientId: cognitoConfig.ClientId,
        Username: email,
      });

      await cognitoClient.send(command);
    } catch (error: any) {
      console.error('Resend confirmation error:', error);
      throw new Error(error.message || 'Failed to resend confirmation code');
    } finally {
      setIsLoading(false);
    }
  };

  const forgotPassword = async (email: string) => {
    setIsLoading(true);
    try {
      const command = new ForgotPasswordCommand({
        ClientId: cognitoConfig.ClientId,
        Username: email,
      });

      await cognitoClient.send(command);
    } catch (error: any) {
      console.error('Forgot password error:', error);
      throw new Error(error.message || 'Failed to initiate password reset');
    } finally {
      setIsLoading(false);
    }
  };

  const confirmForgotPassword = async (email: string, code: string, newPassword: string) => {
    setIsLoading(true);
    try {
      const command = new ConfirmForgotPasswordCommand({
        ClientId: cognitoConfig.ClientId,
        Username: email,
        ConfirmationCode: code,
        Password: newPassword,
      });

      await cognitoClient.send(command);
    } catch (error: any) {
      console.error('Confirm forgot password error:', error);
      throw new Error(error.message || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      await clearStoredTokens();
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshSession = async () => {
    try {
      const currentUser = await getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Refresh session error:', error);
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    signInWithEmail,
    signUpWithEmail,
    confirmSignUp,
    resendConfirmationCode,
    forgotPassword,
    confirmForgotPassword,
    signOut,
    refreshSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
