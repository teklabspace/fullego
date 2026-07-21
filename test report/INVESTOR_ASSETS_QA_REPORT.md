# Akunuba — Investor Asset QA Report (all 7 groups · all 90 sub-categories)

**Prepared:** 19 Jul 2026 · **Account under test:** `investor.test.qa@akunuba-test.com` (role: **investor**, KYC approved, Annual plan)

## Summary

| Check | Result |
|---|---|
| Sub-categories covered | **90 / 90** (every sub-category of all 7 category groups) |
| Asset created with every form field filled | **90 / 90 pass** |
| Stored data verified field-by-field after creation | **90 / 90 pass — 0 mismatches** |
| Asset edited (values, text, dropdowns changed) | **90 / 90 pass** |
| After edit: new data saved AND old data preserved | **90 / 90 pass — 0 losses** |
| Every field visible on the View Details page | **90 / 90 pass** |
| Assets list pagination (20 per page, 5 pages, 90 total) | **Pass** |
| Only investor role can add/edit assets (advisor & admin blocked) | **Pass** |

Below, every asset is listed with each field's **original value** (as created), its
**updated value** (after the edit test), and whether the final value is
**visible on the asset's View Details page**. Where original and updated value
differ, the edit changed it deliberately; identical values prove untouched data
survived the edit.


---

# Category group: Assets

## 1. Yachts — “QA Yachts Asset”

Asset ID: `40128e8b-8e06-48c2-be89-b870d1f0dcb5`

| Field | Original (created) | Updated (after edit) | Visible in View Details |
|---|---|---|---|
| Asset Name | QA Yachts Asset | QA Yachts Asset | ✔ |
| Category | Yachts | Yachts | ✔ |
| Description | QA matrix test asset for Yachts. | QA matrix test asset for Yachts. Updated by edit pass. ⭑ | ✔ |
| Location | Test City 1 | Test City 1 EDITED ⭑ | ✔ |
| Asset Type | luxury_asset | luxury_asset | n/a |
| Estimated Value | $110,000 | $121,000 ⭑ | ✔ |
| Current Value | $110,000 | $121,000 ⭑ | ✔ |
| Condition | Excellent | Very Good ⭑ | ✔ |
| Ownership Type | Sole | Sole | ✔ |
| Acquisition/Purchase Date | 2023-05-10 | 2023-05-10 | ✔ |
| Purchase Price | $95,000 | $95,000 | ✔ |
| Currency | USD | USD | n/a |
| Valuation Type | manual | manual | n/a |
| Make | Maker 1 | Maker 1 | ✔ |
| Model | Model-X1 | Model-X1 | ✔ |
| Year | 2023 | 2023 | ✔ |
| Serial Number | SN-0001-QA | SN-0001-QA EDITED ⭑ | ✔ |
| Proof of Ownership | Ownership Cert QA-0001 | Ownership Cert QA-0001 | ✔ |
| Appraisal Document | Appraisal Doc QA-0001 | Appraisal Doc QA-0001 | ✔ |
| Tags | qa, matrix | qa, matrix | n/a |

## 2. Private Jets — “QA Private Jets Asset”

Asset ID: `6b0c080e-b326-4958-aa6d-916be511ec51`

| Field | Original (created) | Updated (after edit) | Visible in View Details |
|---|---|---|---|
| Asset Name | QA Private Jets Asset | QA Private Jets Asset | ✔ |
| Category | Private Jets | Private Jets | ✔ |
| Description | QA matrix test asset for Private Jets. | QA matrix test asset for Private Jets. Updated by edit pass. ⭑ | ✔ |
| Location | Test City 2 | Test City 2 EDITED ⭑ | ✔ |
| Asset Type | luxury_asset | luxury_asset | n/a |
| Estimated Value | $120,000 | $132,000 ⭑ | ✔ |
| Current Value | $120,000 | $132,000 ⭑ | ✔ |
| Condition | Excellent | Very Good ⭑ | ✔ |
| Ownership Type | Sole | Sole | ✔ |
| Acquisition/Purchase Date | 2023-05-10 | 2023-05-10 | ✔ |
| Purchase Price | $105,000 | $105,000 | ✔ |
| Currency | USD | USD | n/a |
| Valuation Type | manual | manual | n/a |
| Make | Maker 2 | Maker 2 | ✔ |
| Model | Model-X2 | Model-X2 | ✔ |
| Year | 2023 | 2023 | ✔ |
| Serial Number | SN-0002-QA | SN-0002-QA EDITED ⭑ | ✔ |
| Proof of Ownership | Ownership Cert QA-0002 | Ownership Cert QA-0002 | ✔ |
| Appraisal Document | Appraisal Doc QA-0002 | Appraisal Doc QA-0002 | ✔ |
| Tags | qa, matrix | qa, matrix | n/a |

## 3. Real Estate — “QA Real Estate Asset”

Asset ID: `0048218b-97ab-463e-b6dc-7a7ca8d4b09f`

| Field | Original (created) | Updated (after edit) | Visible in View Details |
|---|---|---|---|
| Asset Name | QA Real Estate Asset | QA Real Estate Asset | ✔ |
| Category | Real Estate | Real Estate | ✔ |
| Description | QA matrix test asset for Real Estate. | QA matrix test asset for Real Estate. Updated by edit pass. ⭑ | ✔ |
| Location | Test City 3 | Test City 3 EDITED ⭑ | ✔ |
| Asset Type | real_estate | real_estate | n/a |
| Estimated Value | $130,000 | $143,000 ⭑ | ✔ |
| Current Value | $130,000 | $143,000 ⭑ | ✔ |
| Condition | Excellent | Very Good ⭑ | ✔ |
| Ownership Type | Sole | Sole | ✔ |
| Acquisition/Purchase Date | 2023-05-10 | 2023-05-10 | ✔ |
| Purchase Price | $115,000 | $115,000 | ✔ |
| Currency | USD | USD | n/a |
| Valuation Type | manual | manual | n/a |
| Make | Maker 3 | Maker 3 | ✔ |
| Model | Model-X3 | Model-X3 | ✔ |
| Year | 2023 | 2023 | ✔ |
| Serial Number | SN-0003-QA | SN-0003-QA EDITED ⭑ | ✔ |
| Proof of Ownership | Ownership Cert QA-0003 | Ownership Cert QA-0003 | ✔ |
| Appraisal Document | Appraisal Doc QA-0003 | Appraisal Doc QA-0003 | ✔ |
| Tags | qa, matrix | qa, matrix | n/a |

## 4. Vehicles — “QA Vehicles Asset”

Asset ID: `d3e150fc-8fa7-4341-b9cd-33c711b4c6c2`

| Field | Original (created) | Updated (after edit) | Visible in View Details |
|---|---|---|---|
| Asset Name | QA Vehicles Asset | QA Vehicles Asset | ✔ |
| Category | Vehicles | Vehicles | ✔ |
| Description | QA matrix test asset for Vehicles. | QA matrix test asset for Vehicles. Updated by edit pass. ⭑ | ✔ |
| Location | Test City 4 | Test City 4 EDITED ⭑ | ✔ |
| Asset Type | luxury_asset | luxury_asset | n/a |
| Estimated Value | $140,000 | $154,000 ⭑ | ✔ |
| Current Value | $140,000 | $154,000 ⭑ | ✔ |
| Condition | Excellent | Very Good ⭑ | ✔ |
| Ownership Type | Sole | Sole | ✔ |
| Acquisition/Purchase Date | 2023-05-10 | 2023-05-10 | ✔ |
| Purchase Price | $125,000 | $125,000 | ✔ |
| Currency | USD | USD | n/a |
| Valuation Type | manual | manual | n/a |
| Make | Maker 4 | Maker 4 | ✔ |
| Model | Model-X4 | Model-X4 | ✔ |
| Year | 2023 | 2023 | ✔ |
| Serial Number | SN-0004-QA | SN-0004-QA EDITED ⭑ | ✔ |
| Proof of Ownership | Ownership Cert QA-0004 | Ownership Cert QA-0004 | ✔ |
| Appraisal Document | Appraisal Doc QA-0004 | Appraisal Doc QA-0004 | ✔ |
| Tags | qa, matrix | qa, matrix | n/a |

## 5. Art & Collectibles — “QA Art & Collectibles Asset”

Asset ID: `c93ca5d1-c5bd-47e1-90b1-7d6723eecd3e`

| Field | Original (created) | Updated (after edit) | Visible in View Details |
|---|---|---|---|
| Asset Name | QA Art & Collectibles Asset | QA Art & Collectibles Asset | ✔ |
| Category | Art & Collectibles | Art & Collectibles | ✔ |
| Description | QA matrix test asset for Art & Collectibles. | QA matrix test asset for Art & Collectibles. Updated by edit pass. ⭑ | ✔ |
| Location | Test City 5 | Test City 5 EDITED ⭑ | ✔ |
| Asset Type | luxury_asset | luxury_asset | n/a |
| Estimated Value | $150,000 | $165,000 ⭑ | ✔ |
| Current Value | $150,000 | $165,000 ⭑ | ✔ |
| Condition | Excellent | Very Good ⭑ | ✔ |
| Ownership Type | Sole | Sole | ✔ |
| Acquisition/Purchase Date | 2023-05-10 | 2023-05-10 | ✔ |
| Purchase Price | $135,000 | $135,000 | ✔ |
| Currency | USD | USD | n/a |
| Valuation Type | manual | manual | n/a |
| Make | Maker 5 | Maker 5 | ✔ |
| Model | Model-X5 | Model-X5 | ✔ |
| Year | 2023 | 2023 | ✔ |
| Serial Number | SN-0005-QA | SN-0005-QA EDITED ⭑ | ✔ |
| Proof of Ownership | Ownership Cert QA-0005 | Ownership Cert QA-0005 | ✔ |
| Appraisal Document | Appraisal Doc QA-0005 | Appraisal Doc QA-0005 | ✔ |
| Tags | qa, matrix | qa, matrix | n/a |

## 6. Watches & Jewelry — “QA Watches & Jewelry Asset”

Asset ID: `df6776c3-4a4b-45dc-9e1b-7217f79e6dab`

| Field | Original (created) | Updated (after edit) | Visible in View Details |
|---|---|---|---|
| Asset Name | QA Watches & Jewelry Asset | QA Watches & Jewelry Asset | ✔ |
| Category | Watches & Jewelry | Watches & Jewelry | ✔ |
| Description | QA matrix test asset for Watches & Jewelry. | QA matrix test asset for Watches & Jewelry. Updated by edit pass. ⭑ | ✔ |
| Location | Test City 6 | Test City 6 EDITED ⭑ | ✔ |
| Asset Type | luxury_asset | luxury_asset | n/a |
| Estimated Value | $160,000 | $176,000 ⭑ | ✔ |
| Current Value | $160,000 | $176,000 ⭑ | ✔ |
| Condition | Excellent | Very Good ⭑ | ✔ |
| Ownership Type | Sole | Sole | ✔ |
| Acquisition/Purchase Date | 2023-05-10 | 2023-05-10 | ✔ |
| Purchase Price | $145,000 | $145,000 | ✔ |
| Currency | USD | USD | n/a |
| Valuation Type | manual | manual | n/a |
| Make | Maker 6 | Maker 6 | ✔ |
| Model | Model-X6 | Model-X6 | ✔ |
| Year | 2023 | 2023 | ✔ |
| Serial Number | SN-0006-QA | SN-0006-QA EDITED ⭑ | ✔ |
| Proof of Ownership | Ownership Cert QA-0006 | Ownership Cert QA-0006 | ✔ |
| Appraisal Document | Appraisal Doc QA-0006 | Appraisal Doc QA-0006 | ✔ |
| Tags | qa, matrix | qa, matrix | n/a |

## 7. Precious Metals — “QA Precious Metals Asset”

Asset ID: `f1775d40-f8a7-4eec-9219-6ee4f86d00c3`

| Field | Original (created) | Updated (after edit) | Visible in View Details |
|---|---|---|---|
| Asset Name | QA Precious Metals Asset | QA Precious Metals Asset | ✔ |
| Category | Precious Metals | Precious Metals | ✔ |
| Description | QA matrix test asset for Precious Metals. | QA matrix test asset for Precious Metals. Updated by edit pass. ⭑ | ✔ |
| Location | Test City 7 | Test City 7 EDITED ⭑ | ✔ |
| Estimated Value | $170,000 | $187,000 ⭑ | ✔ |
| Current Value | $170,000 | $187,000 ⭑ | ✔ |
| Condition | Excellent | Very Good ⭑ | ✔ |
| Ownership Type | Sole | Sole | ✔ |
| Acquisition/Purchase Date | 2023-05-10 | 2023-05-10 | ✔ |
| Purchase Price | $155,000 | $155,000 | ✔ |
| Currency | USD | USD | n/a |
| Valuation Type | manual | manual | n/a |
| Make | Maker 7 | Maker 7 | ✔ |
| Model | Model-X7 | Model-X7 | ✔ |
| Year | 2023 | 2023 | ✔ |
| Serial Number | SN-0007-QA | SN-0007-QA EDITED ⭑ | ✔ |
| Proof of Ownership | Ownership Cert QA-0007 | Ownership Cert QA-0007 | ✔ |
| Appraisal Document | Appraisal Doc QA-0007 | Appraisal Doc QA-0007 | ✔ |
| Tags | qa, matrix | qa, matrix | n/a |

## 8. Wine & Whiskey — “QA Wine & Whiskey Asset”

Asset ID: `5f0528d7-2713-4609-a664-82f91936b176`

| Field | Original (created) | Updated (after edit) | Visible in View Details |
|---|---|---|---|
| Asset Name | QA Wine & Whiskey Asset | QA Wine & Whiskey Asset | ✔ |
| Category | Wine & Whiskey | Wine & Whiskey | ✔ |
| Description | QA matrix test asset for Wine & Whiskey. | QA matrix test asset for Wine & Whiskey. Updated by edit pass. ⭑ | ✔ |
| Location | Test City 8 | Test City 8 EDITED ⭑ | ✔ |
| Estimated Value | $180,000 | $198,000 ⭑ | ✔ |
| Current Value | $180,000 | $198,000 ⭑ | ✔ |
| Condition | Excellent | Very Good ⭑ | ✔ |
| Ownership Type | Sole | Sole | ✔ |
| Acquisition/Purchase Date | 2023-05-10 | 2023-05-10 | ✔ |
| Purchase Price | $165,000 | $165,000 | ✔ |
| Currency | USD | USD | n/a |
| Valuation Type | manual | manual | n/a |
| Make | Maker 8 | Maker 8 | ✔ |
| Model | Model-X8 | Model-X8 | ✔ |
| Year | 2023 | 2023 | ✔ |
| Serial Number | SN-0008-QA | SN-0008-QA EDITED ⭑ | ✔ |
| Proof of Ownership | Ownership Cert QA-0008 | Ownership Cert QA-0008 | ✔ |
| Appraisal Document | Appraisal Doc QA-0008 | Appraisal Doc QA-0008 | ✔ |
| Tags | qa, matrix | qa, matrix | n/a |

## 9. Luxury Furniture — “QA Luxury Furniture Asset”

Asset ID: `70b25cec-63f6-4e39-996e-3cb7f098b939`

