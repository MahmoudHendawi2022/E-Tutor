import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useLessons } from "./LessonsContext";
import { usePlatformSettings } from "./PlatformSettingsContext";
import { paymentsService } from "../services/payments/payments.service";

const PaymentsContext = createContext(null);

export function PaymentsProvider({ children }) {
  const { lessons } = useLessons();
  const { settings } = usePlatformSettings();
  const [payments, setPayments] = useState(() => paymentsService.loadPayments());
  const [payouts, setPayouts] = useState(() => paymentsService.loadPayouts());

  useEffect(() => {
    paymentsService.savePayments(payments);
  }, [payments]);

  useEffect(() => {
    paymentsService.savePayouts(payouts);
  }, [payouts]);

  /* Release earnings only after the tutor manually changes the lesson status to completed. */
  useEffect(() => {
    const completedIds = new Set(
      lessons.filter((lesson) => lesson.status === "completed").map((lesson) => Number(lesson.id)),
    );
    setPayments((current) => {
      let changed = false;
      const next = current.map((payment) => {
        if (
          payment.paymentStatus === "paid" &&
          payment.fundStatus === "held" &&
          completedIds.has(Number(payment.lessonId))
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
      return changed ? next : current;
    });
  }, [lessons]);

  const createPayment = useCallback(
    ({
      lessonId,
      bookingId,
      studentId,
      tutorId,
      grossAmount,
      currency,
      method = "card",
      paymentStatus = "paid",
    }) => {
      const exists = payments.find((payment) => String(payment.bookingId) === String(bookingId));
      if (exists) return exists;

      const gross = paymentsService.money(grossAmount);
      const feeRate = paymentsService.number(settings.commissionRate);
      const platformFeeAmount = paymentsService.money((gross * feeRate) / 100);
      const tutorEarningAmount = paymentsService.money(gross - platformFeeAmount);
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
      setPayments((current) => [...current, payment]);
      return payment;
    },
    [payments, settings],
  );

  const markPaymentPaid = useCallback(
    (paymentId) => {
      setPayments((current) =>
        current.map((payment) => {
          if (payment.id !== paymentId) return payment;

          const lessonCompleted = lessons.some(
            (lesson) =>
              Number(lesson.id) === Number(payment.lessonId) &&
              lesson.status === "completed",
          );

          return {
            ...payment,
            paymentStatus: "paid",
            fundStatus: lessonCompleted ? "released" : "held",
            payoutStatus: lessonCompleted ? "available" : "not_available",
            paidAt: new Date().toISOString(),
            releasedAt: lessonCompleted ? new Date().toISOString() : payment.releasedAt,
          };
        }),
      );
    },
    [lessons],
  );

  const refundPayment = useCallback((paymentId, requestedAmount) => {
    let result = null;
    setPayments((current) =>
      current.map((payment) => {
        if (payment.id !== paymentId || !["paid", "partially_refunded"].includes(payment.paymentStatus)) {
          return payment;
        }
        /* A payout batch must be reversed/handled separately before refunding. */
        if (["pending", "paid"].includes(payment.payoutStatus)) {
          return payment;
        }
        const remaining = paymentsService.money(payment.grossAmount - paymentsService.number(payment.refundAmount));
        const amount = Math.min(remaining, Math.max(0, paymentsService.money(requestedAmount ?? remaining)));
        if (amount <= 0) return payment;
        const totalRefund = paymentsService.money(paymentsService.number(payment.refundAmount) + amount);
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
      }),
    );
    return result;
  }, []);

  const holdPaymentPayout = useCallback((paymentId) => {
    setPayments((current) =>
      current.map((payment) =>
        payment.id === paymentId ? { ...payment, payoutStatus: "held" } : payment,
      ),
    );
  }, []);

  const unholdPaymentPayout = useCallback((paymentId) => {
    setPayments((current) =>
      current.map((payment) =>
        payment.id === paymentId && payment.fundStatus === "released"
          ? { ...payment, payoutStatus: "available" }
          : payment,
      ),
    );
  }, []);

  const createTutorPayout = useCallback(
    (tutorId, paymentIds = null, requestedCurrency = null) => {
      const baseEligible = payments.filter(
        (payment) =>
          Number(payment.tutorId) === Number(tutorId) &&
          payment.paymentStatus !== "refunded" &&
          payment.fundStatus === "released" &&
          payment.payoutStatus === "available" &&
          (!paymentIds || paymentIds.includes(payment.id)),
      );

      if (!baseEligible.length) {
        return { success: false, message: "No available tutor earnings." };
      }

      const availableCurrencies = [
        ...new Set(
          baseEligible.map(
            (payment) => payment.currency || settings.defaultCurrency || "USD",
          ),
        ),
      ];

      if (!requestedCurrency && availableCurrencies.length > 1) {
        return {
          success: false,
          message: `This tutor has earnings in multiple currencies (${availableCurrencies.join(
            ", ",
          )}). Create one payout per currency.`,
        };
      }

      const currency =
        requestedCurrency || availableCurrencies[0] || settings.defaultCurrency || "USD";

      const eligible = baseEligible.filter(
        (payment) =>
          (payment.currency || settings.defaultCurrency || "USD") === currency,
      );

      if (!eligible.length) {
        return { success: false, message: `No available ${currency} earnings.` };
      }

      const amount = paymentsService.money(
        eligible.reduce((sum, payment) => {
          const netAfterRefund = Math.max(
            0,
            paymentsService.number(payment.grossAmount) - paymentsService.number(payment.refundAmount),
          );
          const ratio =
            paymentsService.number(payment.grossAmount) > 0
              ? netAfterRefund / paymentsService.number(payment.grossAmount)
              : 0;
          return sum + paymentsService.number(payment.tutorEarningAmount) * ratio;
        }, 0),
      );

      if (amount < paymentsService.number(settings.minimumPayout)) {
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

      setPayouts((current) => [payout, ...current]);
      setPayments((current) =>
        current.map((payment) =>
          payout.paymentIds.includes(payment.id)
            ? { ...payment, payoutStatus: "pending", payoutId: payout.id }
            : payment,
        ),
      );

      return { success: true, payout };
    },
    [payments, settings],
  );

  const markPayoutPaid = useCallback((payoutId) => {
    setPayouts((current) =>
      current.map((payout) =>
        payout.id === payoutId
          ? { ...payout, status: "paid", paidAt: new Date().toISOString() }
          : payout,
      ),
    );
    setPayments((current) =>
      current.map((payment) =>
        payment.payoutId === payoutId ? { ...payment, payoutStatus: "paid" } : payment,
      ),
    );
  }, []);

  const getPaymentByLessonId = useCallback(
    (lessonId) => payments.find((payment) => Number(payment.lessonId) === Number(lessonId)) || null,
    [payments],
  );
  const getPaymentsByTutorId = useCallback(
    (tutorId) => payments.filter((payment) => Number(payment.tutorId) === Number(tutorId)),
    [payments],
  );
  const getPaymentsByStudentId = useCallback(
    (studentId) => payments.filter((payment) => Number(payment.studentId) === Number(studentId)),
    [payments],
  );

  /*
    Financial totals are grouped by currency.
    We intentionally do NOT add USD + EGP + EUR together because that would
    produce misleading admin totals without a real FX conversion service.
  */
  const financialByCurrency = useMemo(() => {
    const currencies = new Set([
      ...payments.map((payment) => payment.currency || settings.defaultCurrency || "USD"),
      ...payouts.map((payout) => payout.currency || settings.defaultCurrency || "USD"),
      settings.defaultCurrency || "USD",
    ]);

    const result = {};

    currencies.forEach((currency) => {
      const currencyPayments = payments.filter(
        (payment) => (payment.currency || settings.defaultCurrency || "USD") === currency,
      );
      const currencyPayouts = payouts.filter(
        (payout) => (payout.currency || settings.defaultCurrency || "USD") === currency,
      );
      const paidLike = currencyPayments.filter((payment) =>
        ["paid", "partially_refunded", "refunded"].includes(payment.paymentStatus),
      );

      const grossBookings = paymentsService.money(
        paidLike.reduce((sum, payment) => sum + paymentsService.number(payment.grossAmount), 0),
      );
      const refunded = paymentsService.money(
        paidLike.reduce((sum, payment) => sum + paymentsService.number(payment.refundAmount), 0),
      );
      const netCollected = paymentsService.money(grossBookings - refunded);
      const platformRevenue = paymentsService.money(
        paidLike.reduce((sum, payment) => {
          const net = Math.max(
            0,
            paymentsService.number(payment.grossAmount) - paymentsService.number(payment.refundAmount),
          );
          const ratio = paymentsService.number(payment.grossAmount) > 0 ? net / paymentsService.number(payment.grossAmount) : 0;
          return sum + paymentsService.number(payment.platformFeeAmount) * ratio;
        }, 0),
      );
      const tutorEarnings = paymentsService.money(
        paidLike.reduce((sum, payment) => {
          const net = Math.max(
            0,
            paymentsService.number(payment.grossAmount) - paymentsService.number(payment.refundAmount),
          );
          const ratio = paymentsService.number(payment.grossAmount) > 0 ? net / paymentsService.number(payment.grossAmount) : 0;
          return sum + paymentsService.number(payment.tutorEarningAmount) * ratio;
        }, 0),
      );
      const pendingPayouts = paymentsService.money(
        currencyPayouts
          .filter((payout) => payout.status === "pending")
          .reduce((sum, payout) => sum + paymentsService.number(payout.amount), 0),
      );
      const paidPayouts = paymentsService.money(
        currencyPayouts
          .filter((payout) => payout.status === "paid")
          .reduce((sum, payout) => sum + paymentsService.number(payout.amount), 0),
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
  }, [payments, payouts, settings.defaultCurrency]);

  const financialSummary = useMemo(() => {
    const currency = settings.defaultCurrency || "USD";
    return (
      financialByCurrency[currency] || {
        currency,
        grossBookings: 0,
        refunded: 0,
        netCollected: 0,
        platformRevenue: 0,
        tutorEarnings: 0,
        pendingPayouts: 0,
        paidPayouts: 0,
      }
    );
  }, [financialByCurrency, settings.defaultCurrency]);

  const getTutorFinance = useCallback(
    (tutorId, currency = null) => {
      const list = getPaymentsByTutorId(tutorId).filter(
        (payment) =>
          !currency ||
          (payment.currency || settings.defaultCurrency || "USD") === currency,
      );
      const relatedPayouts = payouts.filter(
        (payout) =>
          Number(payout.tutorId) === Number(tutorId) &&
          (!currency ||
            (payout.currency || settings.defaultCurrency || "USD") === currency),
      );

      const gross = paymentsService.money(list.reduce((sum, payment) => sum + paymentsService.number(payment.grossAmount), 0));
      const refunded = paymentsService.money(
        list.reduce((sum, payment) => sum + paymentsService.number(payment.refundAmount), 0),
      );
      const available = paymentsService.money(
        list
          .filter((payment) => payment.payoutStatus === "available")
          .reduce((sum, payment) => {
            const net = Math.max(
              0,
              paymentsService.number(payment.grossAmount) - paymentsService.number(payment.refundAmount),
            );
            const ratio =
              paymentsService.number(payment.grossAmount) > 0 ? net / paymentsService.number(payment.grossAmount) : 0;
            return sum + paymentsService.number(payment.tutorEarningAmount) * ratio;
          }, 0),
      );
      const pending = paymentsService.money(
        relatedPayouts
          .filter((payout) => payout.status === "pending")
          .reduce((sum, payout) => sum + paymentsService.number(payout.amount), 0),
      );
      const paidOut = paymentsService.money(
        relatedPayouts
          .filter((payout) => payout.status === "paid")
          .reduce((sum, payout) => sum + paymentsService.number(payout.amount), 0),
      );
      const tutorEarnings = paymentsService.money(
        list.reduce((sum, payment) => {
          const net = Math.max(
            0,
            paymentsService.number(payment.grossAmount) - paymentsService.number(payment.refundAmount),
          );
          const ratio =
            paymentsService.number(payment.grossAmount) > 0 ? net / paymentsService.number(payment.grossAmount) : 0;
          return sum + paymentsService.number(payment.tutorEarningAmount) * ratio;
        }, 0),
      );
      const platformCommission = paymentsService.money(
        list.reduce((sum, payment) => {
          const net = Math.max(
            0,
            paymentsService.number(payment.grossAmount) - paymentsService.number(payment.refundAmount),
          );
          const ratio =
            paymentsService.number(payment.grossAmount) > 0 ? net / paymentsService.number(payment.grossAmount) : 0;
          return sum + paymentsService.number(payment.platformFeeAmount) * ratio;
        }, 0),
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
    },
    [getPaymentsByTutorId, payouts, settings.defaultCurrency],
  );

  const getTutorFinanceByCurrency = useCallback(
    (tutorId) => {
      const tutorPayments = getPaymentsByTutorId(tutorId);
      const tutorPayouts = payouts.filter(
        (payout) => Number(payout.tutorId) === Number(tutorId),
      );
      const currencies = [
        ...new Set([
          ...tutorPayments.map(
            (payment) => payment.currency || settings.defaultCurrency || "USD",
          ),
          ...tutorPayouts.map(
            (payout) => payout.currency || settings.defaultCurrency || "USD",
          ),
        ]),
      ];

      return currencies.reduce((result, currency) => {
        result[currency] = getTutorFinance(tutorId, currency);
        return result;
      }, {});
    },
    [getPaymentsByTutorId, getTutorFinance, payouts, settings.defaultCurrency],
  );

  const getStudentFinanceByCurrency = useCallback(
    (studentId) => {
      const list = getPaymentsByStudentId(studentId);
      const currencies = [
        ...new Set(
          list.map(
            (payment) => payment.currency || settings.defaultCurrency || "USD",
          ),
        ),
      ];

      return currencies.reduce((result, currency) => {
        const currencyPayments = list.filter(
          (payment) =>
            (payment.currency || settings.defaultCurrency || "USD") === currency,
        );
        const gross = paymentsService.money(
          currencyPayments.reduce(
            (sum, payment) => sum + paymentsService.number(payment.grossAmount),
            0,
          ),
        );
        const refunded = paymentsService.money(
          currencyPayments.reduce(
            (sum, payment) => sum + paymentsService.number(payment.refundAmount),
            0,
          ),
        );

        result[currency] = {
          currency,
          gross,
          refunded,
          netSpend: paymentsService.money(gross - refunded),
          paymentCount: currencyPayments.length,
        };
        return result;
      }, {});
    },
    [getPaymentsByStudentId, settings.defaultCurrency],
  );

  const value = useMemo(
    () => ({
      payments,
      payouts,
      financialSummary,
      financialByCurrency,
      createPayment,
      markPaymentPaid,
      refundPayment,
      holdPaymentPayout,
      unholdPaymentPayout,
      createTutorPayout,
      markPayoutPaid,
      getPaymentByLessonId,
      getPaymentsByTutorId,
      getPaymentsByStudentId,
      getTutorFinance,
      getTutorFinanceByCurrency,
      getStudentFinanceByCurrency,
    }),
    [
      payments,
      payouts,
      financialSummary,
      financialByCurrency,
      createPayment,
      markPaymentPaid,
      refundPayment,
      holdPaymentPayout,
      unholdPaymentPayout,
      createTutorPayout,
      markPayoutPaid,
      getPaymentByLessonId,
      getPaymentsByTutorId,
      getPaymentsByStudentId,
      getTutorFinance,
      getTutorFinanceByCurrency,
      getStudentFinanceByCurrency,
    ],
  );

  return <PaymentsContext.Provider value={value}>{children}</PaymentsContext.Provider>;
}

export function usePayments() {
  const context = useContext(PaymentsContext);
  if (!context) throw new Error("usePayments must be used inside PaymentsProvider");
  return context;
}
