import openpyxl
from openpyxl.drawing.image import Image
from datetime import datetime
import sys
import json
import os
import io
import warnings

# Suppress potential library warnings that can corrupt the binary stream
warnings.filterwarnings("ignore", category=UserWarning)

def cm_to_pixels(cm):
    return int((cm / 2.54) * 96)

def to_up(val):
    return str(val).upper().strip() if val else ""

def process_excel(data):
    try:
        # Load paths relative to script location
        script_dir = os.path.dirname(os.path.abspath(__file__))
        template_path = os.path.join(script_dir, "data", "APPLICATION-for-MARRIAGE-LICENSE.xlsx")
        img_path = os.path.join(script_dir, "data", "couple_img.png")
        
        if not os.path.exists(template_path):
            sys.stderr.write(f"Error: Template not found at {template_path}\n")
            os._exit(1)

        wb = openpyxl.load_workbook(template_path)
        
        # Date Calculations
        now = datetime.now()
        day_now = str(now.day)
        month_now = now.strftime("%B").upper()
        year_now = str(now.year)

        # Helper to safely get integers
        def get_int(key):
            val = data.get(key, 0)
            try:
                return int(val) if val else 0
            except:
                return 0

        # DATA EXTRACTION
        g_age = get_int("gAge")
        b_age = get_int("bAge")
        
        g_town_prov = to_up(f"{data.get('gTown', '')}, {data.get('gProv', 'NUEVA VIZCAYA')}")
        b_town_prov = to_up(f"{data.get('bTown', '')}, {data.get('bProv', 'NUEVA VIZCAYA')}")
        g_full_addr = to_up(f"{data.get('gBrgy', '')}, {g_town_prov}")
        b_full_addr = to_up(f"{data.get('bBrgy', '')}, {b_town_prov}")

        # Image Logic
        if os.path.exists(img_path) and "Notice" in wb.sheetnames:
            try:
                couple_img = Image(img_path)
                couple_img.height = cm_to_pixels(3.75)
                couple_img.width = cm_to_pixels(5.73)
                wb["Notice"].add_image(couple_img, "T11")
            except Exception as e:
                sys.stderr.write(f"Warning: Image overlay failed: {e}\n")

        # MAIN APPLICATION SHEET MAPPING
        if "APPLICATION" not in wb.sheetnames:
            sys.stderr.write("Error: 'APPLICATION' sheet missing in template\n")
            os._exit(1)
            
        app = wb["APPLICATION"]
        
        # Groom
        app['B8'], app['B9'], app['B10'] = to_up(data.get("gFirst")), to_up(data.get("gMiddle")), to_up(data.get("gLast"))
        app['B11'], app['N11'] = to_up(data.get("gBday")), g_age
        app['B12'], app['L12'] = to_up(data.get("gBirthPlace") or g_town_prov), to_up(data.get("gCountry", "PHILIPPINES"))
        app['B13'], app['H13'] = "MALE", to_up(data.get("gCitizen", "FILIPINO"))
        app['B15'], app['M15'] = g_full_addr, to_up(data.get("gCountry", "PHILIPPINES"))
        app['B16'], app['B17'] = to_up(data.get("gReligion")), to_up(data.get("gStatus", "SINGLE"))
        
        # Parents & Givers (Groom)
        app['B22'], app['H22'], app['L22'] = to_up(data.get("gFathF")), to_up(data.get("gFathM")), to_up(data.get("gFathL"))
        app['B26'], app['G26'], app['K26'] = to_up(data.get("gMothF")), to_up(data.get("gMothM")), to_up(data.get("gMothL"))
        if 18 <= g_age <= 24:
            app['B30'], app['H30'], app['L30'] = to_up(data.get("gGiverF")), to_up(data.get("gGiverM")), to_up(data.get("gGiverL"))
            app['B31'], app['B32'] = to_up(data.get("gGiverRelation")), to_up(data.get("gCitizen", "FILIPINO"))

        # Bride
        app['U8'], app['U9'], app['U10'] = to_up(data.get("bFirst")), to_up(data.get("bMiddle")), to_up(data.get("bLast"))
        app['U11'], app['AF11'] = to_up(data.get("bBday")), b_age
        app['U12'], app['AE12'] = to_up(data.get("bBirthPlace") or b_town_prov), to_up(data.get("bCountry", "PHILIPPINES"))
        app['U13'], app['Z13'] = "FEMALE", to_up(data.get("bCitizen", "FILIPINO"))
        app['U15'], app['AF15'] = b_full_addr, to_up(data.get("bCountry", "PHILIPPINES"))
        app['U16'], app['U17'] = to_up(data.get("bReligion")), to_up(data.get("bStatus", "SINGLE"))

        # Parents & Givers (Bride)
        app['U22'], app['Y22'], app['AC22'] = to_up(data.get("bFathF")), to_up(data.get("bFathM")), to_up(data.get("bFathL"))
        app['U26'], app['Y26'], app['AD26'] = to_up(data.get("bMothF")), to_up(data.get("bMothM")), to_up(data.get("bMothL"))
        if 18 <= b_age <= 24:
            app['U30'], app['Y30'], app['AD30'] = to_up(data.get("bGiverF")), to_up(data.get("bGiverM")), to_up(data.get("bGiverL"))
            app['U31'], app['U32'] = to_up(data.get("bGiverRelation")), to_up(data.get("bCitizen", "FILIPINO"))

        # Common Footer Info
        app['B37'], app['U37'], app['E37'], app['W37'], app['L37'], app['AD37'] = day_now, day_now, month_now, month_now, year_now, year_now
        app['B38'] = app['U38'] = "SOLANO, NUEVA VIZCAYA"

        # Sheet Visibility Logic
        is_groom_ext = g_town_prov != "SOLANO, NUEVA VIZCAYA"
        is_bride_ext = b_town_prov != "SOLANO, NUEVA VIZCAYA"
        
        sheets_to_keep = ["APPLICATION", "Notice"]
        
        # Age-based Consent/Advice Sheets
        extra_sheet = None
        if 18 <= b_age <= 20 and g_age >= 25: extra_sheet = "CONSENT F"
        elif 18 <= g_age <= 20 and b_age >= 25: extra_sheet = "CONSENT M"
        elif 18 <= b_age <= 20 and 18 <= g_age <= 20: extra_sheet = "CONSENT M&F"
        elif 21 <= b_age <= 24 and g_age >= 25: extra_sheet = "ADVICE F"
        elif 21 <= g_age <= 24 and b_age >= 25: extra_sheet = "ADVICE M"
        elif 21 <= b_age <= 24 and 21 <= g_age <= 24: extra_sheet = "ADVICE M&F"
        elif 21 <= g_age <= 24 and 18 <= b_age <= 20: extra_sheet = "ADVICE M-CONSENT F"
        elif 21 <= b_age <= 24 and 18 <= g_age <= 20: extra_sheet = "ADVICE F-CONSENT M"
        
        if extra_sheet: sheets_to_keep.append(extra_sheet)
        if is_groom_ext or is_bride_ext: sheets_to_keep.extend(["AddressBACKnotice", "EnvelopeAddress"])

        # Delete unwanted sheets
        for s in wb.sheetnames:
            if s not in sheets_to_keep:
                del wb[s]

        # OUTPUT STREAMS
        output = io.BytesIO()
        wb.save(output)
        output.seek(0)
        
        sys.stdout.buffer.write(output.read())
        sys.stdout.buffer.flush()
        os._exit(0)

    except Exception as e:
        sys.stderr.write(f"Error during processing: {str(e)}\n")
        os._exit(1)

if __name__ == "__main__":
    # Wait for input from stdin (Next.js sends data here)
    try:
        input_raw = sys.stdin.read()
        if not input_raw:
            sys.stderr.write("No data received\n")
            os._exit(1)
        
        input_json = json.loads(input_raw)
        process_excel(input_json)
    except Exception as e:
        sys.stderr.write(f"Startup Error: {str(e)}\n")
        os._exit(1)