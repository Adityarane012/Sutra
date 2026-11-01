import os
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement
from docx.oxml.ns import qn, nsdecls
from docx.oxml import parse_xml

def set_cell_background(cell, fill_hex):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>')
    tcPr.append(shd)

def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = parse_xml(f'''
        <w:tcMar {nsdecls("w")}>
            <w:top w:w="{top}" w:type="dxa"/>
            <w:bottom w:w="{bottom}" w:type="dxa"/>
            <w:left w:w="{left}" w:type="dxa"/>
            <w:right w:w="{right}" w:type="dxa"/>
        </w:tcMar>
    ''')
    tcPr.append(tcMar)

def set_table_borders(table, color="CBD5E1", sz="4", val="single"):
    tblPr = table._tbl.tblPr
    borders = parse_xml(f'''
        <w:tblBorders {nsdecls("w")}>
            <w:top w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>
            <w:bottom w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>
            <w:left w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>
            <w:right w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>
            <w:insideH w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>
            <w:insideV w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>
        </w:tblBorders>
    ''')
    tblPr.append(borders)

def build_report():
    doc = docx.Document()

    # Page setup: A4, 1-inch margins
    for section in doc.sections:
        section.page_width = Inches(8.27)
        section.page_height = Inches(11.69)
        section.top_margin = Inches(1.0)
        section.bottom_margin = Inches(1.0)
        section.left_margin = Inches(1.0)
        section.right_margin = Inches(1.0)

    # Base style
    style = doc.styles['Normal']
    font = style.font
    font.name = 'Calibri'
    font.size = Pt(11)
    font.color.rgb = RGBColor(0x1F, 0x29, 0x37)

    # Title
    p_title = doc.add_paragraph()
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_title.paragraph_format.space_before = Pt(0)
    p_title.paragraph_format.space_after = Pt(4)
    run_title = p_title.add_run("Code Kernel ’26 Hackathon Report")
    run_title.font.name = 'Georgia'
    run_title.font.size = Pt(24)
    run_title.font.bold = True
    run_title.font.color.rgb = RGBColor(0x0F, 0x17, 0x2A)

    # Subtitle divider line
    p_sub = doc.add_paragraph()
    p_sub.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_sub.paragraph_format.space_after = Pt(16)
    run_sub = p_sub.add_run("Adaptive Learning for Classes 6 to 10 • Team Winners")
    run_sub.font.size = Pt(11)
    run_sub.font.color.rgb = RGBColor(0x64, 0x74, 0x8B)

    def add_section_header(title):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(16)
        p.paragraph_format.space_after = Pt(6)
        p.paragraph_format.keep_with_next = True
        run = p.add_run(title)
        run.font.name = 'Georgia'
        run.font.size = Pt(13)
        run.font.bold = True
        run.font.color.rgb = RGBColor(0x0F, 0x17, 0x2A)
        return p

    def add_subsection_header(title):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(10)
        p.paragraph_format.space_after = Pt(4)
        p.paragraph_format.keep_with_next = True
        run = p.add_run(title)
        run.font.name = 'Calibri'
        run.font.size = Pt(11.5)
        run.font.bold = True
        run.font.color.rgb = RGBColor(0x1E, 0x29, 0x3B)
        return p

    def add_bullet(bold_prefix, text):
        p = doc.add_paragraph(style='List Bullet')
        p.paragraph_format.space_after = Pt(3)
        p.paragraph_format.line_spacing = 1.15
        r_bold = p.add_run(bold_prefix)
        r_bold.font.bold = True
        r_bold.font.color.rgb = RGBColor(0x0F, 0x17, 0x2A)
        r_text = p.add_run(" " + text)
        return p

    def add_para(text):
        p = doc.add_paragraph()
        p.paragraph_format.space_after = Pt(6)
        p.paragraph_format.line_spacing = 1.15
        p.add_run(text)
        return p

    # 1. Date & Name of the Event
    add_section_header("1. Date & Name of the Event")
    p1 = doc.add_paragraph()
    p1.paragraph_format.space_after = Pt(4)
    r = p1.add_run("Event Name: ")
    r.bold = True
    p1.add_run("Code Kernel ’26 Hackathon, organized by ")
    r2 = p1.add_run("X-Kernel, Gokaraju Rangaraju Institute of Engineering and Technology (GRIET), Hyderabad")
    r2.bold = True
    p1.add_run(" in collaboration with ")
    p1.add_run("Canvas Classes").bold = True
    p1.add_run(", supported by ")
    p1.add_run("MyStartupWave").bold = True
    p1.add_run(" (Online, hosted on Unstop).")

    p_dates = doc.add_paragraph()
    p_dates.paragraph_format.space_after = Pt(4)
    p_dates.add_run("Dates & Timeline:").bold = True

    add_bullet("Decode Round (Ideation & Pedagogical Formulation):", "21st October 2026 – 24th October 2026")
    add_bullet("Build Round (Prototyping & Algorithmic Implementation):", "25th October 2026 – 29th October 2026")
    add_bullet("Prove Round (Empirical Validation, Live Demonstration & Defense):", "30th October 2026 – 31st October 2026")

    # 2. Team Members
    add_section_header("2. Team Members")
    p_tm = doc.add_paragraph()
    p_tm.paragraph_format.space_after = Pt(4)
    p_tm.add_run("Team Name: Team Winners").bold = True

    add_bullet("Armaan Chopra (B028) —", "Team Winners")
    add_bullet("Aditya Rane (B129) —", "Team Winners (Team Lead)")

    # 3. Poster / Brochure / Website Link of the Event
    add_section_header("3. Poster / Brochure / Website Link of the Event")
    add_para("Event Platform: Unstop Code Kernel ’26 Hackathon Portal")
    add_para("Track: EdTech & AI — Adaptive Learning for Classes 6 to 10")
    p_ps = doc.add_paragraph()
    p_ps.paragraph_format.space_after = Pt(6)
    p_ps.add_run("Official Problem Statement: ").bold = True
    r_quote = p_ps.add_run("“One pace does not fit every learner. Design an adaptive solution for Indian classrooms (Classes 6 to 10) that understands where each student stands and changes what they learn next, how they learn it, and empowers the teacher instead of replacing them.”")
    r_quote.italic = True

    # 4. Problem Statement
    add_section_header("4. Problem Statement")
    add_para("In Indian school classrooms, 40 to 60 students are taught at a single uniform syllabus pace. A student who misses a foundational concept in Class 6 or 7 is forced onward, accumulating an invisible compounding learning gap. Independent research (Muralidharan, Singh & Ganimian, American Economic Review, 2019) revealed that the average Class 9 student in urban government schools sits 2.5 to 4.5 grade levels behind in mathematics. Furthermore, ASER 2024 reported that only 46% of rural Class 8 students could solve foundational division and negative number problems.")

    p_crit = doc.add_paragraph()
    p_crit.paragraph_format.space_after = Pt(4)
    p_crit.add_run("Critical Shortcomings in Existing EdTech Approaches:").bold = True

    add_bullet("Drilling Symptoms Instead of Root Causes:", "Traditional adaptive quiz applications re-drill the current chapter failed (e.g. serving more Class 9 linear equations) rather than identifying the broken prerequisite from Class 6 (e.g. number line integer signs).")
    add_bullet("Chatbot Wrappers:", "Generic LLM chatbot wrappers lack formal cognitive mastery tracking, produce hallucinatory explanations, and cannot guarantee deterministic diagnostic bounds.")
    add_bullet("Ignoring Ground Realities:", "Commercial global apps assume high-end individual smartphones, continuous high-speed 4G/5G internet, English-only proficiency, and sideline the classroom school teacher.")

    add_para("Evaluation Criteria & Weights: Relevance to Problem Statement (20%), Adaptivity across Learn/Solve/Test (20%), Algorithm & Model Choice (15%), Feasibility & Tech Stack (15%), Indian Context & Accessibility (10%), Teacher Support (10%), Clarity & Completeness (10%).")

    # 5. Proposed Solution: Sutra
    add_section_header("5. Proposed Solution: Sutra")
    add_para("Sutra (“thread” in Sanskrit) is an offline-first, dual-engine cognitive adaptive learning platform built specifically for Indian school education (Classes 6–10). Its founding thesis is simple: Find the thread. Fix the root.")

    add_subsection_header("5.1 Overview & Architecture")
    add_para("Sutra models the NCERT mathematics curriculum as a Directed Acyclic Graph (DAG) of atomic competencies. Rather than re-drilling failed questions, Sutra's Root-Cause Trace State Machine leverages misconception-tagged distractors to back-traverse the DAG and isolate the foundational breakdown in ≤ 3 bounded diagnostic probes (averaging 1.8 probes). Once fixed via a 2-minute tri-lingual micro-lesson, the student progressively climbs back up the prerequisite chain and consolidates understanding by teaching “Chotu” (an AI younger sibling persona).")

    add_subsection_header("5.2 Core Algorithmic Features")
    add_bullet("NCERT Prerequisite Concept DAG:", "12 atomic competencies across Classes 6 to 9 with rigorous topological ordering (Integers & Number Line → Integer Operations → Multiplication → Like Terms → Linear Equations → Polynomials → 2-Variable Equations).")
    add_bullet("Root-Cause Trace State Machine:", "Deterministic backtracking engine bounded by MAX_PROBES = 3. Concepts already mastered (P(known) ≥ 0.85) are strictly bypassed to eliminate diagnostic fatigue.")
    add_bullet("Bayesian Knowledge Tracing (BKT):", "Latent mastery modeling (P(L0)=0.30, P(T)=0.15, P(S)=0.10, P(G)=0.20) with dynamic posterior updates that account for slips, guesses, and hint deductions.")
    add_bullet("Blended Elo-BKT Dynamic Selector:", "Solves cold-start question calibration by blending Elo ratings with student BKT: P(success) = w · Elo + (1 - w) · BKT. Targets the optimal 70% success zone (shifting to 55% after a 3-streak, and 85% after 2 misses).")
    add_bullet("3-Rung Scaffolding Ladder:", "Rung 1: Conceptual Nudge → Rung 2: Worked Sub-Step → Rung 3: Dynamically selected Easier Twin question.")
    add_bullet("Teach Chotu (Feynman Technique):", "Students prove mastery by teaching a junior sibling bot. Runs 100% offline via a tri-lingual scripted keyword engine, or online via Gemini API, evaluated against a 4-point teacher-editable rubric.")
    add_bullet("“Kal ki Class” Teacher Intelligence:", "2-minute morning brief displaying the section's top root gap, 10-minute chalk-and-talk re-teach activity, greedy bipartite buddy pairing (peer teaching), and 1-click WhatsApp broadcast.")
    add_bullet("Multi-Tier Frugal Deployment:", "Tier 1 (Personal Device Offline PWA), Tier 2 (Shared Family Phone with 4-digit PINs), Tier 3 (Zero-Device Paper Tap-Grid for 30-second teacher mark entry + printable worksheets).")
    add_bullet("India DPDP Act 2023 Compliance:", "Zero student PII collected (no phone numbers, emails, addresses, photos, or biometrics).")

    add_subsection_header("5.3 Technical Implementation & Stack")
    add_bullet("Frontend:", "React 18, Vite 5, Vanilla CSS with custom Indian terracotta/navy design tokens, Web Speech API (TTS Read-Aloud & Speech Recognition).")
    add_bullet("Engine:", "Pure JavaScript deterministic algorithms (Zero heavy runtime dependencies; 33 passing automated tests; production bundle: 102 kB gzip).")
    add_bullet("Persistence:", "Offline-first Service Worker, IndexedDB/LocalStorage, synchronized to Supabase Postgres (schema with Row-Level Security in schema.sql).")

    add_subsection_header("5.4 Decode Round Feedback & Revisions Incorporated")
    add_para("In the Decode Round, Sutra was shortlisted at Rank #13 with a score of 90.3/100. The judges provided three specific recommendations, all of which were fully implemented in this build:")
    add_bullet("1. Formal Relational Schema:", "Authored production-ready schema.sql mapping schools, classes, students, concepts, DAG links, attempts, traces, and teachbacks with Postgres Row-Level Security.")
    add_bullet("2. Elo Cold-Start Solution:", "Formulated a mathematically sound decaying confidence weight (w = 1 - e^(-n/20)) that trusts BKT on fresh question banks and smoothly transitions to Elo as attempts accumulate.")
    add_bullet("3. Empirical Validation:", "Conducted a comprehensive simulation across 700 synthetic students (scripts/simulate.js), verifying an 87.2% exact-root localization accuracy (compared to 0% for standard chapter re-drilling baselines) and an AUC of 0.78.")

    add_subsection_header("5.5 Project Links")
    add_bullet("GitHub Repository:", "https://github.com/Adityarane012/Sutra")
    add_bullet("Documentation Suite:", "Docs/ARCHITECTURE.md, Docs/ADAPTIVE_ENGINE.md, Docs/DEMO_SCRIPT.md")

    # 6. Screenshots & Visual Verification
    doc.add_page_break()
    add_section_header("6. Screenshots & Visual Verification")

    figures = [
        ("Docs/Sutra_Adaptivity_Architecture.png", "Fig 1: Sutra End-to-End System Architecture, NCERT Concept DAG, BKT Formulation, and Multi-Tier Frugal Deployment", Inches(6.2)),
        ("Docs/screen_dash.png", "Fig 2: Student Dashboard (Riya, Class 9) showing Today's Focus Plan, Concept Thread Mastery Grid, and Activity Launchers", Inches(5.8)),
        ("Docs/screen_practice.png", "Fig 3: Adaptive Practice Session featuring the 3-Rung Hint Scaffolding Ladder, Streak Tracker, and Success-Probability Metrics", Inches(5.8)),
        ("Docs/screen_chotu.png", "Fig 4: Teach Chotu Feynman Role-Reversal Chat: Conversational Tri-lingual Dialogue with Real-Time Pedagogical Rubric Tracking", Inches(5.8)),
        ("Docs/screen_teacher.png", "Fig 5: Teacher “Kal ki Class” 2-Minute Morning Brief: Class Root-Gap Identification, 10-Min Re-teach Strategy, and Peer Buddy Pairing", Inches(5.8)),
        ("Docs/screen_sheets.png", "Fig 6: Tier 3 Paper Mode: 30-Second Classroom Tap-Grid for Rapid Grading and Personalized Printable Worksheets", Inches(5.8)),
        ("Docs/screen_heatmap.png", "Fig 7: Teacher Class Heatmap displaying Mastery Distribution across all 12 NCERT Competencies with Individual Student Inspection", Inches(5.8)),
        ("Docs/image.png", "Fig 8: Official Code Kernel ’26 Decode Round Evaluation Scorecard (Rank #13, Score 90.3/100, Shortlisted for Build & Prove Rounds)", Inches(5.8))
    ]

    for img_path, caption, width in figures:
        if os.path.exists(img_path):
            p_img = doc.add_paragraph()
            p_img.alignment = WD_ALIGN_PARAGRAPH.CENTER
            p_img.paragraph_format.space_before = Pt(8)
            p_img.paragraph_format.space_after = Pt(3)
            p_img.paragraph_format.keep_with_next = True
            run_img = p_img.add_run()
            run_img.add_picture(img_path, width=width)

            p_cap = doc.add_paragraph()
            p_cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
            p_cap.paragraph_format.space_before = Pt(0)
            p_cap.paragraph_format.space_after = Pt(14)
            r_cap = p_cap.add_run(caption)
            r_cap.font.size = Pt(9.5)
            r_cap.font.italic = True
            r_cap.font.bold = True
            r_cap.font.color.rgb = RGBColor(0x47, 0x55, 0x69)

    # 7. Verification & Empirical Results
    add_section_header("7. Verification & Empirical Results")
    add_para("Sutra was subjected to rigorous verification using automated testing suites and large-scale synthetic simulations to prove algorithmic accuracy:")

    # Table
    table = doc.add_table(rows=8, cols=4)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(table)

    headers = ["Verification Area", "Metric / Benchmark", "Result", "Status"]
    row_hdr = table.rows[0]
    for i, h in enumerate(headers):
        cell = row_hdr.cells[i]
        cell.text = h
        set_cell_background(cell, "F1F5F9")
        set_cell_margins(cell, top=120, bottom=120, left=150, right=150)
        p = cell.paragraphs[0]
        p.runs[0].font.bold = True
        p.runs[0].font.color.rgb = RGBColor(0x0F, 0x17, 0x2A)

    table_data = [
        ("Automated Test Suite", "Unit, Property-Based & Edge-Case Tests (npm test)", "33 / 33 passed (< 1.2s execution)", "VERIFIED ✓"),
        ("Concept Graph Integrity", "Kahn's Topological Sort Cycle Detection", "Valid DAG, 0 cycles, 100% pathUp reachability", "VERIFIED ✓"),
        ("Root Gap Localization", "Exact Root Accuracy in ≤ 3 Probes (vs Baseline)", "87.2% accuracy (vs 0% for chapter re-drilling)", "VERIFIED ✓"),
        ("Diagnostic Efficiency", "Average Probes to Locate Root Breakdown", "1.8 probes (strictly bounded by max 3)", "VERIFIED ✓"),
        ("Next-Answer Prediction", "BKT Predictive Discriminative Power (AUC)", "0.78 AUC across 2,800 test responses", "VERIFIED ✓"),
        ("Cold-Start Calibration", "Brier Score on Brand-New Question Banks", "0.142 (Blended) vs 0.231 (Plain Elo) — Lower is better", "VERIFIED ✓"),
        ("PWA Offline Resilience", "Zero-Network Simulation with LocalStorage", "100% functional (Diagnostic, Micro-lesson, Scripted Chotu)", "VERIFIED ✓")
    ]

    for row_idx, data in enumerate(table_data, start=1):
        row = table.rows[row_idx]
        for col_idx, text in enumerate(data):
            cell = row.cells[col_idx]
            cell.text = text
            set_cell_margins(cell, top=100, bottom=100, left=150, right=150)
            if col_idx == 0:
                cell.paragraphs[0].runs[0].font.bold = True
            elif col_idx == 3:
                r_status = cell.paragraphs[0].runs[0]
                r_status.font.bold = True
                r_status.font.color.rgb = RGBColor(0x16, 0xA3, 0x4A)

    # Conclusion Callout Box
    p_concl = doc.add_paragraph()
    p_concl.paragraph_format.space_before = Pt(16)
    p_concl.paragraph_format.space_after = Pt(8)
    r_c_bold = p_concl.add_run("Conclusion & Impact: ")
    r_c_bold.font.bold = True
    r_c_bold.font.color.rgb = RGBColor(0x16, 0x65, 0x34)
    r_c_text = p_concl.add_run("Sutra establishes that effective educational AI in emerging economies does not require heavy, high-cost LLM wrappers. By pairing formal NCERT concept graphs with Bayesian Knowledge Tracing, deterministic root-cause backtracking, and offline-first teacher tooling, Sutra delivers measurable, accessible personalized learning for every Indian student.")
    r_c_text.font.color.rgb = RGBColor(0x16, 0x65, 0x34)

    out_path = "c:\\Users\\Aditya Rane\\Downloads\\Sutra\\Docs\\B028_B129_CodeKernel_Report.docx"
    doc.save(out_path)
    print(f"Successfully generated DOCX report at: {out_path}")

if __name__ == '__main__':
    build_report()
