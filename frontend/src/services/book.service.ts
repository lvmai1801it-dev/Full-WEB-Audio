import api from "./api.client";
import type { Book, ApiResponse, PaginatedResponse } from "@/types";

export interface GetBooksParams {
    page?: number;
    limit?: number;
    sort?: string;
    search?: string;
    genre?: string;
}

export async function getBooks(params?: GetBooksParams) {
    const { data } = await api.get<PaginatedResponse<Book>>("/books", { params });
    return data;
}

export async function getBook(slug: string) {
    const { data } = await api.get<ApiResponse<Book>>(`/books/${slug}`);
    return data;
}

export async function getBooksByAuthor(authorSlug: string, params?: GetBooksParams) {
    // Assuming backend supports filter by author via params or specific endpoint
    // For now, let's use search or custom param if backend supports, otherwise mock specific endpoint structure
    // Based on previous conversations, general /books endpoint might filter
    return getBooks({ ...params, search: authorSlug }); // Placeholder behavior
}
