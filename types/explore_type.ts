export interface ExplorePostDto {
    id: string;
    content: string;
    createdAt: Date;
    user: {
        nickname: string;
    };
}

export interface ExploreResponseDto {
    posts: ExplorePostDto[];
    totalCount: number;
    currentPage: number;
    totalPages: number;
}
