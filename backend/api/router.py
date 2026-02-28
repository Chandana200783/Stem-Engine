from fastapi import APIRouter, UploadFile, File
from pydantic import BaseModel
from typing import Optional, Dict, List
import os
import shutil
import tempfile

router = APIRouter()

class SolveRequest(BaseModel):
    equation: str
    solve_for: Optional[str] = None
    known_variables: Optional[Dict[str, str]] = None # Example: {"m": "2 kg"}
    explanation_level: Optional[str] = "Step by Step"

class PlotRequest(BaseModel):
    equation: str

@router.post("/solve")
async def solve_equation(request: SolveRequest):
    from engine.solver import process_equation, _is_natural_language
    from engine.word_problem_solver import solve_word_problem

    eq = request.equation.strip()

    # Route natural language to the word problem solver
    if _is_natural_language(eq):
        result = solve_word_problem(eq, request.explanation_level)
        return result

    # Otherwise use the symbolic SymPy engine
    return process_equation(eq, request.solve_for, request.known_variables, request.explanation_level)

@router.post("/plot")
async def generate_plot(request: PlotRequest):
    from engine.plotter import process_plot
    return process_plot(request.equation)

@router.get("/formulas")
async def get_formulas():
    import json
    import os
    file_path = os.path.join(os.path.dirname(__file__), "..", "data", "formulas.json")
    try:
        with open(file_path, "r") as f:
            return json.load(f)
    except FileNotFoundError:
        return {"categories": []}

@router.get("/formulas/search")
async def search_formulas(q: str):
    import json
    import os
    file_path = os.path.join(os.path.dirname(__file__), "..", "data", "formulas.json")
    results = []
    try:
        with open(file_path, "r") as f:
            data = json.load(f)
            q = q.lower()
            for cat in data.get("categories", []):
                for topic in cat.get("topics", []):
                    for form in topic.get("formulas", []):
                        if (q in form["name"].lower() or 
                            q in form["description"].lower() or 
                            any(q in tag.lower() for tag in form.get("tags", [])) or
                            any(q in str(var).lower() for var in form.get("variables", {}))):
                            results.append(form)
    except FileNotFoundError:
        pass
    return {"results": results}

@router.post("/scan-image")
async def scan_image(file: UploadFile = File(...)):
    from engine.scanner import scanner
    
    # Save uploaded file to a temporary location
    with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(file.filename)[1]) as tmp:
        shutil.copyfileobj(file.file, tmp)
        tmp_path = tmp.name

    try:
        text = scanner.scan_image(tmp_path)
        
        # Check if scanning failed with a message
        if text.startswith("[Error"):
            return {"success": False, "error": text}
            
        questions = scanner.extract_questions(text)
        
        return {
            "success": True,
            "text": text,
            "questions": questions,
            "is_paper": len(questions) > 1
        }
    finally:
        # Clean up
        if os.path.exists(tmp_path):
            os.remove(tmp_path)
