// Supabase Edge Function: AI label reader (Premium feature).
// Takes a photo of an ingredient label and returns a structured pregnancy /
// breastfeeding assessment from Claude. Deploy: supabase functions deploy analyze-label
// Requires secret: supabase secrets set ANTHROPIC_API_KEY=sk-ant-...

import Anthropic from 'npm:@anthropic-ai/sdk';

const STAGE_LABELS: Record<string, string> = {
  t1: 'first trimester of pregnancy',
  t2: 'second trimester of pregnancy',
  t3: 'third trimester of pregnancy',
  bf: 'breastfeeding',
};

const SYSTEM_PROMPT = `You are the analysis engine for Mamama, a pregnancy-safety scanner.
You receive a photo of a product's ingredient label and the user's stage.
Rules:
- Transcribe the ingredient list, then assess each ingredient against published clinical
  guidance (MotherToBaby, NIH LactMed, ACOG, FDA, NHS, EFSA).
- BE CONSERVATIVE. When evidence conflicts or is thin, choose the stronger warning.
- Never overclaim safety: if you cannot read the label or verify ingredients, say so.
- This is informational decision support, not medical advice, and your output will be
  displayed with that disclaimer.
Respond with ONLY a JSON object:
{
  "verdict": "avoid" | "caution" | "ok" | "unknown",
  "headline": "one short sentence",
  "ingredients": [{ "name": "...", "risk": "safe" | "caution" | "avoid" | "unknown", "note": "one sentence" }],
  "reasoning": "2-3 sentences, plain English, cautious clinical tone"
}`;

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'POST only' }), { status: 405 });
  }

  const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'ANTHROPIC_API_KEY not configured' }), { status: 500 });
  }

  let payload: { imageBase64?: string; mediaType?: string; stage?: string };
  try {
    payload = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), { status: 400 });
  }

  const { imageBase64, mediaType = 'image/jpeg', stage = 't2' } = payload;
  if (!imageBase64) {
    return new Response(JSON.stringify({ error: 'imageBase64 is required' }), { status: 400 });
  }

  const anthropic = new Anthropic({ apiKey });

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-5',
      max_tokens: 1500,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: mediaType as 'image/jpeg', data: imageBase64 },
            },
            {
              type: 'text',
              text: `The user is in the ${STAGE_LABELS[stage] ?? STAGE_LABELS.t2}. Analyze this ingredient label.`,
            },
          ],
        },
      ],
    });

    const text = message.content.find((b) => b.type === 'text');
    if (!text || text.type !== 'text') {
      return new Response(JSON.stringify({ error: 'No analysis produced' }), { status: 502 });
    }

    // Claude returns bare JSON per the system prompt; validate before relaying.
    const parsed = JSON.parse(text.text.replace(/^```json?\s*|\s*```$/g, ''));
    return new Response(JSON.stringify(parsed), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    const messageText = e instanceof Error ? e.message : 'Analysis failed';
    return new Response(JSON.stringify({ error: messageText }), { status: 502 });
  }
});
