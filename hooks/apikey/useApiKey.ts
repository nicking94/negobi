// hooks/useApiKey.ts
import { useState, useEffect } from "react";

export const useApiKey = () => {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [apiKeyExpiration, setApiKeyExpiration] = useState<string | null>(null);

  useEffect(() => {
    const storedApiKey = localStorage.getItem("NEGOBI_USER_API_KEY");
    const storedExpiration = localStorage.getItem("NEGOBI_API_KEY_EXPIRATION");

    setApiKey(storedApiKey);
    setApiKeyExpiration(storedExpiration);
  }, []);

  const setUserApiKey = (key: string, expiration?: string) => {
    localStorage.setItem("NEGOBI_USER_API_KEY", key);
    if (expiration) {
      localStorage.setItem("NEGOBI_API_KEY_EXPIRATION", expiration);
    }
    setApiKey(key);
    setApiKeyExpiration(expiration || null);
  };

  const clearApiKey = () => {
    localStorage.removeItem("NEGOBI_USER_API_KEY");
    localStorage.removeItem("NEGOBI_API_KEY_EXPIRATION");
    setApiKey(null);
    setApiKeyExpiration(null);
  };

  const isApiKeyExpired = () => {
    if (!apiKeyExpiration) return false;
    return new Date() > new Date(apiKeyExpiration);
  };

  return {
    apiKey,
    apiKeyExpiration,
    setUserApiKey,
    clearApiKey,
    isApiKeyExpired,
  };
};
