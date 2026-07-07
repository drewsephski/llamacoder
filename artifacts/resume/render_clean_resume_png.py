from __future__ import annotations

from pathlib import Path
from textwrap import wrap

from PIL import Image, ImageDraw, ImageFont


BASE = Path(__file__).parent
OUT = BASE / "Drew_Sepeczi_Clean_Resume.png"

W, H = 1700, 2200
SHEET = (1540, 2040)
INK = "#111827"
MUTED = "#5d6675"
SOFT = "#eef2f7"
LINE = "#d9dee7"
ACCENT = "#2457d6"
ACCENT_DARK = "#153b94"
PAPER = "#ffffff"
WASH = "#f7f8fb"
CARD = "#fbfcff"

FONT_REGULAR = "/System/Library/Fonts/Supplemental/Arial.ttf"
FONT_BOLD = "/System/Library/Fonts/Supplemental/Arial Bold.ttf"


def font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(FONT_BOLD if bold else FONT_REGULAR, size=size)


def text_width(draw: ImageDraw.ImageDraw, text: str, fnt: ImageFont.FreeTypeFont) -> int:
    box = draw.textbbox((0, 0), text, font=fnt)
    return box[2] - box[0]


def fit_text(draw: ImageDraw.ImageDraw, text: str, fnt: ImageFont.FreeTypeFont, max_width: int) -> list[str]:
    words = text.split()
    lines: list[str] = []
    line = ""
    for word in words:
        candidate = word if not line else f"{line} {word}"
        if text_width(draw, candidate, fnt) <= max_width:
            line = candidate
        else:
            if line:
                lines.append(line)
            line = word
    if line:
        lines.append(line)
    return lines


def draw_wrapped(
    draw: ImageDraw.ImageDraw,
    text: str,
    xy: tuple[int, int],
    max_width: int,
    fnt: ImageFont.FreeTypeFont,
    fill: str = INK,
    line_gap: int = 8,
) -> int:
    x, y = xy
    line_height = fnt.size + line_gap
    for line in fit_text(draw, text, fnt, max_width):
        draw.text((x, y), line, font=fnt, fill=fill)
        y += line_height
    return y


def draw_rule_title(draw: ImageDraw.ImageDraw, title: str, x: int, y: int, width: int) -> int:
    fnt = font(28, bold=True)
    draw.text((x, y), title.upper(), font=fnt, fill=ACCENT_DARK)
    tw = text_width(draw, title.upper(), fnt)
    ry = y + 17
    draw.line((x + tw + 22, ry, x + width, ry), fill=LINE, width=2)
    return y + 48


def draw_bullet(draw: ImageDraw.ImageDraw, text: str, x: int, y: int, width: int) -> int:
    fnt = font(27)
    bullet_x = x
    text_x = x + 32
    draw.ellipse((bullet_x, y + 13, bullet_x + 8, y + 21), fill=INK)
    end = draw_wrapped(draw, text, (text_x, y), width - 32, fnt, fill="#263142", line_gap=8)
    return end + 8


def draw_role(
    draw: ImageDraw.ImageDraw,
    title: str,
    date: str,
    bullets: list[str],
    x: int,
    y: int,
    width: int,
) -> int:
    title_font = font(33, bold=True)
    date_font = font(25, bold=True)
    draw.text((x, y), title, font=title_font, fill=INK)
    dw = text_width(draw, date, date_font)
    draw.text((x + width - dw, y + 5), date, font=date_font, fill=MUTED)
    y += 47
    for item in bullets:
        y = draw_bullet(draw, item, x, y, width)
    return y + 18


def draw_product(draw: ImageDraw.ImageDraw, name: str, copy: str, x: int, y: int, w: int, h: int) -> None:
    draw.rounded_rectangle((x, y, x + w, y + h), radius=22, fill=CARD, outline="#e1e6ef", width=2)
    draw.text((x + 24, y + 21), name, font=font(28, bold=True), fill=INK)
    draw_wrapped(draw, copy, (x + 24, y + 62), w - 48, font(22), fill="#344153", line_gap=6)


