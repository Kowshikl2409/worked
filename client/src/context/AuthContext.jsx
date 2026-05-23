import React, { createContext, useContext } from 'react';
import { ClerkProvider, useUser, useClerk } from '@clerk/clerk-react';

const AuthContext = createContext(null);

const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || import.meta.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

if (!CLERK_PUBLISHABLE_KEY) {
  console.warn("Clerk Publishable Key is missing from the environment. Please define NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY in .env");
}

function ClerkAuthBridge({ children }) {
  const { isLoaded, isSignedIn, user } = useUser();
  const { signOut } = useClerk();

  const customSignOut = async () => {
    try {
      await signOut();
    } catch (err) {
      console.error("Clerk signout error:", err);
    }
  };

  const signIn = () => {
    window.location.href = '/sign-in';
  };

  return (
    <AuthContext.Provider value={{ 
      isSignedIn: isLoaded ? isSignedIn : false, 
      user: isSignedIn ? user : null, 
      signIn, 
      signOut: customSignOut,
      isLoaded
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function AuthProvider({ children }) {
  return (
    <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
      <ClerkAuthBridge>{children}</ClerkAuthBridge>
    </ClerkProvider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
