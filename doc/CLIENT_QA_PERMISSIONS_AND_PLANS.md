# Client Q&A — Permissions, Settings & Subscription Plans

> Status: **Awaiting client reply.**
> Context: Client requested that **admins be able to grant/manage permissions for advisors**.
> This doc holds (1) our message/questions to the client, and (2) space for the client's
> answers. Fill in the **Client reply** lines as answers come back, then we turn the
> decisions into a spec + implementation.

---

## Part 1 — Our message to the client

### A. The core model — what does "admin gives permissions to advisor" mean?

1. **Per-role or per-user?** Should admin change permissions for all advisors at once
   (edit the "advisor" role), or grant/revoke permissions for one specific advisor
   (e.g. give advisor Jane `approve:listings` but not others)?
   - *Why:* Per-role is much simpler (toggle a shared template). Per-user means we store
     overrides per account and merge them at request time — more flexible, more work.
   - *Recommended:* start per-role; add per-user overrides later if needed.
   - **Client reply:**

2. **Custom roles?** Does admin only toggle permissions on the three existing roles
   (admin/investor/advisor), or do they need to create entirely new roles
   (e.g. "Senior Advisor", "Support Agent")?
   - *Why:* Custom roles = a roles table + management UI, a bigger feature.
   - *Recommended:* no custom roles for v1 — just configurable permissions on existing roles.
   - **Client reply:**

3. **Can an advisor be granted admin-only powers?** Should admin be able to hand an
   advisor currently admin-only capabilities — `manage:users`, `write:assets`,
   `create:listings`, `approve:listings`, `manage:marketplace`, `manage:subscriptions`?
   Or is there a locked set that can never be given to a non-admin?
   - *Why:* Some of these are dangerous (user management, subscription/billing). We need a
     "never grantable" list.
   - **Client reply:**

4. **Can admin reduce/revoke too, or only grant?** "Give permissions" implies adding —
   but should admin also be able to remove default advisor permissions
   (e.g. take away `view:analytics`)?
   - **Client reply:**

### B. Granularity — do the coarse gates need splitting?

5. **Support permissions:** Today `manage:support` is a single gate covering reply,
   internal notes, change status, assign tickets, and view-all-tickets. The frontend
   originally assumed these were separate (`reply:tickets`, `post:internal_notes`,
   `update:ticket_status`, `view:all_tickets`). Split into individual toggles, or keep one
   support gate?
   - *Why:* Splitting means new permissions + re-gating ~14 support endpoints. Significant
     work, only worth it if they actually want that granularity.
   - **Client reply:**

6. **Any other capability to split** for finer admin control
   (e.g. read vs. write analytics, KYC view vs. approve)?
   - **Client reply:**

### C. Scoping — the most important unresolved question

7. **When an advisor is granted `write:portfolio` or trade, whose accounts can they act on?**
   Today these are ownership-scoped to the advisor's own account only — an advisor cannot
   touch a client's portfolio or trade for them; there's no mechanism to even address
   another account. If the client wants advisors to manage client portfolios, that is a
   major change (new scoping logic on every write/trade endpoint), not a permission toggle.
   - *Why:* This determines whether this is a small permissions feature or a large
     delegated-access feature.
   - **Client reply:**

8. **`read:users` / `view:analytics` scope:** When granted, should an advisor see all
   users / platform-wide analytics, or only their assigned clients / their own book?
   (Today: all users, own-account analytics only.)
   - **Client reply:**

9. **`/crm/users` scope:** Should it return all users, or only the calling advisor's
   clients? (Today: returns the staff roster, platform-wide.)
   - **Client reply:**

### D. Advisor↔client relationship (prerequisite for any "client-scoped" answer above)

10. **Do advisors get assigned a set of clients?** There is currently no advisor↔client
    model in the system (no table, no link). If any of C7–C9 should be "their clients
    only," we first need to build this relationship. Does the client want it?
    - **Client reply:**

11. **If yes:** Who assigns clients to an advisor — admin only, or self-service? One
    advisor per client, or many? Do we need a "my clients" view/endpoint?
    - **Client reply:**

### E. Storage, security & audit

12. **Audit trail:** When admin changes permissions, do we need to record who changed
    what, when (compliance/accountability)? *Recommended: yes.*
    - **Client reply:**

13. **Guardrails:** Can an admin accidentally remove all admins / lock themselves out?
    Should there always be at least one admin? Can admin edit their own permissions?
    - **Client reply:**

14. **Effective immediately?** When admin changes a permission, should it apply on the
    user's next request, or only after they re-login? (Affects whether we read permissions
    live from DB vs. bake them into the login token.) *Recommended: live from DB.*
    - **Client reply:**

### F. UI / settings surface

