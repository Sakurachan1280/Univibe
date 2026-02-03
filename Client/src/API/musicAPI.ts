import axiosClient from "./axiosClient";

export interface UploadFile {
  uri: string;
  name: string;
  type: string;
}

export interface CreateSongPayload {
  title: string;
  artist: string;
  duration?: string;
  genre?: string;
  audio?: UploadFile;
  cover?: UploadFile;
}

export const createSongAPI = async (data: CreateSongPayload) => {
  const formData = new FormData();

  formData.append("title", data.title);
  formData.append("artist", data.artist);

  formData.append("audio", {
    uri: data.audio!.uri,
    name: data.audio!.name,
    type: data.audio!.type,
  } as any);

  formData.append("cover", {
    uri: data.cover!.uri,
    name: data.cover!.name,
    type: data.cover!.type,
  } as any);

  return axiosClient.post("/music/songs", formData);
};