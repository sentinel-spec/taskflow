-- CreateTable
CREATE TABLE "system_settings" (
    "key" TEXT NOT NULL DEFAULT 'default',
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "locale" TEXT NOT NULL DEFAULT 'en-US',
    "mail_enabled" BOOLEAN NOT NULL DEFAULT false,
    "mail_from_email" TEXT NOT NULL DEFAULT '',
    "mail_from_name" TEXT NOT NULL DEFAULT '',
    "ai_enabled" BOOLEAN NOT NULL DEFAULT true,
    "ai_provider" TEXT NOT NULL DEFAULT 'openrouter',
    "ai_model" TEXT NOT NULL DEFAULT 'openai/gpt-4.1-mini',
    "ai_base_url" TEXT NOT NULL DEFAULT 'https://openrouter.ai/api/v1',
    "ai_api_key" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_settings_pkey" PRIMARY KEY ("key")
);
