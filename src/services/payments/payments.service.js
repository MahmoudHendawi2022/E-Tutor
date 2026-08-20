import { storageService } from "../storage/storage.service";

const PAYMENTS_KEY = "etutor_payments_v1";
const PAYOUTS_KEY = "etutor_payouts_v1";

const number = (value) => (Number.isFinite(Number(value)) ? Number(value) : 0);
const money = (value) => Math.round((number(value) + Number.EPSILON) * 100) / 100;

export const paymentsService = {
  loadPayments() {
    return storageService.getItem(PAYMENTS_KEY, []);
  },

  savePayments(payments) {
    storageService.setItem(PAYMENTS_KEY, payments);
  },

  loadPayouts() {
    return storageService.getItem(PAYOUTS_KEY, []);
  },

  savePayouts(payouts) {
    storageService.setItem(PAYOUTS_KEY, payouts);
  },

  number,
  money
};
