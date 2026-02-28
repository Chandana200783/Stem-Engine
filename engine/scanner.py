import re
import os
from typing import List, Dict, Any, Optional

try:
    import pytesseract
    from PIL import Image
    HAS_OCR = True
except ImportError:
    HAS_OCR = False

class Scanner:
    def __init__(self):
        # Only set hardcoded path if on Windows local
        if os.name == 'nt' and os.path.exists(r'C:\Program Files\Tesseract-OCR\tesseract.exe'):
            pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

    def scan_image(self, image_path: str) -> str:
        """
        Extract text from image using OCR.
        If OCR tools are missing, returns a friendly error message.
        """
        if not HAS_OCR:
            return "[Error: OCR libraries (pytesseract, Pillow) not installed on server.]"
        
        try:
            # Check if tesseract is in PATH (standard for Linux/Vercel if installed via packages)
            # Note: Vercel standard environment doesn't have tesseract
            text = pytesseract.image_to_string(Image.open(image_path))
            return text
        except Exception as e:
            if "tesseract is not installed" in str(e).lower() or "no such file" in str(e).lower():
                return "[Error: Tesseract OCR is not available in this environment (Vercel). Please type your problem manually or use the Dictate feature.]"
            return f"[Error scanning image: {str(e)}]"

    def extract_questions(self, text: str) -> List[str]:
        """
        Splits a block of text into individual questions.
        Looks for common numbering patterns.
        """
        # Clean text
        text = text.replace('\r', '')
        
        # Patterns for question starts:
        # 1. 1) Q1. Q.1 [1]
        patterns = [
            r'\n\s*\d+[\.\)]\s+', # 1. or 1)
            r'\n\s*Q(?:uestion)?\s*\.?\s*\d+\s*[\.\:\-]?\s*', # Q1. Q1: Question 1
            r'\n\s*\[\d+\]\s+', # [1]
        ]
        
        # Normalize: prepend a newline to catch the first question if it's at the start
        text = '\n' + text
        
        # Find all split points
        split_indices = []
        for pat in patterns:
            for match in re.finditer(pat, text):
                split_indices.append(match.start())
        
        split_indices = sorted(list(set(split_indices)))
        
        if not split_indices:
            # If no clear numbers, but text is long, maybe it's just one question
            # Strip preamble/noise
            return [text.strip()]
        
        questions = []
        for i in range(len(split_indices)):
            start = split_indices[i]
            end = split_indices[i+1] if i + 1 < len(split_indices) else len(text)
            q_text = text[start:end].strip()
            
            # Remove the numbering part from the beginning of the question text
            for pat in patterns:
                q_text = re.sub('^' + pat.replace('\\n\\s*', ''), '', q_text).strip()
            
            if len(q_text) > 5: # Basic filter for noise
                questions.append(q_text)
        
        return questions

scanner = Scanner()
