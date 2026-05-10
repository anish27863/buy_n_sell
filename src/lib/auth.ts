import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const secretKey = process.env.JWT_SECRET!;
const key = new TextEncoder().encode(secretKey);

export type UserJwtPayload = {
  id: number;
  username: string;
  role: 'customer' | 'seller' | 'admin';
  approvalStatus?: 'pending' | 'approved' | 'rejected';
};

export async function encrypt(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(key);
}

export async function decrypt(input: string): Promise<UserJwtPayload | null> {
  try {
    const { payload } = await jwtVerify(input, key, {
      algorithms: ['HS256'],
    });
    return payload as unknown as UserJwtPayload;
  } catch (error) {
    return null;
  }
}

export async function setAuthCookie(user: UserJwtPayload) {
  const token = await encrypt(user);
  (await cookies()).set('bazaar_auth', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24, // 24 hours
  });
}

export async function getSession(): Promise<UserJwtPayload | null> {
  const token = (await cookies()).get('bazaar_auth')?.value;
  if (!token) return null;
  return await decrypt(token);
}

export async function logout() {
  (await cookies()).delete('bazaar_auth');
}
