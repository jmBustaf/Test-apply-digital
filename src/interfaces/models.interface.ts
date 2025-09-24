export interface JwtPayload {
  sub: string;
  userName: string;
  role: 'admin' | 'user';
}

export interface IPayload {
  userId: string;
  userName: string;
  role: 'admin' | 'user';
}
