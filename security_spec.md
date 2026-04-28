# Adl - Security Specification

## Data Invariants
- A case must belong to a registered plaintiff.
- Only an assigned judge or the parties involved can see detailed progress of a case.
- Status transitions must follow a logical flow (e.g., cannot go from dismissed to hearing).
- Reputation scores can only be modified by system-level logic or admins.

## The Dirty Dozen Payloads (Targeting Rejection)
1. **Identity Spoofing**: Creating a case with someone else's `plaintiffId`.
2. **Privilege Escalation**: Updating own user record to set `role: "admin"`.
3. **Status Hijacking**: Defendant trying to set a case status to `resolved` without a judge.
4. **ID Poisoning**: Injecting a 2MB string as a `caseId`.
5. **PII Leak**: Listing all users to scrape emails (List queries must be restricted).
6. **Immutable Field Attack**: Trying to change `createdAt` on a case.
7. **Shadow Field Injection**: Adding `isVerified: true` to a user profile.
8. **Orphaned Writes**: Creating a case without a title or type.
9. **Timing Attack**: Setting `updatedAt` to a future date instead of `request.time`.
10. **Unauthorized Read**: An unauthenticated user trying to read a specific case.
11. **Resource Exhaustion**: Sending a massive array in a field to bloat storage costs.
12. **Cross-Case Injection**: A plaintiff trying to update a case they don't own.

## Verification
- `firestore.rules` will be tested using a dedicated test suite (emulated).
- ESLint with `@firebase/eslint-plugin-security-rules` will be used for static analysis.
