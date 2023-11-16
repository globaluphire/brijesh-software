const envConfig = {
    SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    SUPABASE_API: process.env.NEXT_PUBLIC_SUPABASE_API_KEY,
    TWILIO_ACCOUNT_SID: process.env.NEXT_TWILIO_ACCOUNT_SID,
    TWILIO_AUTH_TOKEN: process.env.NEXT_TWILIO_AUTH_TOKEN,
    TWILIO_NUMBER: process.env.NEXT_TWILIO_NUMBER,
    SENDGRID_API_KEY: process.env.NEXT_SENDGRID_API_KEY,
    JOB_PORTAL_GMAP_API_KEY: process.env.NEXT_PUBLIC_JOB_PORTAL_GMAP_API_KEY,
    DOCUSIGN_INTEGRATION_KEY: process.env.NEXT_DOCUSIGN_INTEGRATION_KEY,
    DOCUSIGN_USER_ID: process.env.NEXT_DOCUSIGN_USER_ID,
    DOCUSIGN_ACCOUNT_ID: process.env.NEXT_DOCUSIGN_ACCOUNT_ID,
    DOCUSIGN_API_URL: process.env.NEXT_DOCUSIGN_API_URL,
    DOCUSIGN_ACCESS_TOKEN_URL: process.env.NEXT_DOCUSIGN_ACCESS_TOKEN_URL,
    DOCUSIGN_RSA_KEY: process.env.NEXT_DOCUSIGN_RSA_KEY,
    SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
    WEBSITE_URL: process.env.NEXT_PUBLIC_WEBSITE_URL,
    EMAIL_REPORT: process.env.NEXT_PUBLIC_EMAIL_REPORT
};

module.exports = {
    envConfig,
};
