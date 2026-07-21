# Akunuba — Asset Categories QA Matrix (all 7 groups × all 90 sub-categories)

**Date:** 18 Jul 2026 · **Tester account:** `advisor.test.qa@akunuba-test.com` (advisor role, KYC approved, annual plan)
**Environment:** local Next dev server → local FastAPI backend → shared Supabase DB
**Related:** frontend fixes on branch `feat/stripe-billing-integration`; backend notes in `Fullego_Backend/BACKEND_MESSAGE_ASSETS_QA.md`

## 1. Scope & method

Every sub-category of every category group was exercised through four steps:

1. **Create** — an asset with **every form field of its group filled** (payload byte-identical to what the Add Asset wizard sends; the wizard itself was click-tested end-to-end in the browser for one sub-category of each of the 7 groups, including photo/PDF upload, date pickers, dropdowns and tags).
2. **Create-verify** — asset re-fetched; every top-level field and every specification key compared against what was entered.
3. **Edit** — the asset updated (values +10%, text fields appended "EDITED", dropdown values changed), again with the wizard's exact update payload; then re-fetched and verified that **new data saved AND untouched old data survived**.
4. **View Details** — the real `/dashboard/assets/detail?id=…` page loaded in a Chromium browser for **each of the 90 assets** and scanned for every entered value.

**Result: 90/90 sub-categories pass all four steps.** Zero data-loss or mismatch issues remain; the issues found on the way (and fixed during this engagement) are in section 4.

## 2. Dropdown audit

Every dropdown on every group form has selectable options — none was found empty, so no
new option lists were needed:

| Dropdown | Options |
|---|---|
| Asset Type (Portfolio) | Stock, Bond, Real Estate, Luxury Asset, Crypto, Other |
| Condition | Excellent, Very Good, Good, Fair, Poor |
| Ownership Type | Sole, Joint, Trust, Corporate |
| Risk Level | Low, Medium, High, Very High |
| Payment Frequency | Monthly, Quarterly, Semi-Annual, Annual |
| Currency | USD, EUR, GBP, JPY, CHF, CAD, AUD |
| Debt Type (Liabilities) | Mortgage, Personal Loan, Business Loan, Credit Card, Auto / Yacht Loan, Margin Loan, Line of Credit, Tax Liability, Deferred Payment, Lease Agreement (+ custom) |
| Wealth Type (Shadow Wealth) | Pending Inheritance, Unvested Stock / RSUs, Deferred Compensation, Marital / Shared Assets, Trust Allocation, Legal Settlement, Anticipated Exit Proceeds, Brand / IP Equity (+ custom) |
| Type (Philanthropy) | Foundation, Donor-Advised Fund, Endowment, Impact Investment, Scholarship Trust, Charitable Trust (+ custom) |
| Service Type (Lifestyle) | Travel Concierge, Event & Auction Access, Club Membership, Property Maintenance, Insurance Management, Family Office Services (+ custom) |
| Record Type (Governance) | KYC, AML, Legal, Audit, Regulatory Filing (+ custom) |

## 3. Per-sub-category results

Legend: ✔ = pass. "Detail view" = every entered field found on the View Details page **after the fixes in section 4**. Sub-categories marked ¹ needed one page reload during the check (transient local network slowness — data was always correct).


### Assets — fields tested: Asset Name, Description, Category, Location, Make, Model, Year, Estimated Value, Purchase Date, Purchase Price, Condition, Ownership Type, Serial Number, Proof of Ownership, Appraisal Document, Tags