| Field | Original (created) | Updated (after edit) | Visible in View Details |
|---|---|---|---|
| Asset Name | QA Luxury Furniture Asset | QA Luxury Furniture Asset | ✔ |
| Category | Luxury Furniture | Luxury Furniture | ✔ |
| Description | QA matrix test asset for Luxury Furniture. | QA matrix test asset for Luxury Furniture. Updated by edit pass. ⭑ | ✔ |
| Location | Test City 9 | Test City 9 EDITED ⭑ | ✔ |
| Estimated Value | $190,000 | $209,000 ⭑ | ✔ |
| Current Value | $190,000 | $209,000 ⭑ | ✔ |
| Condition | Excellent | Very Good ⭑ | ✔ |
| Ownership Type | Sole | Sole | ✔ |
| Acquisition/Purchase Date | 2023-05-10 | 2023-05-10 | ✔ |
| Purchase Price | $175,000 | $175,000 | ✔ |
| Currency | USD | USD | n/a |
| Valuation Type | manual | manual | n/a |
| Make | Maker 9 | Maker 9 | ✔ |
| Model | Model-X9 | Model-X9 | ✔ |
| Year | 2023 | 2023 | ✔ |
| Serial Number | SN-0009-QA | SN-0009-QA EDITED ⭑ | ✔ |
| Proof of Ownership | Ownership Cert QA-0009 | Ownership Cert QA-0009 | ✔ |
| Appraisal Document | Appraisal Doc QA-0009 | Appraisal Doc QA-0009 | ✔ |
| Tags | qa, matrix | qa, matrix | n/a |

## 10. Antiques — “QA Antiques Asset”

Asset ID: `a0969b09-297e-4c5b-b238-b9537b77ace8`

| Field | Original (created) | Updated (after edit) | Visible in View Details |
|---|---|---|---|
| Asset Name | QA Antiques Asset | QA Antiques Asset | ✔ |
| Category | Antiques | Antiques | ✔ |
| Description | QA matrix test asset for Antiques. | QA matrix test asset for Antiques. Updated by edit pass. ⭑ | ✔ |
| Location | Test City 10 | Test City 10 EDITED ⭑ | ✔ |
| Estimated Value | $200,000 | $220,000 ⭑ | ✔ |
| Current Value | $200,000 | $220,000 ⭑ | ✔ |
| Condition | Excellent | Very Good ⭑ | ✔ |
| Ownership Type | Sole | Sole | ✔ |
| Acquisition/Purchase Date | 2023-05-10 | 2023-05-10 | ✔ |
| Purchase Price | $185,000 | $185,000 | ✔ |
| Currency | USD | USD | n/a |
| Valuation Type | manual | manual | n/a |
| Make | Maker 10 | Maker 10 | ✔ |
| Model | Model-X10 | Model-X10 | ✔ |
| Year | 2023 | 2023 | ✔ |
| Serial Number | SN-0010-QA | SN-0010-QA EDITED ⭑ | ✔ |
| Proof of Ownership | Ownership Cert QA-0010 | Ownership Cert QA-0010 | ✔ |
| Appraisal Document | Appraisal Doc QA-0010 | Appraisal Doc QA-0010 | ✔ |
| Tags | qa, matrix | qa, matrix | n/a |

## 11. Fine Instruments — “QA Fine Instruments Asset”

Asset ID: `f8f667ee-e9f4-45bd-b43c-15c6f394a276`

| Field | Original (created) | Updated (after edit) | Visible in View Details |
|---|---|---|---|
| Asset Name | QA Fine Instruments Asset | QA Fine Instruments Asset | ✔ |
| Category | Fine Instruments | Fine Instruments | ✔ |
| Description | QA matrix test asset for Fine Instruments. | QA matrix test asset for Fine Instruments. Updated by edit pass. ⭑ | ✔ |
| Location | Test City 11 | Test City 11 EDITED ⭑ | ✔ |
| Estimated Value | $210,000 | $231,000 ⭑ | ✔ |
| Current Value | $210,000 | $231,000 ⭑ | ✔ |
| Condition | Excellent | Very Good ⭑ | ✔ |
| Ownership Type | Sole | Sole | ✔ |
| Acquisition/Purchase Date | 2023-05-10 | 2023-05-10 | ✔ |
| Purchase Price | $195,000 | $195,000 | ✔ |
| Currency | USD | USD | n/a |
| Valuation Type | manual | manual | n/a |
| Make | Maker 11 | Maker 11 | ✔ |
| Model | Model-X11 | Model-X11 | ✔ |
| Year | 2023 | 2023 | ✔ |
| Serial Number | SN-0011-QA | SN-0011-QA EDITED ⭑ | ✔ |
| Proof of Ownership | Ownership Cert QA-0011 | Ownership Cert QA-0011 | ✔ |
| Appraisal Document | Appraisal Doc QA-0011 | Appraisal Doc QA-0011 | ✔ |
| Tags | qa, matrix | qa, matrix | n/a |

## 12. Luxury Memorabilia — “QA Luxury Memorabilia Asset”

Asset ID: `c0aa0885-4355-428c-bdc9-d364bdb4b1e2`

| Field | Original (created) | Updated (after edit) | Visible in View Details |
|---|---|---|---|
| Asset Name | QA Luxury Memorabilia Asset | QA Luxury Memorabilia Asset | ✔ |
| Category | Luxury Memorabilia | Luxury Memorabilia | ✔ |
| Description | QA matrix test asset for Luxury Memorabilia. | QA matrix test asset for Luxury Memorabilia. Updated by edit pass. ⭑ | ✔ |
| Location | Test City 12 | Test City 12 EDITED ⭑ | ✔ |
| Estimated Value | $220,000 | $242,000 ⭑ | ✔ |
| Current Value | $220,000 | $242,000 ⭑ | ✔ |
| Condition | Excellent | Very Good ⭑ | ✔ |
| Ownership Type | Sole | Sole | ✔ |
| Acquisition/Purchase Date | 2023-05-10 | 2023-05-10 | ✔ |
| Purchase Price | $205,000 | $205,000 | ✔ |
| Currency | USD | USD | n/a |
| Valuation Type | manual | manual | n/a |
| Make | Maker 12 | Maker 12 | ✔ |
| Model | Model-X12 | Model-X12 | ✔ |
| Year | 2023 | 2023 | ✔ |
| Serial Number | SN-0012-QA | SN-0012-QA EDITED ⭑ | ✔ |
| Proof of Ownership | Ownership Cert QA-0012 | Ownership Cert QA-0012 | ✔ |
| Appraisal Document | Appraisal Doc QA-0012 | Appraisal Doc QA-0012 | ✔ |
| Tags | qa, matrix | qa, matrix | n/a |

## 13. Farmland & Agri Land — “QA Farmland & Agri Land Asset”

Asset ID: `d509e9f8-e78b-49a8-82e9-eca007438db5`

| Field | Original (created) | Updated (after edit) | Visible in View Details |
|---|---|---|---|
| Asset Name | QA Farmland & Agri Land Asset | QA Farmland & Agri Land Asset | ✔ |
| Category | Farmland & Agri Land | Farmland & Agri Land | ✔ |
| Description | QA matrix test asset for Farmland & Agri Land. | QA matrix test asset for Farmland & Agri Land. Updated by edit pass. ⭑ | ✔ |
| Location | Test City 13 | Test City 13 EDITED ⭑ | ✔ |
| Asset Type | real_estate | real_estate | n/a |
| Estimated Value | $230,000 | $253,000 ⭑ | ✔ |
| Current Value | $230,000 | $253,000 ⭑ | ✔ |
| Condition | Excellent | Very Good ⭑ | ✔ |
| Ownership Type | Sole | Sole | ✔ |
| Acquisition/Purchase Date | 2023-05-10 | 2023-05-10 | ✔ |
| Purchase Price | $215,000 | $215,000 | ✔ |
| Currency | USD | USD | n/a |
| Valuation Type | manual | manual | n/a |
| Make | Maker 13 | Maker 13 | ✔ |
| Model | Model-X13 | Model-X13 | ✔ |
| Year | 2023 | 2023 | ✔ |
| Serial Number | SN-0013-QA | SN-0013-QA EDITED ⭑ | ✔ |
| Proof of Ownership | Ownership Cert QA-0013 | Ownership Cert QA-0013 | ✔ |
| Appraisal Document | Appraisal Doc QA-0013 | Appraisal Doc QA-0013 | ✔ |
| Tags | qa, matrix | qa, matrix | n/a |

## 14. Private Company Equity — “QA Private Company Equity Asset”

Asset ID: `8bde7dc0-06a5-4095-bdba-a9f3d6f85a06`

| Field | Original (created) | Updated (after edit) | Visible in View Details |
|---|---|---|---|
| Asset Name | QA Private Company Equity Asset | QA Private Company Equity Asset | ✔ |
| Category | Private Company Equity | Private Company Equity | ✔ |
| Description | QA matrix test asset for Private Company Equity. | QA matrix test asset for Private Company Equity. Updated by edit pass. ⭑ | ✔ |
| Location | Test City 14 | Test City 14 EDITED ⭑ | ✔ |
| Estimated Value | $240,000 | $264,000 ⭑ | ✔ |
| Current Value | $240,000 | $264,000 ⭑ | ✔ |
| Condition | Excellent | Very Good ⭑ | ✔ |
| Ownership Type | Sole | Sole | ✔ |
| Acquisition/Purchase Date | 2023-05-10 | 2023-05-10 | ✔ |
| Purchase Price | $225,000 | $225,000 | ✔ |
| Currency | USD | USD | n/a |
| Valuation Type | manual | manual | n/a |
| Make | Maker 14 | Maker 14 | ✔ |
| Model | Model-X14 | Model-X14 | ✔ |
| Year | 2023 | 2023 | ✔ |
| Serial Number | SN-0014-QA | SN-0014-QA EDITED ⭑ | ✔ |
| Proof of Ownership | Ownership Cert QA-0014 | Ownership Cert QA-0014 | ✔ |
| Appraisal Document | Appraisal Doc QA-0014 | Appraisal Doc QA-0014 | ✔ |
| Tags | qa, matrix | qa, matrix | n/a |

## 15. Intellectual Property — “QA Intellectual Property Asset”

Asset ID: `f6755578-9ba5-46b9-ae83-6f6da3e51082`

| Field | Original (created) | Updated (after edit) | Visible in View Details |
|---|---|---|---|
| Asset Name | QA Intellectual Property Asset | QA Intellectual Property Asset | ✔ |
| Category | Intellectual Property | Intellectual Property | ✔ |
| Description | QA matrix test asset for Intellectual Property. | QA matrix test asset for Intellectual Property. Updated by edit pass. ⭑ | ✔ |
| Location | Test City 15 | Test City 15 EDITED ⭑ | ✔ |
| Estimated Value | $250,000 | $275,000 ⭑ | ✔ |
| Current Value | $250,000 | $275,000 ⭑ | ✔ |
| Condition | Excellent | Very Good ⭑ | ✔ |
| Ownership Type | Sole | Sole | ✔ |
| Acquisition/Purchase Date | 2023-05-10 | 2023-05-10 | ✔ |
| Purchase Price | $235,000 | $235,000 | ✔ |
| Currency | USD | USD | n/a |
| Valuation Type | manual | manual | n/a |
| Make | Maker 15 | Maker 15 | ✔ |
| Model | Model-X15 | Model-X15 | ✔ |
| Year | 2023 | 2023 | ✔ |
| Serial Number | SN-0015-QA | SN-0015-QA EDITED ⭑ | ✔ |
| Proof of Ownership | Ownership Cert QA-0015 | Ownership Cert QA-0015 | ✔ |
| Appraisal Document | Appraisal Doc QA-0015 | Appraisal Doc QA-0015 | ✔ |
| Tags | qa, matrix | qa, matrix | n/a |

## 16. Racehorses & Animals — “QA Racehorses & Animals Asset”

Asset ID: `22ff647c-4b99-43f6-a1ce-5b04a0444e1b`

| Field | Original (created) | Updated (after edit) | Visible in View Details |
|---|---|---|---|
| Asset Name | QA Racehorses & Animals Asset | QA Racehorses & Animals Asset | ✔ |
| Category | Racehorses & Animals | Racehorses & Animals | ✔ |
| Description | QA matrix test asset for Racehorses & Animals. | QA matrix test asset for Racehorses & Animals. Updated by edit pass. ⭑ | ✔ |
| Location | Test City 16 | Test City 16 EDITED ⭑ | ✔ |
| Estimated Value | $260,000 | $286,000 ⭑ | ✔ |
| Current Value | $260,000 | $286,000 ⭑ | ✔ |
| Condition | Excellent | Very Good ⭑ | ✔ |
| Ownership Type | Sole | Sole | ✔ |
| Acquisition/Purchase Date | 2023-05-10 | 2023-05-10 | ✔ |
| Purchase Price | $245,000 | $245,000 | ✔ |
| Currency | USD | USD | n/a |
| Valuation Type | manual | manual | n/a |
| Make | Maker 16 | Maker 16 | ✔ |
| Model | Model-X16 | Model-X16 | ✔ |
| Year | 2023 | 2023 | ✔ |
| Serial Number | SN-0016-QA | SN-0016-QA EDITED ⭑ | ✔ |
| Proof of Ownership | Ownership Cert QA-0016 | Ownership Cert QA-0016 | ✔ |
| Appraisal Document | Appraisal Doc QA-0016 | Appraisal Doc QA-0016 | ✔ |
| Tags | qa, matrix | qa, matrix | n/a |

## 17. Fractional Ownerships — “QA Fractional Ownerships Asset”

Asset ID: `377385c7-6f03-4ae3-961c-318f5750dc2a`

| Field | Original (created) | Updated (after edit) | Visible in View Details |
|---|---|---|---|
| Asset Name | QA Fractional Ownerships Asset | QA Fractional Ownerships Asset | ✔ |
| Category | Fractional Ownerships | Fractional Ownerships | ✔ |
| Description | QA matrix test asset for Fractional Ownerships. | QA matrix test asset for Fractional Ownerships. Updated by edit pass. ⭑ | ✔ |
| Location | Test City 17 | Test City 17 EDITED ⭑ | ✔ |
| Estimated Value | $270,000 | $297,000 ⭑ | ✔ |
| Current Value | $270,000 | $297,000 ⭑ | ✔ |
| Condition | Excellent | Very Good ⭑ | ✔ |
| Ownership Type | Sole | Sole | ✔ |
| Acquisition/Purchase Date | 2023-05-10 | 2023-05-10 | ✔ |
| Purchase Price | $255,000 | $255,000 | ✔ |
| Currency | USD | USD | n/a |
| Valuation Type | manual | manual | n/a |
| Make | Maker 17 | Maker 17 | ✔ |
| Model | Model-X17 | Model-X17 | ✔ |
| Year | 2023 | 2023 | ✔ |
| Serial Number | SN-0017-QA | SN-0017-QA EDITED ⭑ | ✔ |
| Proof of Ownership | Ownership Cert QA-0017 | Ownership Cert QA-0017 | ✔ |
| Appraisal Document | Appraisal Doc QA-0017 | Appraisal Doc QA-0017 | ✔ |
| Tags | qa, matrix | qa, matrix | n/a |

