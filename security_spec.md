# Security Specification for Zeno.com Firestore

## 1. Data Invariants
1. A post must have valid strings for id, title, author, date, imageUrl, appLink, snippet, and status ('published' | 'draft').
2. Regular/unauthenticated visitors can only read published posts. Draft posts are strictly confidential and visible only to authorized administrators.
3. Ordinary visitors can never create, update, or delete posts or settings. Only authorized admin (`animeanime9683@gmail.com` with email verification or UID recorded in `/admins/`) can write.
4. Settings can be read by any visitor to render social links, but only modified by administrators.
5. All other paths are denied by default.

## 2. The "Dirty Dozen" Payloads (Must Return PERMISSION_DENIED)
1. Anonymous user attempting to create a post in `/posts/{postId}`.
2. Unauthenticated visitor attempting to read a draft post (`status == 'draft'`) from `/posts/{postId}`.
3. Authenticated non-admin attempting to delete a post.
4. Non-admin attempting to update an existing post's appLink to a malicious phishing URL.
5. Non-admin attempting to list draft posts.
6. Admin creating a post without a required field (e.g. missing `status`).
7. Admin creating a post with an invalid status (e.g. `status == 'deleted'`).
8. Admin injecting an oversized title (>300 characters) or oversized ID.
9. Non-admin attempting to overwrite `/settings/main`.
10. Spoofed admin token with `email == 'animeanime9683@gmail.com'` but `email_verified == false`.
11. Unauthenticated write to `/admins/{uid}` to self-assign admin privileges.
12. Random visitor trying to write to arbitrary unspecified collection paths (e.g. `/system/config`).
