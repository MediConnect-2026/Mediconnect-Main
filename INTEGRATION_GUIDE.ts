/**
 * EJEMPLO DE INTEGRACIÓN DE LOGIN CON LA API
 * 
 * Este archivo muestra cómo integrar los hooks de autenticación en LoginPage.tsx
 * 
 * CAMBIOS NECESARIOS EN LoginPage.tsx:
 * 
 * 1. Importar los hooks:
 * ```tsx
 * import { useLogin } from '@/lib/hooks/auth';
 * ```
 * 
 * 2. Reemplazar el manejador de submit:
 * ```tsx
 * // ANTES (actual):
 * const handleSubmit = (data: LoginSchemaType) => {
 *   if (data.email && data.password) {
 *     setLoginCredentials({ email: data.email, password: data.password });
 *     navigate("/admin/dashboard");
 *   } else {
 *     alert(t("login.errorFields"));
 *   }
 * };
 * 
 * // DESPUÉS (con API):
 * const { loginUser, isPending } = useLogin();
 * 
 * const handleSubmit = (data: LoginSchemaType) => {
 *   // Guardar credenciales en el store (opcional, para persistencia)
 *   setLoginCredentials({ email: data.email, password: data.password });
 *   
 *   // Hacer login con la API
 *   loginUser({
 *     email: data.email,
 *     password: data.password
 *   });
 * };
 * ```
 * 
 * 3. Actualizar el botón de submit para mostrar loading:
 * ```tsx
 * <MCButton 
 *   type="submit" 
 *   className="w-full" 
 *   variant="primary"
 *   disabled={isPending}
 * >
 *   {isPending ? t("login.loading", "Iniciando sesión...") : t("login.submit", "Sign In")}
 * </MCButton>
 * ```
 * 
 * 4. Remover la navegación manual (el hook la maneja automáticamente):
 * - Ya no es necesario `navigate("/admin/dashboard")` porque el hook redirige según el rol
 * 
 * ============================================
 * PARA OAUTH (Google Login):
 * ============================================
 * 
 * En OAuthProvider.tsx:
 * 
 * 1. Importar el hook:
 * ```tsx
 * import { useGoogleLogin } from '@/lib/hooks/auth';
 * ```
 * 
 * 2. Usar el hook en el componente:
 * ```tsx
 * const { loginWithGoogle, isPending } = useGoogleLogin();
 * 
 * const handleGoogleSuccess = (credentialResponse: CredentialResponse) => {
 *   if (credentialResponse.credential) {
 *     loginWithGoogle(credentialResponse.credential);
 *   }
 * };
 * ```
 * 
 * 3. Configurar Google Sign-In button:
 * - Asegúrate de tener el VITE_GOOGLE_CLIENT_ID en .env
 * - El callback debe llamar a `loginWithGoogle` con el idToken
 * 
 * ============================================
 * MANEJO DE ERRORES:
 * ============================================
 * 
 * Los errores se manejan automáticamente:
 * - Se muestran como toasts
 * - Son traducibles y específicos por tipo de error
 * - No necesitas código adicional de manejo de errores
 * 
 * Si quieres personalizar el manejo de errores:
 * ```tsx
 * const { loginUser, isPending, error } = useLogin();
 * 
 * // Acceder al error en el componente:
 * {error && <p className="text-red-500">{error.message}</p>}
 * ```
 * 
 * ============================================
 * LOGOUT:
 * ============================================
 * 
 * En cualquier componente donde necesites logout:
 * ```tsx
 * import { useLogout } from '@/lib/hooks/auth';
 * 
 * const { logoutUser, isPending } = useLogout();
 * 
 * const handleLogout = () => {
 *   logoutUser();
 * };
 * ```
 * 
 * ============================================
 * FLUJO COMPLETO:
 * ============================================
 * 
 * 1. Usuario ingresa email/password
 * 2. handleSubmit llama a loginUser()
 * 3. Se hace POST a /auth/login
 * 4. Si es exitoso:
 *    - Se guarda el token en el store
 *    - Se guardan los datos del usuario
 *    - Se muestra toast de éxito
 *    - Se redirige según el rol (PATIENT -> /patient/dashboard, etc.)
 * 5. Si falla:
 *    - Se muestra toast de error
 *    - El formulario permanece disponible
 * 
 * ============================================
 * ROLES Y REDIRECCIÓN:
 * ============================================
 * 
 * El backend devuelve: "Paciente", "Doctor", "Administrador"
 * Se mapean a:         "PATIENT",  "DOCTOR", "CENTER"
 * 
 * La redirección automática va a:
 * - PATIENT -> ROUTES.PATIENT.HOME (/patient/dashboard)
 * - DOCTOR -> ROUTES.DOCTOR.HOME (/doctor/dashboard)
 * - CENTER -> ROUTES.CENTER.HOME (/center/dashboard)
 */

export {};
