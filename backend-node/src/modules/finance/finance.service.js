const repository = require('./finance.repository');

async function createInvoice(req) {
  await repository.createInvoice(req);
  return {
    statusCode: 501,
    payload: {
      message: 'finance.createInvoice belum diimplementasikan'
    }
  };
}

async function listInvoices(req) {
  await repository.listInvoices(req);
  return {
    statusCode: 501,
    payload: {
      message: 'finance.listInvoices belum diimplementasikan'
    }
  };
}

async function getInvoice(req) {
  await repository.getInvoice(req);
  return {
    statusCode: 501,
    payload: {
      message: 'finance.getInvoice belum diimplementasikan'
    }
  };
}

async function cancelInvoice(req) {
  await repository.cancelInvoice(req);
  return {
    statusCode: 501,
    payload: {
      message: 'finance.cancelInvoice belum diimplementasikan'
    }
  };
}

async function createPayment(req) {
  await repository.createPayment(req);
  return {
    statusCode: 501,
    payload: {
      message: 'finance.createPayment belum diimplementasikan'
    }
  };
}

async function listPayments(req) {
  await repository.listPayments(req);
  return {
    statusCode: 501,
    payload: {
      message: 'finance.listPayments belum diimplementasikan'
    }
  };
}

async function paymentWebhook(req) {
  await repository.paymentWebhook(req);
  return {
    statusCode: 501,
    payload: {
      message: 'finance.paymentWebhook belum diimplementasikan'
    }
  };
}

module.exports = {
  createInvoice,
  listInvoices,
  getInvoice,
  cancelInvoice,
  createPayment,
  listPayments,
  paymentWebhook
};
