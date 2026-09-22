// Test Suite for Project Studio & Interactive Buttons
import { query, getOne, getAll } from './src/db';

const API_BASE = 'http://127.0.0.1:5000/api';

async function runProjectStudioTests() {
  console.log('====================================================');
  console.log('🧪 TESTING PROJECT STUDIO BUTTONS & API ENDPOINTS');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, extraInfo?: any) {
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName}`, extraInfo !== undefined ? extraInfo : '');
      failed++;
    }
  }

  try {
    // 1. Authenticate with Demo Account
    const loginRes = await fetch(`${API_BASE}/auth/demo-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: 1 }),
    }).then((r) => r.json());

    const token = loginRes.token;
    assert(!!token, 'Obtained authentication token for Demo Scholar');

    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };

    // 2. Fetch Projects List
    const projects = await fetch(`${API_BASE}/projects`, { headers }).then((r) => r.json());
    assert(Array.isArray(projects) && projects.length === 6, `Projects list fetched (Count: ${projects.length})`);
    
    const firstProject = projects[0];
    assert(firstProject && firstProject.title.includes('Java In-Memory Database'), `First project identified: "${firstProject.title}"`);

    // 3. Test Button Action: Update Project Progress to IN_PROGRESS
    const updateRes = await fetch(`${API_BASE}/projects/${firstProject.id}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({
        status: 'IN_PROGRESS',
        repoUrl: 'https://github.com/scholar/java-inmemory-db',
        demoUrl: 'https://java-db.demo.dev',
        notes: 'Implemented custom B+ Tree and concurrent transaction manager.',
      }),
    }).then((r) => r.json());

    assert(updateRes.projectId === firstProject.id, `PATCH /api/projects/:id updated successfully (ID: ${updateRes.projectId})`);
    assert(updateRes.status === 'IN_PROGRESS', `Project status changed to IN_PROGRESS`);

    // 4. Verify Database Persistence of Updated Fields
    const persistedProjects = await fetch(`${API_BASE}/projects`, { headers }).then((r) => r.json());
    const updatedProject = persistedProjects.find((p: any) => p.id === firstProject.id);

    assert(updatedProject.status === 'IN_PROGRESS', `Persisted status is 'IN_PROGRESS'`);
    assert(updatedProject.repo_url === 'https://github.com/scholar/java-inmemory-db', `Persisted repo_url matches`);
    assert(updatedProject.demo_url === 'https://java-db.demo.dev', `Persisted demo_url matches`);
    assert(updatedProject.user_notes?.includes('B+ Tree'), `Persisted user_notes matches`);

    // 5. Test Button Action: Quick Complete Project (COMPLETED)
    const completeRes = await fetch(`${API_BASE}/projects/${firstProject.id}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({
        status: 'COMPLETED',
        repoUrl: 'https://github.com/scholar/java-inmemory-db',
        demoUrl: 'https://java-db.demo.dev',
        notes: 'Completed all unit tests and benchmarked 100k ops/sec.',
      }),
    }).then((r) => r.json());

    assert(completeRes.status === 'COMPLETED', `Quick Complete button action changed status to COMPLETED`);

    const recheck = await fetch(`${API_BASE}/projects`, { headers }).then((r) => r.json());
    const completedProj = recheck.find((p: any) => p.id === firstProject.id);
    assert(completedProj.status === 'COMPLETED', `Rechecked project status is strictly 'COMPLETED'`);

    // 6. Reset back to PENDING for clean state
    await fetch(`${API_BASE}/projects/${firstProject.id}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({
        status: 'PENDING',
        repoUrl: '',
        demoUrl: '',
        notes: '',
      }),
    });
    console.log('🧹 Cleaned up test project status back to PENDING');

  } catch (err) {
    console.error('Fatal Error during project studio test:', err);
    failed++;
  }

  console.log('\n====================================================');
  console.log(`📊 PROJECT STUDIO TEST SUMMARY: ${passed} PASSED | ${failed} FAILED`);
  console.log('====================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runProjectStudioTests();
