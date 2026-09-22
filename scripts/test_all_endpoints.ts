import http from 'http';

function request(path: string, method = 'GET', body?: any): Promise<{ status: number; data: any }> {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : undefined;
    const req = http.request(
      {
        hostname: 'localhost',
        port: 5000,
        path,
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {}),
        },
      },
      (res) => {
        let raw = '';
        res.on('data', (chunk) => (raw += chunk));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode || 500, data: JSON.parse(raw) });
          } catch {
            resolve({ status: res.statusCode || 500, data: raw });
          }
        });
      }
    );

    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

async function run() {
  console.log('🧪 TESTING ALL BACKEND API ENDPOINTS...');
  const tests = [
    { name: 'GET /api/dashboard', path: '/api/dashboard', method: 'GET' },
    { name: 'GET /api/tracks', path: '/api/tracks', method: 'GET' },
    { name: 'GET /api/weeks', path: '/api/weeks', method: 'GET' },
    { name: 'GET /api/weeks/1', path: '/api/weeks/1', method: 'GET' },
    { name: 'GET /api/days?limit=10', path: '/api/days?limit=10', method: 'GET' },
    { name: 'GET /api/days/1', path: '/api/days/1', method: 'GET' },
    { name: 'GET /api/days/200', path: '/api/days/200', method: 'GET' },
    { name: 'GET /api/tasks/101', path: '/api/tasks/101', method: 'GET' },
    { name: 'GET /api/tasks/201', path: '/api/tasks/201', method: 'GET' },
    { name: 'GET /api/tasks/20001', path: '/api/tasks/20001', method: 'GET' },
    { name: 'GET /api/leetcode', path: '/api/leetcode', method: 'GET' },
    { name: 'GET /api/leetcode/stats', path: '/api/leetcode/stats', method: 'GET' },
    { name: 'GET /api/notes', path: '/api/notes', method: 'GET' },
    { name: 'GET /api/projects', path: '/api/projects', method: 'GET' },
    { name: 'GET /api/auth/me', path: '/api/auth/me', method: 'GET' },
  ];

  let passed = 0;
  let failed = 0;

  for (const t of tests) {
    try {
      const res = await request(t.path, t.method);
      if (res.status >= 200 && res.status < 300) {
        console.log(`  ✅ [${res.status}] ${t.name}`);
        passed++;
      } else {
        console.error(`  ❌ [${res.status}] ${t.name}:`, res.data);
        failed++;
      }
    } catch (err: any) {
      console.error(`  ❌ ERROR ${t.name}:`, err.message);
      failed++;
    }
  }

  console.log(`\nEndpoint Results: ${passed} passed, ${failed} failed.`);
  if (failed > 0) process.exit(1);
}

run();
