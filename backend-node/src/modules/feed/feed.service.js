const repository = require('./feed.repository');

async function listPosts(req) {
  await repository.listPosts(req);
  return {
    statusCode: 200,
    payload: [],
  };
}

async function createPost(req) {
  await repository.createPost(req);
  return {
    statusCode: 501,
    payload: {
      message: 'feed.createPost belum diimplementasikan'
    }
  };
}

async function getPost(req) {
  await repository.getPost(req);
  return {
    statusCode: 501,
    payload: {
      message: 'feed.getPost belum diimplementasikan'
    }
  };
}

async function updatePost(req) {
  await repository.updatePost(req);
  return {
    statusCode: 501,
    payload: {
      message: 'feed.updatePost belum diimplementasikan'
    }
  };
}

async function deletePost(req) {
  await repository.deletePost(req);
  return {
    statusCode: 501,
    payload: {
      message: 'feed.deletePost belum diimplementasikan'
    }
  };
}

async function likePost(req) {
  await repository.likePost(req);
  return {
    statusCode: 501,
    payload: {
      message: 'feed.likePost belum diimplementasikan'
    }
  };
}

async function unlikePost(req) {
  await repository.unlikePost(req);
  return {
    statusCode: 501,
    payload: {
      message: 'feed.unlikePost belum diimplementasikan'
    }
  };
}

async function listComments(req) {
  await repository.listComments(req);
  return {
    statusCode: 501,
    payload: {
      message: 'feed.listComments belum diimplementasikan'
    }
  };
}

async function createComment(req) {
  await repository.createComment(req);
  return {
    statusCode: 501,
    payload: {
      message: 'feed.createComment belum diimplementasikan'
    }
  };
}

async function updateComment(req) {
  await repository.updateComment(req);
  return {
    statusCode: 501,
    payload: {
      message: 'feed.updateComment belum diimplementasikan'
    }
  };
}

async function deleteComment(req) {
  await repository.deleteComment(req);
  return {
    statusCode: 501,
    payload: {
      message: 'feed.deleteComment belum diimplementasikan'
    }
  };
}

module.exports = {
  listPosts,
  createPost,
  getPost,
  updatePost,
  deletePost,
  likePost,
  unlikePost,
  listComments,
  createComment,
  updateComment,
  deleteComment
};
