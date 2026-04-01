import os
import json
import httpx
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict

router = APIRouter()

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]

@router.post("/chat")
def chat_endpoint(payload: ChatRequest):
    api_key = os.getenv("GROQ_API_KEY", "").strip()
    model = os.getenv("OPENAI_MODEL", "llama-3.3-70b-versatile").strip()
    base_url = os.getenv("OPENAI_BASE_URL", "https://api.groq.com/openai/v1").strip()

    if not api_key:
        raise HTTPException(status_code=500, detail="LLM API key not configured.")

    url = base_url.rstrip("/") + "/chat/completions"
    
    # Prepend the system prompt
    formatted_messages = [
        {"role": "system", "content": "You are a highly knowledgeable and professional Welding Quality Engineer AI Assistant. Your goal is to help operators troubleshoot welding defects, discuss metallurgy, recommend TIG/MIG/Arc welding parameters, and provide safety guidelines. Always be concise, practical, and highly accurate. Maintain a supportive and direct tone."}
    ]
    
    for msg in payload.messages:
        formatted_messages.append({"role": msg.role, "content": msg.content})

    api_payload = {
        "model": model,
        "messages": formatted_messages,
        "temperature": 0.5,
    }

    headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}
    
    try:
        with httpx.Client(timeout=30.0) as client:
            res = client.post(url, headers=headers, json=api_payload)
            res.raise_for_status()
        
        data = res.json()
        content = data["choices"][0]["message"]["content"].strip()
        
        return {"response": content}
        
    except httpx.HTTPStatusError as e:
        error_detail = e.response.text if e.response else str(e)
        print(f"LLM API Error: {error_detail}")
        raise HTTPException(status_code=e.response.status_code if e.response else 500, detail=f"Failed to communicate with LLM provider: {error_detail}")
    except Exception as e:
        print(f"Internal Chat Error: {str(e)}")
        raise HTTPException(status_code=500, detail="An internal error occurred while processing your request.")
