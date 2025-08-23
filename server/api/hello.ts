export default function handler(req: any, res: any) {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    message: 'Hello from Vercel!',
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url
  }));
}
