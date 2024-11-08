-- CreateTable
CREATE TABLE "Respondents" (
    "id" SERIAL NOT NULL,
    "auth_id" TEXT NOT NULL,
    "is_dummy" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "age" INTEGER NOT NULL DEFAULT -1,
    "sex" TEXT NOT NULL DEFAULT '無回答',
    "audio_device" TEXT NOT NULL DEFAULT '無回答',
    "is_finished_info" BOOLEAN NOT NULL DEFAULT false,
    "is_finished_int_practice" BOOLEAN NOT NULL DEFAULT false,
    "is_finished_int_main" BOOLEAN NOT NULL DEFAULT false,
    "is_finished_sim_practice" BOOLEAN NOT NULL DEFAULT false,
    "is_finished_sim_main" BOOLEAN NOT NULL DEFAULT false,
    "is_invalid_int_practice" BOOLEAN NOT NULL DEFAULT false,
    "is_invalid_int_main" BOOLEAN NOT NULL DEFAULT false,
    "is_invalid_sim_practice" BOOLEAN NOT NULL DEFAULT false,
    "is_invalid_sim_main" BOOLEAN NOT NULL DEFAULT false,
    "file_path_list_int" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "file_path_list_sim_eval" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "file_path_list_sim_gt" TEXT[] DEFAULT ARRAY[]::TEXT[],

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
    "sample_utt" TEXT NOT NULL,
    "sample_group_int_nat" INTEGER NOT NULL,
    "sample_group_sim" INTEGER NOT NULL,
    "exp_type" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "is_dummy" BOOLEAN NOT NULL,
    "intelligibility_dummy_correct_answer_id" INTEGER NOT NULL,
    "similarity_dummy_correct_answer_id" INTEGER NOT NULL,

    CONSTRAINT "SampleMetaData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IntelligibilityItem" (
    "id" SERIAL NOT NULL,
    "item" TEXT NOT NULL,

    CONSTRAINT "IntelligibilityItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SimilarityItem" (
    "id" SERIAL NOT NULL,
    "item" TEXT NOT NULL,

    CONSTRAINT "SimilarityItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnswersInt" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "respondent_id" INTEGER NOT NULL,
    "sample_meta_data_id" INTEGER NOT NULL,
    "intelligibility_id" INTEGER NOT NULL,

    CONSTRAINT "AnswersInt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnswersSim" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "respondent_id" INTEGER NOT NULL,
    "sample_meta_data_id" INTEGER NOT NULL,
    "similarity_id" INTEGER NOT NULL,

    CONSTRAINT "AnswersSim_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Respondents_auth_id_key" ON "Respondents"("auth_id");

-- CreateIndex
CREATE UNIQUE INDEX "SampleMetaData_file_path_key" ON "SampleMetaData"("file_path");

-- CreateIndex
CREATE UNIQUE INDEX "IntelligibilityItem_item_key" ON "IntelligibilityItem"("item");

-- CreateIndex
CREATE UNIQUE INDEX "SimilarityItem_item_key" ON "SimilarityItem"("item");

-- AddForeignKey
ALTER TABLE "SampleMetaData" ADD CONSTRAINT "SampleMetaData_intelligibility_dummy_correct_answer_id_fkey" FOREIGN KEY ("intelligibility_dummy_correct_answer_id") REFERENCES "IntelligibilityItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SampleMetaData" ADD CONSTRAINT "SampleMetaData_similarity_dummy_correct_answer_id_fkey" FOREIGN KEY ("similarity_dummy_correct_answer_id") REFERENCES "SimilarityItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnswersInt" ADD CONSTRAINT "AnswersInt_respondent_id_fkey" FOREIGN KEY ("respondent_id") REFERENCES "Respondents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnswersInt" ADD CONSTRAINT "AnswersInt_sample_meta_data_id_fkey" FOREIGN KEY ("sample_meta_data_id") REFERENCES "SampleMetaData"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnswersInt" ADD CONSTRAINT "AnswersInt_intelligibility_id_fkey" FOREIGN KEY ("intelligibility_id") REFERENCES "IntelligibilityItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnswersSim" ADD CONSTRAINT "AnswersSim_respondent_id_fkey" FOREIGN KEY ("respondent_id") REFERENCES "Respondents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnswersSim" ADD CONSTRAINT "AnswersSim_sample_meta_data_id_fkey" FOREIGN KEY ("sample_meta_data_id") REFERENCES "SampleMetaData"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnswersSim" ADD CONSTRAINT "AnswersSim_similarity_id_fkey" FOREIGN KEY ("similarity_id") REFERENCES "SimilarityItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
