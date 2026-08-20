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
  money,

  releaseLessonPayments(payments, completedLessonIds) {
    let changed = false;
    const next = payments.map((payment) => {
      if (
        payment.paymentStatus === "paid" &&
        payment.fundStatus === "held" &&
        completedLessonIds.has(Number(payment.lessonId))
      ) {
        changed = true;
        return {
          ...payment,
          fundStatus: "released",
          payoutStatus: "available",
          releasedAt: new Date().toISOString(),
        };
      }
      return payment;
    });
    return { changed, list: next };
  },

  createPayment(payments, settings, {
    lessonId,
    bookingId,
    studentId,
    tutorId,
    grossAmount,
    currency,
    method = "card",
    paymentStatus = "paid",
  }) {
    const exists = payments.find((payment) => String(payment.bookingId) === String(bookingId));
    if (exists) return { payment: exists, list: payments, created: false };

    const gross = this.money(grossAmount);
    const feeRate = this.number(settings.commissionRate);
    const platformFeeAmount = this.money((gross * feeRate) / 100);
    const tutorEarningAmount = this.money(gross - platformFeeAmount);
    const paid = paymentStatus === "paid";
    const payment = {
      id: `PAY-${Date.now()}-${Math.floor(Math.random() * 900 + 100)}`,
      lessonId: Number(lessonId),
      bookingId,
      studentId: Number(studentId),
      tutorId: Number(tutorId),
      currency: currency || settings.defaultCurrency || "USD",
      grossAmount: gross,
      platformFeeRate: feeRate,
      platformFeeAmount,
      tutorEarningAmount,
      refundAmount: 0,
      method,
      paymentStatus,
      fundStatus: paid ? "held" : "unpaid",
      payoutStatus: "not_available",
      paidAt: paid ? new Date().toISOString() : null,
      releasedAt: null,
      refundedAt: null,
      payoutId: null,
      createdAt: new Date().toISOString(),
    };
    return { payment, list: [...payments, payment], created: true };
  },

  markPaymentPaid(payments, lessons, paymentId) {
    return payments.map((payment) => {
      if (payment.id !== paymentId) return payment;

      const lessonCompleted = lessons.some(
        (lesson) =>
          Number(lesson.id) === Number(payment.lessonId) &&
          lesson.status === "completed"
      );

      return {
        ...payment,
        paymentStatus: "paid",
        fundStatus: lessonCompleted ? "released" : "held",
        payoutStatus: lessonCompleted ? "available" : "not_available",
        paidAt: new Date().toISOString(),
        releasedAt: lessonCompleted ? new Date().toISOString() : payment.releasedAt,
      };
    });
  },

  refundPayment(payments, paymentId, requestedAmount) {
    let result = null;
    const list = payments.map((payment) => {
      if (payment.id !== paymentId || !["paid", "partially_refunded"].includes(payment.paymentStatus)) {
        return payment;
      }
      if (["pending", "paid"].includes(payment.payoutStatus)) {
        return payment;
      }
      const remaining = this.money(payment.grossAmount - this.number(payment.refundAmount));
      const amount = Math.min(remaining, Math.max(0, this.money(requestedAmount ?? remaining)));
      if (amount <= 0) return payment;
      const totalRefund = this.money(this.number(payment.refundAmount) + amount);
      const full = totalRefund >= payment.grossAmount;
      result = {
        ...payment,
        refundAmount: totalRefund,
        paymentStatus: full ? "refunded" : "partially_refunded",
        fundStatus: full ? "refunded" : payment.fundStatus,
        payoutStatus: full ? "not_available" : payment.payoutStatus,
        refundedAt: new Date().toISOString(),
      };
      return result;
    });
    return { success: !!result, payment: result, list };
  },

  createTutorPayout(payments, payouts, settings, tutorId, paymentIds = null, requestedCurrency = null) {
    const baseEligible = payments.filter(
      (payment) =>
        Number(payment.tutorId) === Number(tutorId) &&
        payment.paymentStatus !== "refunded" &&
        payment.fundStatus === "released" &&
        payment.payoutStatus === "available" &&
        (!paymentIds || paymentIds.includes(payment.id))
    );

    if (!baseEligible.length) {
      return { success: false, message: "No available tutor earnings." };
    }

    const availableCurrencies = [
      ...new Set(
        baseEligible.map(
          (payment) => payment.currency || settings.defaultCurrency || "USD"
        )
      )
    ];

    if (!requestedCurrency && availableCurrencies.length > 1) {
      return {
        success: false,
        message: `This tutor has earnings in multiple currencies (${availableCurrencies.join(
          ", "
        )}). Create one payout per currency.`,
      };
    }

    const currency =
      requestedCurrency || availableCurrencies[0] || settings.defaultCurrency || "USD";

    const eligible = baseEligible.filter(
      (payment) =>
        (payment.currency || settings.defaultCurrency || "USD") === currency
    );

    if (!eligible.length) {
      return { success: false, message: `No available ${currency} earnings.` };
    }

    const amount = this.money(
      eligible.reduce((sum, payment) => {
        const netAfterRefund = Math.max(
          0,
          this.number(payment.grossAmount) - this.number(payment.refundAmount)
        );
        const ratio =
          this.number(payment.grossAmount) > 0
            ? netAfterRefund / this.number(payment.grossAmount)
            : 0;
        return sum + this.number(payment.tutorEarningAmount) * ratio;
      }, 0)
    );

    if (amount < this.number(settings.minimumPayout)) {
      return {
        success: false,
        message: `Minimum payout is ${settings.minimumPayout} ${currency}.`,
      };
    }

    const payout = {
      id: `PO-${Date.now()}-${Math.floor(Math.random() * 900 + 100)}`,
      tutorId: Number(tutorId),
      paymentIds: eligible.map((payment) => payment.id),
      amount,
      currency,
      status: "pending",
      createdAt: new Date().toISOString(),
      paidAt: null,
    };

    const nextPayouts = [payout, ...payouts];
    const nextPayments = payments.map((payment) =>
      payout.paymentIds.includes(payment.id)
        ? { ...payment, payoutStatus: "pending", payoutId: payout.id }
        : payment
    );

    return { success: true, payout, nextPayouts, nextPayments };
  },

  calculateFinancialByCurrency(payments, payouts, defaultCurrency) {
    const defaultCurr = defaultCurrency || "USD";
    const currencies = new Set([
      ...payments.map((payment) => payment.currency || defaultCurr),
      ...payouts.map((payout) => payout.currency || defaultCurr),
      defaultCurr,
    ]);

    const result = {};

    currencies.forEach((currency) => {
      const currencyPayments = payments.filter(
        (payment) => (payment.currency || defaultCurr) === currency
      );
      const currencyPayouts = payouts.filter(
        (payout) => (payout.currency || defaultCurr) === currency
      );
      const paidLike = currencyPayments.filter((payment) =>
        ["paid", "partially_refunded", "refunded"].includes(payment.paymentStatus)
      );

      const grossBookings = this.money(
        paidLike.reduce((sum, payment) => sum + this.number(payment.grossAmount), 0)
      );
      const refunded = this.money(
        paidLike.reduce((sum, payment) => sum + this.number(payment.refundAmount), 0)
      );
      const netCollected = this.money(grossBookings - refunded);
      const platformRevenue = this.money(
        paidLike.reduce((sum, payment) => {
          const net = Math.max(
            0,
            this.number(payment.grossAmount) - this.number(payment.refundAmount)
          );
          const ratio = this.number(payment.grossAmount) > 0 ? net / this.number(payment.grossAmount) : 0;
          return sum + this.number(payment.platformFeeAmount) * ratio;
        }, 0)
      );
      const tutorEarnings = this.money(
        paidLike.reduce((sum, payment) => {
          const net = Math.max(
            0,
            this.number(payment.grossAmount) - this.number(payment.refundAmount)
          );
          const ratio = this.number(payment.grossAmount) > 0 ? net / this.number(payment.grossAmount) : 0;
          return sum + this.number(payment.tutorEarningAmount) * ratio;
        }, 0)
      );
      const pendingPayouts = this.money(
        currencyPayouts
          .filter((payout) => payout.status === "pending")
          .reduce((sum, payout) => sum + this.number(payout.amount), 0)
      );
      const paidPayouts = this.money(
        currencyPayouts
          .filter((payout) => payout.status === "paid")
          .reduce((sum, payout) => sum + this.number(payout.amount), 0)
      );

      result[currency] = {
        currency,
        grossBookings,
        refunded,
        netCollected,
        platformRevenue,
        tutorEarnings,
        pendingPayouts,
        paidPayouts,
      };
    });

    return result;
  },

  calculateTutorFinance(tutorId, payments, payouts, defaultCurrency, currency = null) {
    const defaultCurr = defaultCurrency || "USD";
    const tutorPayments = payments.filter((payment) => Number(payment.tutorId) === Number(tutorId));
    const list = tutorPayments.filter(
      (payment) =>
        !currency ||
        (payment.currency || defaultCurr) === currency
    );
    const relatedPayouts = payouts.filter(
      (payout) =>
        Number(payout.tutorId) === Number(tutorId) &&
        (!currency ||
          (payout.currency || defaultCurr) === currency)
    );

    const gross = this.money(list.reduce((sum, payment) => sum + this.number(payment.grossAmount), 0));
    const refunded = this.money(
      list.reduce((sum, payment) => sum + this.number(payment.refundAmount), 0)
    );
    const available = this.money(
      list
        .filter((payment) => payment.payoutStatus === "available")
        .reduce((sum, payment) => {
          const net = Math.max(
            0,
            this.number(payment.grossAmount) - this.number(payment.refundAmount)
          );
          const ratio =
            this.number(payment.grossAmount) > 0 ? net / this.number(payment.grossAmount) : 0;
          return sum + this.number(payment.tutorEarningAmount) * ratio;
        }, 0)
    );
    const pending = this.money(
      relatedPayouts
        .filter((payout) => payout.status === "pending")
        .reduce((sum, payout) => sum + this.number(payout.amount), 0)
    );
    const paidOut = this.money(
      relatedPayouts
        .filter((payout) => payout.status === "paid")
        .reduce((sum, payout) => sum + this.number(payout.amount), 0)
    );
    const tutorEarnings = this.money(
      list.reduce((sum, payment) => {
        const net = Math.max(
          0,
          this.number(payment.grossAmount) - this.number(payment.refundAmount)
        );
        const ratio =
          this.number(payment.grossAmount) > 0 ? net / this.number(payment.grossAmount) : 0;
        return sum + this.number(payment.tutorEarningAmount) * ratio;
      }, 0)
    );
    const platformCommission = this.money(
      list.reduce((sum, payment) => {
        const net = Math.max(
          0,
          this.number(payment.grossAmount) - this.number(payment.refundAmount)
        );
        const ratio =
          this.number(payment.grossAmount) > 0 ? net / this.number(payment.grossAmount) : 0;
        return sum + this.number(payment.platformFeeAmount) * ratio;
      }, 0)
    );

    return {
      currency,
      gross,
      refunded,
      tutorEarnings,
      platformCommission,
      available,
      pending,
      paidOut,
    };
  }
};
