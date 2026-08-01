from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import inch
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen.canvas import Canvas
from reportlab.platypus import (
    BaseDocTemplate,
    Frame,
    KeepTogether,
    PageTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)


ROOT = Path(__file__).resolve().parents[2]
OUTPUT = ROOT / "output" / "pdf" / "Drew Sepeczi - AI Engineer Resume - 2026.pdf"
OUTPUT.parent.mkdir(parents=True, exist_ok=True)

FONT_DIR = Path("/System/Library/Fonts/Supplemental")
pdfmetrics.registerFont(TTFont("Arial", str(FONT_DIR / "Arial.ttf")))
pdfmetrics.registerFont(TTFont("Arial-Bold", str(FONT_DIR / "Arial Bold.ttf")))

NAVY = colors.HexColor("#101827")
BLUE = colors.HexColor("#0E5485")
TEXT = colors.HexColor("#172033")
MUTED = colors.HexColor("#516073")
RULE = colors.HexColor("#9CA9B8")


class ResumeDocTemplate(BaseDocTemplate):
    def __init__(self, filename: str):
        super().__init__(
            filename,
            pagesize=letter,
            leftMargin=0.43 * inch,
            rightMargin=0.43 * inch,
            topMargin=0.33 * inch,
            bottomMargin=0.28 * inch,
            title="Drew Sepeczi - AI Engineer Resume",
            author="Drew Sepeczi",
            subject="Applied AI Engineer and Full-Stack Product Engineer Resume",
        )
        frame = Frame(
            self.leftMargin,
            self.bottomMargin,
            self.width,
            self.height,
            leftPadding=0,
            rightPadding=0,
            topPadding=0,
            bottomPadding=0,
        )
        self.addPageTemplates(PageTemplate(id="resume", frames=[frame]))


class ResumeCanvas(Canvas):
    def __init__(self, *args, **kwargs):
        kwargs.setdefault("initialFontName", "Arial")
        kwargs.setdefault("initialFontSize", 9)
        super().__init__(*args, **kwargs)


styles = {
    "name": ParagraphStyle(
        "name",
        fontName="Arial-Bold",
        fontSize=20.5,
        leading=21.5,
        textColor=NAVY,
        alignment=TA_CENTER,
        spaceAfter=0,
    ),
    "title": ParagraphStyle(
        "title",
        fontName="Arial-Bold",
        fontSize=10.8,
        leading=12,
        textColor=MUTED,
        alignment=TA_CENTER,
        spaceAfter=1,
    ),
    "contact": ParagraphStyle(
        "contact",
        fontName="Arial",
        fontSize=8.4,
        leading=10,
        textColor=MUTED,
        alignment=TA_CENTER,
        spaceAfter=0,
    ),
    "section": ParagraphStyle(
        "section",
        fontName="Arial-Bold",
        fontSize=10.9,
        leading=12.2,
        textColor=BLUE,
        borderColor=RULE,
        borderWidth=0,
        borderPadding=0,
        spaceBefore=5.2,
        spaceAfter=2.1,
    ),
    "body": ParagraphStyle(
        "body",
        fontName="Arial",
        fontSize=9.45,
        leading=11.35,
        textColor=TEXT,
        alignment=TA_LEFT,
        spaceAfter=0,
    ),
    "skills": ParagraphStyle(
        "skills",
        parent=None,
        fontName="Arial",
        fontSize=9.15,
        leading=10.85,
        textColor=TEXT,
        spaceAfter=0.25,
    ),
    "role": ParagraphStyle(
        "role",
        fontName="Arial-Bold",
        fontSize=9.65,
        leading=11.2,
        textColor=NAVY,
        spaceAfter=0,
    ),
    "date": ParagraphStyle(
        "date",
        fontName="Arial-Bold",
        fontSize=9.35,
        leading=11.2,
        textColor=NAVY,
        alignment=TA_RIGHT,
        spaceAfter=0,
    ),
    "bullet": ParagraphStyle(
        "bullet",
        fontName="Arial",
        fontSize=9.1,
        leading=11.05,
        textColor=TEXT,
        leftIndent=10,
        firstLineIndent=-10,
        spaceAfter=1.0,
    ),
    "project": ParagraphStyle(
        "project",
        fontName="Arial-Bold",
        fontSize=9.45,
        leading=10.8,
        textColor=NAVY,
        spaceAfter=0,
    ),
    "link": ParagraphStyle(
        "link",
        fontName="Arial",
        fontSize=8.95,
        leading=10.8,
        textColor=BLUE,
        alignment=TA_RIGHT,
        spaceAfter=0,
    ),
    "education": ParagraphStyle(
        "education",
        fontName="Arial",
        fontSize=9.35,
        leading=11,
        textColor=TEXT,
        spaceAfter=0,
    ),
}