## 18. Classic Motorcycles — “QA Classic Motorcycles Asset”

Asset ID: `30a56691-c3d0-47f1-96b0-9f326232015c`

| Field | Original (created) | Updated (after edit) | Visible in View Details |
|---|---|---|---|
| Asset Name | QA Classic Motorcycles Asset | QA Classic Motorcycles Asset | ✔ |
| Category | Classic Motorcycles | Classic Motorcycles | ✔ |
| Description | QA matrix test asset for Classic Motorcycles. | QA matrix test asset for Classic Motorcycles. Updated by edit pass. ⭑ | ✔ |
| Location | Test City 18 | Test City 18 EDITED ⭑ | ✔ |
| Estimated Value | $280,000 | $308,000 ⭑ | ✔ |
| Current Value | $280,000 | $308,000 ⭑ | ✔ |
| Condition | Excellent | Very Good ⭑ | ✔ |
| Ownership Type | Sole | Sole | ✔ |
| Acquisition/Purchase Date | 2023-05-10 | 2023-05-10 | ✔ |
| Purchase Price | $265,000 | $265,000 | ✔ |
| Currency | USD | USD | n/a |
| Valuation Type | manual | manual | n/a |
| Make | Maker 18 | Maker 18 | ✔ |
| Model | Model-X18 | Model-X18 | ✔ |
| Year | 2023 | 2023 | ✔ |
| Serial Number | SN-0018-QA | SN-0018-QA EDITED ⭑ | ✔ |
| Proof of Ownership | Ownership Cert QA-0018 | Ownership Cert QA-0018 | ✔ |
| Appraisal Document | Appraisal Doc QA-0018 | Appraisal Doc QA-0018 | ✔ |
| Tags | qa, matrix | qa, matrix | n/a |

## 19. Green Assets — “QA Green Assets Asset”

Asset ID: `75b323a4-7595-4d9a-9526-58c103868635`

| Field | Original (created) | Updated (after edit) | Visible in View Details |
|---|---|---|---|
| Asset Name | QA Green Assets Asset | QA Green Assets Asset | ✔ |
| Category | Green Assets | Green Assets | ✔ |
| Description | QA matrix test asset for Green Assets. | QA matrix test asset for Green Assets. Updated by edit pass. ⭑ | ✔ |
| Location | Test City 19 | Test City 19 EDITED ⭑ | ✔ |
| Estimated Value | $290,000 | $319,000 ⭑ | ✔ |
| Current Value | $290,000 | $319,000 ⭑ | ✔ |
| Condition | Excellent | Very Good ⭑ | ✔ |
| Ownership Type | Sole | Sole | ✔ |
| Acquisition/Purchase Date | 2023-05-10 | 2023-05-10 | ✔ |
| Purchase Price | $275,000 | $275,000 | ✔ |
| Currency | USD | USD | n/a |
| Valuation Type | manual | manual | n/a |
| Make | Maker 19 | Maker 19 | ✔ |
| Model | Model-X19 | Model-X19 | ✔ |
| Year | 2023 | 2023 | ✔ |
| Serial Number | SN-0019-QA | SN-0019-QA EDITED ⭑ | ✔ |
| Proof of Ownership | Ownership Cert QA-0019 | Ownership Cert QA-0019 | ✔ |
| Appraisal Document | Appraisal Doc QA-0019 | Appraisal Doc QA-0019 | ✔ |
| Tags | qa, matrix | qa, matrix | n/a |

## 20. Digital Collectibles — “QA Digital Collectibles Asset”

Asset ID: `f9653155-ce2e-41d1-8e2d-6398beaf3e18`

| Field | Original (created) | Updated (after edit) | Visible in View Details |
|---|---|---|---|
| Asset Name | QA Digital Collectibles Asset | QA Digital Collectibles Asset | ✔ |
| Category | Digital Collectibles | Digital Collectibles | ✔ |
| Description | QA matrix test asset for Digital Collectibles. | QA matrix test asset for Digital Collectibles. Updated by edit pass. ⭑ | ✔ |
| Location | Test City 20 | Test City 20 EDITED ⭑ | ✔ |
| Estimated Value | $300,000 | $330,000 ⭑ | ✔ |
| Current Value | $300,000 | $330,000 ⭑ | ✔ |
| Condition | Excellent | Very Good ⭑ | ✔ |
| Ownership Type | Sole | Sole | ✔ |
| Acquisition/Purchase Date | 2023-05-10 | 2023-05-10 | ✔ |
| Purchase Price | $285,000 | $285,000 | ✔ |
| Currency | USD | USD | n/a |
| Valuation Type | manual | manual | n/a |
| Make | Maker 20 | Maker 20 | ✔ |
| Model | Model-X20 | Model-X20 | ✔ |
| Year | 2023 | 2023 | ✔ |
| Serial Number | SN-0020-QA | SN-0020-QA EDITED ⭑ | ✔ |
| Proof of Ownership | Ownership Cert QA-0020 | Ownership Cert QA-0020 | ✔ |
| Appraisal Document | Appraisal Doc QA-0020 | Appraisal Doc QA-0020 | ✔ |
| Tags | qa, matrix | qa, matrix | n/a |

## 21. Couture & Designer Wear — “QA Couture & Designer Wear Asset”

Asset ID: `50ad4ff0-6fc8-439d-84e4-f67206cf04ab`

| Field | Original (created) | Updated (after edit) | Visible in View Details |
|---|---|---|---|
| Asset Name | QA Couture & Designer Wear Asset | QA Couture & Designer Wear Asset | ✔ |
| Category | Couture & Designer Wear | Couture & Designer Wear | ✔ |
| Description | QA matrix test asset for Couture & Designer Wear. | QA matrix test asset for Couture & Designer Wear. Updated by edit pass. ⭑ | ✔ |
| Location | Test City 21 | Test City 21 EDITED ⭑ | ✔ |
| Estimated Value | $310,000 | $341,000 ⭑ | ✔ |
| Current Value | $310,000 | $341,000 ⭑ | ✔ |
| Condition | Excellent | Very Good ⭑ | ✔ |
| Ownership Type | Sole | Sole | ✔ |
| Acquisition/Purchase Date | 2023-05-10 | 2023-05-10 | ✔ |
| Purchase Price | $295,000 | $295,000 | ✔ |
| Currency | USD | USD | n/a |
| Valuation Type | manual | manual | n/a |
| Make | Maker 21 | Maker 21 | ✔ |
| Model | Model-X21 | Model-X21 | ✔ |
| Year | 2023 | 2023 | ✔ |
| Serial Number | SN-0021-QA | SN-0021-QA EDITED ⭑ | ✔ |
| Proof of Ownership | Ownership Cert QA-0021 | Ownership Cert QA-0021 | ✔ |
| Appraisal Document | Appraisal Doc QA-0021 | Appraisal Doc QA-0021 | ✔ |
| Tags | qa, matrix | qa, matrix | n/a |

## 22. Boats & Watercraft — “QA Boats & Watercraft Asset”

Asset ID: `cd65a4a7-c3cd-4345-9573-eb46ca3a2dc4`

| Field | Original (created) | Updated (after edit) | Visible in View Details |
|---|---|---|---|
| Asset Name | QA Boats & Watercraft Asset | QA Boats & Watercraft Asset | ✔ |
| Category | Boats & Watercraft | Boats & Watercraft | ✔ |
| Description | QA matrix test asset for Boats & Watercraft. | QA matrix test asset for Boats & Watercraft. Updated by edit pass. ⭑ | ✔ |
| Location | Test City 22 | Test City 22 EDITED ⭑ | ✔ |
| Estimated Value | $320,000 | $352,000 ⭑ | ✔ |
| Current Value | $320,000 | $352,000 ⭑ | ✔ |
| Condition | Excellent | Very Good ⭑ | ✔ |
| Ownership Type | Sole | Sole | ✔ |
| Acquisition/Purchase Date | 2023-05-10 | 2023-05-10 | ✔ |
| Purchase Price | $305,000 | $305,000 | ✔ |
| Currency | USD | USD | n/a |
| Valuation Type | manual | manual | n/a |
| Make | Maker 22 | Maker 22 | ✔ |
| Model | Model-X22 | Model-X22 | ✔ |
| Year | 2023 | 2023 | ✔ |
| Serial Number | SN-0022-QA | SN-0022-QA EDITED ⭑ | ✔ |
| Proof of Ownership | Ownership Cert QA-0022 | Ownership Cert QA-0022 | ✔ |
| Appraisal Document | Appraisal Doc QA-0022 | Appraisal Doc QA-0022 | ✔ |
| Tags | qa, matrix | qa, matrix | n/a |

## 23. Raw Precious Stones — “QA Raw Precious Stones Asset”

Asset ID: `36454a44-d945-4cc9-883e-f3e0e420efed`

| Field | Original (created) | Updated (after edit) | Visible in View Details |
|---|---|---|---|
| Asset Name | QA Raw Precious Stones Asset | QA Raw Precious Stones Asset | ✔ |
| Category | Raw Precious Stones | Raw Precious Stones | ✔ |
| Description | QA matrix test asset for Raw Precious Stones. | QA matrix test asset for Raw Precious Stones. Updated by edit pass. ⭑ | ✔ |
| Location | Test City 23 | Test City 23 EDITED ⭑ | ✔ |
| Estimated Value | $330,000 | $363,000 ⭑ | ✔ |
| Current Value | $330,000 | $363,000 ⭑ | ✔ |
| Condition | Excellent | Very Good ⭑ | ✔ |
| Ownership Type | Sole | Sole | ✔ |
| Acquisition/Purchase Date | 2023-05-10 | 2023-05-10 | ✔ |
| Purchase Price | $315,000 | $315,000 | ✔ |
| Currency | USD | USD | n/a |
| Valuation Type | manual | manual | n/a |
| Make | Maker 23 | Maker 23 | ✔ |
| Model | Model-X23 | Model-X23 | ✔ |
| Year | 2023 | 2023 | ✔ |
| Serial Number | SN-0023-QA | SN-0023-QA EDITED ⭑ | ✔ |
| Proof of Ownership | Ownership Cert QA-0023 | Ownership Cert QA-0023 | ✔ |
| Appraisal Document | Appraisal Doc QA-0023 | Appraisal Doc QA-0023 | ✔ |
| Tags | qa, matrix | qa, matrix | n/a |

## 24. Vaulted/Stored Assets — “QA Vaulted/Stored Assets Asset”

Asset ID: `0d759008-b996-4bf1-acc3-582f832f6f6d`

| Field | Original (created) | Updated (after edit) | Visible in View Details |
|---|---|---|---|
| Asset Name | QA Vaulted/Stored Assets Asset | QA Vaulted/Stored Assets Asset | ✔ |
| Category | Vaulted/Stored Assets | Vaulted/Stored Assets | ✔ |
| Description | QA matrix test asset for Vaulted/Stored Assets. | QA matrix test asset for Vaulted/Stored Assets. Updated by edit pass. ⭑ | ✔ |
| Location | Test City 24 | Test City 24 EDITED ⭑ | ✔ |
| Estimated Value | $340,000 | $374,000 ⭑ | ✔ |
| Current Value | $340,000 | $374,000 ⭑ | ✔ |
| Condition | Excellent | Very Good ⭑ | ✔ |
| Ownership Type | Sole | Sole | ✔ |
| Acquisition/Purchase Date | 2023-05-10 | 2023-05-10 | ✔ |
| Purchase Price | $325,000 | $325,000 | ✔ |
| Currency | USD | USD | n/a |
| Valuation Type | manual | manual | n/a |
| Make | Maker 24 | Maker 24 | ✔ |
| Model | Model-X24 | Model-X24 | ✔ |
| Year | 2023 | 2023 | ✔ |
| Serial Number | SN-0024-QA | SN-0024-QA EDITED ⭑ | ✔ |
| Proof of Ownership | Ownership Cert QA-0024 | Ownership Cert QA-0024 | ✔ |
| Appraisal Document | Appraisal Doc QA-0024 | Appraisal Doc QA-0024 | ✔ |
| Tags | qa, matrix | qa, matrix | n/a |

---

# Category group: Portfolio

## 25. Crypto Assets — “QA Crypto Assets Holding”

Asset ID: `fd5886d4-d174-448c-9398-a4ec46eb44cd`

| Field | Original (created) | Updated (after edit) | Visible in View Details |
|---|---|---|---|
| Asset Name | QA Crypto Assets Holding | QA Crypto Assets Holding | ✔ |
| Category | Crypto Assets | Crypto Assets | ✔ |
| Asset Type | crypto | crypto | n/a |
| Estimated Value | $350,000 | $385,000 ⭑ | ✔ |
| Current Value | $350,000 | $385,000 ⭑ | ✔ |
| Acquisition/Purchase Date | 2024-02-15 | 2024-02-15 | ✔ |
| Purchase Price | $330,000 | $330,000 | ✔ |
| Currency | USD | USD | n/a |
| Valuation Type | manual | manual | n/a |
| Institution | Institution 25 Capital | Institution 25 Capital EDITED ⭑ | ✔ |
| Account Number (masked) | ****1025 | ****1025 | ✔ |
| Risk Level | Medium | High ⭑ | ✔ |
| Investment Horizon | 3-5 years | 3-5 years EDITED ⭑ | ✔ |

## 26. Cash Flow Accounts — “QA Cash Flow Accounts Holding”

Asset ID: `943a534b-c835-494d-a409-0812dfcb8b6e`

| Field | Original (created) | Updated (after edit) | Visible in View Details |
|---|---|---|---|
| Asset Name | QA Cash Flow Accounts Holding | QA Cash Flow Accounts Holding | ✔ |
| Category | Cash Flow Accounts | Cash Flow Accounts | ✔ |
| Asset Type | other | other | n/a |
| Estimated Value | $360,000 | $396,000 ⭑ | ✔ |
| Current Value | $360,000 | $396,000 ⭑ | ✔ |
| Acquisition/Purchase Date | 2024-02-15 | 2024-02-15 | ✔ |
| Purchase Price | $340,000 | $340,000 | ✔ |
| Currency | USD | USD | n/a |
| Valuation Type | manual | manual | n/a |
| Institution | Institution 26 Capital | Institution 26 Capital EDITED ⭑ | ✔ |
| Account Number (masked) | ****1026 | ****1026 | ✔ |
| Risk Level | Medium | High ⭑ | ✔ |
| Investment Horizon | 3-5 years | 3-5 years EDITED ⭑ | ✔ |

## 27. Trade Engine — “QA Trade Engine Holding”

Asset ID: `91fd51ce-ae46-4e4e-8f6d-5c6d37f361ed`

| Field | Original (created) | Updated (after edit) | Visible in View Details |
|---|---|---|---|
| Asset Name | QA Trade Engine Holding | QA Trade Engine Holding | ✔ |
| Category | Trade Engine | Trade Engine | ✔ |
| Asset Type | other | other | n/a |
| Estimated Value | $370,000 | $407,000 ⭑ | ✔ |
| Current Value | $370,000 | $407,000 ⭑ | ✔ |
| Acquisition/Purchase Date | 2024-02-15 | 2024-02-15 | ✔ |
| Purchase Price | $350,000 | $350,000 | ✔ |
| Currency | USD | USD | n/a |
| Valuation Type | manual | manual | n/a |
| Institution | Institution 27 Capital | Institution 27 Capital EDITED ⭑ | ✔ |
| Account Number (masked) | ****1027 | ****1027 | ✔ |
| Risk Level | Medium | High ⭑ | ✔ |
| Investment Horizon | 3-5 years | 3-5 years EDITED ⭑ | ✔ |

