# AI Gateway (OpenAI) Wrapper
Provide you OpenAI compatible, cost effective and proxied api endpoints on Cloudflare Worker. Foolproof considered.

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/pokon548/ai-gateway-openai-wrapper)

## Features
- Expose [AI Gateway](https://developers.cloudflare.com/ai-gateway/) endpoint to OpenAI compatible APIs. Use proxied api anywhere.
- Foolproof design. You need to use dummy api key, which cannot be the same with your real OpenAI API key, to access proxied api. This helps you prevent leaking your real key and make sure you never send proxied requests to official endpoint.
- Cost effective. Use [Observe and control](https://developers.cloudflare.com/ai-gateway/get-started/configuring-settings/) to help you control expense and analyze api requests. Never receive surprise bills again!

## Getting Started
1. Create your OpenAI API key on [OpenAI Platform](https://platform.openai.com/). For best foolproof effect, we recommend you do not reuse old one and create fresh new key *solely* used by this worker.
2. Create [AI Gateway](https://developers.cloudflare.com/ai-gateway/get-started/creating-gateway/) in Cloudflare.
3. Deploy this worker by [Clicking Here](https://deploy.workers.cloudflare.com/?url=https://github.com/pokon548/ai-gateway-openai-wrapper).
4. Add following environment variables to your newly created worker (Encrypting these variables is strongly advised!):
    - `AI_GATEWAY_ENDPOINT_URL`: Your AI Gateway endpoint url. Should [looks like](https://developers.cloudflare.com/ai-gateway/get-started/connecting-applications/#openai): `https://gateway.ai.cloudflare.com/v1/ACCOUNT_TAG/GATEWAY/openai`.
    - `DUMMY_WRAPPER_KEY`: Your API key supplied when you calling the wrapper endpoint. Can be any string. **This cannot be the the same with your real OpenAI key. Otherwise your request will be rejected by worker for foolproof reason**.
    - `REAL_OPENAI_KEY`: Your real OpenAI API key. Should looks like: `sk-123456789012345678901234567890123456789012345678`.
5. Use your worker domain as endpoint and `DUMMY_WRAPPER_KEY` as api key. Profit.