def draw_pill(draw: ImageDraw.ImageDraw, text: str, x: int, y: int) -> tuple[int, int]:
    fnt = font(21, bold=True)
    pad_x = 18
    pad_y = 11
    tw = text_width(draw, text, fnt)
    w = tw + pad_x * 2
    h = fnt.size + pad_y * 2
    draw.rounded_rectangle((x, y, x + w, y + h), radius=h // 2, fill=PAPER, outline="#d9e1ee", width=2)
    draw.text((x + pad_x, y + pad_y - 1), text, font=fnt, fill="#263142")
    return w, h


def draw_pills(draw: ImageDraw.ImageDraw, items: list[str], x: int, y: int, width: int) -> int:
    cursor_x = x
    cursor_y = y
    row_h = 0
    for item in items:
        w, h = draw_pill(draw, item, -9999, -9999)
        if cursor_x != x and cursor_x + w > x + width:
            cursor_x = x
            cursor_y += row_h + 13
            row_h = 0
        draw_pill(draw, item, cursor_x, cursor_y)
        cursor_x += w + 13
        row_h = max(row_h, h)
    return cursor_y + row_h


def main() -> None:
    img = Image.new("RGB", (W, H), WASH)
    draw = ImageDraw.Draw(img)

    sx = (W - SHEET[0]) // 2
    sy = (H - SHEET[1]) // 2
    draw.rounded_rectangle((sx, sy, sx + SHEET[0], sy + SHEET[1]), radius=36, fill=PAPER, outline="#e4e7ee", width=2)

    top_h = 352
    draw.line((sx, sy + top_h, sx + SHEET[0], sy + top_h), fill=LINE, width=2)

    x = sx + 84
    y = sy + 76
    draw.text((x, y), "AI Product Engineer · Founder · Full-Stack Builder", font=font(31, bold=True), fill=ACCENT)
    y += 50
    draw.text((x, y), "Drew Sepeczi", font=font(88, bold=True), fill=INK)
    y += 122
    summary = (
        "I turn rough ideas into shipped AI products, tools, and infrastructure. Built 30+ web projects and "
        "10+ AI products across product strategy, UI, backend systems, AI workflows, billing, auth, deployment, "
        "and launch infrastructure."
    )
    draw_wrapped(draw, summary, (x, y), 1240, font(33), fill="#273244", line_gap=10)

    main_x = sx + 84
    main_y = sy + top_h + 58
    main_w = 940
    side_x = sx + 1068
    side_y = main_y
    side_w = 390
    draw.rectangle((sx + 1040, sy + top_h, sx + SHEET[0], sy + SHEET[1]), fill="#f8faff")
    draw.line((sx + 1040, sy + top_h, sx + 1040, sy + SHEET[1]), fill=LINE, width=2)

    y = draw_rule_title(draw, "Experience", main_x, main_y, main_w)
    y = draw_role(
        draw,
        "Founder · Portfolios.chat",
        "Feb 2026 - Present",
        [
            "Building an AI-native portfolio platform that turns resumes, GitHub, and LinkedIn profiles into conversational, recruiter-facing sites.",
            "Own ingestion, AI answer generation, SEO-oriented pages, deployment, launch execution, and subscription packaging.",
        ],
        main_x,
        y,
        main_w,
    )
    y = draw_role(
        draw,
        "Independent Consultant · Remote",
        "Sep 2024 - Jan 2026",
        [
            "Built SlotFlow, a multi-tenant event management platform with AI-powered scheduling that cut administrative overhead in half.",
            "Designed tenant-aware data flows, event optimization logic, and LLM recommendation pipelines for operational scheduling workflows.",
        ],
        main_x,
        y,
        main_w,
    )
    y = draw_role(
        draw,
        "Founder & Lead Engineer · Phoenix Agency",
        "Jul 2023 - Aug 2024",
        [
            "Founded a SaaS boilerplate and client MVP studio; launched NodeBase and Astra, a SaaS template that reached Top 15 on Product Hunt.",
            "Delivered client MVPs with reusable architecture across auth, billing, frontend systems, database design, and deployment.",
        ],
        main_x,
        y,
        main_w,
    )

    y = draw_rule_title(draw, "Selected Products", main_x, y + 8, main_w)
    products = [
        ("NodeBase", "Open-source visual studio for composing and sharing AI pipelines."),
        ("Portfolios.chat", "Conversational portfolio SaaS for recruiter follow-up questions."),
        ("RagBase", "Private document Q&A for PDFs and URLs with cited answers."),
        ("Trace", "Open-source Mac app for polished launch videos, GIFs, and demos."),
        ("Squido", "Terminal coding agent for developers working in real codebases."),
        ("SquidCrawl", "Edge-native scraper API with LLM-optimized output."),
    ]
    card_w = 452
    card_h = 151
    gap = 22
    for i, (name, copy) in enumerate(products):
        cx = main_x + (i % 2) * (card_w + gap)
        cy = y + (i // 2) * (card_h + gap)
        draw_product(draw, name, copy, cx, cy, card_w, card_h)

    y = side_y
    for title, lines in [
        (
            "Contact",
            [
                "Chicago, IL",
                "drewsepeczi@gmail.com",
                "drewsepeczi.xyz",
                "portfolios.chat",
                "github.com/drewsephski",
                "linkedin.com/in/drewsepeczi",
            ],
        ),
    ]:
        draw.text((side_x, y), title.upper(), font=font(25, bold=True), fill=ACCENT_DARK)
        y += 48
        for line in lines:
            y = draw_wrapped(draw, line, (side_x, y), side_w, font(25), fill="#263142", line_gap=7) + 9

    y += 25
    draw.text((side_x, y), "PROOF", font=font(25, bold=True), fill=ACCENT_DARK)
    y += 50
    for number, label in [("30+", "shipped web projects"), ("10+", "AI products built"), ("Open", "source maintainer")]:
        draw.rounded_rectangle((side_x, y, side_x + side_w, y + 104), radius=22, fill="#eef4ff", outline="#dce8ff", width=2)
        draw.text((side_x + 24, y + 18), number, font=font(39, bold=True), fill=ACCENT_DARK)
        draw.text((side_x + 24, y + 63), label, font=font(21, bold=True), fill="#334155")
        y += 122

    y += 22
    draw.text((side_x, y), "STRENGTHS", font=font(25, bold=True), fill=ACCENT_DARK)
    y = draw_pills(
        draw,
        [
            "AI Systems",
            "Full-Stack",
            "Prototyping",
            "API Design",
            "Databases",
            "Performance",
            "Product",
            "Launch",
        ],
        side_x,
        y + 46,
        side_w,
    )

    y += 44
    draw.text((side_x, y), "STACK", font=font(25, bold=True), fill=ACCENT_DARK)
    y = draw_pills(
        draw,
        [
            "TypeScript",
            "React",
            "Next.js",
            "Node.js",
            "Python",
            "PostgreSQL",
            "Supabase",
            "Redis",
            "Vercel AI SDK",
            "Electron",
        ],
        side_x,
        y + 46,
        side_w,
    )

    y += 44
    draw.text((side_x, y), "WRITING", font=font(25, bold=True), fill=ACCENT_DARK)
    draw_wrapped(
        draw,
        "Writes about production agent patterns, AI-first frontend architecture, and open protocols including MCP, A2A, and ACP.",
        (side_x, y + 46),
        side_w,
        font(24),
        fill="#344153",
        line_gap=8,
    )

    img.save(OUT)
    print(OUT)


if __name__ == "__main__":
    main()
