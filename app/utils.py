"""
Shared helper functions.
"""
from __future__ import annotations

import re
from typing import Optional, Tuple

# e.g. 3RP123456, 12SP789, 101CP1234
LOTPLAN_RE = re.compile(r"^(\d+)([A-Z]{1,3}[0-9]+)$")


def parse_user_input(inp: str) -> Tuple[Optional[str], Optional[str], Optional[str], Optional[str]]:
    """
    Convert whatever the user typed into a normalised tuple.

    Returns
    -------
    (region, lot, section, plan)
        region  – "NSW", "QLD" or None (unknown)
        lot     – Lot number as string (or None)
        section – Section number (NSW only) or None
        plan    – Plan label (e.g. DP12345, RP123456) or None
    """
    inp = inp.strip().upper()
    if not inp:
        return None, None, None, None

    # NSW formats → "43/DP12345" or "43/1/DP12345"
    if "/" in inp:
        parts = [p.strip() for p in inp.split("/")]
        if len(parts) == 3:
            return "NSW", parts[0], parts[1], parts[2]          # lot / section / plan
        if len(parts) == 2:
            return "NSW", parts[0], None, parts[1]              # lot / plan
        return None, None, None, None

    # QLD format → "3RP123456"
    m = LOTPLAN_RE.match(inp)
    if m:
        return "QLD", m.group(1), None, m.group(2)

    return None, None, None, None
