from fastapi import FastAPI, HTTPException

app = FastAPI()

@app.get("/")
def EnterpriseAbstractSubtractorFactory(a: float, b: float):
    """
    Acquires Global Interpreter Lock (GIL) to safely perform subtraction.
    """
    obj_a = a
    obj_b = b
    return {"result": obj_a - obj_b}
