// ============================================================
// Sprint 2 · PR-01 · feat/rights-context
// src/context/UserRightsContext.jsx
// ============================================================
// Provides all 9 UserModule_Rights flags for the signed-in user.
// Wrap your app with <UserRightsProvider> INSIDE <AuthProvider>.
// Consume with: const { rights, rightsLoading } = useRights();
// ============================================================

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

// ── Default rights (all zero = no access) ──────────────────
const DEFAULT_RIGHTS = {
  CUST_VIEW:  0,
  CUST_ADD:   0,
  CUST_EDIT:  0,
  CUST_DEL:   0,
  CUST_PRINT: 0,
  ADM_VIEW:   0,
  ADM_USER:   0,
  ADM_ROLE:   0,
  ADM_LOG:    0,
};

const UserRightsContext = createContext({
  rights:        DEFAULT_RIGHTS,
  rightsLoading: true,
  rightsError:   null,
  refreshRights: () => {},
});

// ── Provider ────────────────────────────────────────────────
export function UserRightsProvider({ children }) {
  const { currentUser } = useAuth();
  const [rights,        setRights]        = useState(DEFAULT_RIGHTS);
  const [rightsLoading, setRightsLoading] = useState(true);
  const [rightsError,   setRightsError]   = useState(null);

  const loadRights = async (userId) => {
    if (!userId) {
      setRights(DEFAULT_RIGHTS);
      setRightsLoading(false);
      return;
    }

    setRightsLoading(true);
    setRightsError(null);

    try {
      // Query all UserModule_Rights rows for this user
      const { data, error } = await supabase
        .from('UserModule_Rights')
        .select('right_code, right_value')
        .eq('user_id', userId);

      if (error) throw error;

      // Build a flat map: { CUST_VIEW: 1, CUST_ADD: 0, … }
      const mapped = { ...DEFAULT_RIGHTS };
      (data || []).forEach(({ right_code, right_value }) => {
        if (right_code in mapped) {
          mapped[right_code] = right_value;
        }
      });

      setRights(mapped);
    } catch (err) {
      console.error('[UserRightsContext] Failed to load rights:', err.message);
      setRightsError(err.message);
      setRights(DEFAULT_RIGHTS); // fail-safe: deny everything
    } finally {
      setRightsLoading(false);
    }
  };

  // Reload whenever the signed-in user changes
  useEffect(() => {
    if (currentUser) {
      loadRights(currentUser.id);
    } else {
      // Signed out → reset to zero
      setRights(DEFAULT_RIGHTS);
      setRightsLoading(false);
    }
  }, [currentUser]);

  const refreshRights = () => {
    if (currentUser) loadRights(currentUser.id);
  };

  return (
    <UserRightsContext.Provider
      value={{ rights, rightsLoading, rightsError, refreshRights }}
    >
      {children}
    </UserRightsContext.Provider>
  );
}

// ── Hook ─────────────────────────────────────────────────────
export function useRights() {
  return useContext(UserRightsContext);
}
