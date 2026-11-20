/**
 * أنواع البيانات — نستخدم JSDoc لأننا في JS
 * @typedef {Object} Referee
 * @property {string} id
 * @property {string} full_name
 * @property {string} region
 * @property {string} birth_date
 * @property {'1st'|'2nd'|'3rd'|'International'|'New'} degree
 * @property {'referee'|'assistant'|'both'} job
 * @property {string} phone
 * @property {string} address
 * @property {boolean} has_var_license
 * @property {boolean} has_avar_license
 * @property {boolean} is_suspended
 * @property {string|null} suspension_reason
 * @property {string|null} suspension_until
 * @property {string} created_at
 */

/**
 * @typedef {Object} Competition
 * @property {string} id
 * @property {string} name
 * @property {string} age_category
 * @property {'federation'|'club'} payout_source
 * @property {number} match_fee
 */

/**
 * @typedef {Object} Match
 * @property {string} id
 * @property {string} competition_id
 * @property {string} home_team_id
 * @property {string} away_team_id
 * @property {string} stadium
 * @property {string} match_date
 * @property {string} match_time
 * @property {string|null} main_referee_id
 * @property {string|null} assistant1_referee_id
 * @property {string|null} assistant2_referee_id
 * @property {string|null} fourth_referee_id
 * @property {string|null} var_referee_id
 * @property {string|null} avar_referee_id
 * @property {string|null} supervisor_id
 * @property {boolean} is_notified
 * @property {boolean} is_paid
 * @property {boolean} main_referee_notified
 * @property {boolean} assistant1_notified
 * @property {boolean} assistant2_notified
 * @property {boolean} fourth_referee_notified
 * @property {boolean} var_referee_notified
 * @property {boolean} avar_referee_notified
 * @property {boolean} has_conflict
 * @property {string|null} conflict_details
 * @property {string|null} notes
 */

export const ROLES = {
  ADMIN: 'admin',
  EDITOR: 'editor',
  VIEWER: 'viewer',
}