## 28. Public Equities — “QA Public Equities Holding”

Asset ID: `53bf34bf-5b06-43b4-8cfd-dde328f0f16b`

| Field | Original (created) | Updated (after edit) | Visible in View Details |
|---|---|---|---|
| Asset Name | QA Public Equities Holding | QA Public Equities Holding | ✔ |
| Category | Public Equities | Public Equities | ✔ |
| Asset Type | stock | stock | n/a |
| Estimated Value | $380,000 | $418,000 ⭑ | ✔ |
| Current Value | $380,000 | $418,000 ⭑ | ✔ |
| Acquisition/Purchase Date | 2024-02-15 | 2024-02-15 | ✔ |
| Purchase Price | $360,000 | $360,000 | ✔ |
| Currency | USD | USD | n/a |
| Valuation Type | manual | manual | n/a |
| Institution | Institution 28 Capital | Institution 28 Capital EDITED ⭑ | ✔ |
| Account Number (masked) | ****1028 | ****1028 | ✔ |
| Risk Level | Medium | High ⭑ | ✔ |
| Investment Horizon | 3-5 years | 3-5 years EDITED ⭑ | ✔ |

## 29. Fixed Income — “QA Fixed Income Holding”

Asset ID: `73e6249a-21ae-48eb-81c2-1a59ca74a74d`

| Field | Original (created) | Updated (after edit) | Visible in View Details |
|---|---|---|---|
| Asset Name | QA Fixed Income Holding | QA Fixed Income Holding | ✔ |
| Category | Fixed Income | Fixed Income | ✔ |
| Asset Type | bond | bond | n/a |
| Estimated Value | $390,000 | $429,000 ⭑ | ✔ |
| Current Value | $390,000 | $429,000 ⭑ | ✔ |
| Acquisition/Purchase Date | 2024-02-15 | 2024-02-15 | ✔ |
| Purchase Price | $370,000 | $370,000 | ✔ |
| Currency | USD | USD | n/a |
| Valuation Type | manual | manual | n/a |
| Institution | Institution 29 Capital | Institution 29 Capital EDITED ⭑ | ✔ |
| Account Number (masked) | ****1029 | ****1029 | ✔ |
| Risk Level | Medium | High ⭑ | ✔ |
| Investment Horizon | 3-5 years | 3-5 years EDITED ⭑ | ✔ |

## 30. ETFs & Index Funds — “QA ETFs & Index Funds Holding”

Asset ID: `82718bad-a079-410a-8cb3-1f1ee7377663`

| Field | Original (created) | Updated (after edit) | Visible in View Details |
|---|---|---|---|
| Asset Name | QA ETFs & Index Funds Holding | QA ETFs & Index Funds Holding | ✔ |
| Category | ETFs & Index Funds | ETFs & Index Funds | ✔ |
| Asset Type | other | other | n/a |
| Estimated Value | $400,000 | $440,000 ⭑ | ✔ |
| Current Value | $400,000 | $440,000 ⭑ | ✔ |
| Acquisition/Purchase Date | 2024-02-15 | 2024-02-15 | ✔ |
| Purchase Price | $380,000 | $380,000 | ✔ |
| Currency | USD | USD | n/a |
| Valuation Type | manual | manual | n/a |
| Institution | Institution 30 Capital | Institution 30 Capital EDITED ⭑ | ✔ |
| Account Number (masked) | ****1030 | ****1030 | ✔ |
| Risk Level | Medium | High ⭑ | ✔ |
| Investment Horizon | 3-5 years | 3-5 years EDITED ⭑ | ✔ |

## 31. Mutual Funds — “QA Mutual Funds Holding”

Asset ID: `60a2a8b7-0aef-4c04-ad48-75ca73d1d795`

| Field | Original (created) | Updated (after edit) | Visible in View Details |
|---|---|---|---|
| Asset Name | QA Mutual Funds Holding | QA Mutual Funds Holding | ✔ |
| Category | Mutual Funds | Mutual Funds | ✔ |
| Asset Type | other | other | n/a |
| Estimated Value | $410,000 | $451,000 ⭑ | ✔ |
| Current Value | $410,000 | $451,000 ⭑ | ✔ |
| Acquisition/Purchase Date | 2024-02-15 | 2024-02-15 | ✔ |
| Purchase Price | $390,000 | $390,000 | ✔ |
| Currency | USD | USD | n/a |
| Valuation Type | manual | manual | n/a |
| Institution | Institution 31 Capital | Institution 31 Capital EDITED ⭑ | ✔ |
| Account Number (masked) | ****1031 | ****1031 | ✔ |
| Risk Level | Medium | High ⭑ | ✔ |
| Investment Horizon | 3-5 years | 3-5 years EDITED ⭑ | ✔ |

## 32. Private Equity — “QA Private Equity Holding”

Asset ID: `a3e863e1-3143-440c-a704-adcf51ee678b`

| Field | Original (created) | Updated (after edit) | Visible in View Details |
|---|---|---|---|
| Asset Name | QA Private Equity Holding | QA Private Equity Holding | ✔ |
| Category | Private Equity | Private Equity | ✔ |
| Asset Type | other | other | n/a |
| Estimated Value | $420,000 | $462,000 ⭑ | ✔ |
| Current Value | $420,000 | $462,000 ⭑ | ✔ |
| Acquisition/Purchase Date | 2024-02-15 | 2024-02-15 | ✔ |
| Purchase Price | $400,000 | $400,000 | ✔ |
| Currency | USD | USD | n/a |
| Valuation Type | manual | manual | n/a |
| Institution | Institution 32 Capital | Institution 32 Capital EDITED ⭑ | ✔ |
| Account Number (masked) | ****1032 | ****1032 | ✔ |
| Risk Level | Medium | High ⭑ | ✔ |
| Investment Horizon | 3-5 years | 3-5 years EDITED ⭑ | ✔ |

## 33. Hedge Funds — “QA Hedge Funds Holding”

Asset ID: `2a87e66f-cf9f-49d2-aaa9-60fe41728d5a`

| Field | Original (created) | Updated (after edit) | Visible in View Details |
|---|---|---|---|
| Asset Name | QA Hedge Funds Holding | QA Hedge Funds Holding | ✔ |
| Category | Hedge Funds | Hedge Funds | ✔ |
| Asset Type | other | other | n/a |
| Estimated Value | $430,000 | $473,000 ⭑ | ✔ |
| Current Value | $430,000 | $473,000 ⭑ | ✔ |
| Acquisition/Purchase Date | 2024-02-15 | 2024-02-15 | ✔ |
| Purchase Price | $410,000 | $410,000 | ✔ |
| Currency | USD | USD | n/a |
| Valuation Type | manual | manual | n/a |
| Institution | Institution 33 Capital | Institution 33 Capital EDITED ⭑ | ✔ |
| Account Number (masked) | ****1033 | ****1033 | ✔ |
| Risk Level | Medium | High ⭑ | ✔ |
| Investment Horizon | 3-5 years | 3-5 years EDITED ⭑ | ✔ |

## 34. Commodities — “QA Commodities Holding”

Asset ID: `da1bd7db-4d75-45f3-9639-6a01dd480c88`

| Field | Original (created) | Updated (after edit) | Visible in View Details |
|---|---|---|---|
| Asset Name | QA Commodities Holding | QA Commodities Holding | ✔ |
| Category | Commodities | Commodities | ✔ |
| Asset Type | other | other | n/a |
| Estimated Value | $440,000 | $484,000 ⭑ | ✔ |
| Current Value | $440,000 | $484,000 ⭑ | ✔ |
| Acquisition/Purchase Date | 2024-02-15 | 2024-02-15 | ✔ |
| Purchase Price | $420,000 | $420,000 | ✔ |
| Currency | USD | USD | n/a |
| Valuation Type | manual | manual | n/a |
| Institution | Institution 34 Capital | Institution 34 Capital EDITED ⭑ | ✔ |
| Account Number (masked) | ****1034 | ****1034 | ✔ |
| Risk Level | Medium | High ⭑ | ✔ |
| Investment Horizon | 3-5 years | 3-5 years EDITED ⭑ | ✔ |

## 35. Structured Products — “QA Structured Products Holding”

Asset ID: `cbefd52b-e800-480d-b7df-1baeb7fd520a`

| Field | Original (created) | Updated (after edit) | Visible in View Details |
|---|---|---|---|
| Asset Name | QA Structured Products Holding | QA Structured Products Holding | ✔ |
| Category | Structured Products | Structured Products | ✔ |
| Asset Type | other | other | n/a |
| Estimated Value | $450,000 | $495,000 ⭑ | ✔ |
| Current Value | $450,000 | $495,000 ⭑ | ✔ |
| Acquisition/Purchase Date | 2024-02-15 | 2024-02-15 | ✔ |
| Purchase Price | $430,000 | $430,000 | ✔ |
| Currency | USD | USD | n/a |
| Valuation Type | manual | manual | n/a |
| Institution | Institution 35 Capital | Institution 35 Capital EDITED ⭑ | ✔ |
| Account Number (masked) | ****1035 | ****1035 | ✔ |
| Risk Level | Medium | High ⭑ | ✔ |
| Investment Horizon | 3-5 years | 3-5 years EDITED ⭑ | ✔ |

## 36. Foreign Currency — “QA Foreign Currency Holding”

Asset ID: `a92b0600-5d53-4d66-8020-dc8bb8bdd7bb`

| Field | Original (created) | Updated (after edit) | Visible in View Details |
|---|---|---|---|
| Asset Name | QA Foreign Currency Holding | QA Foreign Currency Holding | ✔ |
| Category | Foreign Currency | Foreign Currency | ✔ |
| Asset Type | other | other | n/a |
| Estimated Value | $460,000 | $506,000 ⭑ | ✔ |
| Current Value | $460,000 | $506,000 ⭑ | ✔ |
| Acquisition/Purchase Date | 2024-02-15 | 2024-02-15 | ✔ |
| Purchase Price | $440,000 | $440,000 | ✔ |
| Currency | USD | USD | n/a |
| Valuation Type | manual | manual | n/a |
| Institution | Institution 36 Capital | Institution 36 Capital EDITED ⭑ | ✔ |
| Account Number (masked) | ****1036 | ****1036 | ✔ |
| Risk Level | Medium | High ⭑ | ✔ |
| Investment Horizon | 3-5 years | 3-5 years EDITED ⭑ | ✔ |

## 37. Offshore Accounts — “QA Offshore Accounts Holding”

Asset ID: `a040c294-7525-46af-850c-60d7370c9cbb`

| Field | Original (created) | Updated (after edit) | Visible in View Details |
|---|---|---|---|
| Asset Name | QA Offshore Accounts Holding | QA Offshore Accounts Holding | ✔ |
| Category | Offshore Accounts | Offshore Accounts | ✔ |
| Asset Type | other | other | n/a |
| Estimated Value | $470,000 | $517,000 ⭑ | ✔ |
| Current Value | $470,000 | $517,000 ⭑ | ✔ |
| Acquisition/Purchase Date | 2024-02-15 | 2024-02-15 | ✔ |
| Purchase Price | $450,000 | $450,000 | ✔ |
| Currency | USD | USD | n/a |
| Valuation Type | manual | manual | n/a |
| Institution | Institution 37 Capital | Institution 37 Capital EDITED ⭑ | ✔ |
| Account Number (masked) | ****1037 | ****1037 | ✔ |
| Risk Level | Medium | High ⭑ | ✔ |
| Investment Horizon | 3-5 years | 3-5 years EDITED ⭑ | ✔ |

## 38. REITs & Real Estate Funds — “QA REITs & Real Estate Funds Holding”

Asset ID: `01e3329c-079b-40e7-8140-fc57d1f25e7e`

| Field | Original (created) | Updated (after edit) | Visible in View Details |
|---|---|---|---|
| Asset Name | QA REITs & Real Estate Funds Holding | QA REITs & Real Estate Funds Holding | ✔ |
| Category | REITs & Real Estate Funds | REITs & Real Estate Funds | ✔ |
| Asset Type | real_estate | real_estate | n/a |
| Estimated Value | $480,000 | $528,000 ⭑ | ✔ |
| Current Value | $480,000 | $528,000 ⭑ | ✔ |
| Acquisition/Purchase Date | 2024-02-15 | 2024-02-15 | ✔ |
| Purchase Price | $460,000 | $460,000 | ✔ |
| Currency | USD | USD | n/a |
| Valuation Type | manual | manual | n/a |
| Institution | Institution 38 Capital | Institution 38 Capital EDITED ⭑ | ✔ |
| Account Number (masked) | ****1038 | ****1038 | ✔ |
| Risk Level | Medium | High ⭑ | ✔ |
| Investment Horizon | 3-5 years | 3-5 years EDITED ⭑ | ✔ |

## 39. Annuities — “QA Annuities Holding”

Asset ID: `85803d2e-7791-4fdb-a07d-c8d3f9bef739`

| Field | Original (created) | Updated (after edit) | Visible in View Details |
|---|---|---|---|
| Asset Name | QA Annuities Holding | QA Annuities Holding | ✔ |
| Category | Annuities | Annuities | ✔ |
| Asset Type | other | other | n/a |
| Estimated Value | $490,000 | $539,000 ⭑ | ✔ |
| Current Value | $490,000 | $539,000 ⭑ | ✔ |
| Acquisition/Purchase Date | 2024-02-15 | 2024-02-15 | ✔ |
| Purchase Price | $470,000 | $470,000 | ✔ |
| Currency | USD | USD | n/a |
| Valuation Type | manual | manual | n/a |
| Institution | Institution 39 Capital | Institution 39 Capital EDITED ⭑ | ✔ |
| Account Number (masked) | ****1039 | ****1039 | ✔ |
| Risk Level | Medium | High ⭑ | ✔ |
| Investment Horizon | 3-5 years | 3-5 years EDITED ⭑ | ✔ |

## 40. Investment-Linked Insurance — “QA Investment-Linked Insurance Holding”

Asset ID: `b5087c07-6656-4045-9f50-1991e31815a6`

| Field | Original (created) | Updated (after edit) | Visible in View Details |
|---|---|---|---|
| Asset Name | QA Investment-Linked Insurance Holding | QA Investment-Linked Insurance Holding | ✔ |
| Category | Investment-Linked Insurance | Investment-Linked Insurance | ✔ |
| Asset Type | other | other | n/a |
| Estimated Value | $500,000 | $550,000 ⭑ | ✔ |
| Current Value | $500,000 | $550,000 ⭑ | ✔ |
| Acquisition/Purchase Date | 2024-02-15 | 2024-02-15 | ✔ |
| Purchase Price | $480,000 | $480,000 | ✔ |
| Currency | USD | USD | n/a |
| Valuation Type | manual | manual | n/a |
| Institution | Institution 40 Capital | Institution 40 Capital EDITED ⭑ | ✔ |
| Account Number (masked) | ****1040 | ****1040 | ✔ |
| Risk Level | Medium | High ⭑ | ✔ |
| Investment Horizon | 3-5 years | 3-5 years EDITED ⭑ | ✔ |

