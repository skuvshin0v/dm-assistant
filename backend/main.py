from dotenv import load_dotenv
from pathlib import Path
load_dotenv(Path(__file__).parent / ".env.local") or load_dotenv(Path(__file__).parent / ".env")

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers.record import router as record_router

app = FastAPI(title="DM Assistant API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(record_router)


@app.get("/health")
def health():
    return {"status": "ok"}
