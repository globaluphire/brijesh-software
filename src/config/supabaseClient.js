import { createClient } from "@supabase/supabase-js";
import { envConfig } from "./env";

export const supabase = createClient(
    envConfig.SUPABASE_URL,
    envConfig.SUPABASE_API
);
