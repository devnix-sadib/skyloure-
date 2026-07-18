import { createContext, useContext, useState, useEffect } from 'react';
import { api } from './api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    api.me().then(u => { setUser(u); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const refreshCartCount = async () => {
    try {
      const items = await api.getCart();
      setCartCount(items.reduce((sum, i) => sum + i.quantity, 0));
    } catch { setCartCount(0); }
  };

  useEffect(() => {
    if (user) refreshCartCount();
    else setCartCount(0);
  }, [user]);

  const logout = async () => {
    await api.logout();
    setUser(null);
    setCartCount(0);
  };

  const login = async (email, password) => {
    const u = await api.login(email, password);
    setUser(u);
    await refreshCartCount();
    return u;
  };

  const register = async (name, email, password) => {
    const u = await api.register(name, email, password);
    setUser(u);
    await refreshCartCount();
    return u;
  };

  return (
    <AuthContext.Provider value={{ user, loading, cartCount, refreshCartCount, setUser, logout, login, register }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
