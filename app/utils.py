import re

# -------- helpers shared by multiple routes ---------------- #

LOTPLAN_RE = re.compile(r"^(\d+)([A-Z].+)$")


def parse_user_input(inp: str):
    """
    Return parsing info:
        * ('NSW', lot, section, plan)  – if user typed 3-part or 2-part Lot/Plan
        * ('QLD', lot, None, plan)     – if user typed QLD style LotPlan
        * (None, None, None, None)     – if parsing failed
    """
    inp = inp.strip().upper()
    if not inp:
        return None, None, None, None

    # NSW formats  ----  "43/DP12345"   or  "43/1/DP12345"
    if "/" in inp:
        parts = [p.strip() for p in inp.split("/")]
        if len(parts) == 3:
            return "NSW", parts[0], parts[1], parts[2]  # lot / section / plan
        if len(parts) == 2:
            return "NSW", parts[0], None, parts[1]      # lot / plan
        return None, None, None, None

    # QLD format  ----  "3RP123456"
    m = LOTPLAN_RE.match(inp)
    if m:
        return "QLD", m.group(1), None, m.group(2)

    return None, None, None, None
