// /* eslint-disable no-restricted-syntax */
// /* eslint-disable no-await-in-loop */
// /* eslint-disable object-shorthand */
// import { PrismaClient } from "@prisma/client";
// import { createClient } from "@supabase/supabase-js";

// // eslint-disable-next-line @typescript-eslint/no-var-requires
// const dfd = require("danfojs-node");

// const prisma = new PrismaClient();

// async function main() {
// 	const supabaseUrlDev = process.env.SUPABASE_URL_DEV;
// 	const serviceRoleKeyDev = process.env.SUPABASE_SERVICE_ROLE_KEY_DEV;
// 	const supabaseUrlProd = process.env.SUPABASE_URL_PROD;
// 	const serviceRoleKeyProd = process.env.SUPABASE_SERVICE_ROLE_KEY_PROD;
// 	const authLocalSavePath = process.env.LOCAL_AUTH_SAVE_PATH;

// 	if (supabaseUrlDev === undefined) {
// 		throw new Error("SUPABASE_URL_DEV was not specified.");
// 	}
// 	if (serviceRoleKeyDev === undefined) {
// 		throw new Error("SUPABASE_SERVICE_ROLE_KEY_DEV was not specified.");
// 	}
// 	if (supabaseUrlProd === undefined) {
// 		throw new Error("SUPABASE_URL_PROD was not specified.");
// 	}
// 	if (serviceRoleKeyProd === undefined) {
// 		throw new Error("SUPABASE_SERVICE_ROLE_KEY_PROD was not specified.");
// 	}
// 	if (authLocalSavePath === undefined) {
// 		throw new Error("LOCAL_AUTH_SAVE_PATH was not specified.");
// 	}

// 	const supabaseDev = createClient(supabaseUrlDev, serviceRoleKeyDev, {
// 		auth: {
// 			autoRefreshToken: false,
// 			persistSession: false,
// 		},
// 	});

// 	const supabaseProd = createClient(supabaseUrlProd, serviceRoleKeyProd, {
// 		auth: {
// 			autoRefreshToken: false,
// 			persistSession: false,
// 		},
// 	});

// 	// eslint-disable-next-line no-constant-condition
// 	while (true) {
// 		const {
// 			data: { users },
// 			error: listUsersError,
// 		} = await supabaseProd.auth.admin.listUsers();

// 		if (listUsersError) {
// 			console.error(listUsersError);
// 			process.exit(1);
// 		}

// 		if (users.length === 0) {
// 			break;
// 		}

// 		for (const user of users) {
// 			const { error: deleteUserError } = await supabaseProd.auth.admin
// 				.deleteUser(user.id);

// 			if (deleteUserError) {
// 				console.error(deleteUserError);
// 				process.exit(1);
// 			}
// 		}
// 	}

// 	const dfAuth = await dfd.readCSV(authLocalSavePath);
// 	dfAuth.sortValues("respondent_id", { ascending: true, inplace: true });

// 	for (let i = 0; i < dfAuth.shape[0]; i += 1) {
// 		const row = dfAuth.iloc({ rows: [i] }).values[0];
// 		const respondentId = row[0];
// 		const email = row[1];
// 		const password = row[2];

// 		const { error: createUserError } = await supabaseProd.auth.admin
// 			.createUser(
// 				{
// 					email: String(email),
// 					password: String(password),
// 					email_confirm: true,
// 				},
// 			);

// 		if (createUserError) {
// 			console.error(createUserError);
// 			process.exit(1);
// 		}

// 		const { data: respondentData, error: respondentSelectError } =
// 			await supabaseDev
// 				.from("Respondents")
// 				.select("file_path_list").eq("id", respondentId);

// 		if (respondentSelectError) {
// 			console.error(respondentSelectError);
// 			process.exit(1);
// 		}

// 		await prisma.respondents.update({
// 			where: {
// 				id: respondentId,
// 			},
// 			data: {
// 				file_path_list: respondentData[0].file_path_list,
// 			},
// 		});
// 	}

// 	const { data: audioDeviceItemList, error: audioDeviceItemSelectError } =
// 		await supabaseDev
// 			.from("AudioDeviceItem")
// 			.select("*");
// 	if (audioDeviceItemSelectError) {
// 		console.error(audioDeviceItemSelectError);
// 		process.exit(1);
// 	}
// 	await prisma.audioDeviceItem.createMany({
// 		data: audioDeviceItemList.map(({ id, ...rest }) => rest),
// 		skipDuplicates: true,
// 	});

// 	const {
// 		data: intelligibilityItemList,
// 		error: intelligibilityItemSelectError,
// 	} = await supabaseDev
// 		.from("IntelligibilityItem")
// 		.select("*");
// 	if (intelligibilityItemSelectError) {
// 		console.error(intelligibilityItemSelectError);
// 		process.exit(1);
// 	}
// 	await prisma.intelligibilityItem.createMany({
// 		data: intelligibilityItemList.map(({ id, ...rest }) => rest),
// 		skipDuplicates: true,
// 	});

// 	const { data: naturalnessItemList, error: naturalnessItemSelectError } =
// 		await supabaseDev
// 			.from("NaturalnessItem")
// 			.select("*");
// 	if (naturalnessItemSelectError) {
// 		console.error(naturalnessItemSelectError);
// 		process.exit(1);
// 	}
// 	await prisma.naturalnessItem.createMany({
// 		data: naturalnessItemList.map(({ id, ...rest }) => rest),
// 		skipDuplicates: true,
// 	});

// 	const { data: sampleMetaDataList, error: sampleMetaDataSelectError } =
// 		await supabaseDev
// 			.from("SampleMetaData")
// 			.select("*");
// 	if (sampleMetaDataSelectError) {
// 		console.error(sampleMetaDataSelectError);
// 		process.exit(1);
// 	}
// 	await prisma.sampleMetaData.createMany({
// 		data: sampleMetaDataList.map(({ id, ...rest }) => rest),
// 		skipDuplicates: true,
// 	});

// 	const { data: sexItemList, error: sexItemSelectError } = await supabaseDev
// 		.from("SexItem")
// 		.select("*");
// 	if (sexItemSelectError) {
// 		console.error(sexItemSelectError);
// 		process.exit(1);
// 	}
// 	await prisma.sexItem.createMany({
// 		data: sexItemList.map(({ id, ...rest }) => rest),
// 		skipDuplicates: true,
// 	});
// }

// main()
// 	.catch(async (e) => {
// 		console.error(e);
// 		process.exit(1);
// 	})
// 	.finally(async () => {
// 		await prisma.$disconnect();
// 	});