| # | Sub-category | Create | Data verified | Edit (new saved / old kept) | Detail view |
|---|---|---|---|---|---|
| 1 | Yachts | ✔ | ✔ | ✔ / ✔ | ✔ all fields |
| 2 | Private Jets | ✔ | ✔ | ✔ / ✔ | ✔ all fields |
| 3 | Real Estate | ✔ | ✔ | ✔ / ✔ | ✔ all fields |
| 4 | Vehicles | ✔ | ✔ | ✔ / ✔ | ✔ all fields |
| 5 | Art & Collectibles | ✔ | ✔ | ✔ / ✔ | ✔ all fields |
| 6 | Watches & Jewelry | ✔ | ✔ | ✔ / ✔ | ✔ all fields |
| 7 | Precious Metals | ✔ | ✔ | ✔ / ✔ | ✔ all fields |
| 8 | Wine & Whiskey | ✔ | ✔ | ✔ / ✔ | ✔ all fields |
| 9 | Luxury Furniture | ✔ | ✔ | ✔ / ✔ | ✔ all fields |
| 10 | Antiques | ✔ | ✔ | ✔ / ✔ | ✔ all fields |
| 11 | Fine Instruments | ✔ | ✔ | ✔ / ✔ | ✔ all fields |
| 12 | Luxury Memorabilia | ✔ | ✔ | ✔ / ✔ | ✔ all fields |
| 13 | Farmland & Agri Land | ✔ | ✔ | ✔ / ✔ | ✔ all fields |
| 14 | Private Company Equity | ✔ | ✔ | ✔ / ✔ | ✔ all fields |
| 15 | Intellectual Property | ✔ | ✔ | ✔ / ✔ | ✔ all fields |
| 16 | Racehorses & Animals | ✔ | ✔ | ✔ / ✔ | ✔ all fields |
| 17 | Fractional Ownerships | ✔ | ✔ | ✔ / ✔ | ✔ all fields |
| 18 | Classic Motorcycles | ✔ | ✔ | ✔ / ✔ | ✔ all fields |
| 19 | Green Assets | ✔ | ✔ | ✔ / ✔ | ✔ all fields |
| 20 | Digital Collectibles | ✔ | ✔ | ✔ / ✔ | ✔ all fields |
| 21 | Couture & Designer Wear | ✔ | ✔ | ✔ / ✔ | ✔ all fields |
| 22 | Boats & Watercraft | ✔ | ✔ | ✔ / ✔ | ✔ all fields |
| 23 | Raw Precious Stones | ✔ | ✔ | ✔ / ✔ | ✔ all fields |
| 24 | Vaulted/Stored Assets | ✔ | ✔ | ✔ / ✔ | ✔ all fields |

### Portfolio — fields tested: Asset Name, Asset Type, Category, Institution, Account Number (masked), Acquisition Date, Purchase Price, Current Value, Currency, Risk Level, Investment Horizon

| # | Sub-category | Create | Data verified | Edit (new saved / old kept) | Detail view |
|---|---|---|---|---|---|
| 25 | Crypto Assets | ✔ | ✔ | ✔ / ✔ | ✔ all fields |
| 26 | Cash Flow Accounts | ✔ | ✔ | ✔ / ✔ | ✔ all fields |
| 27 | Trade Engine | ✔ | ✔ | ✔ / ✔ | ✔ all fields |
| 28 | Public Equities | ✔ | ✔ | ✔ / ✔ | ✔ all fields |
| 29 | Fixed Income | ✔ | ✔ | ✔ / ✔ | ✔ all fields |
| 30 | ETFs & Index Funds ¹ | ✔ | ✔ | ✔ / ✔ | ✔ all fields |
| 31 | Mutual Funds | ✔ | ✔ | ✔ / ✔ | ✔ all fields |
| 32 | Private Equity | ✔ | ✔ | ✔ / ✔ | ✔ all fields |
| 33 | Hedge Funds | ✔ | ✔ | ✔ / ✔ | ✔ all fields |
| 34 | Commodities | ✔ | ✔ | ✔ / ✔ | ✔ all fields |
| 35 | Structured Products | ✔ | ✔ | ✔ / ✔ | ✔ all fields |
| 36 | Foreign Currency | ✔ | ✔ | ✔ / ✔ | ✔ all fields |
| 37 | Offshore Accounts | ✔ | ✔ | ✔ / ✔ | ✔ all fields |
| 38 | REITs & Real Estate Funds | ✔ | ✔ | ✔ / ✔ | ✔ all fields |
| 39 | Annuities | ✔ | ✔ | ✔ / ✔ | ✔ all fields |
| 40 | Investment-Linked Insurance | ✔ | ✔ | ✔ / ✔ | ✔ all fields |
| 41 | Pension & Retirement ¹ | ✔ | ✔ | ✔ / ✔ | ✔ all fields |
| 42 | Crowdfunding Investments ¹ | ✔ | ✔ | ✔ / ✔ | ✔ all fields |
| 43 | Digital Assets (Non-Crypto) | ✔ | ✔ | ✔ / ✔ | ✔ all fields |
| 44 | ESG & Carbon Credits | ✔ | ✔ | ✔ / ✔ | ✔ all fields |
| 45 | Margin & Credit | ✔ | ✔ | ✔ / ✔ | ✔ all fields |
| 46 | Royalty Streams | ✔ | ✔ | ✔ / ✔ | ✔ all fields |
| 47 | Litigation Finance | ✔ | ✔ | ✔ / ✔ | ✔ all fields |
| 48 | Precious Metal ETFs | ✔ | ✔ | ✔ / ✔ | ✔ all fields |
| 49 | Derivatives & Options | ✔ | ✔ | ✔ / ✔ | ✔ all fields |
| 50 | Trusts / Foundations | ✔ | ✔ | ✔ / ✔ | ✔ all fields |
| 51 | Cash Management | ✔ | ✔ | ✔ / ✔ | ✔ all fields |
| 52 | Stablecoins & CBDCs | ✔ | ✔ | ✔ / ✔ | ✔ all fields |
| 53 | DeFi Instruments | ✔ | ✔ | ✔ / ✔ | ✔ all fields |
| 54 | Convertible Notes | ✔ | ✔ | ✔ / ✔ | ✔ all fields |
| 55 | Tax-Deferred Investments | ✔ | ✔ | ✔ / ✔ | ✔ all fields |
| 56 | Stock Options / RSUs | ✔ | ✔ | ✔ / ✔ | ✔ all fields |
| 57 | Micro-Investments | ✔ | ✔ | ✔ / ✔ | ✔ all fields |

