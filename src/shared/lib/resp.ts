// Standardized API response helpers

export function respData(data: any) {
  return Response.json({ code: 0, data });
}

export function respErr(message: string, code = -1) {
  return Response.json({ code, message });
}
