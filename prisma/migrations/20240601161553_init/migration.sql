-- CreateTable
CREATE TABLE "Respondents" (
    "id" SERIAL NOT NULL,
    "auth_id" TEXT NOT NULL,
    "age" INTEGER NOT NULL DEFAULT -1,
    "sex" TEXT NOT NULL DEFAULT '無回答',
    "audio_device" TEXT NOT NULL DEFAULT '無回答',
    "is_finished_info" BOOLEAN NOT NULL DEFAULT false,
    "is_finished_practice" BOOLEAN NOT NULL DEFAULT false,
    "is_finished_eval_1" BOOLEAN NOT NULL DEFAULT false,
    "is_invalid" BOOLEAN NOT NULL DEFAULT false,
    "file_path_list" TEXT[] DEFAULT ARRAY[]::TEXT[],

    CONSTRAINT "Respondents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SexItem" (
    "id" SERIAL NOT NULL,
    "item" TEXT NOT NULL,

    CONSTRAINT "SexItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AudioDeviceItem" (
    "id" SERIAL NOT NULL,
    "item" TEXT NOT NULL,

    CONSTRAINT "AudioDeviceItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SampleMetaData" (
    "id" SERIAL NOT NULL,
    "file_path" TEXT NOT NULL,
    "model_name" TEXT NOT NULL,
    "model_id" INTEGER NOT NULL,
    "speaker_name" TEXT NOT NULL,
    "sample_name" TEXT NOT NULL,
    "sample_group" INTEGER NOT NULL,
    "sample_page_name" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "is_dummy" BOOLEAN NOT NULL,
    "naturalness_dummy_correct_answer_id" INTEGER NOT NULL,
    "intelligibility_dummy_correct_answer_id" INTEGER NOT NULL,

    CONSTRAINT "SampleMetaData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NaturalnessItem" (
    "id" SERIAL NOT NULL,
    "item" TEXT NOT NULL,

    CONSTRAINT "NaturalnessItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IntelligibilityItem" (
    "id" SERIAL NOT NULL,
    "item" TEXT NOT NULL,

    CONSTRAINT "IntelligibilityItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Answers" (
    "id" SERIAL NOT NULL,
    "respondent_id" INTEGER NOT NULL,
    "sample_meta_data_id" INTEGER NOT NULL,
    "naturalness_id" INTEGER NOT NULL,
    "intelligibility_id" INTEGER NOT NULL,

    CONSTRAINT "Answers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Respondents_auth_id_key" ON "Respondents"("auth_id");

-- CreateIndex
CREATE UNIQUE INDEX "SampleMetaData_file_path_key" ON "SampleMetaData"("file_path");

-- CreateIndex
CREATE UNIQUE INDEX "NaturalnessItem_item_key" ON "NaturalnessItem"("item");

-- CreateIndex
CREATE UNIQUE INDEX "IntelligibilityItem_item_key" ON "IntelligibilityItem"("item");

-- AddForeignKey
ALTER TABLE "SampleMetaData" ADD CONSTRAINT "SampleMetaData_naturalness_dummy_correct_answer_id_fkey" FOREIGN KEY ("naturalness_dummy_correct_answer_id") REFERENCES "NaturalnessItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SampleMetaData" ADD CONSTRAINT "SampleMetaData_intelligibility_dummy_correct_answer_id_fkey" FOREIGN KEY ("intelligibility_dummy_correct_answer_id") REFERENCES "IntelligibilityItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Answers" ADD CONSTRAINT "Answers_respondent_id_fkey" FOREIGN KEY ("respondent_id") REFERENCES "Respondents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Answers" ADD CONSTRAINT "Answers_sample_meta_data_id_fkey" FOREIGN KEY ("sample_meta_data_id") REFERENCES "SampleMetaData"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Answers" ADD CONSTRAINT "Answers_naturalness_id_fkey" FOREIGN KEY ("naturalness_id") REFERENCES "NaturalnessItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Answers" ADD CONSTRAINT "Answers_intelligibility_id_fkey" FOREIGN KEY ("intelligibility_id") REFERENCES "IntelligibilityItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
