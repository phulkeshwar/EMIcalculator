# EMI & Loan Calculator

A high-fidelity, client-side React TypeScript application for instant Equated Monthly Installment (EMI) and loan calculations. It features quick loan presets, dynamic SVG doughnut visualization, and a detailed, print-friendly amortization schedule.

## Features

1.  **Synchronized Controls**: Instantly calculate values on input updates using numeric fields and range sliders.
2.  **Flexible Tenures**: Toggle inputs and calculations between **Months** and **Years** with automatic slider adjustments.
3.  **Loan Type Presets**: Quick select buttons to instantly apply standard interest rates:
    *   **Home Loan** (8.5%)
    *   **Car Loan** (9.0%)
    *   **Personal Loan** (14.0%)
    *   **Education Loan** (7.0%)
    *   **Custom** rate inputs.
4.  **Math Accuracy**: Calculations utilize standard compound interest formulas:
    $$r = \frac{\text{Annual Interest Rate}}{12 \times 100}$$
    $$n = \text{Tenure in months}$$
    $$\text{EMI} = \frac{P \times r \times (1+r)^n}{(1+r)^n - 1}$$
5.  **Amortization Schedule**: Generate a detailed monthly payment breakdown showing Opening Balance, EMI, Principal Paid, Interest Paid, and Closing Balance. Includes float-rounding adjustments to ensure the final month closes at exactly `₹0.00`.
6.  **Interactive SVG Doughnut Chart**: Visually representing the Principal vs Interest split. Built entirely with pure SVG elements (no bulky third-party chart libraries).
7.  **Clipboard Sharing**: Quick copy button to copy a formatted calculation summary to your clipboard, accompanied by a dynamic sliding toast notification.
8.  **Responsive Theme**: Dark themed user interface (surface `#162236`, background `#0F1B2D`, accent `#3B82F6`) that collapses into a single-column layout on mobile viewports (<768px).

---

## Technical Details

*   **Framework**: [Vite](https://vite.dev/) + [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
*   **Styling**: Pure CSS (using CSS variables, CSS grid layouts, and custom range inputs)
*   **Visual Assets**: Pure inline SVG definitions
*   **Fonts**: `Space Grotesk` (headings, results, numbers) and `Inter` (body paragraphs) loaded via Google Fonts.

---

## Local Setup

### Prerequisites
*   Node.js (v18+)
*   npm or yarn

### Installation
1. Navigate to the repository folder:
   ```bash
   cd EMI
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the local development server:
   ```bash
   npm run dev
   ```
4. Build the application for production:
   ```bash
   npm run build
   ```

---

## Deployment to Vercel

Since this is a client-side static web application, it can be deployed directly to Vercel:
1. Log in to [Vercel](https://vercel.com).
2. Click **Add New** → **Project**.
3. Import your GitHub repository `EMIcalculator`.
4. Leave build commands and directories as default (Vite preset is auto-detected).
5. Click **Deploy**.

---

## Advanced Features Implemented

*   **Prepayment & Part-Payment Modeling**: Add extra recurring or lump-sum payments at specific milestones and forecast months saved or EMI reductions.
*   **Side-by-Side Loan Comparison**: Compare two loan offers with varying interest rates, principals, and tenures side-by-side to review absolute savings.
*   **Reverse Loan Eligibility Calculator**: Estimate maximum loan principal allowed based on monthly income, existing obligations, and target FOIR bank guidelines.

## Submission Details
*   **Developer**: Phulkeshwar Mahto
*   **Email**: [phulkeshwarmahto@gmail.com](mailto:phulkeshwarmahto@gmail.com)
*   **Organization**: Built for Digital Heroes ([https://digitalheroesco.com](https://digitalheroesco.com))
