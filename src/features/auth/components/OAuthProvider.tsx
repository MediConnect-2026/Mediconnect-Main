import GoogleSVG from "@/assets/google-2.svg";
import { useTranslation } from "react-i18next";
import { useGoogleLogin } from "@/lib/hooks/auth";
import { useState } from 'react';

function OAuthProvider() {
  const { t } = useTranslation("auth");
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  
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
    
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const redirectUri = `${window.location.origin}/auth/google/callback`;
    
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

    // Escuchar el mensaje del popup
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      
      if (event.data.type === 'GOOGLE_AUTH_SUCCESS' && event.data.idToken) {
        console.log('✅ ID Token recibido del popup');
        loginWithGoogle(event.data.idToken);
        setIsAuthenticating(false);
        window.removeEventListener('message', handleMessage);
      } else if (event.data.type === 'GOOGLE_AUTH_ERROR') {
        console.error('❌ Error en autenticación de Google');
        setIsAuthenticating(false);
        window.removeEventListener('message', handleMessage);
      }
    };

    window.addEventListener('message', handleMessage);

    // Verificar si el popup fue cerrado
    const checkPopupClosed = setInterval(() => {
      if (popup && popup.closed) {
        clearInterval(checkPopupClosed);
        setIsAuthenticating(false);
        window.removeEventListener('message', handleMessage);
      }
    }, 500);
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
          <img
            src={bubble.src}
            alt={bubble.alt}
            className="pointer-events-none"
            width={20}
            height={20}
          />
          <span className="ml-2 text-[var(--theme-text)] text-lg font-medium">
            {isPending || isAuthenticating ? 'Iniciando sesión...' : bubble.text}
          </span>
        </button>
      ))}
    </div>
  );
}

export default OAuthProvider;
