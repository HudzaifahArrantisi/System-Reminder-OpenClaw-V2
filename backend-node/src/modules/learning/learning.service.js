const repository = require('./learning.repository');

async function listMeetingContents(req) {
  await repository.listMeetingContents(req);
  return {
    statusCode: 501,
    payload: {
      message: 'learning.listMeetingContents belum diimplementasikan'
    }
  };
}

async function createMaterial(req) {
  await repository.createMaterial(req);
  return {
    statusCode: 501,
    payload: {
      message: 'learning.createMaterial belum diimplementasikan'
    }
  };
}

async function createTask(req) {
  await repository.createTask(req);
  return {
    statusCode: 501,
    payload: {
      message: 'learning.createTask belum diimplementasikan'
    }
  };
}

async function updateContent(req) {
  await repository.updateContent(req);
  return {
    statusCode: 501,
    payload: {
      message: 'learning.updateContent belum diimplementasikan'
    }
  };
}

async function deleteContent(req) {
  await repository.deleteContent(req);
  return {
    statusCode: 501,
    payload: {
      message: 'learning.deleteContent belum diimplementasikan'
    }
  };
}

async function listTaskSubmissions(req) {
  const result = await repository.listTaskSubmissions(req);

  if (result?.taskNotFound) {
    return {
      statusCode: 404,
      errorCode: 'NOT_FOUND',
      payload: {
        message: 'Tugas tidak ditemukan',
      },
    };
  }

  if (result?.forbidden) {
    return {
      statusCode: 403,
      errorCode: 'FORBIDDEN',
      payload: {
        message: 'Anda tidak memiliki akses ke pengumpulan tugas ini',
      },
    };
  }

  return {
    statusCode: 200,
    payload: result,
  };
}

async function createTaskSubmission(req) {
  await repository.createTaskSubmission(req);
  return {
    statusCode: 501,
    payload: {
      message: 'learning.createTaskSubmission belum diimplementasikan'
    }
  };
}

async function gradeSubmission(req) {
  await repository.gradeSubmission(req);
  return {
    statusCode: 501,
    payload: {
      message: 'learning.gradeSubmission belum diimplementasikan'
    }
  };
}

async function listTugasByPertemuan(req) {
  const rows = await repository.listTugasByPertemuan(req);
  return {
    statusCode: 200,
    payload: rows,
  };
}

async function listTugas(req) {
  const rows = await repository.listTugas(req);
  return {
    statusCode: 200,
    payload: rows,
  };
}

async function createLegacyTask(req) {
  const result = await repository.createLegacyTask(req);

  if (result?.missingFields) {
    return {
      statusCode: 400,
      errorCode: 'VALIDATION_ERROR',
      payload: {
        message: 'pertemuan_id, title, dan deadline wajib diisi',
      },
    };
  }

  if (result?.pertemuanNotFound) {
    return {
      statusCode: 404,
      errorCode: 'NOT_FOUND',
      payload: {
        message: 'Pertemuan tidak ditemukan',
      },
    };
  }

  return {
    statusCode: 201,
    payload: {
      message: 'Tugas berhasil diupload',
      tugas: result.tugas,
    },
  };
}

async function submitLegacyTask(req) {
  const result = await repository.submitLegacyTask(req);

  if (result?.fileMissing) {
    return {
      statusCode: 400,
      errorCode: 'VALIDATION_ERROR',
      payload: {
        message: 'File jawaban wajib diupload',
      },
    };
  }

  if (result?.tugasNotFound) {
    return {
      statusCode: 404,
      errorCode: 'NOT_FOUND',
      payload: {
        message: 'Tugas tidak ditemukan',
      },
    };
  }

  if (result?.alreadySubmitted) {
    return {
      statusCode: 409,
      errorCode: 'CONFLICT',
      payload: {
        message: 'Tugas sudah pernah dikumpulkan',
      },
    };
  }

  return {
    statusCode: 201,
    payload: {
      message: 'Tugas berhasil dikumpulkan',
      submission: result.submission,
    },
  };
}

async function listOpenClawTaskStatus(req) {
  const rows = await repository.listOpenClawTaskStatus(req);
  return {
    statusCode: 200,
    payload: rows,
  };
}

module.exports = {
  listMeetingContents,
  createMaterial,
  createTask,
  updateContent,
  deleteContent,
  listTaskSubmissions,
  createTaskSubmission,
  gradeSubmission,
  listTugasByPertemuan,
  listTugas,
  createLegacyTask,
  submitLegacyTask,
  listOpenClawTaskStatus,
};