### Liabilities — fields tested: Debt Type, Creditor Name, Amount Owed, Interest Rate, Start Date, Maturity Date, Payment Frequency, Collateral, Currency

| # | Sub-category | Create | Data verified | Edit (new saved / old kept) | Detail view |
|---|---|---|---|---|---|
| 58 | Mortgages | ✔ | ✔ | ✔ / ✔ | ✔ all fields |
| 59 | Personal Loans | ✔ | ✔ | ✔ / ✔ | ✔ all fields |
| 60 | Business Loans | ✔ | ✔ | ✔ / ✔ | ✔ all fields |
| 61 | Credit Cards | ✔ | ✔ | ✔ / ✔ | ✔ all fields |
| 62 | Auto / Yacht Loans | ✔ | ✔ | ✔ / ✔ | ✔ all fields |
| 63 | Margin Loans | ✔ | ✔ | ✔ / ✔ | ✔ all fields |
| 64 | Lines of Credit | ✔ | ✔ | ✔ / ✔ | ✔ all fields |
| 65 | Tax Liabilities | ✔ | ✔ | ✔ / ✔ | ✔ all fields |
| 66 | Deferred Payments | ✔ | ✔ | ✔ / ✔ | ✔ all fields |
| 67 | Lease Agreements | ✔ | ✔ | ✔ / ✔ | ✔ all fields |

### Shadow Wealth — fields tested: Wealth Type, Description, Estimated Value, Expected Date, Documentation, Source Entity, Beneficiary

| # | Sub-category | Create | Data verified | Edit (new saved / old kept) | Detail view |
|---|---|---|---|---|---|
| 68 | Pending Inheritance | ✔ | ✔ | ✔ / ✔ | ✔ all fields |
| 69 | Unvested Stock / RSUs | ✔ | ✔ | ✔ / ✔ | ✔ all fields |
| 70 | Deferred Compensation | ✔ | ✔ | ✔ / ✔ | ✔ all fields |
| 71 | Marital / Shared Assets | ✔ | ✔ | ✔ / ✔ | ✔ all fields |
| 72 | Trust Allocations | ✔ | ✔ | ✔ / ✔ | ✔ all fields |
| 73 | Legal Settlements | ✔ | ✔ | ✔ / ✔ | ✔ all fields |
| 74 | Anticipated Exit Proceeds | ✔ | ✔ | ✔ / ✔ | ✔ all fields |
| 75 | Brand / IP Equity | ✔ | ✔ | ✔ / ✔ | ✔ all fields |

### Philanthropy — fields tested: Fund/Vehicle Name, Type (Foundation/DAF/etc), Purpose, Start Date, Contribution Value, Institution, Jurisdiction, Impact Area

| # | Sub-category | Create | Data verified | Edit (new saved / old kept) | Detail view |
|---|---|---|---|---|---|
| 76 | Foundations | ✔ | ✔ | ✔ / ✔ | ✔ all fields |
| 77 | Donor-Advised Funds | ✔ | ✔ | ✔ / ✔ | ✔ all fields |
| 78 | Endowments | ✔ | ✔ | ✔ / ✔ | ✔ all fields |
| 79 | Impact Investments ¹ | ✔ | ✔ | ✔ / ✔ | ✔ all fields |
| 80 | Scholarship Trusts | ✔ | ✔ | ✔ / ✔ | ✔ all fields |

### Lifestyle — fields tested: Service Type, Vendor Name, Membership/Service ID, Start Date, End Date, Associated Asset, Location, Annual Cost

