const { Router } = require('express');
const { asyncHandler } = require('../../utils/asyncHandler');
const { authenticate } = require('../../middlewares/authenticate');
const { authorizeRoles } = require('../../middlewares/authorizeRoles');
const controller = require('./finance.controller');

const router = Router();

router.post('/ukt/invoices', authenticate, authorizeRoles('admin'), asyncHandler(controller.createInvoice));
router.get('/ukt/invoices', authenticate, asyncHandler(controller.listInvoices));
router.get('/ukt/invoices/:invoiceId', authenticate, asyncHandler(controller.getInvoice));
router.patch('/ukt/invoices/:invoiceId/cancel', authenticate, authorizeRoles('admin'), asyncHandler(controller.cancelInvoice));
router.post('/ukt/invoices/:invoiceId/payments', authenticate, asyncHandler(controller.createPayment));
router.get('/ukt/invoices/:invoiceId/payments', authenticate, asyncHandler(controller.listPayments));
router.post('/ukt/payments/webhook', asyncHandler(controller.paymentWebhook));

module.exports = router;
