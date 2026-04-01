const fs = require('fs');
const path = require('path');

const base = path.resolve(__dirname, '../src/modules');

const defs = {
  auth: ['register', 'login', 'refresh', 'logout', 'me'],
  users: ['getMe', 'updateMe'],
  profiles: [
    'getPublicProfile',
    'updateMahasiswaProfile',
    'updateDosenProfile',
    'updateAdminProfile',
    'updateOrtuProfile',
    'updateUkmProfile',
    'updateOrmawaProfile',
    'getChildren',
  ],
  feed: [
    'listPosts',
    'createPost',
    'getPost',
    'updatePost',
    'deletePost',
    'likePost',
    'unlikePost',
    'listComments',
    'createComment',
    'updateComment',
    'deleteComment',
  ],
  courses: [
    'listCourses',
    'createCourse',
    'getCourse',
    'updateCourse',
    'listEnrollments',
    'addEnrollment',
    'removeEnrollment',
    'listMeetings',
    'createMeeting',
  ],
  attendance: [
    'createSession',
    'openSession',
    'closeSession',
    'getSession',
    'scanAttendance',
    'manualRecord',
    'courseRecap',
    'studentRecap',
  ],
  learning: [
    'listMeetingContents',
    'createMaterial',
    'createTask',
    'updateContent',
    'deleteContent',
    'listTaskSubmissions',
    'createTaskSubmission',
    'gradeSubmission',
  ],
  finance: [
    'createInvoice',
    'listInvoices',
    'getInvoice',
    'cancelInvoice',
    'createPayment',
    'listPayments',
    'paymentWebhook',
  ],
  admin: ['listUsers', 'createUser', 'updateUserStatus', 'auditLogs'],
};

for (const [moduleName, functions] of Object.entries(defs)) {
  const moduleDir = path.join(base, moduleName);

  const controllerPath = path.join(moduleDir, `${moduleName}.controller.js`);
  const servicePath = path.join(moduleDir, `${moduleName}.service.js`);
  const repositoryPath = path.join(moduleDir, `${moduleName}.repository.js`);

  const controllerParts = [
    "const { success, errorPayload } = require('../../utils/apiResponse');",
    `const service = require('./${moduleName}.service');`,
    '',
  ];

  for (const fn of functions) {
    controllerParts.push(
      `async function ${fn}(req, res) {`,
      `  const data = await service.${fn}(req);`,
      '  const statusCode = data.statusCode || 200;',
      '  if (statusCode >= 400) {',
      "    const code = data.errorCode || 'REQUEST_FAILED';",
      "    const message = data.payload?.message || 'Request gagal';",
      '    const details = data.payload?.details || null;',
      '    return res.status(statusCode).json(errorPayload(code, message, details, res.locals.traceId));',
      '  }',
      '  return res.status(statusCode).json(success(data.payload, data.meta || {}, res.locals.traceId));',
      '}',
      ''
    );
  }

  controllerParts.push('module.exports = {');
  controllerParts.push(`  ${functions.join(',\n  ')}`);
  controllerParts.push('};');

  const serviceParts = [`const repository = require('./${moduleName}.repository');`, ''];

  for (const fn of functions) {
    serviceParts.push(
      `async function ${fn}(req) {`,
      `  await repository.${fn}(req);`,
      '  return {',
      '    statusCode: 501,',
      '    payload: {',
      `      message: '${moduleName}.${fn} belum diimplementasikan'`,
      '    }',
      '  };',
      '}',
      ''
    );
  }

  serviceParts.push('module.exports = {');
  serviceParts.push(`  ${functions.join(',\n  ')}`);
  serviceParts.push('};');

  const repositoryParts = [];

  for (const fn of functions) {
    repositoryParts.push(
      `async function ${fn}(_req) {`,
      '  return null;',
      '}',
      ''
    );
  }

  repositoryParts.push('module.exports = {');
  repositoryParts.push(`  ${functions.join(',\n  ')}`);
  repositoryParts.push('};');

  fs.writeFileSync(controllerPath, `${controllerParts.join('\n')}\n`, 'utf8');
  fs.writeFileSync(servicePath, `${serviceParts.join('\n')}\n`, 'utf8');
  fs.writeFileSync(repositoryPath, `${repositoryParts.join('\n')}\n`, 'utf8');
}

console.log('Module stubs generated.');