15. **Where does admin manage this?** A dedicated "Roles & Permissions" settings screen?
    A toggle matrix (roles × permissions)? Per-user editor on the user detail page?
    - **Client reply:**

16. **Should the frontend show advisors a read-only view of their own permissions** (so
    they understand what they can/can't do), separate from the admin editor?
    - **Client reply:**

### G. Defaults, migration & enforcement

17. **Default advisor permission set:** Keep today's set (`read:users`, `read:assets`,
    `read:portfolio`, `write:portfolio`, trade, `view:analytics`, `manage:support`) as the
    starting template, or a different default?
    - **Client reply:**

18. **Existing advisors on launch:** Inherit the current defaults, or start from zero until
    admin configures them?
    - **Client reply:**

19. **Enforcement consistency (FYI — may need a decision):** Today enforcement is
    inconsistent — some actions return 403 when denied, list endpoints return
    filtered/empty results instead, and a few permissions (`write:portfolio`, trade,
    `view:analytics`) aren't actually checked at all (ownership does the work). If
    permissions become admin-configurable, should we standardize enforcement so a toggle
    reliably means something everywhere? *Recommended: yes.*
    - **Client reply:**

### H. Additional permission/settings questions

20. **Permission dependencies.** Some permissions are meaningless/dangerous in isolation
    (e.g. `approve:listings` without `read:assets`). Should the admin UI enforce
    dependencies (auto-enable prerequisites / block invalid combos), or allow any
    combination?
    - **Client reply:**

21. **Sensitive-permission safeguard.** For the dangerous set (user management, billing,
    approvals), should granting them require a second admin's approval / a confirmation
    step — or no special gate?
    - **Client reply:**

22. **Bulk apply** (only if per-user in Q1). Can an admin apply a permission change to
    multiple advisors at once, or one at a time only?
    - **Client reply:**

23. **Notify the advisor.** When their permissions change, should the advisor get a
    notification?
    - **Client reply:**

24. **Empty-section behavior.** If removing permissions leaves a sidebar section with zero
    items, hide the whole section? *(Default: yes.)*
    - **Client reply:**

25. **Mid-session revocation.** If a permission is revoked while the advisor is actively on
    that screen, what should they see — immediate lockout/redirect, or takes effect on next
    navigation?
    - **Client reply:**

### I. Feature definitions — please explain how you want these to work

26. **Escrow Disputes.** Walk us through your intended flow: when funds are held vs.
    released, what counts as a dispute, who can raise one, and how an admin resolves it
    (release to seller / refund buyer / other). Any rules or timelines to enforce?
    - **Client reply:**

27. **Entity Structure.** What should this do? Which entity types matter (trusts, LLCs,
    holding companies, foundations…), what hierarchy/relationships, what people/roles, and
    what compliance or documents should attach to an entity?
    - **Client reply:**

28. **Compliance.** What's the intended scope? Which obligations are tracked (KYC/AML,
    audits, policies…), how is the compliance score calculated, who acts on tasks/alerts,
    and what reports do you need?
    - **Client reply:**

---

## Part 2 — Subscription plans / feature gating

We've locked in the three subscription packages and wired up payment:

- **Starter** — $49/mo (or $470/yr, ~20% off)
- **Pro** — $299/mo (or $2,870/yr)
- **Premium** — $899/mo (or $8,630/yr)

Monthly and annual billing on all three. No free tier, no Concierge/custom package, no
trials or discount codes — per your direction.

To finish feature-gating, we need limits and feature entitlements per plan. For
Starter / Pro / Premium please tell us:

1. Max accounts a user can connect/create per plan.
   - **Client reply:**
2. Max assets per plan.
   - **Client reply:**
3. Document storage / document count limits, if any.
   - **Client reply:**
4. Any other usage caps (e.g. trades, marketplace listings, AI appraisals per month).
   - **Client reply:**
5. Which features are included in each tier (e.g. automated rebalancing, AI insights,
   document center, priority support).
   - **Client reply:**

### Additional plan questions

6. **Overage behavior:** when a user hits a cap (e.g. max assets), do we block, warn, or
   auto-charge for extra?
   - **Client reply:**
7. **Downgrade handling:** if someone on Pro drops to Starter but already exceeds Starter's
   limits, what happens to the excess (locked/read-only, forced removal, grandfathered)?
   - **Client reply:**
8. **Who pays / seat model:** do advisor and admin accounts consume a subscription, or is
   billing investor-only? Per-user or per-account?
   - **Client reply:**
9. **Proration:** on mid-cycle upgrade/downgrade, do we prorate or charge full next cycle?
   - **Client reply:**

---

## Decisions log (fill once answered)

| # | Question | Decision | Date |
|---|----------|----------|------|
|   |          |          |      |
