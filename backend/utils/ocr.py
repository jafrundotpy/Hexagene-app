import easyocr
import re
import logging

logger = logging.getLogger(__name__)

# Initialize reader globally so the model is only loaded once
reader = easyocr.Reader(['en'], gpu=False)

def extract_health_data(image_path: str) -> dict:
    try:
        # Run EasyOCR
        results = reader.readtext(image_path)
        
        # Combine all text
        text = " ".join([res[1] for res in results])
        logger.info(f"OCR Raw Text: {text}")
        
        extracted = {}
        
        # Sleep
        sleep_match = re.search(r'(?i)(?:sleep|asleep).*?(\d+)\s*(?:h|hr|hours?).*?(\d+)\s*(?:m|min|minutes?)', text)
        if sleep_match:
            extracted['sleep'] = round(float(sleep_match.group(1)) + float(sleep_match.group(2))/60.0, 2)
        else:
            sleep_simple = re.search(r'(?i)(?:sleep|asleep).*?(\d+(?:\.\d+)?)', text)
            if sleep_simple:
                extracted['sleep'] = float(sleep_simple.group(1))

        # Steps
        steps_match = re.search(r'(?i)(\d{1,3}(?:,\d{3})*|\d+)\s*steps', text)
        if not steps_match:
            steps_match = re.search(r'(?i)steps.*?(\d{1,3}(?:,\d{3})*|\d+)', text)
        if steps_match:
            extracted['steps'] = int(steps_match.group(1).replace(',', ''))

        # Heart Rate
        hr_match = re.search(r'(?i)(\d+)\s*(?:bpm|beats)', text)
        if not hr_match:
            hr_match = re.search(r'(?i)(?:resting hr|heart rate).*?(\d+)', text)
        if hr_match:
            extracted['heart_rate'] = int(hr_match.group(1))

        # HRV
        hrv_match = re.search(r'(?i)(\d+)\s*ms', text)
        if not hrv_match:
            hrv_match = re.search(r'(?i)hrv.*?(\d+)', text)
        if hrv_match:
            extracted['hrv'] = int(hrv_match.group(1))

        # VO2 Max
        vo2_match = re.search(r'(?i)(\d+(?:\.\d+)?)\s*vo2', text)
        if not vo2_match:
            vo2_match = re.search(r'(?i)vo2.*?(\d+(?:\.\d+)?)', text)
        if vo2_match:
            extracted['vo2_max'] = int(float(vo2_match.group(1)))

        # Active Minutes
        active_match = re.search(r'(?i)(\d+)\s*(?:active|activity)', text)
        if not active_match:
            active_match = re.search(r'(?i)active.*?(\d+)', text)
        if active_match:
            extracted['active_minutes'] = int(active_match.group(1))

        logger.info(f"Parsed OCR Data: {extracted}")
        return extracted
    except Exception as e:
        logger.error(f"OCR Extraction error: {e}")
        return {}
