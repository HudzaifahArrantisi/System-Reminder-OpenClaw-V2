const repository = require('./courses.repository');

async function listCourses(req) {
  const rows = await repository.listCourses(req);
  return {
    statusCode: 200,
    payload: rows,
  };
}

async function createCourse(req) {
  await repository.createCourse(req);
  return {
    statusCode: 501,
    payload: {
      message: 'courses.createCourse belum diimplementasikan'
    }
  };
}

async function getCourse(req) {
  const item = await repository.getCourse(req);
  if (!item) {
    return {
      statusCode: 404,
      errorCode: 'COURSE_NOT_FOUND',
      payload: {
        message: 'Mata kuliah tidak ditemukan',
      },
    };
  }

  return {
    statusCode: 200,
    payload: item,
  };
}

async function updateCourse(req) {
  await repository.updateCourse(req);
  return {
    statusCode: 501,
    payload: {
      message: 'courses.updateCourse belum diimplementasikan'
    }
  };
}

async function listEnrollments(req) {
  await repository.listEnrollments(req);
  return {
    statusCode: 501,
    payload: {
      message: 'courses.listEnrollments belum diimplementasikan'
    }
  };
}

async function addEnrollment(req) {
  await repository.addEnrollment(req);
  return {
    statusCode: 501,
    payload: {
      message: 'courses.addEnrollment belum diimplementasikan'
    }
  };
}

async function removeEnrollment(req) {
  await repository.removeEnrollment(req);
  return {
    statusCode: 501,
    payload: {
      message: 'courses.removeEnrollment belum diimplementasikan'
    }
  };
}

async function listMeetings(req) {
  const rows = await repository.listMeetings(req);
  return {
    statusCode: 200,
    payload: rows,
  };
}

async function createMeeting(req) {
  await repository.createMeeting(req);
  return {
    statusCode: 501,
    payload: {
      message: 'courses.createMeeting belum diimplementasikan'
    }
  };
}

module.exports = {
  listCourses,
  createCourse,
  getCourse,
  updateCourse,
  listEnrollments,
  addEnrollment,
  removeEnrollment,
  listMeetings,
  createMeeting
};