def section(title: str):
    return KeepTogether(
        [
            Paragraph(title, styles["section"]),
            Table(
                [[""]],
                colWidths=[7.64 * inch],
                rowHeights=[0.6],
                style=TableStyle(
                    [
                        ("FONTNAME", (0, 0), (-1, -1), "Arial"),
                        ("LINEABOVE", (0, 0), (-1, -1), 0.65, RULE),
                        ("LEFTPADDING", (0, 0), (-1, -1), 0),
                        ("RIGHTPADDING", (0, 0), (-1, -1), 0),
                        ("TOPPADDING", (0, 0), (-1, -1), 0),
                        ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
                    ]
                ),
            ),
        ]
    )


def role_header(company: str, title: str, dates: str):
    return Table(
        [[Paragraph(f"{company}  |  {title}", styles["role"]), Paragraph(dates, styles["date"])]],
        colWidths=[5.95 * inch, 1.69 * inch],
        style=TableStyle(
            [
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 0),
                ("RIGHTPADDING", (0, 0), (-1, -1), 0),
                ("TOPPADDING", (0, 0), (-1, -1), 0),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 0.5),
            ]
        ),
    )


def bullet(text: str):
    # ASCII hyphens are intentionally used for maximum ATS compatibility.
    return Paragraph(f"- {text}", styles["bullet"])


def project_header(name: str, label: str, url: str):
    return Table(
        [[Paragraph(name, styles["project"]), Paragraph(f'<link href="{url}" color="#0E5485">{label}</link>', styles["link"])]],
        colWidths=[5.2 * inch, 2.44 * inch],
        style=TableStyle(
            [
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 0),
                ("RIGHTPADDING", (0, 0), (-1, -1), 0),
                ("TOPPADDING", (0, 0), (-1, -1), 0),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
            ]
        ),
    )


