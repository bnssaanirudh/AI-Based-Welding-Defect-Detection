# Welding AI App 2.0: Complete System Setup Guide

This document is a comprehensive, step-by-step tutorial on how to take this project folder and successfully run the full Artificial Intelligence pipeline and Web Application on a completely new computer or server.

## System Prerequisites
Before you begin, ensure the new machine has the following foundational software installed:
1. **Python 3.10+**: Required for the FastAPI AI backend. (Download from python.org)
2. **Node.js (LTS version)**: Required for the React/Vite frontend. (Download from nodejs.org)
3. **Git**: (Optional, but recommended)

---

## Part 1: Setting up the AI Python Backend
The backend powers the image segmentation models, the SQLite database, and the LLM Assistant.

### 1. Open a Terminal and Navigate to the Project Root
Open your command prompt or terminal and `cd` into the main project folder containing the `backend` directory.

### 2. Create a Virtual Environment (Recommended)
To prevent dependency conflicts on the new computer, it is highly recommended to create an isolated Python virtual environment.
```bash
python -m venv venv
```

### 3. Activate the Virtual Environment
- **On Windows:**
  ```cmd
  venv\Scripts\activate
  ```
- **On Mac / Linux:**
  ```bash
  source venv/bin/activate
  ```

### 4. Install Backend Dependencies
With the virtual environment activated, install all the required AI python packages like PyTorch, FastAPI, etc.
```bash
pip install -r requirements.txt
```
*(Note: If the new machine has a dedicated NVIDIA GPU, you may want to install the CUDA-specific version of PyTorch from pytorch.org to dramatically speed up inference.)*

### 5. Verify the AI Model File Exists
Ensure that the computer vision model weights file exists at the following path:
`model/steel_segmentation_fast_model.pth`

### 6. Start the Backend Server
Start the Uvicorn web server hosting FastAPI.
```bash
python -m backend.main
```
If successful, you will see a message indicating the server is running on `http://127.0.0.1:8000`.

---

## Part 2: Setting up the React Web App (Frontend)
The frontend is the premium UI where users actually interact with the system.

### 1. Open a New Terminal Tab
Leave the Python backend running in the first terminal. Open a second terminal window.

### 2. Navigate to the Web App Directory
```bash
cd web_app
```

### 3. Install Node Dependencies
Because this is a new machine, you must download all the `node_modules` required by the React application.
```bash
npm install
```

### 4. Start the Frontend Server
Once installation completes, launch the Vite development server.
```bash
npm run dev
```

### 5. Access the Application
The terminal will provide a local URL, typically `http://localhost:5173/`. Open this address in any modern web browser (Chrome, Edge, Safari).

---

## Part 3: Configuration Notes
### The Groq API Key (AI Assistant)
The sophisticated natural language AI Assistant relies on the Groq API for Llama-3 inference.
Currently, this is hardcoded to a secure fallback key inside `backend/advisor.py`. If you want to use a completely different API key on the new system, simply set the `OPENAI_API_KEY` system environment variable, and the backend will automatically prioritize it.

### The SQLite Database
The dashboard statistics and history reports read from an SQLite database. Upon the very first successful startup on the new machine, the backend will automatically generate the `welding_history.db` file in the root directory. No manual SQL setup is required!

Everything is containerized to work perfectly out of the box. Happy welding analysis!
