# ESG Alpha Gap

**AI-Powered ESG Transformation & Market Recognition Intelligence Platform**

ESG Alpha Gap is a forward-looking ESG intelligence platform designed to identify companies whose **real ESG transformation may be progressing faster than the market recognises**.

Instead of relying only on traditional ESG ratings and annual disclosures, the platform analyses recent ESG-related signals, evaluates the strength of corporate transformation, measures market recognition, and calculates an **Alpha Gap** to surface potentially overlooked ESG improvers.

> **Core idea:** Find companies where ESG transformation is strong, but market recognition is still catching up.

---

## 1. Problem Statement

Traditional ESG assessment can be:

* **Backward-looking** — heavily dependent on annual or periodic disclosures.
* **Slow to reflect change** — recent improvements may take time to appear in formal ESG ratings.
* **Information-heavy** — investors must manually analyse large amounts of ESG information.
* **Difficult to compare** — ESG activity and market recognition are often evaluated separately.
* **Prone to surface-level signals** — high ESG visibility does not necessarily mean strong underlying transformation.

This creates an information gap.

A company may be making meaningful ESG improvements today while receiving relatively little market attention.

**ESG Alpha Gap is designed to detect that gap.**

---

## 2. Our Solution

ESG Alpha Gap transforms ESG-related evidence into an explainable investor intelligence signal.

The system evaluates two main dimensions:

### Transformation Strength

Measures evidence indicating that a company is actively improving its ESG position.

Signals can include:

* ESG news signal density
* Positive ESG initiatives
* Environmental developments
* Social initiatives
* Governance improvements
* Supporting evidence count
* Strength and consistency of ESG signals

### Market Recognition

Measures how strongly those ESG developments appear to be recognised externally.

Indicators can include:

* News visibility
* Media attention
* Recognition indicators
* Relative ESG-related coverage

### Alpha Gap

The platform then compares the two dimensions:

**Alpha Gap = Transformation Strength − Market Recognition**

A **high positive Alpha Gap** suggests that ESG transformation appears stronger than current market recognition.

This does **not** represent guaranteed investment alpha or predict future share prices. It is an intelligence signal designed to help users identify companies that may deserve deeper investigation.

---

## 3. Key Features

### ESG Market Scanner

Scans companies and collects relevant ESG evidence for analysis.

Supported scanning workflows include:

* Custom company watchlists
* Sector-based scans
* ASEAN-focused scans
* Broader market-universe analysis

### Transformation Strength Score

Evaluates the strength of ESG improvement signals detected for each company.

### Market Recognition Score

Estimates how much visibility and recognition the company's ESG developments are currently receiving.

### Alpha Gap Score

Compares transformation strength against market recognition to identify potential ESG recognition gaps.

### Hidden ESG Improvers

Surfaces companies demonstrating strong ESG transformation signals that may not yet receive equivalent market attention.

### Evidence-Based Analysis

Rather than presenting only a score, the platform provides supporting evidence so users can understand **why** a company received its assessment.

### Explainable AI

AI is used to structure, classify, summarise, and interpret ESG information while keeping the underlying evidence visible to the user.

### Company-Level Intelligence

Users can move from market-level discovery into individual companies to investigate their ESG signals and supporting evidence.

---

## 4. How It Works

```text
ESG / Market Data Sources
          │
          ▼
   Evidence Collection
          │
          ▼
 Cleaning & Normalisation
          │
          ▼
   AI Signal Analysis
          │
          ├───────────────┐
          ▼               ▼
 Transformation      Market Recognition
    Strength
          │               │
          └───────┬───────┘
                  ▼
             Alpha Gap
                  │
                  ▼
       Ranking & Intelligence
                  │
                  ▼
       Explainable Dashboard
```

The workflow follows five broad stages:

1. **Collect** relevant company and ESG evidence.
2. **Process** and normalise the collected information.
3. **Analyse** ESG signals using the intelligence pipeline.
4. **Score** transformation strength and market recognition.
5. **Explain** the resulting Alpha Gap through evidence and company-level insights.

---

## 5. Technology Stack

### Frontend

* Next.js
* React
* TypeScript
* Tailwind CSS
* Framer Motion

The frontend provides the interactive dashboard, market scanning experience, company analysis, score visualisations, evidence presentation, and user interactions.

### Backend

The backend manages:

* API endpoints
* Market universe generation
* Scan execution
* Scan lifecycle management
* Company-level evidence collection
* Intelligence scoring
* Scan result retrieval
* Scan history and caching

### AI / Intelligence Layer

The intelligence pipeline is responsible for converting unstructured ESG information into structured signals used by the scoring system.

```text
Raw ESG Evidence
      ↓
Evidence Processing
      ↓
ESG Signal Extraction
      ↓
Signal Classification
      ↓
Evidence Aggregation
      ↓
Transformation Strength
      +
Market Recognition
      ↓
Alpha Gap
      ↓
Explainable Result
```

The AI layer supports the analysis rather than acting as an unexplained black-box investment decision-maker.

---

## 6. Project Architecture

The system follows a modular full-stack architecture.

