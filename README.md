<div align="center">

# 👁️ SAATCHI

### Your Digital Witness

> *“Because deleted evidence should not mean denied justice.”*

![React](https://img.shields.io/badge/Frontend-React-blue?style=for-the-badge\&logo=react)
![TailwindCSS](https://img.shields.io/badge/UI-TailwindCSS-38BDF8?style=for-the-badge\&logo=tailwindcss)
![Supabase](https://img.shields.io/badge/Backend-Supabase-3ECF8E?style=for-the-badge\&logo=supabase)
![Chrome Extension](https://img.shields.io/badge/Platform-Chrome_Extension-4285F4?style=for-the-badge\&logo=googlechrome)

### Commit Happens Hackathon 2026

</div>

---

# The Problem

Online harassment disappears faster than justice can react to it.
Victims of cyberbullying often lose critical evidence before they are able to:

* report it,
* preserve it,
* or legally use it.

A normal screenshot is rarely enough.
It does not prove:

* when the content existed,
* where it came from,
* whether it was edited,
* or whether the evidence remained untouched afterward.

Meanwhile:

* platforms remove flagged content,
* accounts get deleted,
* stories disappear,
* and victims panic before preserving proof properly.

As a result, many genuine cases fail because evidence handling itself is weak.

---

# Our Idea

SAATCHI is a browser extension and evidence preservation platform designed to capture online harassment in a legally meaningful and tamper-resistant way.

Instead of only taking screenshots, SAATCHI preserves:

* page state,
* timestamps,
* platform metadata,
* sender identity,
* source URL,
* and cryptographic verification hashes.

The platform acts like a **digital witness** that records evidence before it disappears.

---

# Why We Chose This Problem

We realized that most reporting systems focus on:

* moderation,
* blocking users,
* or reporting abuse.

Very few focus on:

* evidence preservation,
* integrity verification,
* and structured legal documentation.

That missing layer is what inspired SAATCHI.
Our goal is not just reporting harassment.
Our goal is helping victims preserve proof safely and reliably.

---

# What SAATCHI Does

## ⚡ Instant Evidence Capture
Capture online harassment in real time with a single click.
The extension preserves:

* screenshot,
* page content,
* metadata,
* and source information together.

---

## 🔐 SHA-256 Tamper Verification

Every captured incident receives a unique SHA-256 cryptographic hash.
This allows future verification that:
* the evidence was not modified,
* altered,
* or tampered with after capture.

---

## ☁️ Secure Evidence Vault

Users can securely store incidents inside their personal evidence dashboard.

The vault helps organize:

* cases,
* screenshots,
* metadata,
* and reports in one place.

---

## 📄 Legal-Ready Report Generation

SAATCHI automatically generates structured PDF reports containing:

* evidence preview,
* metadata,
* timestamps,
* URLs,
* and integrity hashes.

These reports can later be shared with:

* institutions,
* workplaces,
* cybercrime cells,
* NGOs,
* or legal authorities.

---

# Proposed Workflow

```text
Victim encounters harassment
            ↓
Clicks SAATCHI Capture
            ↓
Extension captures:
- Screenshot
- URL
- Timestamp
- Sender Information
- Page Metadata
            ↓
SHA-256 Hash Generated
            ↓
Encrypted Evidence Stored
            ↓
User Generates Legal Report
```

---

# Planned Features

| Feature                    | Description                                  |
| -------------------------- | -------------------------------------------- |
| Real-Time Capture          | Instantly preserve online evidence           |
| Metadata Extraction        | Save URL, sender ID, timestamp, and platform |
| Cryptographic Verification | SHA-256 tamper-proof integrity               |
| Secure Evidence Vault      | Store and manage incidents                   |
| PDF Report Generator       | Export legal-ready documentation             |
| User Authentication        | Secure personal access                       |
| Evidence Verification      | Re-check integrity anytime                   |

---

# Tech Stack

| Layer             | Technology          |
| ----------------- | ------------------- |
| Frontend          | React + TailwindCSS |
| Browser Extension | Chrome Manifest V3  |
| Backend           | Supabase            |
| Database          | PostgreSQL          |
| Authentication    | Supabase Auth       |
| Hashing           | Web Crypto API      |
| PDF Reports       | jsPDF               |
| Deployment        | Vercel              |

---

# Initial Architecture

```text
Browser Extension
        ↓
Evidence Capture Engine
        ↓
Metadata + Hash Generation
        ↓
Secure Database Storage
        ↓
Dashboard & Report Generator
```

---

# Project Structure

```text
saatchi/
│
├── extension/
│   ├── manifest.json
│   ├── popup.html
│   ├── popup.js
│   └── background.js
│
├── web-app/
│   ├── src/
│   ├── components/
│   ├── pages/
│   └── utils/
│
├── backend/
│
├── docs/
│
└── README.md
```

---

# Goals For The Hackathon

Our primary goals are:

* Build a working Chrome extension
* Capture and preserve evidence securely
* Generate cryptographic hashes
* Create downloadable legal reports
* Build a clean and simple UI
* Deploy a working live prototype

---

# Future Scope
SAATCHI can later evolve into:

* mobile applications,
* institutional safety systems,
* cybercrime reporting integrations,
* AI-based harassment detection,
* chain-of-custody tracking,
* and encrypted cloud evidence systems.

---

# Team Vision
We believe evidence should not disappear before victims are heard.
SAATCHI is being built with the idea that:

* proof matters,
* integrity matters,
* and victims deserve better digital protection tools.
This project is our attempt to make online evidence preservation more trustworthy, accessible, and legally useful.

---

# Team
Built during **Commit Happens Hackathon 2026**
Team CREATIVE COMPILERS

---
