export interface CreateInviteDto {
    toUserEmail: string;
}

export interface InviteUserDto {
    id: string;
    nickname: string;
    email: string;
}

export interface InviteResponseDto {
    id: string;
    fromUser: InviteUserDto;
    toUser: InviteUserDto;
    createdAt: Date;
}

export interface InviteListResponseDto {
    invites: InviteResponseDto[];
    totalCount: number;
}

export interface InviteLinkResponseDto {
    inviteUrl: string;
}

export interface InviteCodeDto {
    code: string;
    fromUserId: string;
    toUserId: string | null;
    createdAt: Date;
    expiresAt: Date;
}
