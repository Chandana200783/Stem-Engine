import pytesseract
from PIL import Image
import re
import os

# Explicitly set Tesseract path for Windows
pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

class STEMScanner:
    def __init__(self):
        # Tesseract configuration
        self.config = '--oem 3 --psm 6'

    def scan_image(self, image_path):
        """
        Extract text from an image using Tesseract OCR.
        """
        try:
            image = Image.open(image_path)
            text = pytesseract.image_to_string(image, config=self.config)
            return text.strip()
        except Exception as e:
            return f"[Error] Scanning failed: {str(e)}"

    def extract_questions(self, text):
        """
        Extract individual questions from the scanned text.
        """
        if not text:
            return []

        # Simple split logic based on numbers or keywords
        # 1. Split by newline followed by number and dot/parenthesis
        # Example: "1.", "2)", "Q1:", "Question 1."
        patterns = [
            r'\n\s*\d+[\.\)]\s+',
            r'\n\s*Q(?:uestion)?\s*\.?\s*\d+\s*[\.\:\-]?\s*',
            r'\n\s*\[\d+\]\s*'
        ]
        
        # Combine patterns
        combined_pattern = '|'.join(patterns)
        
        # We also want to handle the first question if it doesn't start with a newline
        if re.match(r'^(?:\d+[\.\)]|Q(?:uestion)?\s*\d+)', text.strip()):
            # If starts with a question marker, we might need a dummy prefix to split correctly
            text = "\n" + text
            
        parts = re.split(combined_pattern, text)
        
        # Filter out empty or very short snippets
        questions = [q.strip() for q in parts if q.strip() and len(q.strip()) > 5]
        
        # If no questions were split but there is text, treat whole thing as one question
        if not questions and text.strip():
            questions = [text.strip()]
            
        return questions

scanner = STEMScanner()
