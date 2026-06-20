import { useState, useEffect } from 'react';

// Preset Types
type PresetType = 'home' | 'car' | 'personal' | 'education' | 'custom';

interface AmortizationRow {
  month: number;
  openingBalance: number;
  emi: number;
  principal: number;
  interest: number;
  closingBalance: number;
}

export default function App() {
  // Input States
  const [loanAmount, setLoanAmount] = useState<number>(100000);
  const [interestRate, setInterestRate] = useState<number>(12);
  const [tenure, setTenure] = useState<number>(12);
  const [tenureUnit, setTenureUnit] = useState<'months' | 'years'>('months');
  const [activePreset, setActivePreset] = useState<PresetType>('custom');

  // Outputs state for numbers updating animation classes
  const [animate, setAnimate] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Amortization Table state
  const [amortizationTable, setAmortizationTable] = useState<AmortizationRow[]>([]);
  const [monthlyEmi, setMonthlyEmi] = useState<number>(0);
  const [totalInterest, setTotalInterest] = useState<number>(0);
  const [totalPayable, setTotalPayable] = useState<number>(0);

  // Synchronize inputs & calculate
  useEffect(() => {
    calculateEMI();
  }, [loanAmount, interestRate, tenure, tenureUnit]);

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
      maximumFractionDigits: 2,
    }).format(val);
  };

  // Main EMI Calculation Logic
  const calculateEMI = () => {
    // Principal
    const P = loanAmount;
    // Annual Interest Rate
    const R = interestRate;
    // Monthly interest rate
    const r = R / 12 / 100;
    // Total number of months
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

    // Generate Amortization Schedule
    const schedule: AmortizationRow[] = [];
    let balance = P;

    for (let i = 1; i <= n; i++) {
      const opening = balance;
      let interestPaid = opening * r;
      let principalPaid = calculatedEmi - interestPaid;

      // Adjustment for the last month to ensure closing balance is exactly 0
      if (i === n) {
        principalPaid = opening;
        interestPaid = opening * r; // Re-calculate interest based on exact remaining balance
        balance = 0;
      } else {
        balance = opening - principalPaid;
        // Float precision safeguard
        if (balance < 0) balance = 0;
      }

      schedule.push({
        month: i,
        openingBalance: opening,
        emi: principalPaid + interestPaid,
        principal: principalPaid,
        interest: interestPaid,
        closingBalance: balance,
      });
    }

    setAmortizationTable(schedule);
    
    // Trigger update micro-animation
    setAnimate(true);
    const timer = setTimeout(() => setAnimate(false), 300);
    return () => clearTimeout(timer);
  };

  // Convert tenure unit and adapt value
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

  // Copy results summary to clipboard
  const copyToClipboard = () => {
    const unitText = tenureUnit === 'years' ? (tenure === 1 ? 'Year' : 'Years') : (tenure === 1 ? 'Month' : 'Months');
    const summary = `EMI Loan Calculation Summary:
-----------------------------
Loan Amount: ${formatCurrency(loanAmount)}
Interest Rate: ${interestRate}% p.a.
Tenure: ${tenure} ${unitText}
-----------------------------
Monthly EMI: ${formatCurrency(monthlyEmi)}
Total Interest Payable: ${formatCurrency(totalInterest)}
Total Amount Payable: ${formatCurrency(totalPayable)}
-----------------------------
Phulkeshwar Mahto | phulkeshwarmahto@gmail.com
Built for Digital Heroes: https://digitalheroesco.com`;

    navigator.clipboard.writeText(summary)
      .then(() => {
        showToast('Summary copied to clipboard!');
      })
      .catch(() => {
        showToast('Failed to copy summary.');
      });
  };

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
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
          <span className="logo-badge">FREE</span>
        </div>
        <div className="author-chip">
          By <strong>Phulkeshwar Mahto</strong> &nbsp;·&nbsp; 
          <a href="mailto:phulkeshwarmahto@gmail.com">phulkeshwarmahto@gmail.com</a>
        </div>
      </header>

      {/* HERO */}
      <div className="hero">
        <div className="hero-eyebrow">Digital Heroes Trial · Tool 2</div>
        <h1>Free &amp; Instant <span>EMI Calculator</span></h1>
        <p>
          Compare phone EMI plans, home, or car loans. View total interest, monthly payment, and a full amortization schedule instantly.
        </p>
      </div>

      {/* MAIN CONTAINER */}
      <main className="main">
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
                  onChange={(e) => {
                    const val = parseFloat(e.target.value) || 0;
                    setLoanAmount(val);
                  }}
                  placeholder="e.g. 100000"
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
                    const val = parseFloat(e.target.value) || 0;
                    setInterestRate(val);
                    setActivePreset('custom');
                  }}
                  placeholder="e.g. 12"
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
              
              {/* Tenure Unit Toggle */}
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
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 0;
                    setTenure(val);
                  }}
                  placeholder={tenureUnit === 'years' ? "Years (e.g. 5)" : "Months (e.g. 60)"}
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

            <button type="button" className="btn-primary" onClick={calculateEMI}>
              Calculate EMI
            </button>
          </div>

          {/* RIGHT COLUMN: RESULTS & SVG CHART */}
          <div className="card">
            <div className="card-title">Calculation Breakdown</div>

            {/* Monthly EMI Result */}
            <div className="result-box">
              <div className="result-label">Monthly EMI</div>
              <div className={`result-val ${animate ? 'flash' : ''}`}>
                {formatCurrency(monthlyEmi)}
              </div>
            </div>

            {/* SVG Doughnut Chart */}
            <div className="chart-container">
              <svg width="180" height="180" viewBox="0 0 180 180" className="chart-svg">
                {/* Background Track */}
                <circle
                  cx="90"
                  cy="90"
                  r={radius}
                  className="chart-circle bg"
                />
                
                {/* Principal Segment */}
                <circle
                  cx="90"
                  cy="90"
                  r={radius}
                  className="chart-circle principal"
                  strokeDasharray={`${principalStroke} ${circumference}`}
                  strokeDashoffset={0}
                />
                
                {/* Interest Segment */}
                <circle
                  cx="90"
                  cy="90"
                  r={radius}
                  className="chart-circle interest"
                  strokeDasharray={`${interestStroke} ${circumference}`}
                  strokeDashoffset={-principalStroke}
                />
              </svg>

              {/* Inner Center Text */}
              <div className="chart-center-text">
                <span className="chart-center-val">
                  {totalPayable > 0 ? `${Math.round(interestPercent)}%` : '0%'}
                </span>
                <span className="chart-center-lbl">Interest</span>
              </div>
            </div>

            {/* Results Statistics List */}
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

            {/* Visual Split Progress Bar */}
            <div className="split-bar-container">
              <div className="split-bar-label">
                <span>Principal ({Math.round(principalPercent)}%)</span>
                <span>Interest ({Math.round(interestPercent)}%)</span>
              </div>
              <div className="split-bar">
                <div 
                  className="split-part principal" 
                  style={{ width: `${principalPercent}%` }}
                ></div>
                <div 
                  className="split-part interest" 
                  style={{ width: `${interestPercent}%` }}
                ></div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="actions-row">
              <button type="button" className="btn-sec" onClick={copyToClipboard}>
                <span>⎘</span> Copy Summary
              </button>
            </div>
          </div>
        </div>

        {/* BOTTOM FULL-WIDTH SECTIONS: AMORTIZATION SCHEDULE */}
        {amortizationTable.length > 0 && (
          <div className="table-section">
            <div className="table-card">
              <div className="table-header-row">
                <div className="card-title">Amortization Schedule</div>
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
                          {row.closingBalance === 0 ? '₹0.00' : formatCurrency(row.closingBalance)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer>
        <p className="footer-author">
          Built by <strong>Phulkeshwar Mahto</strong> &nbsp;·&nbsp;
          <a href="mailto:phulkeshwarmahto@gmail.com">phulkeshwarmahto@gmail.com</a>
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
