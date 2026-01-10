-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "postgis";

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "PlantExposure" AS ENUM ('Full Sun', 'Partial Shade', 'Shade');

-- CreateEnum
CREATE TYPE "PlantUse" AS ENUM ('ORNAMENTAL', 'GROUNDCOVER', 'FOOD', 'MEDICINAL', 'FRAGRANCE');

-- CreateEnum
CREATE TYPE "WaterRequirement" AS ENUM ('LOW', 'MODERATE', 'HIGH', 'AQUATIC');

-- CreateEnum
CREATE TYPE "LightRequirement" AS ENUM ('FULL_SUN', 'PARTIAL_SUN', 'PARTIAL_SHADE', 'FULL_SHADE');

-- CreateEnum
CREATE TYPE "GrowthRate" AS ENUM ('SLOW', 'MODERATE', 'FAST');

-- CreateEnum
CREATE TYPE "DiagnosisStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "ConditionType" AS ENUM ('DISEASE', 'PEST', 'DEFICIENCY', 'ENVIRONMENTAL', 'HEALTHY');

-- CreateEnum
CREATE TYPE "Severity" AS ENUM ('LOW', 'MODERATE', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "CareTaskType" AS ENUM ('WATER', 'FERTILIZE', 'PRUNE', 'REPOT', 'HARVEST', 'PEST_CHECK', 'DISEASE_CHECK', 'MULCH', 'WEED', 'CUSTOM');

-- CreateEnum
CREATE TYPE "CareFrequency" AS ENUM ('DAILY', 'EVERY_OTHER_DAY', 'TWICE_WEEKLY', 'WEEKLY', 'BIWEEKLY', 'MONTHLY', 'CUSTOM');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "birth_date" DATE,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "avatar_url" TEXT,
    "preferences" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gardens" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "description" TEXT,
    "size" DOUBLE PRECISION,
    "climate" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "gardens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plants" (
    "id" TEXT NOT NULL,
    "nickname" TEXT,
    "species_id" TEXT,
    "common_name" TEXT,
    "scientific_name" TEXT,
    "family" TEXT,
    "exposure" "PlantExposure",
    "watering" TEXT,
    "soil_type" TEXT,
    "flower_color" TEXT,
    "height" DOUBLE PRECISION,
    "planted_date" DATE,
    "acquired_date" DATE,
    "blooming_season" TEXT,
    "planting_season" TEXT,
    "care_notes" TEXT,
    "image_url" TEXT,
    "thumbnail_url" TEXT,
    "use" "PlantUse",
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "garden_id" TEXT NOT NULL,

    CONSTRAINT "plants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "species" (
    "id" TEXT NOT NULL,
    "common_name" TEXT NOT NULL,
    "scientific_name" TEXT NOT NULL,
    "family" TEXT NOT NULL,
    "genus" TEXT,
    "description" TEXT,
    "origin" TEXT,
    "native_regions" TEXT[],
    "min_temp_celsius" DOUBLE PRECISION,
    "max_temp_celsius" DOUBLE PRECISION,
    "water_requirement" "WaterRequirement",
    "light_requirement" "LightRequirement",
    "soil_types" TEXT[],
    "average_height" DOUBLE PRECISION,
    "growth_rate" "GrowthRate",
    "lifespan" TEXT,
    "blooming_season" TEXT[],
    "harvest_season" TEXT[],
    "default_watering_days" INTEGER,
    "default_fertilize_days" INTEGER,
    "gbif_id" TEXT,
    "plant_net_id" TEXT,
    "image_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "species_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "diagnoses" (
    "id" TEXT NOT NULL,
    "image_url" TEXT NOT NULL,
    "description" TEXT,
    "status" "DiagnosisStatus" NOT NULL DEFAULT 'PENDING',
    "confidence" DOUBLE PRECISION,
    "condition_name" TEXT,
    "condition_type" "ConditionType",
    "severity" "Severity",
    "affected_parts" TEXT[],
    "causes" TEXT[],
    "symptoms" TEXT[],
    "treatment_steps" TEXT[],
    "prevention_tips" TEXT[],
    "organic_treatment" TEXT,
    "chemical_treatment" TEXT,
    "recovery_time_weeks" INTEGER,
    "critical_actions" TEXT[],
    "ai_model" TEXT,
    "raw_response" JSONB,
    "processing_ms" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "plant_id" TEXT,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "diagnoses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "care_schedules" (
    "id" TEXT NOT NULL,
    "task_type" "CareTaskType" NOT NULL,
    "frequency" "CareFrequency" NOT NULL,
    "interval_days" INTEGER,
    "next_due_date" TIMESTAMP(3) NOT NULL,
    "last_done_at" TIMESTAMP(3),
    "notes" TEXT,
    "is_enabled" BOOLEAN NOT NULL DEFAULT true,
    "weather_adjust" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "garden_id" TEXT,
    "plant_id" TEXT,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "care_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "care_completions" (
    "id" TEXT NOT NULL,
    "completed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "skipped" BOOLEAN NOT NULL DEFAULT false,
    "skip_reason" TEXT,
    "photo_url" TEXT,
    "schedule_id" TEXT NOT NULL,

    CONSTRAINT "care_completions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE INDEX "gardens_user_id_idx" ON "gardens"("user_id");

-- CreateIndex
CREATE INDEX "gardens_latitude_longitude_idx" ON "gardens"("latitude", "longitude");

-- CreateIndex
CREATE INDEX "gardens_name_idx" ON "gardens"("name");

-- CreateIndex
CREATE INDEX "plants_garden_id_idx" ON "plants"("garden_id");

-- CreateIndex
CREATE INDEX "plants_species_id_idx" ON "plants"("species_id");

-- CreateIndex
CREATE INDEX "plants_garden_id_common_name_idx" ON "plants"("garden_id", "common_name");

-- CreateIndex
CREATE INDEX "plants_garden_id_created_at_idx" ON "plants"("garden_id", "created_at");

-- CreateIndex
CREATE INDEX "plants_garden_id_exposure_idx" ON "plants"("garden_id", "exposure");

-- CreateIndex
CREATE INDEX "plants_garden_id_watering_idx" ON "plants"("garden_id", "watering");

-- CreateIndex
CREATE UNIQUE INDEX "species_scientific_name_key" ON "species"("scientific_name");

-- CreateIndex
CREATE INDEX "species_common_name_idx" ON "species"("common_name");

-- CreateIndex
CREATE INDEX "species_family_idx" ON "species"("family");

-- CreateIndex
CREATE INDEX "species_genus_idx" ON "species"("genus");

-- CreateIndex
CREATE INDEX "diagnoses_plant_id_idx" ON "diagnoses"("plant_id");

-- CreateIndex
CREATE INDEX "diagnoses_user_id_idx" ON "diagnoses"("user_id");

-- CreateIndex
CREATE INDEX "diagnoses_status_idx" ON "diagnoses"("status");

-- CreateIndex
CREATE INDEX "diagnoses_user_id_status_idx" ON "diagnoses"("user_id", "status");

-- CreateIndex
CREATE INDEX "diagnoses_user_id_created_at_idx" ON "diagnoses"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "care_schedules_user_id_idx" ON "care_schedules"("user_id");

-- CreateIndex
CREATE INDEX "care_schedules_next_due_date_idx" ON "care_schedules"("next_due_date");

-- CreateIndex
CREATE INDEX "care_schedules_user_id_next_due_date_idx" ON "care_schedules"("user_id", "next_due_date");

-- CreateIndex
CREATE INDEX "care_schedules_garden_id_idx" ON "care_schedules"("garden_id");

-- CreateIndex
CREATE INDEX "care_schedules_plant_id_idx" ON "care_schedules"("plant_id");

-- CreateIndex
CREATE INDEX "care_schedules_is_enabled_idx" ON "care_schedules"("is_enabled");

-- CreateIndex
CREATE INDEX "care_schedules_garden_id_next_due_date_idx" ON "care_schedules"("garden_id", "next_due_date");

-- CreateIndex
CREATE INDEX "care_schedules_user_id_is_enabled_next_due_date_idx" ON "care_schedules"("user_id", "is_enabled", "next_due_date");

-- CreateIndex
CREATE INDEX "care_schedules_user_id_task_type_idx" ON "care_schedules"("user_id", "task_type");

-- CreateIndex
CREATE INDEX "care_completions_schedule_id_idx" ON "care_completions"("schedule_id");

-- CreateIndex
CREATE INDEX "care_completions_completed_at_idx" ON "care_completions"("completed_at");

-- CreateIndex
CREATE INDEX "care_completions_schedule_id_completed_at_idx" ON "care_completions"("schedule_id", "completed_at");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_key" ON "refresh_tokens"("token");

-- CreateIndex
CREATE INDEX "refresh_tokens_user_id_idx" ON "refresh_tokens"("user_id");

-- AddForeignKey
ALTER TABLE "gardens" ADD CONSTRAINT "gardens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plants" ADD CONSTRAINT "plants_species_id_fkey" FOREIGN KEY ("species_id") REFERENCES "species"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plants" ADD CONSTRAINT "plants_garden_id_fkey" FOREIGN KEY ("garden_id") REFERENCES "gardens"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diagnoses" ADD CONSTRAINT "diagnoses_plant_id_fkey" FOREIGN KEY ("plant_id") REFERENCES "plants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diagnoses" ADD CONSTRAINT "diagnoses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "care_schedules" ADD CONSTRAINT "care_schedules_garden_id_fkey" FOREIGN KEY ("garden_id") REFERENCES "gardens"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "care_schedules" ADD CONSTRAINT "care_schedules_plant_id_fkey" FOREIGN KEY ("plant_id") REFERENCES "plants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "care_schedules" ADD CONSTRAINT "care_schedules_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "care_completions" ADD CONSTRAINT "care_completions_schedule_id_fkey" FOREIGN KEY ("schedule_id") REFERENCES "care_schedules"("id") ON DELETE CASCADE ON UPDATE CASCADE;
