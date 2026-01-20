import api from "./api.client";
import type { Genre, ApiResponse } from "@/types";

export async function getGenres() {
    const { data } = await api.get<ApiResponse<Genre[]>>("/genres");
    return data;
}

export async function getGenre(slug: string) {
    const { data } = await api.get<ApiResponse<Genre>>(`/genres/${slug}`);
    return data;
}