| # | Sub-category | Create | Data verified | Edit (new saved / old kept) | Detail view |
|---|---|---|---|---|---|
| 81 | Travel Concierge | ✔ | ✔ | ✔ / ✔ | ✔ all fields |
| 82 | Event & Auction Access | ✔ | ✔ | ✔ / ✔ | ✔ all fields |
| 83 | Club Memberships | ✔ | ✔ | ✔ / ✔ | ✔ all fields |
| 84 | Property Maintenance | ✔ | ✔ | ✔ / ✔ | ✔ all fields |
| 85 | Insurance Management | ✔ | ✔ | ✔ / ✔ | ✔ all fields |
| 86 | Family Office Services | ✔ | ✔ | ✔ / ✔ | ✔ all fields |

### Governance — fields tested: Record Type, Document Name, Related Asset/User, Upload Date, Expiry Date, Verified By, Notes

| # | Sub-category | Create | Data verified | Edit (new saved / old kept) | Detail view |
|---|---|---|---|---|---|
| 87 | KYC & AML Records | ✔ | ✔ | ✔ / ✔ | ✔ all fields |
| 88 | Audit Logs | ✔ | ✔ | ✔ / ✔ | ✔ all fields |
| 89 | Legal Agreements | ✔ | ✔ | ✔ / ✔ | ✔ all fields |
| 90 | Regulatory Filings | ✔ | ✔ | ✔ / ✔ | ✔ all fields |


## 4. Issues found during this pass (and their status)

### Fixed in frontend (this branch)

| # | Issue | Fix |
|---|---|---|
| 1 | **View Details showed almost none of the entered data.** The page hardcoded a real-estate "Property Details" card (Property Type, Address, Size, Year Built), so Liabilities/Portfolio/Shadow Wealth/Philanthropy/Lifestyle/Governance details (debt type, creditor, interest rate, fund type, service type, record type, …) were invisible, and the card showed blank rows. | `AssetDetailClient.js` — details card now renders **every** specification dynamically with proper labels, money/date formatting. |
| 2 | **Description, Condition and Purchase Price were shown nowhere** on the detail page (confirmed missing on the first 15 sub-categories checked). | Added to the details card; re-checked — visible for all applicable sub-categories. |
| 3 | Post-edit/cancel redirect went to `/dashboard/assets/<id>` — a route that doesn't exist (static export uses `/dashboard/assets/detail?id=`) → **404 after every edit save**. | 4 redirects corrected in the add/edit wizard. |
| 4 | Step-3 valuation silently overrode step-1 edits of Estimated/Current Value, Amount Owed, Contribution Value (stale prefilled value won on save). | Step-1 value fields now sync to the step-3 valuation field. |
| 5 | Philanthropy assets were created with **no value** (Contribution Value not promoted to estimated/current value → excluded from net worth). | `contribution_value` added to the value-promotion chain (create + update). |
| 6 | Non-Portfolio assets always stored `asset_type: "other"` (their forms have no Asset Type field, and edit could never correct it). | Category→type mapping (Yachts→luxury_asset, Real Estate→real_estate, …) now applied on create **and** update when the form has no Asset Type field. |
| 7 | Assets-list cards showed **no fields** for Liabilities/Lifestyle/Governance (and partial for others) — card field lookup read top-level keys that live in `specifications`. | Card field resolver rewritten (correct spec keys, money formatting, timezone-safe dates). |
| 8 | Assets in the 5 groups without an "Asset Name" field could **never be renamed** (edit kept the old name). | Name now re-derives from the group's identifying field (debt type / wealth type / fund name / service type / document name) on edit. |

### Backend-owned (documented in `BACKEND_MESSAGE_ASSETS_QA.md`, not fixed here)

1. **18 of 90 sub-categories were missing from the backend's seeded `asset_categories` table** (most of Shadow Wealth, Philanthropy, Lifestyle, Governance). The create endpoint auto-created them during this test, so all 90 now exist — but `scripts/seed_categories.py` should be aligned with the frontend's category list for fresh environments.
2. Valueless assets store `estimated_value = NULL` but `current_value = 0.00` (inconsistent conventions).
3. Date-only `acquisition_date` values are stored with a timezone offset (`07:00:00+00`).
4. Free-plan 5-asset limit returns a clear 403 — working as intended (verified when the 6th asset was rejected).

## 5. Test data inventory

97 assets exist on the QA account: 7 from the earlier interactive browser pass (named e.g. "Ocean Pearl Yacht II") and 90 from this matrix (named "QA <Sub-category> Asset/Holding/Fund/Record" or the group's type name). All are flagged QA data and can be deleted or kept for regression.
