import axiosClient from "./axiosClient";

export interface UserProfile {
    display_name: string;
    avatar_url: string;
    cover_url: string;
    bio: string;
    dob?: Date;
    genres_interest: string[];
    social_links: {
        instagram: string;
        spotify: string;
        facebook: string;
    };
}

export interface User {
    _id: string;
    username: string;
    email: string;
    phone?: string;
    auth_provider: string;
    profile: UserProfile;
    role: "user" | "admin";
    created_at: Date;
    updated_at: Date;
}

export const getMeAPI = async (): Promise<User | null> => {
    const res = await axiosClient.get("/users/me");
    return res.data;
};

export const updateProfileAPI = async (formData: FormData): Promise<User> => {
    const res = await axiosClient.put("/users/profile", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
    return res.data;
};
