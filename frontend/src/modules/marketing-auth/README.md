# Account pages

Routes: `/giris-yap` and `/kayit-ol`. Both use the shared `AuthScreen` and `AuthForm`; changing tabs navigates between the routes. The shared navigation's only account CTA links to `/kayit-ol`.

Forms validate email and required fields locally. Registration requires eight password characters and matching confirmation. Password visibility is user-controlled. No API call, session, account creation, persistence or credential logging is implemented. Submit and password recovery display explicit unavailable messages with a support contact. Connect agreed authentication endpoints before enabling success behavior.
