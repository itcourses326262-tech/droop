import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { ensureUserProfile } from '@/lib/firebaseUsers';

const AuthContext = createContext();

// user = بيانات Firebase Auth (uid, email) + ملف المستخدم من Firestore (users/{uid}).
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  const loadUser = useCallback(async (fbUser) => {
    let profile = null;
    try {
      profile = await ensureUserProfile(fbUser);
    } catch (e) {
      console.error('Loading user profile failed:', e);
    }
    setUser({
      ...profile,
      display_name: profile?.display_name || fbUser.displayName || null,
      profile_picture: profile?.profile_picture || fbUser.photoURL || null,
      uid: fbUser.uid,
      id: fbUser.uid,
      email: fbUser.email,
      emailVerified: fbUser.emailVerified,
    });
  }, []);

  useEffect(() => {
    return onAuthStateChanged(auth, async (fbUser) => {
      if (!fbUser) {
        setUser(null);
        setIsAuthenticated(false);
        setIsLoadingAuth(false);
        return;
      }
      await loadUser(fbUser);
      setIsAuthenticated(true);
      setIsLoadingAuth(false);
    });
  }, [loadUser]);

  // يعيد تحميل الملف بعد تعديله (صفحة الملف الشخصي).
  const refreshUser = useCallback(async () => {
    if (auth.currentUser) await loadUser(auth.currentUser);
  }, [loadUser]);

  const logout = async (shouldRedirect = true) => {
    await signOut(auth);
    if (shouldRedirect) window.location.href = '/';
  };

  const navigateToLogin = () => {
    const returnTo = window.location.pathname + window.location.search;
    window.location.href = '/login?returnTo=' + encodeURIComponent(returnTo);
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isAdmin: user?.role === 'admin',
      isProfessional: user?.account_type === 'professional',
      refreshUser,
      isLoadingAuth,
      authChecked: !isLoadingAuth,
      logout,
      navigateToLogin,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
