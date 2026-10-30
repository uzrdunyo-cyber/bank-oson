import { LoanInput, LoanResult, AmortizationScheduleItem } from '../types';

export function calculateLoan(input: LoanInput): LoanResult {
  const amount = Math.max(0, Number(input.amount) || 0);
  const annualRate = Math.max(0, Number(input.annualRate) || 0);
  const termMonths = Math.max(1, Math.min(360, Math.floor(Number(input.termMonths) || 1)));
  const oneTimeFee = Math.max(0, Number(input.oneTimeFee) || 0);
  const monthlyInsuranceRate = Math.max(0, Number(input.monthlyInsuranceRate) || 0);

  const monthlyRate = annualRate / 12 / 100;
  const schedule: AmortizationScheduleItem[] = [];

  let totalInterest = 0;
  let firstMonthPayment = 0;
  let lastMonthPayment = 0;

  if (input.type === 'annuity') {
    let fixedPayment = 0;
    if (annualRate === 0) {
      fixedPayment = amount / termMonths;
    } else {
      const compoundFactor = Math.pow(1 + monthlyRate, termMonths);
      fixedPayment = (amount * monthlyRate * compoundFactor) / (compoundFactor - 1);
    }

    firstMonthPayment = fixedPayment;
    let balance = amount;

    for (let month = 1; month <= termMonths; month++) {
      let interestPart = balance * monthlyRate;
      let principalPart = fixedPayment - interestPart;

      if (month === termMonths || balance - principalPart < 0) {
        principalPart = balance;
        fixedPayment = principalPart + interestPart;
        balance = 0;
      } else {
        balance -= principalPart;
      }

      totalInterest += interestPart;

      schedule.push({
        month,
        monthlyPayment: Math.round(fixedPayment),
        principalPayment: Math.round(principalPart),
        interestPayment: Math.round(interestPart),
        remainingBalance: Math.max(0, Math.round(balance)),
      });
    }
  } else {
    // Differential
    const monthlyPrincipal = amount / termMonths;
    let balance = amount;

    for (let month = 1; month <= termMonths; month++) {
      const interestPart = balance * monthlyRate;
      const principalPart = (month === termMonths) ? balance : monthlyPrincipal;
      const payment = principalPart + interestPart;

      if (month === 1) firstMonthPayment = payment;
      if (month === termMonths) lastMonthPayment = payment;

      balance -= principalPart;
      totalInterest += interestPart;

      schedule.push({
        month,
        monthlyPayment: Math.round(payment),
        principalPayment: Math.round(principalPart),
        interestPayment: Math.round(interestPart),
        remainingBalance: Math.max(0, Math.round(balance)),
      });
    }
  }

  // Insurance and extra costs
  const totalInsurance = (amount * (monthlyInsuranceRate / 100)) * termMonths;
  const totalExtraFees = oneTimeFee + totalInsurance;

  const totalPayment = amount + totalInterest;
  const grandTotal = totalPayment + totalExtraFees;

  // Approximate Effective Annual Cost
  const totalExtraPercentage = amount > 0 ? ((grandTotal - amount) / amount) / (termMonths / 12) * 100 : 0;
  const effectiveRate = Number(totalExtraPercentage.toFixed(2));

  const formulaExplanation = input.type === 'annuity'
    ? 'Annuitet formulasi: A = P × [r(1+r)ⁿ] / [(1+r)ⁿ - 1], bu yerda P — kredit summasi, r — oylik foiz stavkasi (yillik stavka / 12), n — oylar soni.'
    : 'Differensial to\'lov formulasi: Har oy teng asosiy qarz (P / n) va qoldiqqa hisoblangan oylik foiz to\'lanadi. Shu sababli oylik to\'lov asta-sekin kamayib boradi.';

  return {
    monthlyPayment: Math.round(firstMonthPayment),
    lastMonthlyPayment: input.type === 'differential' ? Math.round(lastMonthPayment) : undefined,
    totalPayment: Math.round(totalPayment),
    totalInterest: Math.round(totalInterest),
    totalExtraFees: Math.round(totalExtraFees),
    grandTotal: Math.round(grandTotal),
    effectiveRate,
    schedule,
    formulaExplanation,
  };
}

// Format numbers in Uzbek currency format (e.g. 50 000 000 so'm)
export function formatUzbekCurrency(value: number): string {
  if (isNaN(value)) return '0';
  return Math.round(value)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}
