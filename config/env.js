const envConfig = {
    SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    SUPABASE_API: process.env.NEXT_PUBLIC_SUPABASE_API_KEY,
    SENDGRID_API_KEY: process.env.NEXT_SENDGRID_API_KEY,
};

module.exports = {
    envConfig,
};
