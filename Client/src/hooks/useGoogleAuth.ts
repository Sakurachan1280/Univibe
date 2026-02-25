import * as WebBrowser from "expo-web-browser";
import * as AuthSession from "expo-auth-session";
import { useEffect } from "react";

// Đóng cửa sổ browser sau khi xác thực OAuth thành công
WebBrowser.maybeCompleteAuthSession();

const GOOGLE_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID ?? "";

// Expo proxy redirect URI cho Expo Go (Google chấp nhận https://)
const EXPO_PROXY_REDIRECT = "https://auth.expo.io/@Minh11_01/univibe";

// Hardcode Google discovery endpoints (không dùng useAutoDiscovery để tránh hook ngoài component)
const discovery = {
    authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenEndpoint: "https://oauth2.googleapis.com/token",
    revocationEndpoint: "https://oauth2.googleapis.com/revoke",
};

/**
 * Hook xử lý Google OAuth flow trên Expo mobile.
 * - Dùng Authorization Code + PKCE (Google yêu cầu từ 2022+, không còn implicit flow)
 * - Expo Go → redirect qua proxy https://auth.expo.io
 * - Dev build / Production → dùng custom scheme univibe://
 */
export function useGoogleAuth(onSuccess: (code: string, redirectUri: string) => void) {
    // Detect Expo Go bằng __DEV__ + check xem URI có scheme exp:// không
    const testRedirectUri = AuthSession.makeRedirectUri({ scheme: "univibe" });
    const isExpoGo = testRedirectUri.startsWith("exp://");

    // Chọn redirect URI phù hợp
    const redirectUri = isExpoGo ? EXPO_PROXY_REDIRECT : testRedirectUri;

    console.log("[Google OAuth] isExpoGo:", isExpoGo);
    console.log("[Google OAuth] redirectUri:", redirectUri);
    console.log("[Google OAuth] clientId:", GOOGLE_CLIENT_ID);

    const [request, response, promptAsync] = AuthSession.useAuthRequest(
        {
            clientId: GOOGLE_CLIENT_ID,
            redirectUri,
            responseType: AuthSession.ResponseType.Code,
            scopes: ["openid", "profile", "email"],
            usePKCE: false, // Expo proxy (auth.expo.io) không hỗ trợ PKCE
        },
        discovery
    );

    useEffect(() => {
        if (response?.type === "success") {
            const { code } = response.params;
            console.log("[Google OAuth] Nhận được code:", code ? "✅" : "❌");
            if (code) {
                onSuccess(code, redirectUri);
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
