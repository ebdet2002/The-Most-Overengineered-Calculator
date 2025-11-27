from fastapi import FastAPI, HTTPException

app = FastAPI()

@app.get("/")
def subtract(a: float, b: float):
    return {"result": a - b}