## 41. Pension & Retirement — “QA Pension & Retirement Holding”

Asset ID: `0677bbfa-1be7-4d64-922d-d2a049f2e01c`

| Field | Original (created) | Updated (after edit) | Visible in View Details |
|---|---|---|---|
| Asset Name | QA Pension & Retirement Holding | QA Pension & Retirement Holding | ✔ |
| Category | Pension & Retirement | Pension & Retirement | ✔ |
| Asset Type | other | other | n/a |
| Estimated Value | $510,000 | $561,000 ⭑ | ✔ |
| Current Value | $510,000 | $561,000 ⭑ | ✔ |
| Acquisition/Purchase Date | 2024-02-15 | 2024-02-15 | ✔ |
| Purchase Price | $490,000 | $490,000 | ✔ |
| Currency | USD | USD | n/a |
| Valuation Type | manual | manual | n/a |
| Institution | Institution 41 Capital | Institution 41 Capital EDITED ⭑ | ✔ |
| Account Number (masked) | ****1041 | ****1041 | ✔ |
| Risk Level | Medium | High ⭑ | ✔ |
| Investment Horizon | 3-5 years | 3-5 years EDITED ⭑ | ✔ |

## 42. Crowdfunding Investments — “QA Crowdfunding Investments Holding”

Asset ID: `a74755b8-c312-43c3-8fed-4fdfd7159f1e`

| Field | Original (created) | Updated (after edit) | Visible in View Details |
|---|---|---|---|
| Asset Name | QA Crowdfunding Investments Holding | QA Crowdfunding Investments Holding | ✔ |
| Category | Crowdfunding Investments | Crowdfunding Investments | ✔ |
| Asset Type | other | other | n/a |
| Estimated Value | $520,000 | $572,000 ⭑ | ✔ |
| Current Value | $520,000 | $572,000 ⭑ | ✔ |
| Acquisition/Purchase Date | 2024-02-15 | 2024-02-15 | ✔ |
| Purchase Price | $500,000 | $500,000 | ✔ |
| Currency | USD | USD | n/a |
| Valuation Type | manual | manual | n/a |
| Institution | Institution 42 Capital | Institution 42 Capital EDITED ⭑ | ✔ |
| Account Number (masked) | ****1042 | ****1042 | ✔ |
| Risk Level | Medium | High ⭑ | ✔ |
| Investment Horizon | 3-5 years | 3-5 years EDITED ⭑ | ✔ |

## 43. Digital Assets (Non-Crypto) — “QA Digital Assets (Non-Crypto) Holding”

Asset ID: `e1635a79-ece2-4cfc-ae2a-165f4f6ea352`

| Field | Original (created) | Updated (after edit) | Visible in View Details |
|---|---|---|---|
| Asset Name | QA Digital Assets (Non-Crypto) Holding | QA Digital Assets (Non-Crypto) Holding | ✔ |
| Category | Digital Assets (Non-Crypto) | Digital Assets (Non-Crypto) | ✔ |
| Asset Type | other | other | n/a |
| Estimated Value | $530,000 | $583,000 ⭑ | ✔ |
| Current Value | $530,000 | $583,000 ⭑ | ✔ |
| Acquisition/Purchase Date | 2024-02-15 | 2024-02-15 | ✔ |
| Purchase Price | $510,000 | $510,000 | ✔ |
| Currency | USD | USD | n/a |
| Valuation Type | manual | manual | n/a |
| Institution | Institution 43 Capital | Institution 43 Capital EDITED ⭑ | ✔ |
| Account Number (masked) | ****1043 | ****1043 | ✔ |
| Risk Level | Medium | High ⭑ | ✔ |
| Investment Horizon | 3-5 years | 3-5 years EDITED ⭑ | ✔ |

## 44. ESG & Carbon Credits — “QA ESG & Carbon Credits Holding”

Asset ID: `ab506890-4556-46e7-aa1b-e25c668d8435`

| Field | Original (created) | Updated (after edit) | Visible in View Details |
|---|---|---|---|
| Asset Name | QA ESG & Carbon Credits Holding | QA ESG & Carbon Credits Holding | ✔ |
| Category | ESG & Carbon Credits | ESG & Carbon Credits | ✔ |
| Asset Type | other | other | n/a |
| Estimated Value | $540,000 | $594,000 ⭑ | ✔ |
| Current Value | $540,000 | $594,000 ⭑ | ✔ |
| Acquisition/Purchase Date | 2024-02-15 | 2024-02-15 | ✔ |
| Purchase Price | $520,000 | $520,000 | ✔ |
| Currency | USD | USD | n/a |
| Valuation Type | manual | manual | n/a |
| Institution | Institution 44 Capital | Institution 44 Capital EDITED ⭑ | ✔ |
| Account Number (masked) | ****1044 | ****1044 | ✔ |
| Risk Level | Medium | High ⭑ | ✔ |
| Investment Horizon | 3-5 years | 3-5 years EDITED ⭑ | ✔ |

## 45. Margin & Credit — “QA Margin & Credit Holding”

Asset ID: `6630acda-694c-4e55-bed7-e5615a73db51`

| Field | Original (created) | Updated (after edit) | Visible in View Details |
|---|---|---|---|
| Asset Name | QA Margin & Credit Holding | QA Margin & Credit Holding | ✔ |
| Category | Margin & Credit | Margin & Credit | ✔ |
| Asset Type | other | other | n/a |
| Estimated Value | $550,000 | $605,000 ⭑ | ✔ |
| Current Value | $550,000 | $605,000 ⭑ | ✔ |
| Acquisition/Purchase Date | 2024-02-15 | 2024-02-15 | ✔ |
| Purchase Price | $530,000 | $530,000 | ✔ |
| Currency | USD | USD | n/a |
| Valuation Type | manual | manual | n/a |
| Institution | Institution 45 Capital | Institution 45 Capital EDITED ⭑ | ✔ |
| Account Number (masked) | ****1045 | ****1045 | ✔ |
| Risk Level | Medium | High ⭑ | ✔ |
| Investment Horizon | 3-5 years | 3-5 years EDITED ⭑ | ✔ |

## 46. Royalty Streams — “QA Royalty Streams Holding”

Asset ID: `1ae8231d-4c3e-4776-b989-540386d9c5f0`

| Field | Original (created) | Updated (after edit) | Visible in View Details |
|---|---|---|---|
| Asset Name | QA Royalty Streams Holding | QA Royalty Streams Holding | ✔ |
| Category | Royalty Streams | Royalty Streams | ✔ |
| Asset Type | other | other | n/a |
| Estimated Value | $560,000 | $616,000 ⭑ | ✔ |
| Current Value | $560,000 | $616,000 ⭑ | ✔ |
| Acquisition/Purchase Date | 2024-02-15 | 2024-02-15 | ✔ |
| Purchase Price | $540,000 | $540,000 | ✔ |
| Currency | USD | USD | n/a |
| Valuation Type | manual | manual | n/a |
| Institution | Institution 46 Capital | Institution 46 Capital EDITED ⭑ | ✔ |
| Account Number (masked) | ****1046 | ****1046 | ✔ |
| Risk Level | Medium | High ⭑ | ✔ |
| Investment Horizon | 3-5 years | 3-5 years EDITED ⭑ | ✔ |

## 47. Litigation Finance — “QA Litigation Finance Holding”

Asset ID: `ec16d53f-c269-4f49-9fed-a1016136ee1a`

| Field | Original (created) | Updated (after edit) | Visible in View Details |
|---|---|---|---|
| Asset Name | QA Litigation Finance Holding | QA Litigation Finance Holding | ✔ |
| Category | Litigation Finance | Litigation Finance | ✔ |
| Asset Type | other | other | n/a |
| Estimated Value | $570,000 | $627,000 ⭑ | ✔ |
| Current Value | $570,000 | $627,000 ⭑ | ✔ |
| Acquisition/Purchase Date | 2024-02-15 | 2024-02-15 | ✔ |
| Purchase Price | $550,000 | $550,000 | ✔ |
| Currency | USD | USD | n/a |
| Valuation Type | manual | manual | n/a |
| Institution | Institution 47 Capital | Institution 47 Capital EDITED ⭑ | ✔ |
| Account Number (masked) | ****1047 | ****1047 | ✔ |
| Risk Level | Medium | High ⭑ | ✔ |
| Investment Horizon | 3-5 years | 3-5 years EDITED ⭑ | ✔ |

## 48. Precious Metal ETFs — “QA Precious Metal ETFs Holding”

Asset ID: `5653c4fc-8ab3-442e-98e1-9acc31bf9223`

| Field | Original (created) | Updated (after edit) | Visible in View Details |
|---|---|---|---|
| Asset Name | QA Precious Metal ETFs Holding | QA Precious Metal ETFs Holding | ✔ |
| Category | Precious Metal ETFs | Precious Metal ETFs | ✔ |
| Asset Type | other | other | n/a |
| Estimated Value | $580,000 | $638,000 ⭑ | ✔ |
| Current Value | $580,000 | $638,000 ⭑ | ✔ |
| Acquisition/Purchase Date | 2024-02-15 | 2024-02-15 | ✔ |
| Purchase Price | $560,000 | $560,000 | ✔ |
| Currency | USD | USD | n/a |
| Valuation Type | manual | manual | n/a |
| Institution | Institution 48 Capital | Institution 48 Capital EDITED ⭑ | ✔ |
| Account Number (masked) | ****1048 | ****1048 | ✔ |
| Risk Level | Medium | High ⭑ | ✔ |
| Investment Horizon | 3-5 years | 3-5 years EDITED ⭑ | ✔ |

## 49. Derivatives & Options — “QA Derivatives & Options Holding”

Asset ID: `44062531-7b70-4714-a569-c8d384e5305b`

| Field | Original (created) | Updated (after edit) | Visible in View Details |
|---|---|---|---|
| Asset Name | QA Derivatives & Options Holding | QA Derivatives & Options Holding | ✔ |
| Category | Derivatives & Options | Derivatives & Options | ✔ |
| Asset Type | other | other | n/a |
| Estimated Value | $590,000 | $649,000 ⭑ | ✔ |
| Current Value | $590,000 | $649,000 ⭑ | ✔ |
| Acquisition/Purchase Date | 2024-02-15 | 2024-02-15 | ✔ |
| Purchase Price | $570,000 | $570,000 | ✔ |
| Currency | USD | USD | n/a |
| Valuation Type | manual | manual | n/a |
| Institution | Institution 49 Capital | Institution 49 Capital EDITED ⭑ | ✔ |
| Account Number (masked) | ****1049 | ****1049 | ✔ |
| Risk Level | Medium | High ⭑ | ✔ |
| Investment Horizon | 3-5 years | 3-5 years EDITED ⭑ | ✔ |

## 50. Trusts / Foundations — “QA Trusts / Foundations Holding”

Asset ID: `a0cb9976-47ab-4b51-9bab-e3d8fcc1e9d1`

| Field | Original (created) | Updated (after edit) | Visible in View Details |
|---|---|---|---|
| Asset Name | QA Trusts / Foundations Holding | QA Trusts / Foundations Holding | ✔ |
| Category | Trusts / Foundations | Trusts / Foundations | ✔ |
| Asset Type | other | other | n/a |
| Estimated Value | $600,000 | $660,000 ⭑ | ✔ |
| Current Value | $600,000 | $660,000 ⭑ | ✔ |
| Acquisition/Purchase Date | 2024-02-15 | 2024-02-15 | ✔ |
| Purchase Price | $580,000 | $580,000 | ✔ |
| Currency | USD | USD | n/a |
| Valuation Type | manual | manual | n/a |
| Institution | Institution 50 Capital | Institution 50 Capital EDITED ⭑ | ✔ |
| Account Number (masked) | ****1050 | ****1050 | ✔ |
| Risk Level | Medium | High ⭑ | ✔ |
| Investment Horizon | 3-5 years | 3-5 years EDITED ⭑ | ✔ |

## 51. Cash Management — “QA Cash Management Holding”

Asset ID: `7a3d036c-6fec-42b0-b111-0373fc06e99b`

| Field | Original (created) | Updated (after edit) | Visible in View Details |
|---|---|---|---|
| Asset Name | QA Cash Management Holding | QA Cash Management Holding | ✔ |
| Category | Cash Management | Cash Management | ✔ |
| Asset Type | other | other | n/a |
| Estimated Value | $610,000 | $671,000 ⭑ | ✔ |
| Current Value | $610,000 | $671,000 ⭑ | ✔ |
| Acquisition/Purchase Date | 2024-02-15 | 2024-02-15 | ✔ |
| Purchase Price | $590,000 | $590,000 | ✔ |
| Currency | USD | USD | n/a |
| Valuation Type | manual | manual | n/a |
| Institution | Institution 51 Capital | Institution 51 Capital EDITED ⭑ | ✔ |
| Account Number (masked) | ****1051 | ****1051 | ✔ |
| Risk Level | Medium | High ⭑ | ✔ |
| Investment Horizon | 3-5 years | 3-5 years EDITED ⭑ | ✔ |

## 52. Stablecoins & CBDCs — “QA Stablecoins & CBDCs Holding”

Asset ID: `1532bf3e-554e-47f2-a5c8-02ac52297162`

| Field | Original (created) | Updated (after edit) | Visible in View Details |
|---|---|---|---|
| Asset Name | QA Stablecoins & CBDCs Holding | QA Stablecoins & CBDCs Holding | ✔ |
| Category | Stablecoins & CBDCs | Stablecoins & CBDCs | ✔ |
| Asset Type | crypto | crypto | n/a |
| Estimated Value | $620,000 | $682,000 ⭑ | ✔ |
| Current Value | $620,000 | $682,000 ⭑ | ✔ |
| Acquisition/Purchase Date | 2024-02-15 | 2024-02-15 | ✔ |
| Purchase Price | $600,000 | $600,000 | ✔ |
| Currency | USD | USD | n/a |
| Valuation Type | manual | manual | n/a |
| Institution | Institution 52 Capital | Institution 52 Capital EDITED ⭑ | ✔ |
| Account Number (masked) | ****1052 | ****1052 | ✔ |
| Risk Level | Medium | High ⭑ | ✔ |
| Investment Horizon | 3-5 years | 3-5 years EDITED ⭑ | ✔ |

## 53. DeFi Instruments — “QA DeFi Instruments Holding”

Asset ID: `c83139a6-9580-4a96-ac2d-3c5dca4f689f`

| Field | Original (created) | Updated (after edit) | Visible in View Details |
|---|---|---|---|
| Asset Name | QA DeFi Instruments Holding | QA DeFi Instruments Holding | ✔ |
| Category | DeFi Instruments | DeFi Instruments | ✔ |
| Asset Type | crypto | crypto | n/a |
| Estimated Value | $630,000 | $693,000 ⭑ | ✔ |
| Current Value | $630,000 | $693,000 ⭑ | ✔ |
| Acquisition/Purchase Date | 2024-02-15 | 2024-02-15 | ✔ |
| Purchase Price | $610,000 | $610,000 | ✔ |
| Currency | USD | USD | n/a |
| Valuation Type | manual | manual | n/a |
| Institution | Institution 53 Capital | Institution 53 Capital EDITED ⭑ | ✔ |
| Account Number (masked) | ****1053 | ****1053 | ✔ |
| Risk Level | Medium | High ⭑ | ✔ |
| Investment Horizon | 3-5 years | 3-5 years EDITED ⭑ | ✔ |

