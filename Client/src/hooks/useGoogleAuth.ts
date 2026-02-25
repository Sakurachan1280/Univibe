import * as WebBrowser from "expo-web-browser";
import * as AuthSession from "expo-auth-session";
import * as Crypto from "expo-crypto";
import { useEffect } from "react";

// Đóng cửa sổ browser sau khi xác thực OAuth thành công
WebBrowser.maybeCompleteAuthSession();

const GOOGLE_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID ?? "";

const discovery = {
    authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenEndpoint: "https://oauth2.googleapis.com/token",
};

/**
 * Hook xử lý Google OAuth flow trên Expo mobile.
 * - Dùng expo-auth-session để mở màn hình đăng nhập Google
 * - Nhận id_token và gọi callback onSuccess để gửi lên server
 */
export function useGoogleAuth(onSuccess: (idToken: string) => void) {
    // makeRedirectUri() tự động detect môi trường (Expo Go / standalone)
    const redirectUri = AuthSession.makeRedirectUri();

    const [request, response, promptAsync] = AuthSession.useAuthRequest(
        {
            clientId: GOOGLE_CLIENT_ID,
            redirectUri,
            responseType: AuthSession.ResponseType.IdToken,
            scopes: ["openid", "profile", "email"],
            extraParams: {
                nonce: Crypto.randomUUID(),
            },
        },
        discovery
    );

    useEffect(() => {
        if (response?.type === "success") {
            const idToken = response.params.id_token;
            if (idToken) {
                onSuccess(idToken);
            }
        }
    }, [response]);

    return {
        promptAsync,
        requestReady: !!request,
    };
}
