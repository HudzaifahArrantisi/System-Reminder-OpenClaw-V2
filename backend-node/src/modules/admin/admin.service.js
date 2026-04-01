const repository = require('./admin.repository');

async function listUsers(req) {
  await repository.listUsers(req);
  return {
    statusCode: 501,
    payload: {
      message: 'admin.listUsers belum diimplementasikan'
    }
  };
}

async function createUser(req) {
  await repository.createUser(req);
  return {
    statusCode: 501,
    payload: {
      message: 'admin.createUser belum diimplementasikan'
    }
  };
}

async function updateUserStatus(req) {
  await repository.updateUserStatus(req);
  return {
    statusCode: 501,
    payload: {
      message: 'admin.updateUserStatus belum diimplementasikan'
    }
  };
}

async function auditLogs(req) {
  await repository.auditLogs(req);
  return {
    statusCode: 501,
    payload: {
      message: 'admin.auditLogs belum diimplementasikan'
    }
  };
}

module.exports = {
  listUsers,
  createUser,
  updateUserStatus,
  auditLogs
};
