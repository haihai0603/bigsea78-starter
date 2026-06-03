import { NextResponse } from 'next/server';

export function respData(data: any) {
  return NextResponse.json({ code: 0, data });
}

export function respErr(message: string, code = -1) {
  return NextResponse.json({ code, message });
}
