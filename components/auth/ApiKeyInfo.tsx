// components/ApiKeyInfo.tsx
"use client";

import { Calendar, Key, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { useApiKey } from "@/hooks/apikey/useApiKey";

export const ApiKeyInfo = () => {
  const { apiKey, apiKeyExpiration, isApiKeyExpired } = useApiKey();

  if (!apiKey) return null;

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
      <div className="flex items-start gap-3">
        <Key className="h-5 w-5 text-blue-600 mt-0.5" />
        <div className="flex-1">
          <h4 className="font-medium text-blue-900 mb-1">
            Información de API Key
          </h4>
          <div className="text-sm text-blue-700 space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-medium">Estado:</span>
              {isApiKeyExpired() ? (
                <span className="flex items-center gap-1 text-red_m">
                  <AlertTriangle className="h-3 w-3" />
                  Expirada
                </span>
              ) : (
                <span className="text-green-600">Activa</span>
              )}
            </div>
            {apiKeyExpiration && (
              <div className="flex items-center gap-2">
                <Calendar className="h-3 w-3" />
                <span>
                  Expira:{" "}
                  {format(
                    new Date(apiKeyExpiration),
                    "dd/MM/yyyy 'a las' HH:mm"
                  )}
                </span>
              </div>
            )}
            <div className="mt-2">
              <span className="font-medium">Key:</span>
              <code className="ml-2 bg-blue-100 px-2 py-1 rounded text-xs">
                {apiKey.substring(0, 8)}...{apiKey.substring(apiKey.length - 8)}
              </code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