## 54. Convertible Notes — “QA Convertible Notes Holding”

Asset ID: `76a84982-da13-48c5-b0e8-9275641290dd`

| Field | Original (created) | Updated (after edit) | Visible in View Details |
|---|---|---|---|
| Asset Name | QA Convertible Notes Holding | QA Convertible Notes Holding | ✔ |
| Category | Convertible Notes | Convertible Notes | ✔ |
| Asset Type | bond | bond | n/a |
| Estimated Value | $640,000 | $704,000 ⭑ | ✔ |
| Current Value | $640,000 | $704,000 ⭑ | ✔ |
| Acquisition/Purchase Date | 2024-02-15 | 2024-02-15 | ✔ |
| Purchase Price | $620,000 | $620,000 | ✔ |
| Currency | USD | USD | n/a |
| Valuation Type | manual | manual | n/a |
| Institution | Institution 54 Capital | Institution 54 Capital EDITED ⭑ | ✔ |
| Account Number (masked) | ****1054 | ****1054 | ✔ |
| Risk Level | Medium | High ⭑ | ✔ |
| Investment Horizon | 3-5 years | 3-5 years EDITED ⭑ | ✔ |

## 55. Tax-Deferred Investments — “QA Tax-Deferred Investments Holding”

Asset ID: `14dc0fe6-00ab-4de6-bc23-f6d76a3daa8a`

| Field | Original (created) | Updated (after edit) | Visible in View Details |
|---|---|---|---|
| Asset Name | QA Tax-Deferred Investments Holding | QA Tax-Deferred Investments Holding | ✔ |
| Category | Tax-Deferred Investments | Tax-Deferred Investments | ✔ |
| Asset Type | other | other | n/a |
| Estimated Value | $650,000 | $715,000 ⭑ | ✔ |
| Current Value | $650,000 | $715,000 ⭑ | ✔ |
| Acquisition/Purchase Date | 2024-02-15 | 2024-02-15 | ✔ |
| Purchase Price | $630,000 | $630,000 | ✔ |
| Currency | USD | USD | n/a |
| Valuation Type | manual | manual | n/a |
| Institution | Institution 55 Capital | Institution 55 Capital EDITED ⭑ | ✔ |
| Account Number (masked) | ****1055 | ****1055 | ✔ |
| Risk Level | Medium | High ⭑ | ✔ |
| Investment Horizon | 3-5 years | 3-5 years EDITED ⭑ | ✔ |

## 56. Stock Options / RSUs — “QA Stock Options / RSUs Holding”

Asset ID: `ee928bdb-7dd2-4cd8-8237-2705bcb22b6b`

| Field | Original (created) | Updated (after edit) | Visible in View Details |
|---|---|---|---|
| Asset Name | QA Stock Options / RSUs Holding | QA Stock Options / RSUs Holding | ✔ |
| Category | Stock Options / RSUs | Stock Options / RSUs | ✔ |
| Asset Type | stock | stock | n/a |
| Estimated Value | $660,000 | $726,000 ⭑ | ✔ |
| Current Value | $660,000 | $726,000 ⭑ | ✔ |
| Acquisition/Purchase Date | 2024-02-15 | 2024-02-15 | ✔ |
| Purchase Price | $640,000 | $640,000 | ✔ |
| Currency | USD | USD | n/a |
| Valuation Type | manual | manual | n/a |
| Institution | Institution 56 Capital | Institution 56 Capital EDITED ⭑ | ✔ |
| Account Number (masked) | ****1056 | ****1056 | ✔ |
| Risk Level | Medium | High ⭑ | ✔ |
| Investment Horizon | 3-5 years | 3-5 years EDITED ⭑ | ✔ |

## 57. Micro-Investments — “QA Micro-Investments Holding”

Asset ID: `307a0c93-d253-4564-8e58-0e239d67d93e`

| Field | Original (created) | Updated (after edit) | Visible in View Details |
|---|---|---|---|
| Asset Name | QA Micro-Investments Holding | QA Micro-Investments Holding | ✔ |
| Category | Micro-Investments | Micro-Investments | ✔ |
| Asset Type | other | other | n/a |
| Estimated Value | $670,000 | $737,000 ⭑ | ✔ |
| Current Value | $670,000 | $737,000 ⭑ | ✔ |
| Acquisition/Purchase Date | 2024-02-15 | 2024-02-15 | ✔ |
| Purchase Price | $650,000 | $650,000 | ✔ |
| Currency | USD | USD | n/a |
| Valuation Type | manual | manual | n/a |
| Institution | Institution 57 Capital | Institution 57 Capital EDITED ⭑ | ✔ |
| Account Number (masked) | ****1057 | ****1057 | ✔ |
| Risk Level | Medium | High ⭑ | ✔ |
| Investment Horizon | 3-5 years | 3-5 years EDITED ⭑ | ✔ |

---

# Category group: Liabilities

## 58. Mortgages — “Mortgage”

Asset ID: `a319f14c-cb01-463d-95af-03657575a628`

| Field | Original (created) | Updated (after edit) | Visible in View Details |
|---|---|---|---|
| Asset Name | Mortgage | Mortgage | ✔ |
| Category | Mortgages | Mortgages | ✔ |
| Estimated Value | $680,000 | $748,000 ⭑ | ✔ |
| Current Value | $680,000 | $748,000 ⭑ | ✔ |
| Currency | USD | USD | n/a |
| Valuation Type | manual | manual | n/a |
| Debt Type | Mortgage | Mortgage | ✔ |
| Creditor Name | Creditor Bank 58 | Creditor Bank 58 EDITED ⭑ | ✔ |
| Amount Owed | $680,000 | $748,000 ⭑ | ✔ |
| Interest Rate | 5.25% | 5.25% | ✔ |
| Start Date | 2022-01-01 | 2022-01-01 | ✔ |
| Maturity Date | 2032-01-01 | 2032-01-01 | ✔ |
| Payment Frequency | Monthly | Annual ⭑ | ✔ |
| Collateral | Collateral item 58 | Collateral item 58 | ✔ |

## 59. Personal Loans — “Personal Loan”

Asset ID: `a1a04be9-b357-49cd-81ef-819f0e46e49b`

| Field | Original (created) | Updated (after edit) | Visible in View Details |
|---|---|---|---|
| Asset Name | Personal Loan | Personal Loan | ✔ |
| Category | Personal Loans | Personal Loans | ✔ |
| Estimated Value | $690,000 | $759,000 ⭑ | ✔ |
| Current Value | $690,000 | $759,000 ⭑ | ✔ |
| Currency | USD | USD | n/a |
| Valuation Type | manual | manual | n/a |
| Debt Type | Personal Loan | Personal Loan | ✔ |
| Creditor Name | Creditor Bank 59 | Creditor Bank 59 EDITED ⭑ | ✔ |
| Amount Owed | $690,000 | $759,000 ⭑ | ✔ |
| Interest Rate | 5.25% | 5.25% | ✔ |
| Start Date | 2022-01-01 | 2022-01-01 | ✔ |
| Maturity Date | 2032-01-01 | 2032-01-01 | ✔ |
| Payment Frequency | Monthly | Annual ⭑ | ✔ |
| Collateral | Collateral item 59 | Collateral item 59 | ✔ |

## 60. Business Loans — “Business Loan”

Asset ID: `a0e33c3e-d75a-4d39-8832-fb1c665246a9`

| Field | Original (created) | Updated (after edit) | Visible in View Details |
|---|---|---|---|
| Asset Name | Business Loan | Business Loan | ✔ |
| Category | Business Loans | Business Loans | ✔ |
| Estimated Value | $700,000 | $770,000 ⭑ | ✔ |
| Current Value | $700,000 | $770,000 ⭑ | ✔ |
| Currency | USD | USD | n/a |
| Valuation Type | manual | manual | n/a |
| Debt Type | Business Loan | Business Loan | ✔ |
| Creditor Name | Creditor Bank 60 | Creditor Bank 60 EDITED ⭑ | ✔ |
| Amount Owed | $700,000 | $770,000 ⭑ | ✔ |
| Interest Rate | 5.25% | 5.25% | ✔ |
| Start Date | 2022-01-01 | 2022-01-01 | ✔ |
| Maturity Date | 2032-01-01 | 2032-01-01 | ✔ |
| Payment Frequency | Monthly | Annual ⭑ | ✔ |
| Collateral | Collateral item 60 | Collateral item 60 | ✔ |

## 61. Credit Cards — “Credit Card”

Asset ID: `6afe968b-01ac-4b92-bb0d-438296b24335`

| Field | Original (created) | Updated (after edit) | Visible in View Details |
|---|---|---|---|
| Asset Name | Credit Card | Credit Card | ✔ |
| Category | Credit Cards | Credit Cards | ✔ |
| Estimated Value | $710,000 | $781,000 ⭑ | ✔ |
| Current Value | $710,000 | $781,000 ⭑ | ✔ |
| Currency | USD | USD | n/a |
| Valuation Type | manual | manual | n/a |
| Debt Type | Credit Card | Credit Card | ✔ |
| Creditor Name | Creditor Bank 61 | Creditor Bank 61 EDITED ⭑ | ✔ |
| Amount Owed | $710,000 | $781,000 ⭑ | ✔ |
| Interest Rate | 5.25% | 5.25% | ✔ |
| Start Date | 2022-01-01 | 2022-01-01 | ✔ |
| Maturity Date | 2032-01-01 | 2032-01-01 | ✔ |
| Payment Frequency | Monthly | Annual ⭑ | ✔ |
| Collateral | Collateral item 61 | Collateral item 61 | ✔ |

## 62. Auto / Yacht Loans — “Auto / Yacht Loan”

Asset ID: `df372672-82c4-4464-aa52-66281a7ff454`

| Field | Original (created) | Updated (after edit) | Visible in View Details |
|---|---|---|---|
| Asset Name | Auto / Yacht Loan | Auto / Yacht Loan | ✔ |
| Category | Auto / Yacht Loans | Auto / Yacht Loans | ✔ |
| Estimated Value | $720,000 | $792,000 ⭑ | ✔ |
| Current Value | $720,000 | $792,000 ⭑ | ✔ |
| Currency | USD | USD | n/a |
| Valuation Type | manual | manual | n/a |
| Debt Type | Auto / Yacht Loan | Auto / Yacht Loan | ✔ |
| Creditor Name | Creditor Bank 62 | Creditor Bank 62 EDITED ⭑ | ✔ |
| Amount Owed | $720,000 | $792,000 ⭑ | ✔ |
| Interest Rate | 5.25% | 5.25% | ✔ |
| Start Date | 2022-01-01 | 2022-01-01 | ✔ |
| Maturity Date | 2032-01-01 | 2032-01-01 | ✔ |
| Payment Frequency | Monthly | Annual ⭑ | ✔ |
| Collateral | Collateral item 62 | Collateral item 62 | ✔ |

## 63. Margin Loans — “Margin Loan”

Asset ID: `b980ecfe-464f-40af-9eae-48aea478c882`

| Field | Original (created) | Updated (after edit) | Visible in View Details |
|---|---|---|---|
| Asset Name | Margin Loan | Margin Loan | ✔ |
| Category | Margin Loans | Margin Loans | ✔ |
| Estimated Value | $730,000 | $803,000 ⭑ | ✔ |
| Current Value | $730,000 | $803,000 ⭑ | ✔ |
| Currency | USD | USD | n/a |
| Valuation Type | manual | manual | n/a |
| Debt Type | Margin Loan | Margin Loan | ✔ |
| Creditor Name | Creditor Bank 63 | Creditor Bank 63 EDITED ⭑ | ✔ |
| Amount Owed | $730,000 | $803,000 ⭑ | ✔ |
| Interest Rate | 5.25% | 5.25% | ✔ |
| Start Date | 2022-01-01 | 2022-01-01 | ✔ |
| Maturity Date | 2032-01-01 | 2032-01-01 | ✔ |
| Payment Frequency | Monthly | Annual ⭑ | ✔ |
| Collateral | Collateral item 63 | Collateral item 63 | ✔ |

## 64. Lines of Credit — “Line of Credit”

Asset ID: `a7652e93-d550-419e-a4c7-bbd7ff88eb09`

| Field | Original (created) | Updated (after edit) | Visible in View Details |
|---|---|---|---|
| Asset Name | Line of Credit | Line of Credit | ✔ |
| Category | Lines of Credit | Lines of Credit | ✔ |
| Estimated Value | $740,000 | $814,000 ⭑ | ✔ |
| Current Value | $740,000 | $814,000 ⭑ | ✔ |
| Currency | USD | USD | n/a |
| Valuation Type | manual | manual | n/a |
| Debt Type | Line of Credit | Line of Credit | ✔ |
| Creditor Name | Creditor Bank 64 | Creditor Bank 64 EDITED ⭑ | ✔ |
| Amount Owed | $740,000 | $814,000 ⭑ | ✔ |
| Interest Rate | 5.25% | 5.25% | ✔ |
| Start Date | 2022-01-01 | 2022-01-01 | ✔ |
| Maturity Date | 2032-01-01 | 2032-01-01 | ✔ |
| Payment Frequency | Monthly | Annual ⭑ | ✔ |
| Collateral | Collateral item 64 | Collateral item 64 | ✔ |

## 65. Tax Liabilities — “Tax Liability”

Asset ID: `b08bb8d2-3021-4cfb-95fa-9ea7c42dc50b`

| Field | Original (created) | Updated (after edit) | Visible in View Details |
|---|---|---|---|
| Asset Name | Tax Liability | Tax Liability | ✔ |
| Category | Tax Liabilities | Tax Liabilities | ✔ |
| Estimated Value | $750,000 | $825,000 ⭑ | ✔ |
| Current Value | $750,000 | $825,000 ⭑ | ✔ |
| Currency | USD | USD | n/a |
| Valuation Type | manual | manual | n/a |
| Debt Type | Tax Liability | Tax Liability | ✔ |
| Creditor Name | Creditor Bank 65 | Creditor Bank 65 EDITED ⭑ | ✔ |
| Amount Owed | $750,000 | $825,000 ⭑ | ✔ |
| Interest Rate | 5.25% | 5.25% | ✔ |
| Start Date | 2022-01-01 | 2022-01-01 | ✔ |
| Maturity Date | 2032-01-01 | 2032-01-01 | ✔ |
| Payment Frequency | Monthly | Annual ⭑ | ✔ |
| Collateral | Collateral item 65 | Collateral item 65 | ✔ |

## 66. Deferred Payments — “Deferred Payment”

Asset ID: `d2fc598b-bf8d-411f-82e6-17945fc12c4a`

