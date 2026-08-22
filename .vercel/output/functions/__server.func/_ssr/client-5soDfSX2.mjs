import { n as TSS_SERVER_FUNCTION, t as createServerFn } from "./ssr.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/client-5soDfSX2.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var getAiStatus_createServerFn_handler = createServerRpc({
	id: "e7fd996a546c9dfe2eaf8857329251ff910df226ca7663e7652f24a0baf69443",
	name: "getAiStatus",
	filename: "src/lib/ai/client.ts"
}, (opts) => getAiStatus.__executeServer(opts));
var getAiStatus = createServerFn({ method: "GET" }).handler(getAiStatus_createServerFn_handler, async () => {
	return { xaiAvailable: Boolean(process.env.XAI_API_KEY) };
});
var completeOnce_createServerFn_handler = createServerRpc({
	id: "d4a5fb700a0f60b7f2e8d605315bcd4ad71b62e59ffebad3024f6932cade8445",
	name: "completeOnce",
	filename: "src/lib/ai/client.ts"
}, (opts) => completeOnce.__executeServer(opts));
var completeOnce = createServerFn({ method: "POST" }).validator((input) => input).handler(completeOnce_createServerFn_handler, async ({ data }) => {
	const { completeChat } = await import("./complete.server-DBIu05kc.mjs").then((n) => n.n);
	return completeChat(data);
});
//#endregion
export { completeOnce_createServerFn_handler, getAiStatus_createServerFn_handler };
