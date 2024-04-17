-- CreateTable
CREATE TABLE "Respondents" (
    "id" SERIAL NOT NULL,
    "age" INTEGER NOT NULL DEFAULT -1,
    "sex" TEXT NOT NULL DEFAULT '無回答',
    "auth_id" TEXT NOT NULL,
    "is_finished_info" BOOLEAN NOT NULL DEFAULT false,
    "is_finished_practice" BOOLEAN NOT NULL DEFAULT false,
    "is_finished_eval_1" BOOLEAN NOT NULL DEFAULT false,
    "is_finished_eval_2" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Respondents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SexItem" (
    "id" SERIAL NOT NULL,
    "item" TEXT NOT NULL,

    CONSTRAINT "SexItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SampleMetaData" (
    "id" SERIAL NOT NULL,
    "page_name" TEXT NOT NULL,
    "file_path" TEXT NOT NULL,
    "speaker_name" TEXT NOT NULL,
    "model_name" TEXT NOT NULL,
    "sample_name" TEXT NOT NULL,
    "kind" TEXT NOT NULL,

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
ALTER TABLE "Answers" ADD CONSTRAINT "Answers_respondent_id_fkey" FOREIGN KEY ("respondent_id") REFERENCES "Respondents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Answers" ADD CONSTRAINT "Answers_sample_meta_data_id_fkey" FOREIGN KEY ("sample_meta_data_id") REFERENCES "SampleMetaData"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Answers" ADD CONSTRAINT "Answers_naturalness_id_fkey" FOREIGN KEY ("naturalness_id") REFERENCES "NaturalnessItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Answers" ADD CONSTRAINT "Answers_intelligibility_id_fkey" FOREIGN KEY ("intelligibility_id") REFERENCES "IntelligibilityItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