```text
┌─────────────────────────────────────┐
│             Frontend                │
│ Next.js • React • TypeScript        │
│ Tailwind CSS • Framer Motion        │
└─────────────────┬───────────────────┘
                  │
                  ▼
┌─────────────────────────────────────┐
│          Backend / API Layer        │
│ Scan APIs • Universe APIs           │
│ Lifecycle • Cache • Results         │
└─────────────────┬───────────────────┘
                  │
                  ▼
┌─────────────────────────────────────┐
│       ESG Intelligence Engine       │
│ Evidence → Signals → Scores         │
│ Transformation • Recognition       │
│ Alpha Gap • Explanations            │
└─────────────────┬───────────────────┘
                  │
                  ▼
┌─────────────────────────────────────┐
│           Data Sources              │
│ ESG News • Company Evidence         │
│ Market / Public Data Sources        │
└─────────────────────────────────────┘
```

Separating these layers allows individual components to be improved or replaced without redesigning the entire platform.

---

## 7. Market Scan API Structure

The application includes backend services for multiple scanning workflows.

```text
/api/market/health
/api/market/scan
/api/market/scan/[scanId]
/api/market/scan/[scanId]/results
/api/market/scan/custom
/api/market/scan/sector
/api/market/scan/asean
/api/market/universe
/api/market/universe/sector
/api/market/universe/asean
```

These APIs support dynamic market universe generation, company scanning, scan lifecycle tracking, evidence processing, and retrieval of intelligence results.

---

## 8. Target Users

### ESG & Sustainable Investors

Discover companies showing emerging ESG improvements before those developments are fully reflected in conventional assessments.

### Equity Analysts

Use ESG transformation signals as an additional research layer during company analysis.

### Asset Managers

Screen larger company universes for ESG developments that warrant deeper investigation.

### ESG Research Teams

Reduce the amount of manual work required to monitor rapidly changing ESG information.

### Financial Institutions

Integrate explainable ESG intelligence into research and sustainability-related workflows.

---

## 9. User Value

ESG Alpha Gap changes the ESG research question from:

> **“Which companies already have strong ESG ratings?”**

to:

> **“Which companies are improving now, and has the market recognised that improvement yet?”**

This provides users with a more **forward-looking, evidence-driven and actionable** approach to ESG research.

---

## 10. Why ESG Alpha Gap Is Different

Most ESG platforms focus primarily on determining:

**How sustainable is this company today?**

ESG Alpha Gap adds two different questions:

**How quickly is the company transforming?**

and

**Has that transformation received proportional market recognition?**

This distinction enables the system to identify potential **hidden ESG improvers**, rather than simply ranking companies that are already recognised as ESG leaders.

---

## 11. Example

Consider two hypothetical companies:

| Company   | Transformation Strength | Market Recognition | Alpha Gap |
| --------- | ----------------------: | -----------------: | --------: |
| Company A |                      82 |                 76 |        +6 |
| Company B |                      79 |                 43 |   **+36** |

Company A has strong ESG transformation, but much of it is already receiving recognition.

Company B also demonstrates strong transformation, while receiving substantially lower recognition.

ESG Alpha Gap would therefore highlight **Company B for further investigation**.

The platform does not automatically recommend buying Company B. Instead, it identifies an **information asymmetry worth investigating**.

---

## 12. Responsible AI & Limitations

ESG Alpha Gap is designed as a **decision-support and research tool**, not an automated investment adviser.

Important limitations include:

* ESG news does not always represent actual corporate performance.
* Media coverage can contain reporting bias.
* Publicly available evidence may be incomplete.
* AI classification and interpretation can contain errors.
* Alpha Gap does not guarantee financial returns.
* Correlation between ESG transformation and future market performance requires further empirical validation.

For this reason, the platform prioritises **explainability and evidence visibility** instead of presenting scores without context.

---

## 13. Scalability

The modular architecture allows the platform to expand beyond the initial MVP.

Future extensions could include:

* Additional ASEAN markets
* Global company coverage
* Regulatory and sustainability filings
* Patent activity
* Green hiring and job-posting signals
* Supply-chain ESG signals
* Alternative datasets
* Historical Alpha Gap backtesting
* Portfolio-level ESG intelligence
* Real-time ESG alerts
* Commercial ESG data integrations

---

## 14. Cost & Deployment

The MVP is designed around largely public data sources, keeping initial operating costs relatively low.

A small-scale deployment could operate at approximately **tens to a few hundred SGD per month**, depending on AI model usage, scan frequency, hosting, and the number of companies analysed.

Enterprise costs would primarily depend on:

* Cloud infrastructure
* Commercial ESG/financial datasets
* AI inference volume
* Number of companies monitored
* Scan frequency
* Number of users

The modular architecture allows individual services to scale independently as usage grows.

---

## 15. Future Development

Potential next steps include:

1. Historical backtesting of Alpha Gap signals.
2. Validation against subsequent ESG rating changes.
3. Integration of additional alternative datasets.
4. Improved sector-specific scoring.
5. Source credibility weighting.
6. Temporal signal-decay modelling.
7. Portfolio monitoring and alerts.
8. Enterprise ESG data integrations.
9. Expansion across ASEAN and global markets.
10. Evaluation of whether Alpha Gap signals have measurable relationships with future market recognition or financial performance.

---

## 16. Vision

ESG intelligence should not only describe **where a company has been**.

It should help investors understand **where the company appears to be heading**.

**ESG Alpha Gap turns fragmented ESG evidence into forward-looking intelligence — helping users discover transformation before recognition catches up.**

---

### Built for POLYFINTECH100 Hackathon

**Team NovaMind**

**ESG Alpha Gap**
*Detect the transformation. Measure the recognition. Find the gap.*
