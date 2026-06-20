# Tool 2 — EMI / Loan Calculator
### Digital Heroes Trial | Vibe Coding Spec for Antigravity + Claude

---

## What to Build
A free, instant EMI and loan calculator that shows monthly payment, total interest, and a full amortization table — no signup, no ads, deployed on Vercel.

**Personal use case to mention in submission:**
> "I used this when comparing phone EMI plans (Flipkart vs bank loan) — I wanted to see the real interest I'd pay over 12 months, not just the monthly amount."

---

## Prompt to Paste into Antigravity (Claude Sonnet 4.6)

```
Build a single-file HTML/CSS/JS EMI Loan Calculator web app. No frameworks, no build step — pure HTML in one index.html file that I can deploy directly on Vercel.

FEATURES:
1. Three inputs: Loan Amount (₹), Annual Interest Rate (%), Loan Tenure (months or years toggle)
2. Instant calculation on input change (no submit button needed, but keep a Calculate button too)
3. Show results:
   - Monthly EMI (large, prominent)
   - Total Amount Payable
   - Total Interest Payable
   - Principal %  vs Interest % (visual bar)
4. Full amortization table: Month | Opening Balance | EMI | Principal | Interest | Closing Balance
5. Preset loan types as quick-select buttons: Home Loan (8.5%), Car Loan (9%), Personal Loan (14%), Education Loan (7%), Custom
6. Toggle between Monthly and Yearly tenure input
7. A doughnut/pie chart showing Principal vs Interest split (use pure SVG — no Chart.js)
8. Copy result summary button
9. "Built for Digital Heroes" button linking to https://digitalheroesco.com — label must be EXACT
10. Show full name "Phulkeshwar Mahto" and email "phulkeshwarmahto@gmail.com" visibly on the page

DESIGN:
- Dark theme: background #0F1B2D, card surface #162236, accent color #3B82F6 (blue — money/finance feel)
- Font: Space Grotesk (Google Fonts) for headings and numbers, Inter for body
- Two-column layout on desktop: inputs left, results right
- Mobile responsive (single column under 680px)
- Smooth transition when numbers update
- No emojis in buttons, clean professional look

TECH:
- Single index.html file (HTML + CSS + JS all in one)
- No npm, no node_modules, no framework
- Google Fonts via CDN link in <head>
- EMI formula: EMI = P × r × (1+r)^n / ((1+r)^n - 1)
  where P = principal, r = monthly rate (annual/12/100), n = months

MANDATORY:
- Button labeled EXACTLY "Built for Digital Heroes" → href="https://digitalheroesco.com"
- Name: Phulkeshwar Mahto
- Email: phulkeshwarmahto@gmail.com
- Must work and produce correct output
- No paid APIs or libraries
```

---

## Required Output Checklist (verify before deploying)

- [ ] EMI formula is correct — test: ₹1,00,000 @ 12% for 12 months = ₹8,884.88/month
- [ ] Amortization table rows add up — final closing balance = ₹0
- [ ] "Built for Digital Heroes" button exists with exact label, links to https://digitalheroesco.com
- [ ] Name "Phulkeshwar Mahto" visible on page
- [ ] Email "phulkeshwarmahto@gmail.com" visible on page (make it a mailto: link)
- [ ] Tenure toggle works (months ↔ years)
- [ ] Preset loan buttons change the interest rate correctly
- [ ] Pie/donut chart renders (SVG — no blank circle)
- [ ] Mobile layout works (test by resizing browser to 375px wide)
- [ ] No console errors on load

---

## GitHub → Vercel Deployment (step by step)

### Step 1 — GitHub Repo
1. Go to github.com → **New repository**
2. Name it: `emi-loan-calculator`
3. Set to **Public**
4. Do NOT add README (keep it empty)
5. Click **Create repository**
6. On your machine, open the folder with `index.html`
7. Run:
```bash
git init
git add index.html
git commit -m "feat: EMI loan calculator - Digital Heroes trial tool 2"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/emi-loan-calculator.git
git push -u origin main
```

### Step 2 — Vercel Deploy
1. Go to vercel.com → **Add New Project**
2. Click **Import Git Repository** → select `emi-loan-calculator`
3. Framework Preset: **Other** (it's plain HTML, no framework)
4. Root Directory: `.` (leave as is)
5. Build Command: leave **blank**
6. Output Directory: leave **blank**
7. Click **Deploy**
8. Wait ~30 seconds → copy your live URL (e.g. `emi-loan-calculator.vercel.app`)

### Step 3 — Verify Live
- Open the live URL
- Enter a loan amount and check EMI is correct
- Click "Built for Digital Heroes" — confirm it goes to digitalheroesco.com
- Check your name and email are visible
- Open on mobile — check layout

---

## Submission Line (copy-paste ready)

> **Tool:** EMI / Loan Calculator
> **Personal use:** Used this to compare phone EMI plans on Flipkart vs bank offer — wanted to see total interest paid, not just monthly amount.
> **Live URL:** https://emi-loan-calculator.vercel.app
> **GitHub:** https://github.com/phulkeshwarmahto/emi-loan-calculator
> **Name:** Phulkeshwar Mahto
> **Email:** phulkeshwarmahto@gmail.com

---

## MCP / Tools to Use in Antigravity

| Tool | Why |
|------|-----|
| **Claude Sonnet 4.6** (built into Antigravity) | Write all HTML/CSS/JS from the prompt above |
| **Gemini** (built into Antigravity, backup) | If Claude hits a limit, switch and continue |
| **Vercel MCP** (connect in Claude.ai settings) | Deploy directly from chat — `vercel deploy` via MCP instead of CLI |
| **GitHub MCP** (connect in Claude.ai settings) | Create repo and push files without leaving chat |

### How to use Vercel MCP in Antigravity
1. In Antigravity settings → MCP Servers → Add: `https://mcp.vercel.com`
2. Authenticate with your Vercel account
3. After building, tell Claude: *"Deploy this index.html to Vercel as a new project called emi-loan-calculator"*
4. Claude will create the project and return the live URL

### How to use GitHub MCP in Antigravity
1. MCP Servers → Add: GitHub MCP (search "GitHub" in Antigravity's MCP store)
2. After build, tell Claude: *"Create a public GitHub repo called emi-loan-calculator and push this index.html"*

---

## Skills Checklist (what Claude will handle automatically)

- **HTML structure** — semantic, single-file
- **CSS** — dark theme, grid layout, responsive, animations
- **JS** — EMI formula, amortization loop, live update, SVG chart
- **No external deps** — everything inline, deploys as static HTML

---

## Quick Formula Reference (for verifying Claude's output)

```
EMI = P × r × (1+r)^n / ((1+r)^n − 1)

P = Principal (loan amount)
r = Monthly interest rate = Annual Rate / 12 / 100
n = Tenure in months

Total Payable = EMI × n
Total Interest = Total Payable − P
```

**Test case:**
- P = ₹5,00,000 | Rate = 10% p.a. | n = 24 months
- r = 10/12/100 = 0.008333
- EMI = ₹23,072.46
- Total Payable = ₹5,53,739
- Total Interest = ₹53,739
