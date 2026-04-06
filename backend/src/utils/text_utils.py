import re


def safe_format(template: str, **kwargs) -> str:
    esc = {}
    for k, v in kwargs.items():
        esc[k] = v.replace("{", "{{").replace("}", "}}") if isinstance(v, str) else v
    return template.format(**esc)


def pre_sanitize(text: str) -> str:
    if text is None:
        return ""
    t = str(text).strip()
    fence = "`" * 3
    if t.startswith(fence):
        t = re.sub(r"^`{3}(?:json)?\s*", "", t, flags=re.IGNORECASE)
        t = re.sub(r"\s*`{3}$", "", t)
    bad = ("\u00a0", "\u2009", "\u200a", "\u202f", "\u2007", "\u2060")
    t = "".join(ch for ch in t if ch.isprintable() and ch not in bad)
    t = t.replace("\u200b", "").replace("\u200c", "").replace("\u200d", "")
    return t
