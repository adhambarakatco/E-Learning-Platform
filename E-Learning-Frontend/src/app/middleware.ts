import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const SECRET_KEY = "12a54731169d4b483466999f9c0977c874c5f846f00f6138ec2d110659379acd4110cda5772c2e66c9fb63b63f28f561d8dbd522f5894b85efd282290150be682ccbdfaffe319b4d3f4a61541075d1a250a8024d3d9fec1ac12fa6e6633ae53022a9effbc5f75a2a5c2fffb0ffe5bb5ed37129390764b6702849de0bfce4c51ab03eddf58cd19158941cc1d408e634506a44399cb9ea70182e506cddfeba2e0576a9b5c8246843792203f410f9de24baf37dfea4aa4ad03f7a96077e124abd2d5b6248e738b9bdf11ea4895e0a2c4158eb9e387dccf0b715e3d6f4df0d1fcf8e94e5f6ad6ae4a0fff5b383e342ca4580d1c99ed4209ecadcd5c682d39c2fa8eb2d07d9e9e06e4a1e8642fd40f07b8bd7ea1eaeea322ccb22f135cc94538911c73bedfec1715b79367216ae754dfbfdc618b79c0e36452b275231b8d6ac46f133ff489a2019bebbaaf9360623fc55e22d5e7e9eb5730d4de714923dda45bd7290"

interface JwtPayload {
  userId: string;
  role: string;
}

export function middleware(req:any) {
  const token = req.cookies.get('token');

  if (!token) {
    return NextResponse.redirect(new URL('/login', req.url)); // Redirect to login if no token
  }

  try {
    const payload = jwt.verify(token, SECRET_KEY) as JwtPayload;

    // Attach user data to headers
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set('user-id', payload.userId);
    requestHeaders.set('user-role', payload.role);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    console.error('Invalid token:', error);
    return NextResponse.redirect(new URL('/login', req.url)); // Redirect on token validation failure
  }
}

export const config = {
  matcher: [''], // Apply to specific routes
};