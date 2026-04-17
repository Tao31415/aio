# Better Auth Error Codes Reference

> 更新时间：2026-04-16

这份文档基于 Better Auth 官网公开文档、Better Auth MCP 返回内容，以及 Better Auth 官方仓库 `main` 分支源码整理。

## 范围说明

- 官网没有一页完整列出“所有内部 error code + 默认 message”。
- 官网 `Errors` 参考页主要覆盖会跳转到 `/api/auth/error` 的 redirect 类错误。
- 更完整的 typed error code 需要回到官方仓库中各个包和插件的 `defineErrorCodes(...)` 定义里汇总。
- 本文保留源码中的英文 `message` 原文，方便你直接用于 i18n、映射表或前端提示。

## 统计

- 官网公开的 redirect 错误页：`17` 个
- `state_mismatch` 页面额外覆盖的 state 子错误：`6` 个视图条目
- 源码中通过 `defineErrorCodes(...)` 定义的 typed error：`270` 条定义
- 按 code 名称去重后：`255` 个唯一 code
- 重复出现的 code 名称：`14` 个

## 官网公开的 Redirect Error

来源：<https://better-auth.com/docs/reference/errors>

| Code | 官网描述 | 详情页 |
| --- | --- | --- |
| `account_already_linked_to_different_user` | The account is already linked to a different user. | [link](https://better-auth.com/docs/reference/errors/account_already_linked_to_different_user) |
| `account_not_linked` | The provider account is not linked to the current user and cannot be linked automatically. | [link](https://better-auth.com/docs/reference/errors/account_not_linked) |
| `email_doesn't_match` | The email doesn't match the email of the account. | [link](https://better-auth.com/docs/reference/errors/email_doesn't_match) |
| `email_not_found` | The provider did not return an email address. | [link](https://better-auth.com/docs/reference/errors/email_not_found) |
| `internal_server_error` | An unexpected error occurred during authentication. | [link](https://better-auth.com/docs/reference/errors/internal_server_error) |
| `invalid_callback_request` | The callback request is invalid. | [link](https://better-auth.com/docs/reference/errors/invalid_callback_request) |
| `invalid_code` | The provided authentication code is invalid or expired. | [link](https://better-auth.com/docs/reference/errors/invalid_code) |
| `no_callback_url` | The callback URL was not found in the request. | [link](https://better-auth.com/docs/reference/errors/no_callback_url) |
| `no_code` | The code was not found in the request. | [link](https://better-auth.com/docs/reference/errors/no_code) |
| `oauth_provider_not_found` | The OAuth provider was not found. | [link](https://better-auth.com/docs/reference/errors/oauth_provider_not_found) |
| `signup_disabled` | Signup disabled error | [link](https://better-auth.com/docs/reference/errors/signup_disabled) |
| `state_mismatch` | State verification failed during the OAuth callback. Covers all state-related error codes and their causes. | [link](https://better-auth.com/docs/reference/errors/state_mismatch) |
| `state_not_found` | The state parameter was not found in the request. | [link](https://better-auth.com/docs/reference/errors/state_not_found) |
| `unable_to_create_session` | The session could not be created during authentication. | [link](https://better-auth.com/docs/reference/errors/unable_to_create_session) |
| `unable_to_create_user` | The user could not be created during authentication. | [link](https://better-auth.com/docs/reference/errors/unable_to_create_user) |
| `unable_to_get_user_info` | The user info was not found in the request. | [link](https://better-auth.com/docs/reference/errors/unable_to_get_user_info) |
| `unable_to_link_account` | The account could not be linked. | [link](https://better-auth.com/docs/reference/errors/unable_to_link_account) |

### `state_mismatch` 页面里的 State 相关子错误

来源：<https://better-auth.com/docs/reference/errors/state_mismatch>

| Code | Message | Strategy | Meaning |
| --- | --- | --- | --- |
| `state_mismatch` | verification not found | `Database` | The verification record for this state does not exist in the database or secondary storage. |
| `state_mismatch` | auth state cookie not found | `Cookie` | The encrypted state cookie was not sent back with the callback request. |
| `state_mismatch` | request expired | `Both` | The state data was found but its expiresAt timestamp is already in the past. |
| `state_invalid` | Failed to decrypt or parse auth state | `Cookie` | The state cookie exists but cannot be decrypted or parsed, for example after a secret change. |
| `state_security_mismatch` | State not persisted correctly | `Database` | The signed state cookie is missing or does not match the state returned in the callback URL. |
| `state_generation_error` | Unable to create verification | `Database` | Better Auth could not write the verification record when starting the flow. |

### 未在 Errors 列表中展示，但官网存在的兜底页

- `unknown`: 官网有单独页面，但该页明确注明不会出现在错误索引里，用作未知错误的 fallback 页。

## 源码中的 Typed Error Codes

这些 code 来自官方仓库各包/插件中的 `defineErrorCodes(...)`。同名 code 可能在多个模块重复定义，也可能 message 不完全一致。

### Core Base Errors

- Source: `packages/core/src/error/codes.ts`
- GitHub: <https://github.com/better-auth/better-auth/blob/main/packages/core/src/error/codes.ts>
- Count: `48`

| Code | Message |
| --- | --- |
| `USER_NOT_FOUND` | User not found |
| `FAILED_TO_CREATE_USER` | Failed to create user |
| `FAILED_TO_CREATE_SESSION` | Failed to create session |
| `FAILED_TO_UPDATE_USER` | Failed to update user |
| `FAILED_TO_GET_SESSION` | Failed to get session |
| `INVALID_PASSWORD` | Invalid password |
| `INVALID_EMAIL` | Invalid email |
| `INVALID_EMAIL_OR_PASSWORD` | Invalid email or password |
| `INVALID_USER` | Invalid user |
| `SOCIAL_ACCOUNT_ALREADY_LINKED` | Social account already linked |
| `PROVIDER_NOT_FOUND` | Provider not found |
| `INVALID_TOKEN` | Invalid token |
| `TOKEN_EXPIRED` | Token expired |
| `ID_TOKEN_NOT_SUPPORTED` | id_token not supported |
| `FAILED_TO_GET_USER_INFO` | Failed to get user info |
| `USER_EMAIL_NOT_FOUND` | User email not found |
| `EMAIL_NOT_VERIFIED` | Email not verified |
| `PASSWORD_TOO_SHORT` | Password too short |
| `PASSWORD_TOO_LONG` | Password too long |
| `USER_ALREADY_EXISTS` | User already exists. |
| `USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL` | User already exists. Use another email. |
| `EMAIL_CAN_NOT_BE_UPDATED` | Email can not be updated |
| `CREDENTIAL_ACCOUNT_NOT_FOUND` | Credential account not found |
| `SESSION_EXPIRED` | Session expired. Re-authenticate to perform this action. |
| `FAILED_TO_UNLINK_LAST_ACCOUNT` | You can't unlink your last account |
| `ACCOUNT_NOT_FOUND` | Account not found |
| `USER_ALREADY_HAS_PASSWORD` | User already has a password. Provide that to delete the account. |
| `CROSS_SITE_NAVIGATION_LOGIN_BLOCKED` | Cross-site navigation login blocked. This request appears to be a CSRF attack. |
| `VERIFICATION_EMAIL_NOT_ENABLED` | Verification email isn't enabled |
| `EMAIL_ALREADY_VERIFIED` | Email is already verified |
| `EMAIL_MISMATCH` | Email mismatch |
| `SESSION_NOT_FRESH` | Session is not fresh |
| `LINKED_ACCOUNT_ALREADY_EXISTS` | Linked account already exists |
| `INVALID_ORIGIN` | Invalid origin |
| `INVALID_CALLBACK_URL` | Invalid callbackURL |
| `INVALID_REDIRECT_URL` | Invalid redirectURL |
| `INVALID_ERROR_CALLBACK_URL` | Invalid errorCallbackURL |
| `INVALID_NEW_USER_CALLBACK_URL` | Invalid newUserCallbackURL |
| `MISSING_OR_NULL_ORIGIN` | Missing or null Origin |
| `CALLBACK_URL_REQUIRED` | callbackURL is required |
| `FAILED_TO_CREATE_VERIFICATION` | Unable to create verification |
| `FIELD_NOT_ALLOWED` | Field not allowed to be set |
| `ASYNC_VALIDATION_NOT_SUPPORTED` | Async validation is not supported |
| `VALIDATION_ERROR` | Validation Error |
| `MISSING_FIELD` | Field is required |
| `METHOD_NOT_ALLOWED_DEFER_SESSION_REQUIRED` | POST method requires deferSessionRefresh to be enabled in session config |
| `BODY_MUST_BE_AN_OBJECT` | Body must be an object |
| `PASSWORD_ALREADY_SET` | User already has a password set |

### Admin Plugin

- Source: `packages/better-auth/src/plugins/admin/error-codes.ts`
- GitHub: <https://github.com/better-auth/better-auth/blob/main/packages/better-auth/src/plugins/admin/error-codes.ts>
- Count: `21`

| Code | Message |
| --- | --- |
| `FAILED_TO_CREATE_USER` | Failed to create user |
| `USER_ALREADY_EXISTS` | User already exists. |
| `USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL` | User already exists. Use another email. |
| `YOU_CANNOT_BAN_YOURSELF` | You cannot ban yourself |
| `YOU_ARE_NOT_ALLOWED_TO_CHANGE_USERS_ROLE` | You are not allowed to change users role |
| `YOU_ARE_NOT_ALLOWED_TO_CREATE_USERS` | You are not allowed to create users |
| `YOU_ARE_NOT_ALLOWED_TO_LIST_USERS` | You are not allowed to list users |
| `YOU_ARE_NOT_ALLOWED_TO_LIST_USERS_SESSIONS` | You are not allowed to list users sessions |
| `YOU_ARE_NOT_ALLOWED_TO_BAN_USERS` | You are not allowed to ban users |
| `YOU_ARE_NOT_ALLOWED_TO_IMPERSONATE_USERS` | You are not allowed to impersonate users |
| `YOU_ARE_NOT_ALLOWED_TO_REVOKE_USERS_SESSIONS` | You are not allowed to revoke users sessions |
| `YOU_ARE_NOT_ALLOWED_TO_DELETE_USERS` | You are not allowed to delete users |
| `YOU_ARE_NOT_ALLOWED_TO_SET_USERS_PASSWORD` | You are not allowed to set users password |
| `BANNED_USER` | You have been banned from this application |
| `YOU_ARE_NOT_ALLOWED_TO_GET_USER` | You are not allowed to get user |
| `NO_DATA_TO_UPDATE` | No data to update |
| `YOU_ARE_NOT_ALLOWED_TO_UPDATE_USERS` | You are not allowed to update users |
| `YOU_CANNOT_REMOVE_YOURSELF` | You cannot remove yourself |
| `YOU_ARE_NOT_ALLOWED_TO_SET_NON_EXISTENT_VALUE` | You are not allowed to set a non-existent role value |
| `YOU_CANNOT_IMPERSONATE_ADMINS` | You cannot impersonate admins |
| `INVALID_ROLE_TYPE` | Invalid role type |

### Anonymous Plugin

- Source: `packages/better-auth/src/plugins/anonymous/error-codes.ts`
- GitHub: <https://github.com/better-auth/better-auth/blob/main/packages/better-auth/src/plugins/anonymous/error-codes.ts>
- Count: `7`

| Code | Message |
| --- | --- |
| `INVALID_EMAIL_FORMAT` | Email was not generated in a valid format |
| `FAILED_TO_CREATE_USER` | Failed to create user |
| `COULD_NOT_CREATE_SESSION` | Could not create session |
| `ANONYMOUS_USERS_CANNOT_SIGN_IN_AGAIN_ANONYMOUSLY` | Anonymous users cannot sign in again anonymously |
| `FAILED_TO_DELETE_ANONYMOUS_USER` | Failed to delete anonymous user |
| `USER_IS_NOT_ANONYMOUS` | User is not anonymous |
| `DELETE_ANONYMOUS_USER_DISABLED` | Deleting anonymous users is disabled |

### Captcha Plugin

- Source: `packages/better-auth/src/plugins/captcha/error-codes.ts`
- GitHub: <https://github.com/better-auth/better-auth/blob/main/packages/better-auth/src/plugins/captcha/error-codes.ts>
- Count: `3`

| Code | Message |
| --- | --- |
| `VERIFICATION_FAILED` | Captcha verification failed |
| `MISSING_RESPONSE` | Missing CAPTCHA response |
| `UNKNOWN_ERROR` | Something went wrong |

### Device Authorization Plugin

- Source: `packages/better-auth/src/plugins/device-authorization/error-codes.ts`
- GitHub: <https://github.com/better-auth/better-auth/blob/main/packages/better-auth/src/plugins/device-authorization/error-codes.ts>
- Count: `12`

| Code | Message |
| --- | --- |
| `INVALID_DEVICE_CODE` | Invalid device code |
| `EXPIRED_DEVICE_CODE` | Device code has expired |
| `EXPIRED_USER_CODE` | User code has expired |
| `AUTHORIZATION_PENDING` | Authorization pending |
| `ACCESS_DENIED` | Access denied |
| `INVALID_USER_CODE` | Invalid user code |
| `DEVICE_CODE_ALREADY_PROCESSED` | Device code already processed |
| `POLLING_TOO_FREQUENTLY` | Polling too frequently |
| `USER_NOT_FOUND` | User not found |
| `FAILED_TO_CREATE_SESSION` | Failed to create session |
| `INVALID_DEVICE_CODE_STATUS` | Invalid device code status |
| `AUTHENTICATION_REQUIRED` | Authentication required |

### Email OTP Plugin

- Source: `packages/better-auth/src/plugins/email-otp/error-codes.ts`
- GitHub: <https://github.com/better-auth/better-auth/blob/main/packages/better-auth/src/plugins/email-otp/error-codes.ts>
- Count: `3`

| Code | Message |
| --- | --- |
| `OTP_EXPIRED` | OTP expired |
| `INVALID_OTP` | Invalid OTP |
| `TOO_MANY_ATTEMPTS` | Too many attempts |

### Generic OAuth Plugin

- Source: `packages/better-auth/src/plugins/generic-oauth/error-codes.ts`
- GitHub: <https://github.com/better-auth/better-auth/blob/main/packages/better-auth/src/plugins/generic-oauth/error-codes.ts>
- Count: `8`

| Code | Message |
| --- | --- |
| `INVALID_OAUTH_CONFIGURATION` | Invalid OAuth configuration |
| `TOKEN_URL_NOT_FOUND` | Invalid OAuth configuration. Token URL not found. |
| `PROVIDER_CONFIG_NOT_FOUND` | No config found for provider |
| `PROVIDER_ID_REQUIRED` | Provider ID is required |
| `INVALID_OAUTH_CONFIG` | Invalid OAuth configuration. |
| `SESSION_REQUIRED` | Session is required |
| `ISSUER_MISMATCH` | OAuth issuer mismatch. The authorization server issuer does not match the expected value (RFC 9207). |
| `ISSUER_MISSING` | OAuth issuer parameter missing. The authorization server did not include the required iss parameter (RFC 9207). |

### Multi Session Plugin

- Source: `packages/better-auth/src/plugins/multi-session/error-codes.ts`
- GitHub: <https://github.com/better-auth/better-auth/blob/main/packages/better-auth/src/plugins/multi-session/error-codes.ts>
- Count: `1`

| Code | Message |
| --- | --- |
| `INVALID_SESSION_TOKEN` | Invalid session token |

### Organization Plugin

- Source: `packages/better-auth/src/plugins/organization/error-codes.ts`
- GitHub: <https://github.com/better-auth/better-auth/blob/main/packages/better-auth/src/plugins/organization/error-codes.ts>
- Count: `57`

| Code | Message |
| --- | --- |
| `YOU_ARE_NOT_ALLOWED_TO_CREATE_A_NEW_ORGANIZATION` | You are not allowed to create a new organization |
| `YOU_HAVE_REACHED_THE_MAXIMUM_NUMBER_OF_ORGANIZATIONS` | You have reached the maximum number of organizations |
| `ORGANIZATION_ALREADY_EXISTS` | Organization already exists |
| `ORGANIZATION_SLUG_ALREADY_TAKEN` | Organization slug already taken |
| `ORGANIZATION_NOT_FOUND` | Organization not found |
| `USER_IS_NOT_A_MEMBER_OF_THE_ORGANIZATION` | User is not a member of the organization |
| `YOU_ARE_NOT_ALLOWED_TO_UPDATE_THIS_ORGANIZATION` | You are not allowed to update this organization |
| `YOU_ARE_NOT_ALLOWED_TO_DELETE_THIS_ORGANIZATION` | You are not allowed to delete this organization |
| `NO_ACTIVE_ORGANIZATION` | No active organization |
| `USER_IS_ALREADY_A_MEMBER_OF_THIS_ORGANIZATION` | User is already a member of this organization |
| `MEMBER_NOT_FOUND` | Member not found |
| `ROLE_NOT_FOUND` | Role not found |
| `YOU_ARE_NOT_ALLOWED_TO_CREATE_A_NEW_TEAM` | You are not allowed to create a new team |
| `TEAM_ALREADY_EXISTS` | Team already exists |
| `TEAM_NOT_FOUND` | Team not found |
| `YOU_CANNOT_LEAVE_THE_ORGANIZATION_AS_THE_ONLY_OWNER` | You cannot leave the organization as the only owner |
| `YOU_CANNOT_LEAVE_THE_ORGANIZATION_WITHOUT_AN_OWNER` | You cannot leave the organization without an owner |
| `YOU_ARE_NOT_ALLOWED_TO_DELETE_THIS_MEMBER` | You are not allowed to delete this member |
| `YOU_ARE_NOT_ALLOWED_TO_INVITE_USERS_TO_THIS_ORGANIZATION` | You are not allowed to invite users to this organization |
| `USER_IS_ALREADY_INVITED_TO_THIS_ORGANIZATION` | User is already invited to this organization |
| `INVITATION_NOT_FOUND` | Invitation not found |
| `YOU_ARE_NOT_THE_RECIPIENT_OF_THE_INVITATION` | You are not the recipient of the invitation |
| `EMAIL_VERIFICATION_REQUIRED_BEFORE_ACCEPTING_OR_REJECTING_INVITATION` | Email verification required before accepting or rejecting invitation |
| `YOU_ARE_NOT_ALLOWED_TO_CANCEL_THIS_INVITATION` | You are not allowed to cancel this invitation |
| `INVITER_IS_NO_LONGER_A_MEMBER_OF_THE_ORGANIZATION` | Inviter is no longer a member of the organization |
| `YOU_ARE_NOT_ALLOWED_TO_INVITE_USER_WITH_THIS_ROLE` | You are not allowed to invite a user with this role |
| `FAILED_TO_RETRIEVE_INVITATION` | Failed to retrieve invitation |
| `YOU_HAVE_REACHED_THE_MAXIMUM_NUMBER_OF_TEAMS` | You have reached the maximum number of teams |
| `UNABLE_TO_REMOVE_LAST_TEAM` | Unable to remove last team |
| `YOU_ARE_NOT_ALLOWED_TO_UPDATE_THIS_MEMBER` | You are not allowed to update this member |
| `ORGANIZATION_MEMBERSHIP_LIMIT_REACHED` | Organization membership limit reached |
| `YOU_ARE_NOT_ALLOWED_TO_CREATE_TEAMS_IN_THIS_ORGANIZATION` | You are not allowed to create teams in this organization |
| `YOU_ARE_NOT_ALLOWED_TO_DELETE_TEAMS_IN_THIS_ORGANIZATION` | You are not allowed to delete teams in this organization |
| `YOU_ARE_NOT_ALLOWED_TO_UPDATE_THIS_TEAM` | You are not allowed to update this team |
| `YOU_ARE_NOT_ALLOWED_TO_DELETE_THIS_TEAM` | You are not allowed to delete this team |
| `INVITATION_LIMIT_REACHED` | Invitation limit reached |
| `TEAM_MEMBER_LIMIT_REACHED` | Team member limit reached |
| `USER_IS_NOT_A_MEMBER_OF_THE_TEAM` | User is not a member of the team |
| `YOU_CAN_NOT_ACCESS_THE_MEMBERS_OF_THIS_TEAM` | You are not allowed to list the members of this team |
| `YOU_DO_NOT_HAVE_AN_ACTIVE_TEAM` | You do not have an active team |
| `YOU_ARE_NOT_ALLOWED_TO_CREATE_A_NEW_TEAM_MEMBER` | You are not allowed to create a new member |
| `YOU_ARE_NOT_ALLOWED_TO_REMOVE_A_TEAM_MEMBER` | You are not allowed to remove a team member |
| `YOU_ARE_NOT_ALLOWED_TO_ACCESS_THIS_ORGANIZATION` | You are not allowed to access this organization as an owner |
| `YOU_ARE_NOT_A_MEMBER_OF_THIS_ORGANIZATION` | You are not a member of this organization |
| `MISSING_AC_INSTANCE` | Dynamic Access Control requires a pre-defined ac instance on the server auth plugin. Read server logs for more information |
| `YOU_MUST_BE_IN_AN_ORGANIZATION_TO_CREATE_A_ROLE` | You must be in an organization to create a role |
| `YOU_ARE_NOT_ALLOWED_TO_CREATE_A_ROLE` | You are not allowed to create a role |
| `YOU_ARE_NOT_ALLOWED_TO_UPDATE_A_ROLE` | You are not allowed to update a role |
| `YOU_ARE_NOT_ALLOWED_TO_DELETE_A_ROLE` | You are not allowed to delete a role |
| `YOU_ARE_NOT_ALLOWED_TO_READ_A_ROLE` | You are not allowed to read a role |
| `YOU_ARE_NOT_ALLOWED_TO_LIST_A_ROLE` | You are not allowed to list a role |
| `YOU_ARE_NOT_ALLOWED_TO_GET_A_ROLE` | You are not allowed to get a role |
| `TOO_MANY_ROLES` | This organization has too many roles |
| `INVALID_RESOURCE` | The provided permission includes an invalid resource |
| `ROLE_NAME_IS_ALREADY_TAKEN` | That role name is already taken |
| `CANNOT_DELETE_A_PRE_DEFINED_ROLE` | Cannot delete a pre-defined role |
| `ROLE_IS_ASSIGNED_TO_MEMBERS` | Cannot delete a role that is assigned to members. Please reassign the members to a different role first |

### Phone Number Plugin

- Source: `packages/better-auth/src/plugins/phone-number/error-codes.ts`
- GitHub: <https://github.com/better-auth/better-auth/blob/main/packages/better-auth/src/plugins/phone-number/error-codes.ts>
- Count: `12`

| Code | Message |
| --- | --- |
| `INVALID_PHONE_NUMBER` | Invalid phone number |
| `PHONE_NUMBER_EXIST` | Phone number already exists |
| `PHONE_NUMBER_NOT_EXIST` | phone number isn't registered |
| `INVALID_PHONE_NUMBER_OR_PASSWORD` | Invalid phone number or password |
| `UNEXPECTED_ERROR` | Unexpected error |
| `OTP_NOT_FOUND` | OTP not found |
| `OTP_EXPIRED` | OTP expired |
| `INVALID_OTP` | Invalid OTP |
| `PHONE_NUMBER_NOT_VERIFIED` | Phone number not verified |
| `PHONE_NUMBER_CANNOT_BE_UPDATED` | Phone number cannot be updated |
| `SEND_OTP_NOT_IMPLEMENTED` | sendOTP not implemented |
| `TOO_MANY_ATTEMPTS` | Too many attempts |

### Two Factor Plugin

- Source: `packages/better-auth/src/plugins/two-factor/error-code.ts`
- GitHub: <https://github.com/better-auth/better-auth/blob/main/packages/better-auth/src/plugins/two-factor/error-code.ts>
- Count: `9`

| Code | Message |
| --- | --- |
| `OTP_NOT_ENABLED` | OTP not enabled |
| `OTP_HAS_EXPIRED` | OTP has expired |
| `TOTP_NOT_ENABLED` | TOTP not enabled |
| `TWO_FACTOR_NOT_ENABLED` | Two factor isn't enabled |
| `BACKUP_CODES_NOT_ENABLED` | Backup codes aren't enabled |
| `INVALID_BACKUP_CODE` | Invalid backup code |
| `INVALID_CODE` | Invalid code |
| `TOO_MANY_ATTEMPTS_REQUEST_NEW_CODE` | Too many attempts. Please request a new code. |
| `INVALID_TWO_FACTOR_COOKIE` | Invalid two factor cookie |

### Username Plugin

- Source: `packages/better-auth/src/plugins/username/error-codes.ts`
- GitHub: <https://github.com/better-auth/better-auth/blob/main/packages/better-auth/src/plugins/username/error-codes.ts>
- Count: `8`

| Code | Message |
| --- | --- |
| `INVALID_USERNAME_OR_PASSWORD` | Invalid username or password |
| `EMAIL_NOT_VERIFIED` | Email not verified |
| `UNEXPECTED_ERROR` | Unexpected error |
| `USERNAME_IS_ALREADY_TAKEN` | Username is already taken. Please try another. |
| `USERNAME_TOO_SHORT` | Username is too short |
| `USERNAME_TOO_LONG` | Username is too long |
| `INVALID_USERNAME` | Username is invalid |
| `INVALID_DISPLAY_USERNAME` | Display username is invalid |

### API Key Package

- Source: `packages/api-key/src/error-codes.ts`
- GitHub: <https://github.com/better-auth/better-auth/blob/main/packages/api-key/src/error-codes.ts>
- Count: `31`

| Code | Message |
| --- | --- |
| `INVALID_METADATA_TYPE` | metadata must be an object or undefined |
| `REFILL_AMOUNT_AND_INTERVAL_REQUIRED` | refillAmount is required when refillInterval is provided |
| `REFILL_INTERVAL_AND_AMOUNT_REQUIRED` | refillInterval is required when refillAmount is provided |
| `USER_BANNED` | User is banned |
| `UNAUTHORIZED_SESSION` | Unauthorized or invalid session |
| `KEY_NOT_FOUND` | API Key not found |
| `KEY_DISABLED` | API Key is disabled |
| `KEY_EXPIRED` | API Key has expired |
| `USAGE_EXCEEDED` | API Key has reached its usage limit |
| `KEY_NOT_RECOVERABLE` | API Key is not recoverable |
| `EXPIRES_IN_IS_TOO_SMALL` | The expiresIn is smaller than the predefined minimum value. |
| `EXPIRES_IN_IS_TOO_LARGE` | The expiresIn is larger than the predefined maximum value. |
| `INVALID_REMAINING` | The remaining count is either too large or too small. |
| `INVALID_PREFIX_LENGTH` | The prefix length is either too large or too small. |
| `INVALID_NAME_LENGTH` | The name length is either too large or too small. |
| `METADATA_DISABLED` | Metadata is disabled. |
| `RATE_LIMIT_EXCEEDED` | Rate limit exceeded. |
| `NO_VALUES_TO_UPDATE` | No values to update. |
| `KEY_DISABLED_EXPIRATION` | Custom key expiration values are disabled. |
| `INVALID_API_KEY` | Invalid API key. |
| `INVALID_USER_ID_FROM_API_KEY` | The user id from the API key is invalid. |
| `INVALID_REFERENCE_ID_FROM_API_KEY` | The reference id from the API key is invalid. |
| `INVALID_API_KEY_GETTER_RETURN_TYPE` | API Key getter returned an invalid key type. Expected string. |
| `SERVER_ONLY_PROPERTY` | The property you're trying to set can only be set from the server auth instance only. |
| `FAILED_TO_UPDATE_API_KEY` | Failed to update API key |
| `NAME_REQUIRED` | API Key name is required. |
| `ORGANIZATION_ID_REQUIRED` | Organization ID is required for organization-owned API keys. |
| `USER_NOT_MEMBER_OF_ORGANIZATION` | You are not a member of the organization that owns this API key. |
| `INSUFFICIENT_API_KEY_PERMISSIONS` | You do not have permission to perform this action on organization API keys. |
| `NO_DEFAULT_API_KEY_CONFIGURATION_FOUND` | No default api-key configuration found. |
| `ORGANIZATION_PLUGIN_REQUIRED` | Organization plugin is required for organization-owned API keys. Please install and configure the organization plugin. |

### Electron Package

- Source: `packages/electron/src/error-codes.ts`
- GitHub: <https://github.com/better-auth/better-auth/blob/main/packages/electron/src/error-codes.ts>
- Count: `7`

| Code | Message |
| --- | --- |
| `INVALID_CLIENT_ID` | Invalid client ID |
| `INVALID_TOKEN` | Invalid or expired token. |
| `STATE_MISMATCH` | state mismatch |
| `MISSING_CODE_CHALLENGE` | missing code challenge |
| `INVALID_CODE_VERIFIER` | Invalid code verifier |
| `MISSING_STATE` | state is required |
| `MISSING_PKCE` | pkce is required |

### Passkey Package

- Source: `packages/passkey/src/error-codes.ts`
- GitHub: <https://github.com/better-auth/better-auth/blob/main/packages/passkey/src/error-codes.ts>
- Count: `14`

| Code | Message |
| --- | --- |
| `CHALLENGE_NOT_FOUND` | Challenge not found |
| `YOU_ARE_NOT_ALLOWED_TO_REGISTER_THIS_PASSKEY` | You are not allowed to register this passkey |
| `FAILED_TO_VERIFY_REGISTRATION` | Failed to verify registration |
| `PASSKEY_NOT_FOUND` | Passkey not found |
| `AUTHENTICATION_FAILED` | Authentication failed |
| `UNABLE_TO_CREATE_SESSION` | Unable to create session |
| `FAILED_TO_UPDATE_PASSKEY` | Failed to update passkey |
| `PREVIOUSLY_REGISTERED` | Previously registered |
| `REGISTRATION_CANCELLED` | Registration cancelled |
| `AUTH_CANCELLED` | Auth cancelled |
| `UNKNOWN_ERROR` | Unknown error |
| `SESSION_REQUIRED` | Passkey registration requires an authenticated session |
| `RESOLVE_USER_REQUIRED` | Passkey registration requires either an authenticated session or a resolveUser callback when requireSession is false |
| `RESOLVED_USER_INVALID` | Resolved user is invalid |

### SSO SAML Package

- Source: `packages/sso/src/saml/error-codes.ts`
- GitHub: <https://github.com/better-auth/better-auth/blob/main/packages/sso/src/saml/error-codes.ts>
- Count: `6`

| Code | Message |
| --- | --- |
| `SINGLE_LOGOUT_NOT_ENABLED` | Single Logout is not enabled |
| `INVALID_LOGOUT_RESPONSE` | Invalid LogoutResponse |
| `INVALID_LOGOUT_REQUEST` | Invalid LogoutRequest |
| `LOGOUT_FAILED_AT_IDP` | Logout failed at IdP |
| `IDP_SLO_NOT_SUPPORTED` | IdP does not support Single Logout Service |
| `SAML_PROVIDER_NOT_FOUND` | SAML provider not found |

### Stripe Package

- Source: `packages/stripe/src/error-codes.ts`
- GitHub: <https://github.com/better-auth/better-auth/blob/main/packages/stripe/src/error-codes.ts>
- Count: `23`

| Code | Message |
| --- | --- |
| `UNAUTHORIZED` | Unauthorized access |
| `INVALID_REQUEST_BODY` | Invalid request body |
| `SUBSCRIPTION_NOT_FOUND` | Subscription not found |
| `SUBSCRIPTION_PLAN_NOT_FOUND` | Subscription plan not found |
| `ALREADY_SUBSCRIBED_PLAN` | You're already subscribed to this plan |
| `REFERENCE_ID_NOT_ALLOWED` | Reference id is not allowed |
| `CUSTOMER_NOT_FOUND` | Stripe customer not found for this user |
| `UNABLE_TO_CREATE_CUSTOMER` | Unable to create customer |
| `UNABLE_TO_CREATE_BILLING_PORTAL` | Unable to create billing portal session |
| `STRIPE_SIGNATURE_NOT_FOUND` | Stripe signature not found |
| `STRIPE_WEBHOOK_SECRET_NOT_FOUND` | Stripe webhook secret not found |
| `STRIPE_WEBHOOK_ERROR` | Stripe webhook error |
| `FAILED_TO_CONSTRUCT_STRIPE_EVENT` | Failed to construct Stripe event |
| `FAILED_TO_FETCH_PLANS` | Failed to fetch plans |
| `EMAIL_VERIFICATION_REQUIRED` | Email verification is required before you can subscribe to a plan |
| `SUBSCRIPTION_NOT_ACTIVE` | Subscription is not active |
| `SUBSCRIPTION_NOT_SCHEDULED_FOR_CANCELLATION` | Subscription is not scheduled for cancellation |
| `SUBSCRIPTION_NOT_PENDING_CHANGE` | Subscription has no pending cancellation or scheduled plan change |
| `ORGANIZATION_NOT_FOUND` | Organization not found |
| `ORGANIZATION_SUBSCRIPTION_NOT_ENABLED` | Organization subscription is not enabled |
| `AUTHORIZE_REFERENCE_REQUIRED` | Organization subscriptions require authorizeReference callback to be configured |
| `ORGANIZATION_HAS_ACTIVE_SUBSCRIPTION` | Cannot delete organization with active subscription |
| `ORGANIZATION_REFERENCE_ID_REQUIRED` | Reference ID is required. Provide referenceId or set activeOrganizationId in session |

## 重复 Code 名称

这些 code 名称在多个模块中重复出现。大多数 message 相同，但少数模块存在不同 message。

| Code | Source Count | Same Message |
| --- | --- | --- |
| `EMAIL_NOT_VERIFIED` | `2` | `yes` |
| `FAILED_TO_CREATE_SESSION` | `2` | `yes` |
| `FAILED_TO_CREATE_USER` | `3` | `yes` |
| `INVALID_OTP` | `2` | `yes` |
| `INVALID_TOKEN` | `2` | `no` |
| `ORGANIZATION_NOT_FOUND` | `2` | `yes` |
| `OTP_EXPIRED` | `2` | `yes` |
| `SESSION_REQUIRED` | `2` | `no` |
| `TOO_MANY_ATTEMPTS` | `2` | `yes` |
| `UNEXPECTED_ERROR` | `2` | `yes` |
| `UNKNOWN_ERROR` | `2` | `no` |
| `USER_ALREADY_EXISTS` | `2` | `yes` |
| `USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL` | `2` | `yes` |
| `USER_NOT_FOUND` | `2` | `yes` |

### 同名但 message 不同的重复项

#### `INVALID_TOKEN`

| Source | Message |
| --- | --- |
| `packages/core/src/error/codes.ts` | Invalid token |
| `packages/electron/src/error-codes.ts` | Invalid or expired token. |

#### `SESSION_REQUIRED`

| Source | Message |
| --- | --- |
| `packages/better-auth/src/plugins/generic-oauth/error-codes.ts` | Session is required |
| `packages/passkey/src/error-codes.ts` | Passkey registration requires an authenticated session |

#### `UNKNOWN_ERROR`

| Source | Message |
| --- | --- |
| `packages/better-auth/src/plugins/captcha/error-codes.ts` | Something went wrong |
| `packages/passkey/src/error-codes.ts` | Unknown error |

## 源码里存在，但没有找到“官方默认 message”定义的 redirect/runtime 字符串

下面这些 code 是我在 redirect 逻辑里搜到的字符串字面量。它们在源码中被当作错误标识使用，但没有像 `defineErrorCodes(...)` 那样给出稳定、统一的默认 message，因此不并入上面的 typed error 表。

### `packages/better-auth/src/plugins/magic-link/index.ts`

- `ATTEMPTS_EXCEEDED`
- `EXPIRED_TOKEN`
- `INVALID_TOKEN`
- `failed_to_create_session`
- `failed_to_create_user`
- `new_user_signup_disabled`

### `packages/better-auth/src/plugins/generic-oauth/routes.ts`

- `email_is_missing`
- `issuer_mismatch`
- `issuer_missing`
- `name_is_missing`
- `oauth_code_verification_failed`
- `user_info_is_missing`

### `packages/better-auth/src/plugins/oauth-proxy/index.ts`

- `invalid_payload`
- `invalid_profile`
- `missing_profile`
- `payload_expired`
- `user_creation_failed`

## 结论

- 如果你要做客户端 i18n 或统一错误映射，优先使用上面的 typed error code 表。
- 如果你要处理 OAuth/SSO 跳转失败页面，优先看 redirect error 表，尤其是 `state_mismatch` 页里的 state 子错误。
- 对于最后一节那些“只有 code 没有统一默认 message”的字符串，建议你在项目里自行定义展示文案。

## 参考来源

- 官网 Errors 索引：<https://better-auth.com/docs/reference/errors>
- 官网 `state_mismatch`：<https://better-auth.com/docs/reference/errors/state_mismatch>
- 官网 i18n：<https://better-auth.com/docs/plugins/i18n>
- Better Auth 官方仓库：<https://github.com/better-auth/better-auth>
