/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

export interface Env {
	REAL_OPENAI_KEY: string;
	DUMMY_WRAPPER_KEY: string;
	AI_GATEWAY_ENDPOINT_URL: string;
	// Example binding to KV. Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/
	// MY_KV_NAMESPACE: KVNamespace;
	//
	// Example binding to Durable Object. Learn more at https://developers.cloudflare.com/workers/runtime-apis/durable-objects/
	// MY_DURABLE_OBJECT: DurableObjectNamespace;
	//
	// Example binding to R2. Learn more at https://developers.cloudflare.com/workers/runtime-apis/r2/
	// MY_BUCKET: R2Bucket;
	//
	// Example binding to a Service. Learn more at https://developers.cloudflare.com/workers/runtime-apis/service-bindings/
	// MY_SERVICE: Fetcher;
	// Example binding to a Queue. Learn more at https://developers.cloudflare.com/queues/javascript-apis/
	// MY_QUEUE: Queue;
}

function isJsonString(str: string) {
	try {
		JSON.parse(str);
	} catch (e) {
		return false;
	}
	return true;
}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const requestURL = new URL(request.url);
		const headers_Origin = request.headers.get('Access-Control-Allow-Origin') || '*';

		const realOpenAIKey = env.REAL_OPENAI_KEY;
		const dummyWrapperKey = env.DUMMY_WRAPPER_KEY;
		const aiGatewayEndpintUrl = env.AI_GATEWAY_ENDPOINT_URL;

		const responseHeader = {
			'Access-Control-Allow-Origin': headers_Origin,
			'content-type': 'application/json;charset=UTF-8',
		};

		if (aiGatewayEndpintUrl) {
			if (dummyWrapperKey) {
				const providedAuthorization = request.headers.get('Authorization');
				if (providedAuthorization) {
					const providedWrapperKey = providedAuthorization.split(' ').pop();
					if (providedWrapperKey == dummyWrapperKey) {
						if (realOpenAIKey) {
							if (realOpenAIKey != dummyWrapperKey) {
								if (requestURL.pathname.startsWith('/v1')) {
									const trimmedURL = aiGatewayEndpintUrl + requestURL.pathname.substring('/v1'.length);
									const gptRequest = new Request(trimmedURL, {
										headers: request.headers,
										method: request.method,
										body: request.body,
										redirect: 'follow',
									});
									gptRequest.headers.set('Authorization', 'Bearer ' + realOpenAIKey);
									// @ts-ignore: linter will report some attrs not found. But that's ok.
									return await fetch(gptRequest);
								} else {
									return Response.json(
										{
											error: {
												type: 'invalid_request_error',
												code: 'unknown_url',
												message: '(OpenAI Wrapper) Your URL does not starts with /v1',
												param: null,
											},
										},
										{
											headers: responseHeader,
											status: 400,
										}
									);
								}
							} else {
								return Response.json(
									{
										error: {
											type: 'invalid_request_error',
											code: 'wrapper_custom_dummy_key_euals_to_real_key',
											message:
												'(OpenAI Wrapper) Dummy key cannot be the same with real OpenAI key, which is prevented for misusing real key in other place. Please change DUMMY_WRAPPER_KEY in Cloudflare Dashboard',
											param: null,
										},
									},
									{
										headers: responseHeader,
										status: 500,
									}
								);
							}
						} else {
							return Response.json(
								{
									error: {
										type: 'invalid_request_error',
										code: 'wrapper_custom_no_real_key_in_env',
										message: '(OpenAI Wrapper) You does not provide real OpenAI key. Please add REAL_OPENAI_KEY in Cloudflare Dashboard',
										param: null,
									},
								},
								{
									headers: responseHeader,
									status: 500,
								}
							);
						}
					} else {
						return Response.json(
							{
								error: {
									type: 'invalid_request_error',
									code: 'wrapper_custom_invalid_dummy_key',
									message:
										'(OpenAI Wrapper) You does not provide correct dummy key. Be noted that you should NOT provide real OpenAI key here, which is not accepted.',
									param: null,
								},
							},
							{
								headers: responseHeader,
								status: 400,
							}
						);
					}
				} else {
					return Response.json(
						{
							error: {
								type: 'invalid_request_error',
								code: 'wrapper_custom_no_dummy_key_in_authorization',
								message: '(OpenAI Wrapper) You does not provide dummy dummy key in Authorization.',
								param: null,
							},
						},
						{
							headers: responseHeader,
							status: 401,
						}
					);
				}
			} else {
				return Response.json(
					{
						error: {
							type: 'invalid_request_error',
							code: 'wrapper_custom_no_dummy_key_in_env',
							message:
								'(OpenAI Wrapper) You does not provide dummy wrapper key in environment variables. Please add DUMMY_WRAPPER_KEY in Cloudflare Dashboard.',
							param: null,
						},
					},
					{
						headers: responseHeader,
						status: 400,
					}
				);
			}
		} else {
			return Response.json(
				{
					error: {
						type: 'invalid_request_error',
						code: 'wrapper_custom_no_endpint_url_in_env',
						message:
							'(OpenAI Wrapper) You does not provide gateway url in environment variables. Please add AI_GATEWAY_ENDPOINT_URL in Cloudflare Dashboard.',
						param: null,
					},
				},
				{
					headers: responseHeader,
					status: 400,
				}
			);
		}
	},
};
