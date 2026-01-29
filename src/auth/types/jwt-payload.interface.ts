export interface JwtPayload {
  sub: string;
  email: string;
}

export interface CurrentUserPayload {
  userId: string;
  email: string;
}
