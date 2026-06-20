import { useState, useEffect } from 'react';

// Preset Types
type PresetType = 'home' | 'car' | 'personal' | 'education' | 'custom';
type TabType = 'standard' | 'prepayments' | 'compare' | 'eligibility';

interface AmortizationRow {
  month: number;
  openingBalance: number;
  emi: number;
  principal: number;
  interest: number;
  prepayment: number;
  closingBalance: number;
}

interface Prepayment {
  id: string;
  month: number;
  amount: number;
  type: 'tenure' | 'emi';
}

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<TabType>('standard');

  // Outputs state for numbers updating animation classes
  const [animate, setAnimate] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // FAQ Active Accordion
  const [faqActive, setFaqActive] = useState<number | null>(null);
  const toggleFaq = (index: number) => {
    setFaqActive(faqActive === index ? null : index);
  };

  // Dynamic FAQ JSON-LD Injection for deep SEO
  useEffect(() => {
    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "How is loan EMI calculated?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Loan EMI is calculated using the formula: [P x R x (1+R)^N]/[(1+R)^N - 1], where P is the Principal loan amount, R is the monthly interest rate (annual rate divided by 12 * 100), and N is the loan tenure in months."
          }
        },
        {
          "@type": "Question",
          "name": "Should I choose to reduce EMI or reduce tenure during prepayment?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Reducing loan tenure typically saves more money on interest over the long run compared to reducing the monthly EMI. Reducing EMI is better if you are facing cash flow constraints and want to lower your monthly obligation."
          }
        },
        {
          "@type": "Question",
          "name": "What is the FOIR ratio and how does it affect eligibility?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "FOIR (Fixed Obligation to Income Ratio) is a metric banks use to gauge your loan eligibility. It measures how much of your monthly net income goes toward paying existing debts. Typically, banks prefer a FOIR under 50%."
          }
        },
        {
          "@type": "Question",
          "name": "Does prepayment attract additional penalties?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Under RBI guidelines, floating rate home loans, car loans, and personal loans do not attract prepayment penalties for individual borrowers. However, fixed-rate loans may still carry a charge of 1-3%."
          }
        }
      ]
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'faq-jsonld';
    script.innerHTML = JSON.stringify(faqSchema);
    document.head.appendChild(script);

    return () => {
      const existingScript = document.getElementById('faq-jsonld');
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, []);

  // 1. STANDARD EMI STATE
  const [loanAmount, setLoanAmount] = useState<number>(1000000);
  const [interestRate, setInterestRate] = useState<number>(8.5);
  const [tenure, setTenure] = useState<number>(120);
  const [tenureUnit, setTenureUnit] = useState<'months' | 'years'>('months');
  const [activePreset, setActivePreset] = useState<PresetType>('home');

  // Outputs for Standard
  const [monthlyEmi, setMonthlyEmi] = useState<number>(0);
  const [totalInterest, setTotalInterest] = useState<number>(0);
  const [totalPayable, setTotalPayable] = useState<number>(0);
  const [amortizationTable, setAmortizationTable] = useState<AmortizationRow[]>([]);

  // 2. PREPAYMENTS STATE
  const [prepayments, setPrepayments] = useState<Prepayment[]>([]);
  const [newPrepMonth, setNewPrepMonth] = useState<number>(12);
  const [newPrepAmount, setNewPrepAmount] = useState<number>(50000);
  const [newPrepType, setNewPrepType] = useState<'tenure' | 'emi'>('tenure');

  // Outputs for Prepayments
  const [prepTotalInterest, setPrepTotalInterest] = useState<number>(0);
  const [prepTotalPayable, setPrepTotalPayable] = useState<number>(0);
  const [prepSavingsInterest, setPrepSavingsInterest] = useState<number>(0);
  const [prepSavingsTenure, setPrepSavingsTenure] = useState<number>(0);
  const [prepTable, setPrepTable] = useState<AmortizationRow[]>([]);

  // 3. COMPARE LOANS STATE
  const [compAmountA, setCompAmountA] = useState<number>(1000000);
  const [compRateA, setCompRateA] = useState<number>(8.5);
  const [compTenureA, setCompTenureA] = useState<number>(120);

  const [compAmountB, setCompAmountB] = useState<number>(1000000);
  const [compRateB, setCompRateB] = useState<number>(8.0);
  const [compTenureB, setCompTenureB] = useState<number>(120);

  // 4. ELIGIBILITY STATE
  const [monthlyIncome, setMonthlyIncome] = useState<number>(80000);
  const [existingEmi, setExistingEmi] = useState<number>(15000);
  const [eligibilityRate, setEligibilityRate] = useState<number>(8.5);
  const [eligibilityTenure, setEligibilityTenure] = useState<number>(15); // years
  const [foir, setFoir] = useState<number>(50); // percentage

  // Synchronize inputs & calculate
  useEffect(() => {
    calculateStandardEMI();
  }, [loanAmount, interestRate, tenure, tenureUnit]);

  useEffect(() => {
    calculatePrepaymentEMI();
  }, [loanAmount, interestRate, tenure, tenureUnit, prepayments]);

  // Handle Preset select
  const handlePresetSelect = (type: PresetType, rateVal: number) => {
    setActivePreset(type);
    if (type !== 'custom') {
      setInterestRate(rateVal);
    }
  };

  // Convert Indian Currency format helper
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Standard EMI Calculation
  const calculateStandardEMI = () => {
    const P = loanAmount;
    const R = interestRate;
    const r = R / 12 / 100;
    const n = tenureUnit === 'years' ? tenure * 12 : tenure;

    if (P <= 0 || n <= 0) {
      setMonthlyEmi(0);
      setTotalInterest(0);
      setTotalPayable(0);
      setAmortizationTable([]);
      return;
    }

    let emiValue = 0;
    if (r === 0) {
      emiValue = P / n;
    } else {
      emiValue = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    }

    const calculatedEmi = emiValue;
    const calculatedTotalPayable = calculatedEmi * n;
    const calculatedTotalInterest = calculatedTotalPayable - P;

    setMonthlyEmi(calculatedEmi);
    setTotalInterest(calculatedTotalInterest);
    setTotalPayable(calculatedTotalPayable);

    // Standard schedule
    const schedule: AmortizationRow[] = [];
    let balance = P;

    for (let i = 1; i <= n; i++) {
      const opening = balance;
      let interestPaid = opening * r;
      let principalPaid = calculatedEmi - interestPaid;

      if (opening <= 0) break;

      if (i === n || balance <= principalPaid) {
        principalPaid = opening;
        interestPaid = opening * r;
        balance = 0;
      } else {
        balance = opening - principalPaid;
      }

      schedule.push({
        month: i,
        openingBalance: opening,
        emi: principalPaid + interestPaid,
        principal: principalPaid,
        interest: interestPaid,
        prepayment: 0,
        closingBalance: balance,
      });
    }
    setAmortizationTable(schedule);

    setAnimate(true);
    const timer = setTimeout(() => setAnimate(false), 300);
    return () => clearTimeout(timer);
  };

  // Recalculate schedule with Prepayments
  const calculatePrepaymentEMI = () => {
    const P = loanAmount;
    const R = interestRate;
    const r = R / 12 / 100;
    const n = tenureUnit === 'years' ? tenure * 12 : tenure;

    if (P <= 0 || n <= 0) {
      setPrepTotalInterest(0);
      setPrepTotalPayable(0);
      setPrepSavingsInterest(0);
      setPrepSavingsTenure(0);
      setPrepTable([]);
      return;
    }

    let baseEmiValue = 0;
    if (r === 0) {
      baseEmiValue = P / n;
    } else {
      baseEmiValue = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    }

    const schedule: AmortizationRow[] = [];
    let balance = P;
    let currentEmi = baseEmiValue;
    let accumulatedInterest = 0;
    let accumulatedPayable = 0;
    let monthIdx = 1;

    // We cap months at 480 to avoid infinite loops
    while (balance > 0.01 && monthIdx <= 480) {
      const opening = balance;
      const interestPaid = opening * r;
      accumulatedInterest += interestPaid;

      // Base principal to pay
      let basePrincipal = currentEmi - interestPaid;
      if (basePrincipal > opening) {
        basePrincipal = opening;
      }

      // Check prepayments for this month
      const prepsThisMonth = prepayments.filter(p => p.month === monthIdx);
      const prepAmount = prepsThisMonth.reduce((sum, p) => sum + p.amount, 0);
      
      const actualPrep = Math.min(opening - basePrincipal, prepAmount);
      const totalPrincipalPaid = basePrincipal + actualPrep;
      
      const closing = Math.max(0, opening - totalPrincipalPaid);
      balance = closing;

      const emiPaidThisMonth = basePrincipal + interestPaid;
      accumulatedPayable += emiPaidThisMonth + actualPrep;

      schedule.push({
        month: monthIdx,
        openingBalance: opening,
        emi: emiPaidThisMonth,
        principal: basePrincipal,
        interest: interestPaid,
        prepayment: actualPrep,
        closingBalance: closing
      });

      // If we had an 'emi' reduction prepayment, recalculate subsequent EMI
      const hasEmiPrep = prepsThisMonth.some(p => p.type === 'emi');
      if (hasEmiPrep && closing > 0 && n - monthIdx > 0) {
        const remainingMonths = n - monthIdx;
        if (r === 0) {
          currentEmi = closing / remainingMonths;
        } else {
          currentEmi = (closing * r * Math.pow(1 + r, remainingMonths)) / (Math.pow(1 + r, remainingMonths) - 1);
        }
      }

      monthIdx++;
    }

    setPrepTable(schedule);
    setPrepTotalInterest(accumulatedInterest);
    setPrepTotalPayable(accumulatedPayable);

    // Compute savings
    const baseTotalInterest = totalInterest; // from standard EMI calculations
    const savingsInt = Math.max(0, baseTotalInterest - accumulatedInterest);
    const monthsTaken = schedule.length;
    const savingsTen = Math.max(0, n - monthsTaken);

    setPrepSavingsInterest(savingsInt);
    setPrepSavingsTenure(savingsTen);
  };

  // Add a prepayment
  const addPrepayment = (e: React.FormEvent) => {
    e.preventDefault();
    const maxMonths = tenureUnit === 'years' ? tenure * 12 : tenure;
    if (newPrepMonth < 1 || newPrepMonth > maxMonths) {
      showToast(`Month must be between 1 and ${maxMonths}`);
      return;
    }
    if (newPrepAmount <= 0) {
      showToast('Amount must be positive');
      return;
    }

    const newPrep: Prepayment = {
      id: Date.now().toString(),
      month: newPrepMonth,
      amount: newPrepAmount,
      type: newPrepType
    };

    setPrepayments([...prepayments, newPrep].sort((a, b) => a.month - b.month));
    showToast('Prepayment added!');
  };

  // Delete a prepayment
  const deletePrepayment = (id: string) => {
    setPrepayments(prepayments.filter(p => p.id !== id));
    showToast('Prepayment removed.');
  };

  // Convert tenure unit change helper
  const handleTenureUnitChange = (newUnit: 'months' | 'years') => {
    if (newUnit === tenureUnit) return;
    setTenureUnit(newUnit);
    if (newUnit === 'years') {
      const converted = Math.max(1, Math.round((tenure / 12) * 10) / 10);
      setTenure(converted);
    } else {
      const converted = Math.min(360, Math.round(tenure * 12));
      setTenure(converted);
    }
  };

  // Copy Results to Clipboard
  const copyToClipboard = () => {
    let summary = '';
    const unitText = tenureUnit === 'years' ? (tenure === 1 ? 'Year' : 'Years') : (tenure === 1 ? 'Month' : 'Months');

    if (activeTab === 'standard') {
      summary = `EMI Loan Calculation Summary:
-----------------------------
Loan Amount: ${formatCurrency(loanAmount)}
Interest Rate: ${interestRate}% p.a.
Tenure: ${tenure} ${unitText}
-----------------------------
Monthly EMI: ${formatCurrency(monthlyEmi)}
Total Interest Payable: ${formatCurrency(totalInterest)}
Total Amount Payable: ${formatCurrency(totalPayable)}
-----------------------------
Phulkeshwar Mahto | phulkeshwar.e@gmail.com
Built for Digital Heroes: https://digitalheroesco.com`;
    } else if (activeTab === 'prepayments') {
      summary = `EMI Prepayment Savings Summary:
-----------------------------
Original Loan: ${formatCurrency(loanAmount)} @ ${interestRate}% for ${tenure} ${unitText}
Prepayments Applied: ${prepayments.length}
Revised Total Interest: ${formatCurrency(prepTotalInterest)}
Revised Total Payable: ${formatCurrency(prepTotalPayable)}
Interest Saved: ${formatCurrency(prepSavingsInterest)}
Months Saved: ${prepSavingsTenure} months
-----------------------------
Phulkeshwar Mahto | phulkeshwar.e@gmail.com
Built for Digital Heroes: https://digitalheroesco.com`;
    } else if (activeTab === 'compare') {
      const emiA = calculateEmiValue(compAmountA, compRateA, compTenureA);
      const emiB = calculateEmiValue(compAmountB, compRateB, compTenureB);
      const intA = emiA * compTenureA - compAmountA;
      const intB = emiB * compTenureB - compAmountB;

      summary = `Loan Comparison Report:
-----------------------------
Loan A: ${formatCurrency(compAmountA)} @ ${compRateA}% for ${compTenureA} months
- EMI: ${formatCurrency(emiA)}
- Total Interest: ${formatCurrency(intA)}

Loan B: ${formatCurrency(compAmountB)} @ ${compRateB}% for ${compTenureB} months
- EMI: ${formatCurrency(emiB)}
- Total Interest: ${formatCurrency(intB)}

Net Difference:
- EMI: ${formatCurrency(Math.abs(emiA - emiB))}
- Interest: ${formatCurrency(Math.abs(intA - intB))}
-----------------------------
Phulkeshwar Mahto | phulkeshwar.e@gmail.com
Built for Digital Heroes: https://digitalheroesco.com`;
    } else if (activeTab === 'eligibility') {
      const { maxEmi, eligibleLoan } = calculateEligibility();
      summary = `Loan Eligibility Assessment:
-----------------------------
Monthly Income: ${formatCurrency(monthlyIncome)}
Existing EMIs: ${formatCurrency(existingEmi)}
Eligible Loan Amount: ${formatCurrency(eligibleLoan)}
Max Affordable EMI: ${formatCurrency(maxEmi)}
Assumed Interest: ${eligibilityRate}% p.a.
Assumed Tenure: ${eligibilityTenure} years
-----------------------------
Phulkeshwar Mahto | phulkeshwar.e@gmail.com
Built for Digital Heroes: https://digitalheroesco.com`;
    }

    navigator.clipboard.writeText(summary)
      .then(() => showToast('Summary copied to clipboard!'))
      .catch(() => showToast('Failed to copy.'));
  };

  const downloadReport = () => {
    let summary = '';
    const unitText = tenureUnit === 'years' ? (tenure === 1 ? 'Year' : 'Years') : (tenure === 1 ? 'Month' : 'Months');

    if (activeTab === 'standard') {
      summary = `EMI Loan Calculation Summary:
-----------------------------
Loan Amount: ${formatCurrency(loanAmount)}
Interest Rate: ${interestRate}% p.a.
Tenure: ${tenure} ${unitText}
-----------------------------
Monthly EMI: ${formatCurrency(monthlyEmi)}
Total Interest Payable: ${formatCurrency(totalInterest)}
Total Amount Payable: ${formatCurrency(totalPayable)}
-----------------------------
Phulkeshwar Mahto | phulkeshwar.e@gmail.com
Built for Digital Heroes: https://digitalheroesco.com`;
    } else if (activeTab === 'prepayments') {
      summary = `EMI Prepayment Savings Summary:
-----------------------------
Original Loan: ${formatCurrency(loanAmount)} @ ${interestRate}% for ${tenure} ${unitText}
Prepayments Applied: ${prepayments.length}
Revised Total Interest: ${formatCurrency(prepTotalInterest)}
Revised Total Payable: ${formatCurrency(prepTotalPayable)}
Interest Saved: ${formatCurrency(prepSavingsInterest)}
Months Saved: ${prepSavingsTenure} months
-----------------------------
Phulkeshwar Mahto | phulkeshwar.e@gmail.com
Built for Digital Heroes: https://digitalheroesco.com`;
    } else if (activeTab === 'compare') {
      const emiA = calculateEmiValue(compAmountA, compRateA, compTenureA);
      const emiB = calculateEmiValue(compAmountB, compRateB, compTenureB);
      const intA = emiA * compTenureA - compAmountA;
      const intB = emiB * compTenureB - compAmountB;

      summary = `Loan Comparison Report:
-----------------------------
Loan Plan A: ${formatCurrency(compAmountA)} @ ${compRateA}% for ${compTenureA} months
- EMI: ${formatCurrency(emiA)}
- Total Interest: ${formatCurrency(intA)}

Loan Plan B: ${formatCurrency(compAmountB)} @ ${compRateB}% for ${compTenureB} months
- EMI: ${formatCurrency(emiB)}
- Total Interest: ${formatCurrency(intB)}

Net Difference:
- EMI: ${formatCurrency(Math.abs(emiA - emiB))}
- Interest: ${formatCurrency(Math.abs(intA - intB))}
-----------------------------
Phulkeshwar Mahto | phulkeshwar.e@gmail.com
Built for Digital Heroes: https://digitalheroesco.com`;
    } else if (activeTab === 'eligibility') {
      const { maxEmi, eligibleLoan } = calculateEligibility();
      summary = `Loan Eligibility Assessment:
-----------------------------
Monthly Income: ${formatCurrency(monthlyIncome)}
Existing EMIs: ${formatCurrency(existingEmi)}
Eligible Loan Amount: ${formatCurrency(eligibleLoan)}
Max Affordable EMI: ${formatCurrency(maxEmi)}
Assumed Interest: ${eligibilityRate}% p.a.
Assumed Tenure: ${eligibilityTenure} years
-----------------------------
Phulkeshwar Mahto | phulkeshwar.e@gmail.com
Built for Digital Heroes: https://digitalheroesco.com`;
    }

    const blob = new Blob([summary], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `emi_${activeTab}_report.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Helper EMI Calculator for comparison
  const calculateEmiValue = (P: number, R: number, n: number) => {
    const r = R / 12 / 100;
    if (P <= 0 || n <= 0) return 0;
    if (r === 0) return P / n;
    return (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  };

  // Helper eligibility calculator
  const calculateEligibility = () => {
    const maxEmi = Math.max(0, (monthlyIncome * foir / 100) - existingEmi);
    const r = eligibilityRate / 12 / 100;
    const n = eligibilityTenure * 12;

    if (maxEmi <= 0 || r === 0 || n <= 0) {
      return { maxEmi, eligibleLoan: 0 };
    }
    const eligibleLoan = maxEmi * (Math.pow(1 + r, n) - 1) / (r * Math.pow(1 + r, n));
    return { maxEmi, eligibleLoan };
  };

  // Doughnut Chart Calculations (SVG)
  const principalPercent = totalPayable > 0 ? (loanAmount / totalPayable) * 100 : 0;
  const interestPercent = totalPayable > 0 ? (totalInterest / totalPayable) * 100 : 0;

  const radius = 70;
  const circumference = 2 * Math.PI * radius; // ~439.82
  const principalStroke = (principalPercent / 100) * circumference;
  const interestStroke = (interestPercent / 100) * circumference;

  return (
    <>
      {/* HEADER */}
      <header>
        <div className="logo">
          <span className="logo-icon">📊</span>
          <span>EMI Calculator</span>
          <span className="logo-badge">PRO</span>
        </div>

        {/* GitHub Link */}
        <a href="https://github.com/phulkeshwar/EMIcalculator" target="_blank" rel="noopener noreferrer" className="github-btn" style={{ margin: '0 auto 0 24px' }}>
          <svg viewBox="0 0 24 24" style={{ width: '14px', height: '14px', fill: 'currentColor' }}><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
          <span>GitHub</span>
        </a>

        <div className="author-chip">
          By <strong>Phulkeshwar Mahto</strong> &nbsp;·&nbsp; 
          <a href="mailto:phulkeshwar.e@gmail.com">phulkeshwar.e@gmail.com</a>
        </div>
      </header>

      {/* HERO */}
      <div className="hero">
        <div className="hero-eyebrow">Enterprise Suite · Free Utilities</div>
        <h1>Advance <span>EMI Calculator</span></h1>
        <p>
          Standard EMI schedules, prepayments forecasting, A/B comparisons, and dynamic bank eligibility audits.
        </p>
      </div>

      {/* MAIN CONTAINER */}
      <main className="main">
        {/* Tab Selection Row */}
        <div className="tab-container">
          <button 
            className={`tab-btn ${activeTab === 'standard' ? 'active' : ''}`}
            onClick={() => setActiveTab('standard')}
          >
            Standard Calculator
          </button>
          <button 
            className={`tab-btn ${activeTab === 'prepayments' ? 'active' : ''}`}
            onClick={() => setActiveTab('prepayments')}
          >
            Prepayments Planner
          </button>
          <button 
            className={`tab-btn ${activeTab === 'compare' ? 'active' : ''}`}
            onClick={() => setActiveTab('compare')}
          >
            Compare Loans
          </button>
          <button 
            className={`tab-btn ${activeTab === 'eligibility' ? 'active' : ''}`}
            onClick={() => setActiveTab('eligibility')}
          >
            Check Loan Eligibility
          </button>
        </div>

        {/* TAB CONTENTS */}
        {activeTab === 'standard' && (
          <div className="calculator-grid">
            {/* LEFT COLUMN: INPUTS */}
            <div className="card">
              <div className="card-title">Loan Parameters</div>

              {/* Presets Grid */}
              <div className="field">
                <label>Preset Loan Types</label>
                <div className="preset-grid" style={{ marginTop: '8px' }}>
                  <button 
                    className={`preset-btn ${activePreset === 'home' ? 'active' : ''}`}
                    onClick={() => handlePresetSelect('home', 8.5)}
                  >
                    Home (8.5%)
                  </button>
                  <button 
                    className={`preset-btn ${activePreset === 'car' ? 'active' : ''}`}
                    onClick={() => handlePresetSelect('car', 9.0)}
                  >
                    Car (9.0%)
                  </button>
                  <button 
                    className={`preset-btn ${activePreset === 'personal' ? 'active' : ''}`}
                    onClick={() => handlePresetSelect('personal', 14.0)}
                  >
                    Personal (14%)
                  </button>
                  <button 
                    className={`preset-btn ${activePreset === 'education' ? 'active' : ''}`}
                    onClick={() => handlePresetSelect('education', 7.0)}
                  >
                    Education (7%)
                  </button>
                  <button 
                    className={`preset-btn ${activePreset === 'custom' ? 'active' : ''}`}
                    onClick={() => handlePresetSelect('custom', interestRate)}
                  >
                    Custom
                  </button>
                </div>
              </div>

              {/* Loan Amount Input */}
              <div className="field">
                <div className="field-label-row">
                  <label htmlFor="loanAmount">Loan Amount (₹)</label>
                  <span className="field-value-badge">{formatCurrency(loanAmount)}</span>
                </div>
                <div className="input-wrapper has-icon">
                  <span className="input-icon">₹</span>
                  <input
                    id="loanAmount"
                    type="number"
                    min="5000"
                    max="100000000"
                    step="1000"
                    value={loanAmount || ''}
                    onChange={(e) => setLoanAmount(parseFloat(e.target.value) || 0)}
                    placeholder="e.g. 1000000"
                  />
                </div>
                <div className="slider-wrap">
                  <input
                    type="range"
                    className="slider"
                    min="10000"
                    max="10000000"
                    step="10000"
                    value={loanAmount}
                    onChange={(e) => setLoanAmount(parseFloat(e.target.value))}
                  />
                </div>
              </div>

              {/* Interest Rate Input */}
              <div className="field">
                <div className="field-label-row">
                  <label htmlFor="interestRate">Annual Interest Rate (%)</label>
                  <span className="field-value-badge">{interestRate}% p.a.</span>
                </div>
                <div className="input-wrapper">
                  <input
                    id="interestRate"
                    type="number"
                    min="0.1"
                    max="50"
                    step="0.1"
                    value={interestRate || ''}
                    onChange={(e) => {
                      setInterestRate(parseFloat(e.target.value) || 0);
                      setActivePreset('custom');
                    }}
                    placeholder="e.g. 8.5"
                  />
                </div>
                <div className="slider-wrap">
                  <input
                    type="range"
                    className="slider"
                    min="1"
                    max="30"
                    step="0.1"
                    value={interestRate}
                    onChange={(e) => {
                      setInterestRate(parseFloat(e.target.value));
                      setActivePreset('custom');
                    }}
                  />
                </div>
              </div>

              {/* Tenure Input */}
              <div className="field">
                <div className="field-label-row">
                  <label htmlFor="tenure">Loan Tenure</label>
                  <span className="field-value-badge">
                    {tenure} {tenureUnit === 'years' ? (tenure === 1 ? 'Year' : 'Years') : (tenure === 1 ? 'Month' : 'Months')}
                  </span>
                </div>
                
                <div className="toggle-wrap">
                  <button
                    type="button"
                    className={`toggle-opt ${tenureUnit === 'months' ? 'active' : ''}`}
                    onClick={() => handleTenureUnitChange('months')}
                  >
                    Months
                  </button>
                  <button
                    type="button"
                    className={`toggle-opt ${tenureUnit === 'years' ? 'active' : ''}`}
                    onClick={() => handleTenureUnitChange('years')}
                  >
                    Years
                  </button>
                </div>

                <div className="input-wrapper">
                  <input
                    id="tenure"
                    type="number"
                    min="1"
                    max={tenureUnit === 'years' ? 30 : 360}
                    step="1"
                    value={tenure || ''}
                    onChange={(e) => setTenure(parseInt(e.target.value) || 0)}
                    placeholder={tenureUnit === 'years' ? "Years (e.g. 10)" : "Months (e.g. 120)"}
                  />
                </div>
                
                <div className="slider-wrap">
                  <input
                    type="range"
                    className="slider"
                    min="1"
                    max={tenureUnit === 'years' ? 30 : 360}
                    step="1"
                    value={tenure}
                    onChange={(e) => setTenure(parseInt(e.target.value))}
                  />
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: RESULTS & SVG CHART */}
            <div className="card">
              <div className="card-title">Calculation Breakdown</div>

              <div className="result-box">
                <div className="result-label">Monthly EMI</div>
                <div className={`result-val ${animate ? 'flash' : ''}`}>
                  {formatCurrency(monthlyEmi)}
                </div>
              </div>

              {/* SVG Doughnut */}
              <div className="chart-container">
                <svg width="180" height="180" viewBox="0 0 180 180" className="chart-svg">
                  <circle cx="90" cy="90" r={radius} className="chart-circle bg" />
                  <circle
                    cx="90"
                    cy="90"
                    r={radius}
                    className="chart-circle principal"
                    strokeDasharray={`${principalStroke} ${circumference}`}
                    strokeDashoffset={0}
                  />
                  <circle
                    cx="90"
                    cy="90"
                    r={radius}
                    className="chart-circle interest"
                    strokeDasharray={`${interestStroke} ${circumference}`}
                    strokeDashoffset={-principalStroke}
                  />
                </svg>
                <div className="chart-center-text">
                  <span className="chart-center-val">
                    {totalPayable > 0 ? `${Math.round(interestPercent)}%` : '0%'}
                  </span>
                  <span className="chart-center-lbl">Interest</span>
                </div>
              </div>

              <ul className="stats-list">
                <li className="stats-item">
                  <span className="stats-label">
                    <span className="dot principal"></span> Principal Amount
                  </span>
                  <span className="stats-val">{formatCurrency(loanAmount)}</span>
                </li>
                <li className="stats-item">
                  <span className="stats-label">
                    <span className="dot interest"></span> Total Interest Payable
                  </span>
                  <span className="stats-val text-green">{formatCurrency(totalInterest)}</span>
                </li>
                <li className="stats-item" style={{ borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                  <span className="stats-label" style={{ color: 'var(--text)', fontWeight: 600 }}>
                    Total Amount Payable
                  </span>
                  <span className="stats-val" style={{ color: 'var(--accent)', fontSize: '1.05rem' }}>
                    {formatCurrency(totalPayable)}
                  </span>
                </li>
              </ul>

              <div className="actions-row" style={{ display: 'flex', gap: '8px' }}>
                <button type="button" className="btn-sec" onClick={copyToClipboard}>
                  <span>⎘</span> Copy Summary
                </button>
                <button type="button" className="btn-primary" onClick={downloadReport} style={{ padding: '8px 16px', fontSize: '0.88rem' }}>
                  <span>💾</span> Download Report
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'prepayments' && (
          <div className="calculator-grid">
            {/* LEFT COLUMN: PREPAYMENT FORM */}
            <div className="card">
              <div className="card-title">Manage Prepayments</div>
              
              <form onSubmit={addPrepayment} className="prepay-form">
                <div className="field">
                  <label htmlFor="prepMonth">Payment Month</label>
                  <div className="input-wrapper">
                    <input
                      id="prepMonth"
                      type="number"
                      min="1"
                      value={newPrepMonth || ''}
                      onChange={(e) => setNewPrepMonth(parseInt(e.target.value) || 0)}
                      placeholder="e.g. 12"
                      required
                    />
                  </div>
                </div>

                <div className="field">
                  <label htmlFor="prepAmount">Prepayment Amount (₹)</label>
                  <div className="input-wrapper has-icon">
                    <span className="input-icon">₹</span>
                    <input
                      id="prepAmount"
                      type="number"
                      min="1000"
                      value={newPrepAmount || ''}
                      onChange={(e) => setNewPrepAmount(parseFloat(e.target.value) || 0)}
                      placeholder="e.g. 50000"
                      required
                    />
                  </div>
                </div>

                <div className="field">
                  <label>Action Choice</label>
                  <div className="toggle-wrap" style={{ marginTop: '8px' }}>
                    <button
                      type="button"
                      className={`toggle-opt ${newPrepType === 'tenure' ? 'active' : ''}`}
                      onClick={() => setNewPrepType('tenure')}
                    >
                      Reduce Tenure
                    </button>
                    <button
                      type="button"
                      className={`toggle-opt ${newPrepType === 'emi' ? 'active' : ''}`}
                      onClick={() => setNewPrepType('emi')}
                    >
                      Reduce EMI
                    </button>
                  </div>
                </div>

                <button type="submit" className="btn-primary">
                  + Add Prepayment
                </button>
              </form>

              {/* Active Prepayments List */}
              <div className="card-title" style={{ marginTop: '24px' }}>Active Milestones</div>
              {prepayments.length === 0 ? (
                <p style={{ color: 'var(--text-sec)', fontSize: '0.88rem' }}>No prepayments added yet. Add one above to see savings.</p>
              ) : (
                <div className="prepay-list">
                  {prepayments.map((prep) => (
                    <div key={prep.id} className="prepay-item">
                      <div>
                        <strong>Month {prep.month}</strong> &nbsp;·&nbsp; {formatCurrency(prep.amount)}
                        <span style={{ 
                          marginLeft: '10px', 
                          fontSize: '0.75rem', 
                          padding: '2px 6px', 
                          borderRadius: '4px',
                          background: prep.type === 'tenure' ? 'var(--accent-light)' : 'var(--green-light)',
                          color: prep.type === 'tenure' ? 'var(--accent)' : 'var(--green)' 
                        }}>
                          {prep.type === 'tenure' ? 'Reduce Tenure' : 'Reduce EMI'}
                        </span>
                      </div>
                      <button 
                        type="button" 
                        className="btn-delete"
                        onClick={() => deletePrepayment(prep.id)}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* RIGHT COLUMN: PREPAYMENT STATS */}
            <div className="card">
              <div className="card-title">Savings &amp; Forecast</div>
              
              <div className="savings-badge-row">
                <div className="savings-badge">
                  <div className="savings-badge-val">{formatCurrency(prepSavingsInterest)}</div>
                  <div className="savings-badge-lbl">Total Interest Saved</div>
                </div>
                <div className="savings-badge">
                  <div className="savings-badge-val">
                    {prepSavingsTenure} {prepSavingsTenure === 1 ? 'Month' : 'Months'}
                  </div>
                  <div className="savings-badge-lbl">Tenure Saved</div>
                </div>
              </div>

              <ul className="stats-list">
                <li className="stats-item">
                  <span className="stats-label">Original Interest</span>
                  <span className="stats-val">{formatCurrency(totalInterest)}</span>
                </li>
                <li className="stats-item">
                  <span className="stats-label">Revised Interest</span>
                  <span className="stats-val text-green">{formatCurrency(prepTotalInterest)}</span>
                </li>
                <li className="stats-item">
                  <span className="stats-label">Revised Total Paid</span>
                  <span className="stats-val" style={{ color: 'var(--accent)' }}>{formatCurrency(prepTotalPayable)}</span>
                </li>
                <li className="stats-item">
                  <span className="stats-label">Installments Paid</span>
                  <span className="stats-val">{prepTable.length} months</span>
                </li>
              </ul>

              <div className="actions-row" style={{ display: 'flex', gap: '8px' }}>
                <button type="button" className="btn-sec" onClick={copyToClipboard}>
                  <span>⎘</span> Copy Prepayment Report
                </button>
                <button type="button" className="btn-primary" onClick={downloadReport} style={{ padding: '8px 16px', fontSize: '0.88rem' }}>
                  <span>💾</span> Download Report
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'compare' && (
          <div className="compare-grid">
            {/* LOAN A */}
            <div className="card">
              <div className="comparison-header">Loan Plan A</div>
              
              <div className="field">
                <label>Principal Amount (₹)</label>
                <div className="input-wrapper has-icon">
                  <span className="input-icon">₹</span>
                  <input
                    type="number"
                    value={compAmountA || ''}
                    onChange={(e) => setCompAmountA(parseFloat(e.target.value) || 0)}
                    placeholder="e.g. 1000000"
                  />
                </div>
              </div>

              <div className="field">
                <label>Interest Rate (%)</label>
                <div className="input-wrapper">
                  <input
                    type="number"
                    step="0.1"
                    value={compRateA || ''}
                    onChange={(e) => setCompRateA(parseFloat(e.target.value) || 0)}
                    placeholder="e.g. 8.5"
                  />
                </div>
              </div>

              <div className="field">
                <label>Tenure (Months)</label>
                <div className="input-wrapper">
                  <input
                    type="number"
                    value={compTenureA || ''}
                    onChange={(e) => setCompTenureA(parseInt(e.target.value) || 0)}
                    placeholder="e.g. 120"
                  />
                </div>
              </div>

              <ul className="stats-list" style={{ marginTop: '24px' }}>
                <li className="stats-item">
                  <span className="stats-label">Monthly EMI</span>
                  <span className="stats-val">{formatCurrency(calculateEmiValue(compAmountA, compRateA, compTenureA))}</span>
                </li>
                <li className="stats-item">
                  <span className="stats-label">Total Interest</span>
                  <span className="stats-val text-green">
                    {formatCurrency(Math.max(0, calculateEmiValue(compAmountA, compRateA, compTenureA) * compTenureA - compAmountA))}
                  </span>
                </li>
              </ul>
            </div>

            {/* LOAN B */}
            <div className="card">
              <div className="comparison-header">Loan Plan B</div>
              
              <div className="field">
                <label>Principal Amount (₹)</label>
                <div className="input-wrapper has-icon">
                  <span className="input-icon">₹</span>
                  <input
                    type="number"
                    value={compAmountB || ''}
                    onChange={(e) => setCompAmountB(parseFloat(e.target.value) || 0)}
                    placeholder="e.g. 1000000"
                  />
                </div>
              </div>

              <div className="field">
                <label>Interest Rate (%)</label>
                <div className="input-wrapper">
                  <input
                    type="number"
                    step="0.1"
                    value={compRateB || ''}
                    onChange={(e) => setCompRateB(parseFloat(e.target.value) || 0)}
                    placeholder="e.g. 8.0"
                  />
                </div>
              </div>

              <div className="field">
                <label>Tenure (Months)</label>
                <div className="input-wrapper">
                  <input
                    type="number"
                    value={compTenureB || ''}
                    onChange={(e) => setCompTenureB(parseInt(e.target.value) || 0)}
                    placeholder="e.g. 120"
                  />
                </div>
              </div>

              <ul className="stats-list" style={{ marginTop: '24px' }}>
                <li className="stats-item">
                  <span className="stats-label">Monthly EMI</span>
                  <span className="stats-val">{formatCurrency(calculateEmiValue(compAmountB, compRateB, compTenureB))}</span>
                </li>
                <li className="stats-item">
                  <span className="stats-label">Total Interest</span>
                  <span className="stats-val text-green">
                    {formatCurrency(Math.max(0, calculateEmiValue(compAmountB, compRateB, compTenureB) * compTenureB - compAmountB))}
                  </span>
                </li>
              </ul>
            </div>

            {/* SIDE-BY-SIDE SUMMARY */}
            <div className="comparison-result-card">
              <div className="card-title" style={{ color: 'var(--text)', borderLeftColor: 'var(--green)' }}>Comparison Report</div>
              {(() => {
                const emiA = calculateEmiValue(compAmountA, compRateA, compTenureA);
                const emiB = calculateEmiValue(compAmountB, compRateB, compTenureB);
                const intA = emiA * compTenureA - compAmountA;
                const intB = emiB * compTenureB - compAmountB;

                const emiDiff = Math.abs(emiA - emiB);
                const intDiff = Math.abs(intA - intB);

                const betterPlan = intA < intB ? 'Loan Plan A' : 'Loan Plan B';

                return (
                  <div>
                    <p style={{ fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '16px' }}>
                      🌟 <strong>{betterPlan}</strong> is mathematically more efficient! It saves you{' '}
                      <span className="text-green" style={{ fontWeight: 700 }}>{formatCurrency(intDiff)}</span> in total interest costs.
                    </p>
                    <ul className="stats-list" style={{ marginBottom: 0 }}>
                      <li className="stats-item">
                        <span className="stats-label" style={{ color: 'var(--text-sec)' }}>Difference in Monthly EMI</span>
                        <span className="stats-val">{formatCurrency(emiDiff)}</span>
                      </li>
                      <li className="stats-item">
                        <span className="stats-label" style={{ color: 'var(--text-sec)' }}>Difference in Interest Paid</span>
                        <span className="stats-val text-green">{formatCurrency(intDiff)}</span>
                      </li>
                    </ul>
                  </div>
                );
              })()}
              <div className="actions-row" style={{ marginTop: '20px', display: 'flex', gap: '8px' }}>
                <button type="button" className="btn-sec" onClick={copyToClipboard} style={{ background: 'var(--surface3)' }}>
                  <span>⎘</span> Copy Comparison Details
                </button>
                <button type="button" className="btn-primary" onClick={downloadReport} style={{ padding: '8px 16px', fontSize: '0.88rem' }}>
                  <span>💾</span> Download Report
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'eligibility' && (
          <div className="calculator-grid">
            {/* LEFT COLUMN: INCOME DETAILS */}
            <div className="card">
              <div className="card-title">Eligibility Inputs</div>

              <div className="field">
                <label htmlFor="monthlyIncome">Gross Monthly Income (₹)</label>
                <div className="input-wrapper has-icon">
                  <span className="input-icon">₹</span>
                  <input
                    id="monthlyIncome"
                    type="number"
                    value={monthlyIncome || ''}
                    onChange={(e) => setMonthlyIncome(parseFloat(e.target.value) || 0)}
                    placeholder="e.g. 80000"
                  />
                </div>
              </div>

              <div className="field">
                <label htmlFor="existingEmi">Existing Monthly EMIs (₹)</label>
                <div className="input-wrapper has-icon">
                  <span className="input-icon">₹</span>
                  <input
                    id="existingEmi"
                    type="number"
                    value={existingEmi || ''}
                    onChange={(e) => setExistingEmi(parseFloat(e.target.value) || 0)}
                    placeholder="e.g. 15000"
                  />
                </div>
              </div>

              <div className="field">
                <label htmlFor="eligRate">Assumed Loan Rate (% p.a.)</label>
                <div className="input-wrapper">
                  <input
                    id="eligRate"
                    type="number"
                    step="0.1"
                    value={eligibilityRate || ''}
                    onChange={(e) => setEligibilityRate(parseFloat(e.target.value) || 0)}
                    placeholder="e.g. 8.5"
                  />
                </div>
              </div>

              <div className="field">
                <label htmlFor="eligTenure">Assumed Loan Tenure (Years)</label>
                <div className="input-wrapper">
                  <input
                    id="eligTenure"
                    type="number"
                    value={eligibilityTenure || ''}
                    onChange={(e) => setEligibilityTenure(parseInt(e.target.value) || 0)}
                    placeholder="e.g. 15"
                  />
                </div>
              </div>

              <div className="field">
                <div className="field-label-row">
                  <label htmlFor="foirSlider">FOIR Threshold (%)</label>
                  <span className="field-value-badge">{foir}%</span>
                </div>
                <div className="slider-wrap">
                  <input
                    id="foirSlider"
                    type="range"
                    className="slider"
                    min="30"
                    max="70"
                    value={foir}
                    onChange={(e) => setFoir(parseInt(e.target.value))}
                  />
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-mute)' }}>
                  Fixed Obligation to Income Ratio (Banks typically set 50% max).
                </span>
              </div>
            </div>

            {/* RIGHT COLUMN: ASSESSMENT */}
            <div className="card">
              <div className="card-title">Eligibility Assessment</div>
              {(() => {
                const { maxEmi, eligibleLoan } = calculateEligibility();
                return (
                  <>
                    <div className="eligibility-result">
                      <div className="result-label">Maximum Eligible Loan</div>
                      <div className="result-val">{formatCurrency(eligibleLoan)}</div>
                    </div>

                    <ul className="stats-list">
                      <li className="stats-item">
                        <span className="stats-label">Max Affordable EMI</span>
                        <span className="stats-val text-green">{formatCurrency(maxEmi)}</span>
                      </li>
                      <li className="stats-item">
                        <span className="stats-label">Monthly FOIR Budget</span>
                        <span className="stats-val">{formatCurrency(monthlyIncome * foir / 100)}</span>
                      </li>
                      <li className="stats-item">
                        <span className="stats-label">Assumed EMI Rate</span>
                        <span className="stats-val">{eligibilityRate}%</span>
                      </li>
                      <li className="stats-item">
                        <span className="stats-label">Assumed Tenure</span>
                        <span className="stats-val">{eligibilityTenure} Years</span>
                      </li>
                    </ul>
                  </>
                );
              })()}

              <div className="actions-row" style={{ marginTop: '24px', display: 'flex', gap: '8px' }}>
                <button type="button" className="btn-sec" onClick={copyToClipboard}>
                  <span>⎘</span> Copy Assessment Report
                </button>
                <button type="button" className="btn-primary" onClick={downloadReport} style={{ padding: '8px 16px', fontSize: '0.88rem' }}>
                  <span>💾</span> Download Report
                </button>
              </div>
            </div>
          </div>
        )}

        {/* BOTTOM SCHEDULE TABLE */}
        {activeTab === 'standard' && amortizationTable.length > 0 && (
          <div className="table-section">
            <div className="table-card">
              <div className="table-header-row">
                <div className="card-title">Standard Amortization Schedule</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-sec)' }}>
                  Total {amortizationTable.length} Installments
                </div>
              </div>
              
              <div className="table-container">
                <table className="amort-table">
                  <thead>
                    <tr>
                      <th>Month</th>
                      <th className="num-col">Opening Balance</th>
                      <th className="num-col">EMI</th>
                      <th className="num-col">Principal</th>
                      <th className="num-col">Interest</th>
                      <th className="num-col">Closing Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {amortizationTable.map((row) => (
                      <tr key={row.month}>
                        <td className="month-col">Month {row.month}</td>
                        <td className="num-col">{formatCurrency(row.openingBalance)}</td>
                        <td className="num-col highlight-col">{formatCurrency(row.emi)}</td>
                        <td className="num-col">{formatCurrency(row.principal)}</td>
                        <td className="num-col green-col">{formatCurrency(row.interest)}</td>
                        <td className="num-col">
                          {row.closingBalance === 0 ? '₹0' : formatCurrency(row.closingBalance)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'prepayments' && prepTable.length > 0 && (
          <div className="table-section">
            <div className="table-card">
              <div className="table-header-row">
                <div className="card-title">Revised Schedule (With Prepayments)</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-sec)' }}>
                  Paid Off in {prepTable.length} Months
                </div>
              </div>
              
              <div className="table-container">
                <table className="amort-table">
                  <thead>
                    <tr>
                      <th>Month</th>
                      <th className="num-col">Opening Balance</th>
                      <th className="num-col">EMI</th>
                      <th className="num-col">Principal</th>
                      <th className="num-col">Interest</th>
                      <th className="num-col">Prepayment</th>
                      <th className="num-col">Closing Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {prepTable.map((row) => (
                      <tr key={row.month}>
                        <td className="month-col">Month {row.month}</td>
                        <td className="num-col">{formatCurrency(row.openingBalance)}</td>
                        <td className="num-col highlight-col">{formatCurrency(row.emi)}</td>
                        <td className="num-col">{formatCurrency(row.principal)}</td>
                        <td className="num-col green-col">{formatCurrency(row.interest)}</td>
                        <td className="num-col" style={{ color: 'var(--accent)', fontWeight: 600 }}>
                          {row.prepayment > 0 ? formatCurrency(row.prepayment) : '—'}
                        </td>
                        <td className="num-col">
                          {row.closingBalance <= 0.05 ? '₹0' : formatCurrency(row.closingBalance)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* FAQ SECTION */}
        <div className="card faq-card" style={{ gridColumn: 'span 2', marginTop: '24px' }}>
          <div className="card-title">❓ Frequently Asked Questions (FAQ)</div>
          <div className="faq-list">
            {[
              {
                q: "How is loan EMI calculated?",
                a: "Loan EMI is calculated using the formula: [P x R x (1+R)^N]/[(1+R)^N - 1], where P is the Principal loan amount, R is the monthly interest rate (annual rate divided by 12 * 100), and N is the loan tenure in months."
              },
              {
                q: "Should I choose to reduce EMI or reduce tenure during prepayment?",
                a: "Reducing loan tenure typically saves more money on interest over the long run compared to reducing the monthly EMI. Reducing EMI is better if you are facing cash flow constraints and want to lower your monthly obligation."
              },
              {
                q: "What is the FOIR ratio and how does it affect eligibility?",
                a: "FOIR (Fixed Obligation to Income Ratio) is a metric banks use to gauge your loan eligibility. It measures how much of your monthly net income goes toward paying existing debts. Typically, banks prefer a FOIR under 50%."
              },
              {
                q: "Does prepayment attract additional penalties?",
                a: "Under RBI guidelines, floating rate home loans, car loans, and personal loans do not attract prepayment penalties for individual borrowers. However, fixed-rate loans may still carry a charge of 1-3%."
              }
            ].map((item, index) => (
              <div key={index} className={`faq-item ${faqActive === index ? 'active' : ''}`}>
                <button
                  type="button"
                  className="faq-question"
                  onClick={() => toggleFaq(index)}
                  aria-expanded={faqActive === index}
                >
                  <span>{item.q}</span>
                  <span className="faq-icon">{faqActive === index ? '−' : '+'}</span>
                </button>
                <div className="faq-answer">
                  <p>{item.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer>
        <p className="footer-author">
          Built by <strong>Phulkeshwar Mahto</strong> &nbsp;·&nbsp;
          <a href="mailto:phulkeshwar.e@gmail.com">phulkeshwar.e@gmail.com</a>
          &nbsp;·&nbsp; B.Tech CSE · NIAMT Ranchi
        </p>
        <a 
          className="dh-btn" 
          href="https://digitalheroesco.com" 
          target="_blank" 
          rel="noopener noreferrer"
        >
          <svg viewBox="0 0 24 24">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
          </svg>
          Built for Digital Heroes
        </a>
      </footer>

      {/* TOAST ALERTS */}
      <div className={`toast ${toastMessage ? 'show' : ''}`}>
        {toastMessage}
      </div>
    </>
  );
}
