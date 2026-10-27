"""Minimal MCP client for VoiceStudio (Streamable HTTP, http://localhost:3900/mcp/).

Usage:
  python mcp_call.py tools
  python mcp_call.py call <tool> '<json-args>'
Runs with the VoiceStudio venv (it ships the `mcp` package).
"""
import asyncio
import json
import os
import sys

from mcp import ClientSession
from mcp.client.streamable_http import streamablehttp_client

URL = os.environ.get("VOICESTUDIO_MCP_URL", "http://localhost:3900/mcp/")
HEADERS = {"X-OmniVoice-Client-Id": "claude-code"}


async def main() -> None:
    async with streamablehttp_client(URL, headers=HEADERS, timeout=60, sse_read_timeout=3600) as (r, w, _):
        async with ClientSession(r, w) as s:
            await s.initialize()
            if sys.argv[1] == "tools":
                for t in (await s.list_tools()).tools:
                    print(t.name, "-", (t.description or "").splitlines()[0][:100])
                return
            name, args = sys.argv[2], json.loads(sys.argv[3] if len(sys.argv) > 3 else "{}")
            res = await s.call_tool(name, args)
            for c in res.content:
                text = getattr(c, "text", None)
                if text is not None:
                    # keep base64 audio out of the terminal
                    try:
                        d = json.loads(text)
                        if isinstance(d, dict) and "wav_base64" in d:
                            d["wav_base64"] = f"<{len(d['wav_base64'])} chars>"
                        text = json.dumps(d, ensure_ascii=False)
                    except Exception:
                        pass
                    print(text[:4000])
            if res.isError:
                sys.exit(1)


asyncio.run(main())
