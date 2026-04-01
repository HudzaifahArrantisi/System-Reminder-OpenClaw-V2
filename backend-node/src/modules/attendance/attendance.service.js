const repository = require('./attendance.repository');

async function createSession(req) {
  await repository.createSession(req);
  return {
    statusCode: 501,
    payload: {
      message: 'attendance.createSession belum diimplementasikan'
    }
  };
}

async function openSession(req) {
  await repository.openSession(req);
  return {
    statusCode: 501,
    payload: {
      message: 'attendance.openSession belum diimplementasikan'
    }
  };
}

async function closeSession(req) {
  await repository.closeSession(req);
  return {
    statusCode: 501,
    payload: {
      message: 'attendance.closeSession belum diimplementasikan'
    }
  };
}

async function getSession(req) {
  await repository.getSession(req);
  return {
    statusCode: 501,
    payload: {
      message: 'attendance.getSession belum diimplementasikan'
    }
  };
}

async function scanAttendance(req) {
  await repository.scanAttendance(req);
  return {
    statusCode: 501,
    payload: {
      message: 'attendance.scanAttendance belum diimplementasikan'
    }
  };
}

async function manualRecord(req) {
  await repository.manualRecord(req);
  return {
    statusCode: 501,
    payload: {
      message: 'attendance.manualRecord belum diimplementasikan'
    }
  };
}

async function courseRecap(req) {
  await repository.courseRecap(req);
  return {
    statusCode: 501,
    payload: {
      message: 'attendance.courseRecap belum diimplementasikan'
    }
  };
}

async function studentRecap(req) {
  await repository.studentRecap(req);
  return {
    statusCode: 501,
    payload: {
      message: 'attendance.studentRecap belum diimplementasikan'
    }
  };
}

module.exports = {
  createSession,
  openSession,
  closeSession,
  getSession,
  scanAttendance,
  manualRecord,
  courseRecap,
  studentRecap
};
