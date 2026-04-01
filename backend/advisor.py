import json
import os

import httpx


def _fallback_advice(top_label, top_confidence, severity, operator_note):
    repairable = severity != "critical"
    if severity == "critical" and top_confidence > 0.55:
        repairable = False
    priority = "immediate" if severity == "critical" else "same-shift" if severity == "warning" else "routine"
    actions = [
        "Capture high-resolution weld images from two additional angles.",
        "Run dye-penetrant or ultrasonic validation on the flagged zone.",
        "Document bead geometry and heat input settings for traceability.",
    ]
    if not repairable:
        actions.insert(0, "Quarantine component and escalate to metallurgical review.")
    if operator_note:
        actions.append(f"Operator note considered: {operator_note}")

    return {
        "source": "fallback",
        "repairable": repairable,
        "priority": priority,
        "summary": (
            f"{top_label} detected at {top_confidence:.1%} confidence with {severity} severity. "
            f"{'Repair attempt possible with controlled rework.' if repairable else 'High risk profile; replacement assessment advised.'}"
        ),
        "actions": actions,
    }


def _llm_advice(prompt, model, api_key, base_url):
    url = base_url.rstrip("/") + "/chat/completions"
    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": "You are a welding quality engineer AI. Return strict JSON only."},
            {"role": "user", "content": prompt},
        ],
        "temperature": 0.2,
    }
    headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}
    with httpx.Client(timeout=25.0) as client:
        res = client.post(url, headers=headers, json=payload)
        res.raise_for_status()
    data = res.json()
    content = data["choices"][0]["message"]["content"].strip()
    if content.startswith("```json"):
        content = content[7:]
    elif content.startswith("```"):
        content = content[3:]
    if content.endswith("```"):
        content = content[:-3]
    content = content.strip()
    
    parsed = json.loads(content)
    return {
        "source": "llm",
        "repairable": bool(parsed.get("repairable", False)),
        "priority": parsed.get("priority", "same-shift"),
        "summary": parsed.get("summary", "No summary from model."),
        "actions": parsed.get("actions", []),
    }


def generate_repair_advice(result, operator_note=""):
    top_label = result.get("top_label", "Unknown defect")
    top_confidence = float(result.get("top_confidence", 0.0))
    severity = result.get("severity", "warning")

    api_key = os.getenv("GROQ_API_KEY", "").strip()
    model = os.getenv("OPENAI_MODEL", "llama-3.3-70b-versatile").strip()
    base_url = os.getenv("OPENAI_BASE_URL", "https://api.groq.com/openai/v1").strip()

    prompt = (
        "Given this welding inspection result, return JSON with keys: "
        "repairable (bool), priority (one of immediate/same-shift/routine), "
        "summary (string), actions (array of 3-5 concise steps). "
        f"Defect={top_label}, confidence={top_confidence:.4f}, severity={severity}, operator_note={operator_note!r}."
    )

    if api_key:
        try:
            return _llm_advice(prompt, model, api_key, base_url)
        except Exception as e:
            print(f"LLM integration failed: {str(e)}")
            pass

    return _fallback_advice(top_label, top_confidence, severity, operator_note)
