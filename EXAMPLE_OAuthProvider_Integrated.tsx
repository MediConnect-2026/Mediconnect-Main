/**
 * EJEMPLO COMPLETO: OAuthProvider.tsx INTEGRADO CON API
 * 
 * Este es el código del OAuthProvider.tsx con la integración de Google OAuth
 * 
 * CAMBIOS PRINCIPALES:
 * 1. Importar useGoogleLogin hook
 * 2. Implementar Google Sign-In con @react-oauth/google
 * 3. Manejar el callback con el hook
 */

import GoogleSVG from "@/assets/google-2.svg";
import { useTranslation } from "react-i18next";
// ✅ NUEVO: Importar el hook de Google login
import { useGoogleLogin } from "@/lib/hooks/auth";
// ✅ NUEVO: Importar Google OAuth library (necesita instalarse)
// npm install @react-oauth/google
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

function OAuthProvider() {
  const { t } = useTranslation("auth");
  
  // ✅ NUEVO: Usar el hook de Google login
  const { loginWithGoogle, isPending } = useGoogleLogin();

  // ✅ NUEVO: Manejar respuesta exitosa de Google
  const handleGoogleSuccess = (credentialResponse: any) => {
    if (credentialResponse.credential) {
      loginWithGoogle(credentialResponse.credential);
    }
  };

  // ✅ NUEVO: Manejar error de Google
  const handleGoogleError = () => {
    console.error('Error al iniciar sesión con Google');
  };

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <div>
        {/* ✅ OPCIÓN 1: Usar el botón personalizado de Google */}
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={handleGoogleError}
          useOneTap
          text="signin_with"
          theme="outline"
          size="large"
          width="100%"
          locale={t("login.locale", "es")}
        />

        {/* ✅ OPCIÓN 2: Botón personalizado (requiere más configuración) */}
        {/* 
        <div
          className="auth-bubble bg-[var(--theme-color-surface)] border border-[var(--theme-border)] 
                     h-[50px] rounded-full flex items-center justify-center hover:opacity-50 
                     transition-opacity duration-300 ease-in-out gap-2 cursor-pointer"
          onClick={() => {
            // Implementar lógico de Google Sign-In manual
          }}
        >
          <img
            src={GoogleSVG}
            alt="Google"
            className="pointer-events-none"
            width={20}
            height={20}
          />
          <span className="ml-2 text-[var(--theme-text)] text-lg font-medium">
            {isPending 
              ? t("login.googleLoading", "Conectando...") 
              : t("login.googleSignUp", "Registrarse con Google")
            }
          </span>
        </div>
        */}
      </div>
    </GoogleOAuthProvider>
  );
}

export default OAuthProvider;

/**
 * PASOS PARA CONFIGURAR GOOGLE OAUTH:
 * 
 * 1. Instalar la librería:
 *    npm install @react-oauth/google
 * 
 * 2. Obtener Client ID de Google:
 *    - Ir a https://console.cloud.google.com/
 *    - Crear un proyecto o seleccionar uno existente
 *    - Habilitar Google+ API
 *    - Crear credenciales OAuth 2.0
 *    - Copiar el Client ID
 * 
 * 3. Configurar en .env:
 *    VITE_GOOGLE_CLIENT_ID=tu_client_id_aqui.apps.googleusercontent.com
 * 
 * 4. Configurar authorized JavaScript origins:
 *    - http://localhost:5173 (desarrollo)
 *    - https://tu-dominio.com (producción)
 * 
 * 5. Configurar authorized redirect URIs:
 *    - http://localhost:5173
 *    - https://tu-dominio.com
 * 
 * ALTERNATIVA SIN LIBRERÍA:
 * 
 * Si prefieres no usar @react-oauth/google, puedes implementar
 * el Google Sign-In manualmente con el script de Google Identity Services:
 * 
 * 1. Agregar script en index.html:
 *    <script src="https://accounts.google.com/gsi/client" async defer></script>
 * 
 * 2. Inicializar en el componente:
 *    useEffect(() => {
 *      window.google.accounts.id.initialize({
 *        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
 *        callback: handleGoogleSuccess
 *      });
 *      window.google.accounts.id.renderButton(
 *        document.getElementById("googleButton"),
 *        { theme: "outline", size: "large" }
 *      );
 *    }, []);
 */