story = [
    Paragraph("DREW SEPECZI", styles["name"]),
    Paragraph("APPLIED AI ENGINEER  |  FULL-STACK PRODUCT ENGINEER", styles["title"]),
    Paragraph(
        'Fox River Grove, IL  |  224-343-1711  |  <link href="mailto:drewsepeczi@gmail.com" color="#0E5485">drewsepeczi@gmail.com</link>  |  '
        '<link href="https://www.linkedin.com/in/drewsepeczi/" color="#0E5485">linkedin.com/in/drewsepeczi</link>  |  '
        '<link href="https://github.com/drewsephski/" color="#0E5485">github.com/drewsephski</link>',
        styles["contact"],
    ),
    Paragraph(
        '<link href="https://drewsepeczi.xyz" color="#0E5485">drewsepeczi.xyz</link>  |  '
        '<link href="https://squidagent.app" color="#0E5485">squidagent.app</link>',
        styles["contact"],
    ),
    section("SUMMARY"),
    Paragraph(
        "Applied AI and full-stack engineer who builds production AI products from architecture through launch. "
        "Shipped 12+ applications spanning LLM orchestration, streaming agents, structured generation, RAG, "
        "multi-tenant SaaS, usage billing, and automated verification using TypeScript, Next.js, Python, PostgreSQL, and cloud infrastructure.",
        styles["body"],
    ),
    section("TECHNICAL SKILLS"),
    Paragraph("<b>AI Systems:</b> Vercel AI SDK, OpenRouter, LLM orchestration, structured outputs, tool calling, RAG, agents, embeddings, vector search", styles["skills"]),
    Paragraph("<b>Engineering:</b> TypeScript, JavaScript, Python, React, Next.js, Node.js, REST, GraphQL, streaming APIs", styles["skills"]),
    Paragraph("<b>Data &amp; Cloud:</b> PostgreSQL, Prisma, Supabase, Redis, Docker, AWS, Vercel, CI/CD", styles["skills"]),
    Paragraph("<b>Product Systems:</b> Stripe subscriptions and usage billing, OAuth, Better Auth, multi-tenant SaaS, observability, automated testing", styles["skills"]),
    section("EXPERIENCE"),
    role_header("Squid Agent", "Creator &amp; Lead Engineer", "Mar 2026 - Present"),
    bullet("Built and launched a production AI application builder that turns prompts, pasted screenshots, and website references into functional React applications with live preview and iterative editing."),
    bullet("Architected multi-route LLM orchestration for research, clarification, planning, and code generation using streamed execution, structured outputs, request-scoped capability controls, and requirement-completeness safeguards."),
    bullet("Owned the end-to-end SaaS platform: multi-model access, authentication, subscriptions and usage billing, per-model cost attribution, project versioning, code export, and automated static and runtime verification."),
    role_header("Phoenix Agency", "Founder &amp; Lead AI Engineer", "Jan 2026 - May 2026"),
    bullet("Shipped AI-enabled SaaS products and reusable production architecture spanning authentication, billing, PostgreSQL data models, deployment, observability, and LLM workflows."),
    bullet("Led product discovery through launch across client and internal products; the Astra template reached Product Hunt's daily top 15."),
    role_header("Independent Consultant", "AI / Full-Stack Engineer (Contract)", "Oct 2025 - Jan 2026"),
    bullet("Built SlotFlow, a multi-tenant event automation platform with AI-assisted planning, recurring events, public claims and waitlists, organizer controls, and notification workflows."),
    bullet("Integrated conversational and API-driven automation to reduce repetitive organizer work and improve participant follow-through."),
    section("SELECTED PROJECTS"),
    project_header("SquidCrawl", "squidcrawl.dev", "https://squidcrawl.dev"),
    bullet("Built an edge-native search and scraping API that converts web pages into clean, LLM-ready content for agents and RAG pipelines without headless-browser overhead for typical HTML."),
    project_header("Trace", "trace.builders", "https://trace.builders"),
    bullet("Shipped a cross-platform, local-first workspace for running AI agents with filesystem access, MCP integrations, and approval-controlled actions (v2.1.x)."),
    project_header("RagBase", "ragbase.dev", "https://ragbase.dev"),
    bullet("Shipped private in-browser document Q&amp;A with file and URL ingestion, cited answers, model choice, and no-signup onboarding."),
    project_header("NodeBase", "github.com/drewsephski/nodebase", "https://github.com/drewsephski/nodebase"),
    bullet("Created an open-source node editor for composing, running, and extending AI workflows and external integrations."),
    section("EDUCATION"),
    Table(
        [
            [Paragraph("Harper College  |  AI and Cloud Computing", styles["education"]), Paragraph("Expected 2028", styles["date"])],
            [Paragraph("TripleTen Academy  |  Software Engineering", styles["education"]), Paragraph("2024 - 2025", styles["date"])],
        ],
        colWidths=[6.1 * inch, 1.54 * inch],
        style=TableStyle(
            [
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 0),
                ("RIGHTPADDING", (0, 0), (-1, -1), 0),
                ("TOPPADDING", (0, 0), (-1, -1), 0),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
            ]
        ),
    ),
]

ResumeDocTemplate(str(OUTPUT)).build(story, canvasmaker=ResumeCanvas)
print(OUTPUT)
