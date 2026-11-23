-- Generated from insurance.ttl by derive_semantic_view.py. Do not edit by hand.
CREATE OR REPLACE SEMANTIC VIEW analytics.gold.portfolio_pulse
  TABLES (
    month AS analytics.gold.dim_month PRIMARY KEY (month_key) COMMENT = 'A month on the reporting calendar.',
    claim AS analytics.gold.fct_claims PRIMARY KEY (claim_id) COMMENT = 'A request for payment under a policy. Only settled claims count towards claims paid.',
    policy AS analytics.gold.dim_policy PRIMARY KEY (policy_id) COMMENT = 'An insurance contract sold to a customer.',
    premium AS analytics.gold.fct_premium_earned PRIMARY KEY (premium_earning_id) COMMENT = 'The part of a policy''s premium earned in one month, spread evenly across the days it is in force.',
    product AS analytics.gold.dim_product PRIMARY KEY (product_id) WITH SYNONYMS = ('LOB', 'line of business') COMMENT = 'The line of business a policy belongs to: Auto, Home, Health or Life.',
    risk_zone AS analytics.gold.dim_risk_zone PRIMARY KEY (risk_zone_id) WITH SYNONYMS = ('risk band', 'territory') COMMENT = 'Underwriting risk band for where a policy is located: High, Medium or Low.'
  )
  RELATIONSHIPS (
    policy_covers_product AS policy (product_id) REFERENCES product,
    premium_earned_for AS premium (policy_id) REFERENCES policy,
    premium_earned_in_month AS premium (month_key) REFERENCES month,
    policy_located_in AS policy (risk_zone_id) REFERENCES risk_zone,
    claim_made_under AS claim (policy_id) REFERENCES policy,
    claim_settled_in_month AS claim (settled_month_key) REFERENCES month
  )
  FACTS (
    premium.premium_earned_eur AS premium_earned_eur,
    claim.settlement_amount_eur AS settlement_amount_eur COMMENT = 'Standardised to euros in staging.'
  )
  DIMENSIONS (
    claim.claim_status AS claim_status COMMENT = 'open, settled or declined.',
    month.month_start AS month_start WITH SYNONYMS = ('period', 'reporting month') COMMENT = 'First day of the month.',
    policy.inception_date AS inception_date WITH SYNONYMS = ('start date'),
    product.product_name AS product_name WITH SYNONYMS = ('line', 'product'),
    risk_zone.zone_name AS zone_name WITH SYNONYMS = ('risk zone', 'zone')
  )
  METRICS (
    claim.claim_count AS COUNT(DISTINCT CASE WHEN claim.claim_status = 'settled' THEN claim.claim_id END) WITH SYNONYMS = ('number of claims') COMMENT = 'Distinct claims settled in the period.',
    claim.claims_paid AS SUM(CASE WHEN claim.claim_status = 'settled' THEN claim.settlement_amount_eur END) WITH SYNONYMS = ('paid claims', 'paid losses') COMMENT = 'Settlement amounts of settled claims, dated by settlement month. Open reserves are excluded.',
    premium.earned_premium AS SUM(premium.premium_earned_eur) COMMENT = 'Premium earned in the period, summed.',
    loss_ratio AS claim.claims_paid / NULLIF(premium.earned_premium, 0) WITH SYNONYMS = ('LR', 'claims ratio') COMMENT = 'Claims paid divided by earned premium, as a ratio of sums for any slice. Target 70%.'
  )
  COMMENT = 'Premium, claims and loss ratio by product, risk zone and month.';
