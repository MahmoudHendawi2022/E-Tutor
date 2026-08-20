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
      const { changed, list } = paymentsService.releaseLessonPayments(current, completedIds);
      return changed ? list : current;
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
      let res;
      setPayments((current) => {
        res = paymentsService.createPayment(current, settings, {
          lessonId,
          bookingId,
          studentId,
          tutorId,
          grossAmount,
          currency,
          method,
          paymentStatus,
        });
        return res.list;
      });
      return res?.payment;
    },
    [settings],
  );

  const markPaymentPaid = useCallback(
    (paymentId) => {
      setPayments((current) => paymentsService.markPaymentPaid(current, lessons, paymentId));
    },
    [lessons],
  );

  const refundPayment = useCallback((paymentId, requestedAmount) => {
    let res;
    setPayments((current) => {
      res = paymentsService.refundPayment(current, paymentId, requestedAmount);
      return res.success ? res.list : current;
    });
    return res?.payment;
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
      const res = paymentsService.createTutorPayout(payments, payouts, settings, tutorId, paymentIds, requestedCurrency);
      if (res.success) {
        setPayouts(res.nextPayouts);
        setPayments(res.nextPayments);
        return { success: true, payout: res.payout };
      }
      return { success: false, message: res.message };
    },
    [payments, payouts, settings],
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

  const financialByCurrency = useMemo(() => {
    return paymentsService.calculateFinancialByCurrency(payments, payouts, settings.defaultCurrency);
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
      return paymentsService.calculateTutorFinance(tutorId, payments, payouts, settings.defaultCurrency, currency);
    },
    [payments, payouts, settings.defaultCurrency],
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
