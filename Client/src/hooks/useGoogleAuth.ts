import * as WebBrowser from "expo-web-browser";
import * as AuthSession from "expo-auth-session";
import { useEffect } from "react";

// Đóng cửa sổ browser sau khi xác thực OAuth thành công
WebBrowser.maybeCompleteAuthSession();

const GOOGLE_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID ?? "146828788136-k7r446b057t137p6s84t9qj23543445u.apps.googleusercontent.com";

// Hardcode Google discovery endpoints
const discovery = {
    authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenEndpoint: "https://oauth2.googleapis.com/token",
    revocationEndpoint: "https://oauth2.googleapis.com/revoke",
};

/**
 * Hook xử lý Google OAuth flow trên Expo mobile.
 * - Dùng Authorization Code + PKCE
 * - Development build / Production → dùng custom scheme univibe://
 * - NOTE: auth.expo.io proxy đã bị tắt từ Expo SDK 49+, không dùng được nữa
 */
export function useGoogleAuth(onSuccess: (code: string, redirectUri: string, codeVerifier?: string) => void) {
    // Dùng custom scheme univibe:// — hoạt động trên dev build và production build
    const redirectUri = AuthSession.makeRedirectUri({ scheme: "univibe" });

    console.log("[Google OAuth] redirectUri:", redirectUri);
    console.log("[Google OAuth] clientId:", GOOGLE_CLIENT_ID);

    const [request, response, promptAsync] = AuthSession.useAuthRequest(
        {
            clientId: GOOGLE_CLIENT_ID,
            redirectUri,
            responseType: AuthSession.ResponseType.Code,
            scopes: ["openid", "profile", "email"],
            usePKCE: true,
        },
        discovery
    );

    useEffect(() => {
        if (response?.type === "success") {
            const { code } = response.params;
            console.log("[Google OAuth] Nhận được code:", code ? "✅" : "❌");
            if (code) {
                // Truyền cả codeVerifier (PKCE) sang server
                onSuccess(code, redirectUri, request?.codeVerifier ?? undefined);
            }
        } else if (response?.type === "error") {
            console.error("[Google OAuth] Lỗi:", JSON.stringify(response.error));
        } else if (response?.type === "dismiss") {
            console.log("[Google OAuth] Người dùng đóng cửa sổ đăng nhập");
        }
    }, [response]);

    return {
        promptAsync,
        requestReady: !!request,
    };
}