| Field | Original (created) | Updated (after edit) | Visible in View Details |
|---|---|---|---|
| Asset Name | Deferred Payment | Deferred Payment | ✔ |
| Category | Deferred Payments | Deferred Payments | ✔ |
| Estimated Value | $760,000 | $836,000 ⭑ | ✔ |
| Current Value | $760,000 | $836,000 ⭑ | ✔ |
| Currency | USD | USD | n/a |
| Valuation Type | manual | manual | n/a |
| Debt Type | Deferred Payment | Deferred Payment | ✔ |
| Creditor Name | Creditor Bank 66 | Creditor Bank 66 EDITED ⭑ | ✔ |
| Amount Owed | $760,000 | $836,000 ⭑ | ✔ |
| Interest Rate | 5.25% | 5.25% | ✔ |
| Start Date | 2022-01-01 | 2022-01-01 | ✔ |
| Maturity Date | 2032-01-01 | 2032-01-01 | ✔ |
| Payment Frequency | Monthly | Annual ⭑ | ✔ |
| Collateral | Collateral item 66 | Collateral item 66 | ✔ |

## 67. Lease Agreements — “Lease Agreement”

Asset ID: `5b85c017-4b2f-45a4-a0fa-35eea0f8fe34`

| Field | Original (created) | Updated (after edit) | Visible in View Details |
|---|---|---|---|
| Asset Name | Lease Agreement | Lease Agreement | ✔ |
| Category | Lease Agreements | Lease Agreements | ✔ |
| Estimated Value | $770,000 | $847,000 ⭑ | ✔ |
| Current Value | $770,000 | $847,000 ⭑ | ✔ |
| Currency | USD | USD | n/a |
| Valuation Type | manual | manual | n/a |
| Debt Type | Lease Agreement | Lease Agreement | ✔ |
| Creditor Name | Creditor Bank 67 | Creditor Bank 67 EDITED ⭑ | ✔ |
| Amount Owed | $770,000 | $847,000 ⭑ | ✔ |
| Interest Rate | 5.25% | 5.25% | ✔ |
| Start Date | 2022-01-01 | 2022-01-01 | ✔ |
| Maturity Date | 2032-01-01 | 2032-01-01 | ✔ |
| Payment Frequency | Monthly | Annual ⭑ | ✔ |
| Collateral | Collateral item 67 | Collateral item 67 | ✔ |

---

# Category group: Shadow Wealth

## 68. Pending Inheritance — “Pending Inheritance”

Asset ID: `05a21fb8-9cb1-4348-9b1f-35bfb3affdf4`

| Field | Original (created) | Updated (after edit) | Visible in View Details |
|---|---|---|---|
| Asset Name | Pending Inheritance | Pending Inheritance | ✔ |
| Category | Pending Inheritance | Pending Inheritance | ✔ |
| Description | QA shadow wealth entry for Pending Inheritance. | QA shadow wealth entry for Pending Inheritance. Updated by edit pass. ⭑ | ✔ |
| Estimated Value | $780,000 | $858,000 ⭑ | ✔ |
| Current Value | $780,000 | $858,000 ⭑ | ✔ |
| Currency | USD | USD | n/a |
| Valuation Type | manual | manual | n/a |
| Wealth Type | Pending Inheritance | Pending Inheritance | ✔ |
| Expected Date | 2027-03-01 | 2027-03-01 | ✔ |
| Documentation | Document ref QA-0068 | Document ref QA-0068 | ✔ |
| Source Entity | Source Entity 68 | Source Entity 68 EDITED ⭑ | ✔ |
| Beneficiary | Advisor Test | Advisor Test | ✔ |

## 69. Unvested Stock / RSUs — “Unvested Stock / RSUs”

Asset ID: `b8f8f1e7-ccd6-4d0e-b561-f340369e41d5`

| Field | Original (created) | Updated (after edit) | Visible in View Details |
|---|---|---|---|
| Asset Name | Unvested Stock / RSUs | Unvested Stock / RSUs | ✔ |
| Category | Unvested Stock / RSUs | Unvested Stock / RSUs | ✔ |
| Description | QA shadow wealth entry for Unvested Stock / RSUs. | QA shadow wealth entry for Unvested Stock / RSUs. Updated by edit pass. ⭑ | ✔ |
| Estimated Value | $790,000 | $869,000 ⭑ | ✔ |
| Current Value | $790,000 | $869,000 ⭑ | ✔ |
| Currency | USD | USD | n/a |
| Valuation Type | manual | manual | n/a |
| Wealth Type | Unvested Stock / RSUs | Unvested Stock / RSUs | ✔ |
| Expected Date | 2027-03-01 | 2027-03-01 | ✔ |
| Documentation | Document ref QA-0069 | Document ref QA-0069 | ✔ |
| Source Entity | Source Entity 69 | Source Entity 69 EDITED ⭑ | ✔ |
| Beneficiary | Advisor Test | Advisor Test | ✔ |

## 70. Deferred Compensation — “Deferred Compensation”

Asset ID: `b72fd8e7-7e43-4fba-9cf1-32718f3a4d72`

| Field | Original (created) | Updated (after edit) | Visible in View Details |
|---|---|---|---|
| Asset Name | Deferred Compensation | Deferred Compensation | ✔ |
| Category | Deferred Compensation | Deferred Compensation | ✔ |
| Description | QA shadow wealth entry for Deferred Compensation. | QA shadow wealth entry for Deferred Compensation. Updated by edit pass. ⭑ | ✔ |
| Estimated Value | $800,000 | $880,000 ⭑ | ✔ |
| Current Value | $800,000 | $880,000 ⭑ | ✔ |
| Currency | USD | USD | n/a |
| Valuation Type | manual | manual | n/a |
| Wealth Type | Deferred Compensation | Deferred Compensation | ✔ |
| Expected Date | 2027-03-01 | 2027-03-01 | ✔ |
| Documentation | Document ref QA-0070 | Document ref QA-0070 | ✔ |
| Source Entity | Source Entity 70 | Source Entity 70 EDITED ⭑ | ✔ |
| Beneficiary | Advisor Test | Advisor Test | ✔ |

## 71. Marital / Shared Assets — “Marital / Shared Assets”

Asset ID: `f31ac773-6ccd-46c9-bf7e-c60881d89d5d`

| Field | Original (created) | Updated (after edit) | Visible in View Details |
|---|---|---|---|
| Asset Name | Marital / Shared Assets | Marital / Shared Assets | ✔ |
| Category | Marital / Shared Assets | Marital / Shared Assets | ✔ |
| Description | QA shadow wealth entry for Marital / Shared Assets. | QA shadow wealth entry for Marital / Shared Assets. Updated by edit pass. ⭑ | ✔ |
| Estimated Value | $810,000 | $891,000 ⭑ | ✔ |
| Current Value | $810,000 | $891,000 ⭑ | ✔ |
| Currency | USD | USD | n/a |
| Valuation Type | manual | manual | n/a |
| Wealth Type | Marital / Shared Assets | Marital / Shared Assets | ✔ |
| Expected Date | 2027-03-01 | 2027-03-01 | ✔ |
| Documentation | Document ref QA-0071 | Document ref QA-0071 | ✔ |
| Source Entity | Source Entity 71 | Source Entity 71 EDITED ⭑ | ✔ |
| Beneficiary | Advisor Test | Advisor Test | ✔ |

## 72. Trust Allocations — “Trust Allocation”

Asset ID: `b1305ddc-55cc-4ddf-8884-3cb1a37cff30`

| Field | Original (created) | Updated (after edit) | Visible in View Details |
|---|---|---|---|
| Asset Name | Trust Allocation | Trust Allocation | ✔ |
| Category | Trust Allocations | Trust Allocations | ✔ |
| Description | QA shadow wealth entry for Trust Allocations. | QA shadow wealth entry for Trust Allocations. Updated by edit pass. ⭑ | ✔ |
| Estimated Value | $820,000 | $902,000 ⭑ | ✔ |
| Current Value | $820,000 | $902,000 ⭑ | ✔ |
| Currency | USD | USD | n/a |
| Valuation Type | manual | manual | n/a |
| Wealth Type | Trust Allocation | Trust Allocation | ✔ |
| Expected Date | 2027-03-01 | 2027-03-01 | ✔ |
| Documentation | Document ref QA-0072 | Document ref QA-0072 | ✔ |
| Source Entity | Source Entity 72 | Source Entity 72 EDITED ⭑ | ✔ |
| Beneficiary | Advisor Test | Advisor Test | ✔ |

## 73. Legal Settlements — “Legal Settlement”

Asset ID: `61e382e4-141f-46b1-bd79-84c965a7b71b`

| Field | Original (created) | Updated (after edit) | Visible in View Details |
|---|---|---|---|
| Asset Name | Legal Settlement | Legal Settlement | ✔ |
| Category | Legal Settlements | Legal Settlements | ✔ |
| Description | QA shadow wealth entry for Legal Settlements. | QA shadow wealth entry for Legal Settlements. Updated by edit pass. ⭑ | ✔ |
| Estimated Value | $830,000 | $913,000 ⭑ | ✔ |
| Current Value | $830,000 | $913,000 ⭑ | ✔ |
| Currency | USD | USD | n/a |
| Valuation Type | manual | manual | n/a |
| Wealth Type | Legal Settlement | Legal Settlement | ✔ |
| Expected Date | 2027-03-01 | 2027-03-01 | ✔ |
| Documentation | Document ref QA-0073 | Document ref QA-0073 | ✔ |
| Source Entity | Source Entity 73 | Source Entity 73 EDITED ⭑ | ✔ |
| Beneficiary | Advisor Test | Advisor Test | ✔ |

## 74. Anticipated Exit Proceeds — “Anticipated Exit Proceeds”

Asset ID: `62e5f323-c94f-4aa6-9282-c3fd3ab60af6`

| Field | Original (created) | Updated (after edit) | Visible in View Details |
|---|---|---|---|
| Asset Name | Anticipated Exit Proceeds | Anticipated Exit Proceeds | ✔ |
| Category | Anticipated Exit Proceeds | Anticipated Exit Proceeds | ✔ |
| Description | QA shadow wealth entry for Anticipated Exit Proceeds. | QA shadow wealth entry for Anticipated Exit Proceeds. Updated by edit pass. ⭑ | ✔ |
| Estimated Value | $840,000 | $924,000 ⭑ | ✔ |
| Current Value | $840,000 | $924,000 ⭑ | ✔ |
| Currency | USD | USD | n/a |
| Valuation Type | manual | manual | n/a |
| Wealth Type | Anticipated Exit Proceeds | Anticipated Exit Proceeds | ✔ |
| Expected Date | 2027-03-01 | 2027-03-01 | ✔ |
| Documentation | Document ref QA-0074 | Document ref QA-0074 | ✔ |
| Source Entity | Source Entity 74 | Source Entity 74 EDITED ⭑ | ✔ |
| Beneficiary | Advisor Test | Advisor Test | ✔ |

## 75. Brand / IP Equity — “Brand / IP Equity”

Asset ID: `59016ce1-e1f5-4f05-a3f2-faa851c14132`

| Field | Original (created) | Updated (after edit) | Visible in View Details |
|---|---|---|---|
| Asset Name | Brand / IP Equity | Brand / IP Equity | ✔ |
| Category | Brand / IP Equity | Brand / IP Equity | ✔ |
| Description | QA shadow wealth entry for Brand / IP Equity. | QA shadow wealth entry for Brand / IP Equity. Updated by edit pass. ⭑ | ✔ |
| Estimated Value | $850,000 | $935,000 ⭑ | ✔ |
| Current Value | $850,000 | $935,000 ⭑ | ✔ |
| Currency | USD | USD | n/a |
| Valuation Type | manual | manual | n/a |
| Wealth Type | Brand / IP Equity | Brand / IP Equity | ✔ |
| Expected Date | 2027-03-01 | 2027-03-01 | ✔ |
| Documentation | Document ref QA-0075 | Document ref QA-0075 | ✔ |
| Source Entity | Source Entity 75 | Source Entity 75 EDITED ⭑ | ✔ |
| Beneficiary | Advisor Test | Advisor Test | ✔ |

---

# Category group: Philanthropy

## 76. Foundations — “QA Foundations Fund”

Asset ID: `0843001d-794b-46b3-bfae-c727527a4d8b`

| Field | Original (created) | Updated (after edit) | Visible in View Details |
|---|---|---|---|
| Asset Name | QA Foundations Fund | QA Foundations Fund | ✔ |
| Category | Foundations | Foundations | ✔ |
| Estimated Value | $860,000 | $946,000 ⭑ | ✔ |
| Current Value | $860,000 | $946,000 ⭑ | ✔ |
| Currency | USD | USD | n/a |
| Valuation Type | manual | manual | n/a |
| Fund/Vehicle Name | QA Foundations Fund | QA Foundations Fund | ✔ |
| Type | Foundation | Foundation | ✔ |
| Purpose | QA purpose text for Foundations. | QA purpose text for Foundations. | ✔ |
| Start Date | 2025-06-01 | 2025-06-01 | ✔ |
| Contribution Value | $860,000 | $946,000 ⭑ | ✔ |
| Institution | Charitable Inst 76 | Charitable Inst 76 EDITED ⭑ | ✔ |
| Jurisdiction | Delaware, USA | Delaware, USA | ✔ |
| Impact Area | Education | Education | ✔ |

## 77. Donor-Advised Funds — “QA Donor-Advised Funds Fund”

Asset ID: `19764d44-d794-41c9-83a0-eaa654e38437`

| Field | Original (created) | Updated (after edit) | Visible in View Details |
|---|---|---|---|
| Asset Name | QA Donor-Advised Funds Fund | QA Donor-Advised Funds Fund | ✔ |
| Category | Donor-Advised Funds | Donor-Advised Funds | ✔ |
| Estimated Value | $870,000 | $957,000 ⭑ | ✔ |
| Current Value | $870,000 | $957,000 ⭑ | ✔ |
| Currency | USD | USD | n/a |
| Valuation Type | manual | manual | n/a |
| Fund/Vehicle Name | QA Donor-Advised Funds Fund | QA Donor-Advised Funds Fund | ✔ |
| Type | Donor-Advised Fund | Donor-Advised Fund | ✔ |
| Purpose | QA purpose text for Donor-Advised Funds. | QA purpose text for Donor-Advised Funds. | ✔ |
| Start Date | 2025-06-01 | 2025-06-01 | ✔ |
| Contribution Value | $870,000 | $957,000 ⭑ | ✔ |
| Institution | Charitable Inst 77 | Charitable Inst 77 EDITED ⭑ | ✔ |
| Jurisdiction | Delaware, USA | Delaware, USA | ✔ |
| Impact Area | Education | Education | ✔ |

## 78. Endowments — “QA Endowments Fund”

Asset ID: `9fb71643-d3fd-4dc4-85e6-d35fd7f74366`

| Field | Original (created) | Updated (after edit) | Visible in View Details |
|---|---|---|---|
| Asset Name | QA Endowments Fund | QA Endowments Fund | ✔ |
| Category | Endowments | Endowments | ✔ |
| Estimated Value | $880,000 | $968,000 ⭑ | ✔ |
| Current Value | $880,000 | $968,000 ⭑ | ✔ |
| Currency | USD | USD | n/a |
| Valuation Type | manual | manual | n/a |
| Fund/Vehicle Name | QA Endowments Fund | QA Endowments Fund | ✔ |
| Type | Endowment | Endowment | ✔ |
| Purpose | QA purpose text for Endowments. | QA purpose text for Endowments. | ✔ |
| Start Date | 2025-06-01 | 2025-06-01 | ✔ |
| Contribution Value | $880,000 | $968,000 ⭑ | ✔ |
| Institution | Charitable Inst 78 | Charitable Inst 78 EDITED ⭑ | ✔ |
| Jurisdiction | Delaware, USA | Delaware, USA | ✔ |
| Impact Area | Education | Education | ✔ |

