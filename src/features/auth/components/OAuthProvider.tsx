import GoogleSVG from "@/assets/google-2.svg";
import { useTranslation } from "react-i18next";
import { useGoogleLogin } from "@/lib/hooks/auth";
import { useState } from 'react';
import { useGlobalUIStore } from "@/stores/useGlobalUIStore";
import { Loader2 } from "lucide-react";

interface OAuthProviderProps {
  onAuthStateChange?: (isAuthenticating: boolean) => void;
}

function OAuthProvider({ onAuthStateChange }: OAuthProviderProps) {
  const { t } = useTranslation("auth");
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const setToast = useGlobalUIStore((state) => state.setToast);
  
  const bubbles = [
    {
      id: "google",
      src: GoogleSVG,
      alt: "Google Authentication",
      text: t("login.googleSignUp", "Registrarse con Google"),
      provider: "google",
    },
  ];

  const { loginWithGoogle, isPending } = useGoogleLogin();

  const handleCustomButtonClick = () => {
    setIsAuthenticating(true);
    onAuthStateChange?.(true);
    
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const redirectUri = `${window.location.origin}/auth/google/callback.html`;
    
    if (!clientId) {
      setToast({
        message: 'Error de configuración: Google Client ID no está configurado',
        type: 'error',
        open: true,
      });
      setIsAuthenticating(false);
      onAuthStateChange?.(false);
      return;
    }
    
    // Construir la URL de autorización de Google OAuth
    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    authUrl.searchParams.append('client_id', clientId);
    authUrl.searchParams.append('redirect_uri', redirectUri);
    authUrl.searchParams.append('response_type', 'id_token token');
    authUrl.searchParams.append('scope', 'openid email profile');
    authUrl.searchParams.append('nonce', Math.random().toString(36));
      
    // Abrir popup
    const width = 500;
    const height = 600;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;
    
    const popup = window.open(
      authUrl.toString(),
      'Google Sign In',
      `width=${width},height=${height},left=${left},top=${top},popup=yes`
    );

    if (!popup) {
      setToast({
        message: 'No se pudo abrir la ventana de Google. Por favor, permite los popups.',
        type: 'error',
        open: true,
      });
      setIsAuthenticating(false);
      onAuthStateChange?.(false);
      return;
    }

    let messageReceived = false;
    let checkPopupInterval: ReturnType<typeof setInterval> | null = null;
    let authTimeout: ReturnType<typeof setTimeout> | null = null;

    // Función de limpieza
    const cleanup = () => {
      setIsAuthenticating(false);
      onAuthStateChange?.(false);
      window.removeEventListener('message', handleMessage);
      if (checkPopupInterval) clearInterval(checkPopupInterval);
      if (authTimeout) clearTimeout(authTimeout);
    };
    const handleMessage = (event: MessageEvent) => {      
      if (event.origin !== window.location.origin) {
        console.warn('⚠️ Mensaje de origen no confiable:', event.origin);
        return;
      }
      
      if (event.data.type === 'GOOGLE_AUTH_SUCCESS' && event.data.idToken) {
        messageReceived = true;

        loginWithGoogle(event.data.idToken);
        
        // Intentar cerrar el popup
        try {
          popup?.close();
        } catch (e) {
          console.log('El popup se cerrará por sí mismo');
        }
        
        cleanup();
      } else if (event.data.type === 'GOOGLE_AUTH_ERROR') {
        console.error('❌ Error en autenticación de Google:', event.data.error);
        messageReceived = true;
        
        setToast({
          message: `Error de autenticación: ${event.data.error || 'Error desconocido'}`,
          type: 'error',
          open: true,
        });
        
        // Intentar cerrar el popup
        try {
          popup?.close();
        } catch (e) {
          console.log('El popup se cerrará por sí mismo');
        }
        
        cleanup();
      }
    };

    window.addEventListener('message', handleMessage);

    // Verificar si el popup fue cerrado (con manejo de errores COOP)
    checkPopupInterval = setInterval(() => {
      try {
        if (popup && popup.closed) {
          if (checkPopupInterval) clearInterval(checkPopupInterval);
          if (!messageReceived) {
            console.log('Popup cerrado sin recibir respuesta');
            cleanup();
          }
        }
      } catch (e) {
        // Ignorar errores de COOP - el popup está en otro origen
        // Solo limpiar si han pasado muchos intentos sin éxito
      }
    }, 1000);

    // Timeout de seguridad (2 minutos)
    authTimeout = setTimeout(() => {
      if (!messageReceived) {
        console.log('Timeout de autenticación');
        cleanup();
        try {
          popup?.close();
        } catch (e) {
          // Ignorar errores al intentar cerrar
        }
      }
    }, 120000);
  };

  return (
    <div>
      {bubbles.map((bubble) => (
        <button
          key={bubble.id}
          type="button"
          disabled={isPending || isAuthenticating}
          className="auth-bubble bg-[var(--theme-color-surface)] border border-[var(--theme-border)] 
                     h-[50px] w-full rounded-full flex items-center justify-center hover:opacity-50 
                     transition-opacity duration-300 ease-in-out gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleCustomButtonClick}
        >
          {isPending || isAuthenticating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin text-[var(--theme-text)]" />
              <span className="ml-2 text-[var(--theme-text)] text-lg font-medium">
                {t("login.authenticating", "Iniciando sesión...")}
              </span>
            </>
          ) : (
            <>
              <img
                src={bubble.src}
                alt={bubble.alt}
                className="pointer-events-none"
                width={20}
                height={20}
              />
              <span className="ml-2 text-[var(--theme-text)] text-lg font-medium">
                {bubble.text}
              </span>
            </>
          )}
        </button>
      ))}
    </div>
  );
}

export default OAuthProvider;