## 79. Impact Investments — “QA Impact Investments Fund”

Asset ID: `72a1fa97-4022-4d61-b092-97d46c6ae066`

| Field | Original (created) | Updated (after edit) | Visible in View Details |
|---|---|---|---|
| Asset Name | QA Impact Investments Fund | QA Impact Investments Fund | ✔ |
| Category | Impact Investments | Impact Investments | ✔ |
| Estimated Value | $890,000 | $979,000 ⭑ | ✔ |
| Current Value | $890,000 | $979,000 ⭑ | ✔ |
| Currency | USD | USD | n/a |
| Valuation Type | manual | manual | n/a |
| Fund/Vehicle Name | QA Impact Investments Fund | QA Impact Investments Fund | ✔ |
| Type | Impact Investment | Impact Investment | ✔ |
| Purpose | QA purpose text for Impact Investments. | QA purpose text for Impact Investments. | ✔ |
| Start Date | 2025-06-01 | 2025-06-01 | ✔ |
| Contribution Value | $890,000 | $979,000 ⭑ | ✔ |
| Institution | Charitable Inst 79 | Charitable Inst 79 EDITED ⭑ | ✔ |
| Jurisdiction | Delaware, USA | Delaware, USA | ✔ |
| Impact Area | Education | Education | ✔ |

## 80. Scholarship Trusts — “QA Scholarship Trusts Fund”

Asset ID: `16c0ce30-fa9f-484a-a6b1-84e0af9941f0`

| Field | Original (created) | Updated (after edit) | Visible in View Details |
|---|---|---|---|
| Asset Name | QA Scholarship Trusts Fund | QA Scholarship Trusts Fund | ✔ |
| Category | Scholarship Trusts | Scholarship Trusts | ✔ |
| Estimated Value | $900,000 | $990,000 ⭑ | ✔ |
| Current Value | $900,000 | $990,000 ⭑ | ✔ |
| Currency | USD | USD | n/a |
| Valuation Type | manual | manual | n/a |
| Fund/Vehicle Name | QA Scholarship Trusts Fund | QA Scholarship Trusts Fund | ✔ |
| Type | Scholarship Trust | Scholarship Trust | ✔ |
| Purpose | QA purpose text for Scholarship Trusts. | QA purpose text for Scholarship Trusts. | ✔ |
| Start Date | 2025-06-01 | 2025-06-01 | ✔ |
| Contribution Value | $900,000 | $990,000 ⭑ | ✔ |
| Institution | Charitable Inst 80 | Charitable Inst 80 EDITED ⭑ | ✔ |
| Jurisdiction | Delaware, USA | Delaware, USA | ✔ |
| Impact Area | Education | Education | ✔ |

---

# Category group: Lifestyle

## 81. Travel Concierge — “Travel Concierge”

Asset ID: `5ecc36b8-13f4-43eb-8215-644e55dca48b`

| Field | Original (created) | Updated (after edit) | Visible in View Details |
|---|---|---|---|
| Asset Name | Travel Concierge | Travel Concierge | ✔ |
| Category | Travel Concierge | Travel Concierge | ✔ |
| Location | Service City 81 | Service City 81 EDITED ⭑ | ✔ |
| Estimated Value | $910,000 | $1,001,000 ⭑ | ✔ |
| Current Value | $910,000 | $1,001,000 ⭑ | ✔ |
| Currency | USD | USD | n/a |
| Valuation Type | manual | manual | n/a |
| Service Type | Travel Concierge | Travel Concierge | ✔ |
| Vendor Name | Vendor 81 Ltd | Vendor 81 Ltd EDITED ⭑ | ✔ |
| Membership/Service ID | MEM-00081 | MEM-00081 | ✔ |
| Start Date | 2026-01-01 | 2026-01-01 | ✔ |
| End Date | 2027-01-01 | 2027-01-01 | ✔ |
| Associated Asset | QA Yachts Asset | QA Yachts Asset | ✔ |
| Annual Cost | $910,000 | $1,001,000 ⭑ | ✔ |

## 82. Event & Auction Access — “Event & Auction Access”

Asset ID: `d624429b-f502-459c-94fc-fb729d93014c`

| Field | Original (created) | Updated (after edit) | Visible in View Details |
|---|---|---|---|
| Asset Name | Event & Auction Access | Event & Auction Access | ✔ |
| Category | Event & Auction Access | Event & Auction Access | ✔ |
| Location | Service City 82 | Service City 82 EDITED ⭑ | ✔ |
| Estimated Value | $920,000 | $1,012,000 ⭑ | ✔ |
| Current Value | $920,000 | $1,012,000 ⭑ | ✔ |
| Currency | USD | USD | n/a |
| Valuation Type | manual | manual | n/a |
| Service Type | Event & Auction Access | Event & Auction Access | ✔ |
| Vendor Name | Vendor 82 Ltd | Vendor 82 Ltd EDITED ⭑ | ✔ |
| Membership/Service ID | MEM-00082 | MEM-00082 | ✔ |
| Start Date | 2026-01-01 | 2026-01-01 | ✔ |
| End Date | 2027-01-01 | 2027-01-01 | ✔ |
| Associated Asset | QA Yachts Asset | QA Yachts Asset | ✔ |
| Annual Cost | $920,000 | $1,012,000 ⭑ | ✔ |

## 83. Club Memberships — “Club Membership”

Asset ID: `fdd6e42d-31fd-4166-896c-f06138fdceeb`

| Field | Original (created) | Updated (after edit) | Visible in View Details |
|---|---|---|---|
| Asset Name | Club Membership | Club Membership | ✔ |
| Category | Club Memberships | Club Memberships | ✔ |
| Location | Service City 83 | Service City 83 EDITED ⭑ | ✔ |
| Estimated Value | $930,000 | $1,023,000 ⭑ | ✔ |
| Current Value | $930,000 | $1,023,000 ⭑ | ✔ |
| Currency | USD | USD | n/a |
| Valuation Type | manual | manual | n/a |
| Service Type | Club Membership | Club Membership | ✔ |
| Vendor Name | Vendor 83 Ltd | Vendor 83 Ltd EDITED ⭑ | ✔ |
| Membership/Service ID | MEM-00083 | MEM-00083 | ✔ |
| Start Date | 2026-01-01 | 2026-01-01 | ✔ |
| End Date | 2027-01-01 | 2027-01-01 | ✔ |
| Associated Asset | QA Yachts Asset | QA Yachts Asset | ✔ |
| Annual Cost | $930,000 | $1,023,000 ⭑ | ✔ |

## 84. Property Maintenance — “Property Maintenance”

Asset ID: `be4b865b-ed52-4067-ba02-bc68670956c6`

| Field | Original (created) | Updated (after edit) | Visible in View Details |
|---|---|---|---|
| Asset Name | Property Maintenance | Property Maintenance | ✔ |
| Category | Property Maintenance | Property Maintenance | ✔ |
| Location | Service City 84 | Service City 84 EDITED ⭑ | ✔ |
| Estimated Value | $940,000 | $1,034,000 ⭑ | ✔ |
| Current Value | $940,000 | $1,034,000 ⭑ | ✔ |
| Currency | USD | USD | n/a |
| Valuation Type | manual | manual | n/a |
| Service Type | Property Maintenance | Property Maintenance | ✔ |
| Vendor Name | Vendor 84 Ltd | Vendor 84 Ltd EDITED ⭑ | ✔ |
| Membership/Service ID | MEM-00084 | MEM-00084 | ✔ |
| Start Date | 2026-01-01 | 2026-01-01 | ✔ |
| End Date | 2027-01-01 | 2027-01-01 | ✔ |
| Associated Asset | QA Yachts Asset | QA Yachts Asset | ✔ |
| Annual Cost | $940,000 | $1,034,000 ⭑ | ✔ |

## 85. Insurance Management — “Insurance Management”

Asset ID: `55395d09-a385-4ec7-970e-934ef1f30e41`

| Field | Original (created) | Updated (after edit) | Visible in View Details |
|---|---|---|---|
| Asset Name | Insurance Management | Insurance Management | ✔ |
| Category | Insurance Management | Insurance Management | ✔ |
| Location | Service City 85 | Service City 85 EDITED ⭑ | ✔ |
| Estimated Value | $950,000 | $1,045,000 ⭑ | ✔ |
| Current Value | $950,000 | $1,045,000 ⭑ | ✔ |
| Currency | USD | USD | n/a |
| Valuation Type | manual | manual | n/a |
| Service Type | Insurance Management | Insurance Management | ✔ |
| Vendor Name | Vendor 85 Ltd | Vendor 85 Ltd EDITED ⭑ | ✔ |
| Membership/Service ID | MEM-00085 | MEM-00085 | ✔ |
| Start Date | 2026-01-01 | 2026-01-01 | ✔ |
| End Date | 2027-01-01 | 2027-01-01 | ✔ |
| Associated Asset | QA Yachts Asset | QA Yachts Asset | ✔ |
| Annual Cost | $950,000 | $1,045,000 ⭑ | ✔ |

## 86. Family Office Services — “Family Office Services”

Asset ID: `1a9bc8b7-e223-4f7f-bf37-654f03ee45ee`

| Field | Original (created) | Updated (after edit) | Visible in View Details |
|---|---|---|---|
| Asset Name | Family Office Services | Family Office Services | ✔ |
| Category | Family Office Services | Family Office Services | ✔ |
| Location | Service City 86 | Service City 86 EDITED ⭑ | ✔ |
| Estimated Value | $960,000 | $1,056,000 ⭑ | ✔ |
| Current Value | $960,000 | $1,056,000 ⭑ | ✔ |
| Currency | USD | USD | n/a |
| Valuation Type | manual | manual | n/a |
| Service Type | Family Office Services | Family Office Services | ✔ |
| Vendor Name | Vendor 86 Ltd | Vendor 86 Ltd EDITED ⭑ | ✔ |
| Membership/Service ID | MEM-00086 | MEM-00086 | ✔ |
| Start Date | 2026-01-01 | 2026-01-01 | ✔ |
| End Date | 2027-01-01 | 2027-01-01 | ✔ |
| Associated Asset | QA Yachts Asset | QA Yachts Asset | ✔ |
| Annual Cost | $960,000 | $1,056,000 ⭑ | ✔ |

---

# Category group: Governance

## 87. KYC & AML Records — “QA KYC & AML Records Record”

Asset ID: `dbf10215-8e8e-4e95-90ad-6e0c8faf33c7`

| Field | Original (created) | Updated (after edit) | Visible in View Details |
|---|---|---|---|
| Asset Name | QA KYC & AML Records Record | QA KYC & AML Records Record | ✔ |
| Category | KYC & AML Records | KYC & AML Records | ✔ |
| Currency | USD | USD | n/a |
| Valuation Type | manual | manual | n/a |
| Record Type | KYC | KYC | ✔ |
| Document Name | QA KYC & AML Records Record | QA KYC & AML Records Record | ✔ |
| Related Asset/User | Advisor Test | Advisor Test | ✔ |
| Upload Date | 2026-07-18 | 2026-07-18 | ✔ |
| Expiry Date | 2028-07-18 | 2028-07-18 | ✔ |
| Verified By | QA Compliance | QA Compliance EDITED ⭑ | ✔ |
| Notes | QA note for KYC & AML Records. | QA note for KYC & AML Records. | ✔ |

## 88. Audit Logs — “QA Audit Logs Record”

Asset ID: `bce1efa8-ba2e-4b51-9958-2ec17d2f7e74`

| Field | Original (created) | Updated (after edit) | Visible in View Details |
|---|---|---|---|
| Asset Name | QA Audit Logs Record | QA Audit Logs Record | ✔ |
| Category | Audit Logs | Audit Logs | ✔ |
| Currency | USD | USD | n/a |
| Valuation Type | manual | manual | n/a |
| Record Type | Audit | Audit | ✔ |
| Document Name | QA Audit Logs Record | QA Audit Logs Record | ✔ |
| Related Asset/User | Advisor Test | Advisor Test | ✔ |
| Upload Date | 2026-07-18 | 2026-07-18 | ✔ |
| Expiry Date | 2028-07-18 | 2028-07-18 | ✔ |
| Verified By | QA Compliance | QA Compliance EDITED ⭑ | ✔ |
| Notes | QA note for Audit Logs. | QA note for Audit Logs. | ✔ |

## 89. Legal Agreements — “QA Legal Agreements Record”

Asset ID: `1945b8a0-9e36-4076-a761-866d3fb92133`

| Field | Original (created) | Updated (after edit) | Visible in View Details |
|---|---|---|---|
| Asset Name | QA Legal Agreements Record | QA Legal Agreements Record | ✔ |
| Category | Legal Agreements | Legal Agreements | ✔ |
| Currency | USD | USD | n/a |
| Valuation Type | manual | manual | n/a |
| Record Type | Legal | Legal | ✔ |
| Document Name | QA Legal Agreements Record | QA Legal Agreements Record | ✔ |
| Related Asset/User | Advisor Test | Advisor Test | ✔ |
| Upload Date | 2026-07-18 | 2026-07-18 | ✔ |
| Expiry Date | 2028-07-18 | 2028-07-18 | ✔ |
| Verified By | QA Compliance | QA Compliance EDITED ⭑ | ✔ |
| Notes | QA note for Legal Agreements. | QA note for Legal Agreements. | ✔ |

## 90. Regulatory Filings — “QA Regulatory Filings Record”

Asset ID: `07ea36a3-6cfb-4c3c-b79e-cfaea1d512b7`

| Field | Original (created) | Updated (after edit) | Visible in View Details |
|---|---|---|---|
| Asset Name | QA Regulatory Filings Record | QA Regulatory Filings Record | ✔ |
| Category | Regulatory Filings | Regulatory Filings | ✔ |
| Currency | USD | USD | n/a |
| Valuation Type | manual | manual | n/a |
| Record Type | Regulatory Filing | Regulatory Filing | ✔ |
| Document Name | QA Regulatory Filings Record | QA Regulatory Filings Record | ✔ |
| Related Asset/User | Advisor Test | Advisor Test | ✔ |
| Upload Date | 2026-07-18 | 2026-07-18 | ✔ |
| Expiry Date | 2028-07-18 | 2028-07-18 | ✔ |
| Verified By | QA Compliance | QA Compliance EDITED ⭑ | ✔ |
| Notes | QA note for Regulatory Filings. | QA note for Regulatory Filings. | ✔ |


---

⭑ = value deliberately changed by the edit test.

## How to reproduce

1. Log in as `investor.test.qa@akunuba-test.com`.
2. Open **Dashboard → Assets** — 90 assets across 5 pages (20 per page).
3. Open any asset's **View Details** — every field above is shown in the
   "Asset Details" card, the valuation panel, or the header.
