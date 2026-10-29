
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import DOMPurify from "dompurify";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { jsPDF } from "jspdf";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { getProfile } from "../services/profileService";
import "./CVGenerator.css";

const emptyCV = {
  fullName: "",
  email: "",
  phone: "",
  location: "",
  linkedin: "",
  portfolio: "",
  jobTitle: "",
  summary: "",
  education: "",
  experience: "",
  skills: "",
  projects: "",
};

const DRAFT_KEY = "careerCraftCVDraft";

const templates = [
  {
    id: "classic",
    name: "Classic Professional",
    description: "Traditional, structured, and ATS-friendly.",
  },
  {
    id: "teal",
    name: "Modern Teal",
    description: "A two-column CV with a dedicated sidebar.",
  },
  {
    id: "minimal",
    name: "Minimal Black & White",
    description: "Simple typography and minimal decoration.",
  },
  {
    id: "developer",
    name: "Developer Portfolio",
    description: "Puts technical skills and projects first.",
  },
  {
    id: "ats",
    name: "ATS Professional",
    description: "A clean, single-column layout for job applications.",
  },
  {
    id: "software",
    name: "Software Engineer",
    description: "Highlights technical skills, projects, and experience.",
  },
  {
    id: "graduate",
    name: "Graduate & Internship",
    description: "Prioritizes education, projects, and relevant skills.",
  },
];

const colorPalettes = {
  default: { name: "Template default", primary: null, accent: null },
  navy: { name: "Navy Blue", primary: "#172B4D", accent: "#4776B8" },
  teal: { name: "Teal", primary: "#0F6964", accent: "#0F9D91" },
  purple: { name: "Purple", primary: "#392F70", accent: "#7959C7" },
  burgundy: { name: "Burgundy", primary: "#762C45", accent: "#C15B78" },
  forest: { name: "Forest Green", primary: "#23372D", accent: "#71977C" },
  monochrome: { name: "Black & Grey", primary: "#282828", accent: "#777777" },
};

const hexToRgb = (hex) => {
  const value = hex.replace("#", "");
  return [0, 2, 4].map((index) => parseInt(value.slice(index, index + 2), 16));
};

const richTextFields = new Set([
  "summary",
  "education",
  "experience",
  "projects",
]);

const templateColors = {
  classic: { primary: [23, 43, 77], accent: [15, 130, 122] },
  teal: { primary: [15, 105, 100], accent: [15, 157, 145] },
  minimal: { primary: [40, 40, 40], accent: [80, 80, 80] },
  developer: { primary: [57, 47, 112], accent: [91, 75, 196] },
  ats: { primary: [31, 41, 55], accent: [75, 85, 99] },
  software: { primary: [22, 78, 99], accent: [8, 145, 178] },
  graduate: { primary: [55, 65, 81], accent: [180, 83, 9] },
};

function escapeHTML(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function normalizeEditorContent(value) {
  if (!value) return "";

  const text = String(value);

  if (/<\/?[a-z][\s\S]*>/i.test(text)) {
    return DOMPurify.sanitize(text);
  }

  return text
    .split(/\r?\n/)
    .map((line) => `<p>${escapeHTML(line) || "<br>"}</p>`)
    .join("");
}

function htmlToPlainText(value) {
  if (!value) return "";

  const safeHTML = DOMPurify.sanitize(String(value));
  const parsed = new DOMParser().parseFromString(safeHTML, "text/html");

  function readNode(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      return node.textContent || "";
    }

    if (node.nodeType !== Node.ELEMENT_NODE) return "";

    const tag = node.tagName.toLowerCase();

    if (tag === "br") return "\n";

    const content = Array.from(node.childNodes).map(readNode).join("");

    if (tag === "li") return `• ${content.trim()}\n`;

    if (["p", "div", "h1", "h2", "h3", "h4"].includes(tag)) {
      return `${content.trim()}\n`;
    }

    return content;
  }

  return Array.from(parsed.body.childNodes)
    .map(readNode)
    .join("")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function RichTextField({ value, onChange, placeholder }) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: normalizeEditorContent(value),
    immediatelyRender: false,
    onUpdate: ({ editor: currentEditor }) => {
      onChange(currentEditor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "cv-rich-editor-content",
        "aria-label": placeholder || "CV text editor",
        "data-placeholder": placeholder || "Write here...",
      },
    },
  });

  useEffect(() => {
    if (!editor) return;

    const normalizedValue = normalizeEditorContent(value);

    if (normalizedValue && normalizedValue !== editor.getHTML()) {
      editor.commands.setContent(normalizedValue);
    } else if (!normalizedValue && editor.getText().length > 0) {
      editor.commands.clearContent();
    }
  }, [editor, value]);

  if (!editor) {
    return (
      <div className="cv-rich-editor-loading">
        Loading text editor...
      </div>
    );
  }

  const buttons = [
    {
      label: "Bold",
      text: <strong>B</strong>,
      active: editor.isActive("bold"),
      action: () => editor.chain().focus().toggleBold().run(),
    },
    {
      label: "Italic",
      text: <em>I</em>,
      active: editor.isActive("italic"),
      action: () => editor.chain().focus().toggleItalic().run(),
    },
    {
      label: "Bullet list",
      text: "• List",
      active: editor.isActive("bulletList"),
      action: () => editor.chain().focus().toggleBulletList().run(),
    },
    {
      label: "Numbered list",
      text: "1. List",
      active: editor.isActive("orderedList"),
      action: () => editor.chain().focus().toggleOrderedList().run(),
    },
    {
      label: "Heading",
      text: "H",
      active: editor.isActive("heading", { level: 3 }),
      action: () =>
        editor.chain().focus().toggleHeading({ level: 3 }).run(),
    },
    {
      label: "Paragraph",
      text: "P",
      active: editor.isActive("paragraph"),
      action: () => editor.chain().focus().setParagraph().run(),
    },
  ];

  return (
    <div className="cv-rich-editor">
      <div
        className="cv-rich-toolbar"
        role="toolbar"
        aria-label="Text formatting"
      >
        {buttons.map((button) => (
          <button
            key={button.label}
            type="button"
            title={button.label}
            aria-label={button.label}
            aria-pressed={button.active}
            className={button.active ? "is-active" : ""}
            onMouseDown={(event) => event.preventDefault()}
            onClick={button.action}
          >
            {button.text}
          </button>
        ))}
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}

function CVGenerator() {
  const { user } = useAuth();

  const storageKey = `${DRAFT_KEY}_${user?.id || user?.email || "user"}`;

  const [formData, setFormData] = useState(emptyCV);
  const [selectedTemplate, setSelectedTemplate] = useState("classic");
  const [selectedPalette, setSelectedPalette] = useState("default");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadCV() {
      let profileData = {};

      try {
        const response = await getProfile();
        profileData = response?.data || {};
      } catch {
        // Profile autofill is optional.
      }

      let savedDraft = {};
      let savedTemplate = "classic";
      let savedPalette = "default";

      try {
        const parsed = JSON.parse(localStorage.getItem(storageKey) || "{}");

        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
          if (parsed.formData && typeof parsed.formData === "object") {
            savedDraft = parsed.formData;

            if (templates.some((item) => item.id === parsed.selectedTemplate)) {
              savedTemplate = parsed.selectedTemplate;
            }
            if (Object.prototype.hasOwnProperty.call(colorPalettes, parsed.selectedPalette)) {
              savedPalette = parsed.selectedPalette;
            }
          } else {
            // Support drafts saved by the original version.
            savedDraft = parsed;
          }
        }
      } catch {
        savedDraft = {};
      }

      const profileDefaults = {
        fullName: user?.full_name || "",
        email: user?.email || "",
        location: profileData.location || "",
        jobTitle: profileData.career_goal || "",
        summary: profileData.bio || "",
        education: [
          profileData.education_level,
          profileData.field_of_study,
        ]
          .filter(Boolean)
          .join(" — "),
      };

      if (!cancelled) {
        setFormData({
          ...emptyCV,
          ...profileDefaults,
          ...savedDraft,
          fullName: user?.full_name || savedDraft.fullName || "",
          email: user?.email || savedDraft.email || "",
        });

        setSelectedTemplate(savedTemplate);
        setSelectedPalette(savedPalette);
        setLoading(false);
      }
    }

    loadCV();

    return () => {
      cancelled = true;
    };
  }, [storageKey, user?.full_name, user?.email]);

  useEffect(() => {
    if (loading) return;

    try {
      localStorage.setItem(
        storageKey,
        JSON.stringify({ formData, selectedTemplate, selectedPalette })
      );

      setSaved(true);

      const saveIndicator = window.setTimeout(() => setSaved(false), 1800);

      return () => window.clearTimeout(saveIndicator);
    } catch {
      setError("Unable to save your draft in this browser.");
    }
  }, [formData, selectedTemplate, selectedPalette, loading, storageKey]);

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
    setError("");
  }

  function handleRichTextChange(name, html) {
    setFormData((current) => ({ ...current, [name]: html }));
    setError("");
  }

  function getLines(value) {
    return String(value || "")
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);
  }

  function getSkills() {
    return String(formData.skills || "")
      .split(",")
      .map((skill) => skill.trim())
      .filter(Boolean);
  }

  function renderPreviewSection(title, value, fieldName, type = "text") {
    if (richTextFields.has(fieldName)) {
      const safeHTML = DOMPurify.sanitize(normalizeEditorContent(value));

      if (!htmlToPlainText(safeHTML)) return null;

      return (
        <section className={`cv-preview-section cv-section-${fieldName}`} key={fieldName}>
          <h3>{title}</h3>
          <div
            className="cv-preview-rich-content"
            dangerouslySetInnerHTML={{ __html: safeHTML }}
          />
        </section>
      );
    }

    const lines = getLines(value);
    if (!lines.length) return null;

    return (
      <section className={`cv-preview-section cv-section-${fieldName}`} key={fieldName}>
        <h3>{title}</h3>
        {type === "list" ? (
          <ul className="cv-preview-skill-list">
            {getSkills().map((skill, index) => (
              <li key={`${skill}-${index}`}>{skill}</li>
            ))}
          </ul>
        ) : (
          lines.map((line, index) => (
            <p key={`${fieldName}-${index}`}>{line}</p>
          ))
        )}
      </section>
    );
  }

  function renderContacts(className = "") {
    const contacts = [
      ["Email", formData.email],
      ["Phone", formData.phone],
      ["Location", formData.location],
      ["LinkedIn", formData.linkedin],
      ["Portfolio / GitHub", formData.portfolio],
    ].filter(([, value]) => value);

    if (!contacts.length) return null;

    return (
      <div className={`cv-document-contact ${className}`}>
        {contacts.map(([label, value]) => (
          <p key={label}>
            {selectedTemplate === "teal" && <strong>{label}</strong>}
            <span>{value}</span>
          </p>
        ))}
      </div>
    );
  }

  function renderSkills({ chips = false } = {}) {
    const skills = getSkills();
    if (!skills.length) return null;

    return (
      <section className="cv-preview-section cv-section-skills" key="skills">
        <h3>Technical Skills</h3>
        {chips ? (
          <div className="cv-skill-chips">
            {skills.map((skill, index) => (
              <span key={`${skill}-${index}`}>{skill}</span>
            ))}
          </div>
        ) : (
          <ul className="cv-preview-skill-list">
            {skills.map((skill, index) => (
              <li key={`${skill}-${index}`}>{skill}</li>
            ))}
          </ul>
        )}
      </section>
    );
  }

  function renderStandardSections({ developer = false, graduate = false } = {}) {
    if (developer) {
      return (
        <>
          {renderPreviewSection("Projects", formData.projects, "projects")}
          {renderPreviewSection("Experience & Internships", formData.experience, "experience")}
          {renderPreviewSection("Education", formData.education, "education")}
        </>
      );
    }

    if (graduate) {
      return (
        <>
          {renderPreviewSection("Education", formData.education, "education")}
          {renderPreviewSection("Projects", formData.projects, "projects")}
          {renderPreviewSection("Experience & Internships", formData.experience, "experience")}
        </>
      );
    }

    return (
      <>
        {renderPreviewSection("Education", formData.education, "education")}
        {renderPreviewSection("Experience & Internships", formData.experience, "experience")}
        {renderPreviewSection("Projects", formData.projects, "projects")}
      </>
    );
  }

  function downloadPDF() {
    try {
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 14;
      const bottomMargin = 14;
      const baseColors = templateColors[selectedTemplate] || templateColors.classic;
      const palette = colorPalettes[selectedPalette] || colorPalettes.default;
      const colors = palette.primary
        ? { primary: hexToRgb(palette.primary), accent: hexToRgb(palette.accent) }
        : baseColors;
      const isTeal = selectedTemplate === "teal";
      const isMinimal = selectedTemplate === "minimal";
      const isDeveloper = selectedTemplate === "developer";
      const isATS = selectedTemplate === "ats";
      const isSoftware = selectedTemplate === "software";
      const isGraduate = selectedTemplate === "graduate";

      let y = 0;
      let currentX = margin;
      let currentWidth = pageWidth - margin * 2;

      function addPage() {
        pdf.addPage();
        y = 15;
      }

      function ensureSpace(height) {
        if (y + height > pageHeight - bottomMargin) addPage();
      }

      function addText(text, options = {}) {
        const {
          size = 9.3,
          color = [48, 55, 68],
          bold = false,
          x = currentX,
          width = currentWidth,
          indent = 0,
        } = options;

        const cleanText = String(text || "").trim();
        if (!cleanText) return;

        pdf.setFont("helvetica", bold ? "bold" : "normal");
        pdf.setFontSize(size);
        pdf.setTextColor(...color);

        const lines = pdf.splitTextToSize(cleanText, Math.max(10, width - indent));
        const lineHeight = (size * 1.3) / 2.7;

        lines.forEach((line) => {
          ensureSpace(lineHeight + 1);
          pdf.text(line, x + indent, y);
          y += lineHeight;
        });

        y += 1;
      }

      function addSection(title, value, fieldName, options = {}) {
        const { x = currentX, width = currentWidth } = options;
        const content = richTextFields.has(fieldName)
          ? htmlToPlainText(value)
          : String(value || "").trim();

        if (!content) return;

        const items =
          fieldName === "skills"
            ? getSkills()
            : content.split(/\r?\n/).map((item) => item.trim()).filter(Boolean);

        if (!items.length) return;

        ensureSpace(14);
        y += 2;

        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(10);
        pdf.setTextColor(...colors.accent);
        pdf.text(title.toUpperCase(), x, y);
        y += 2.5;

        pdf.setDrawColor(...colors.accent);
        pdf.setLineWidth(isMinimal ? 0.18 : 0.3);
        pdf.line(x, y, x + width, y);
        y += 4;

        items.forEach((item) => {
          addText(fieldName === "skills" ? `• ${item}` : item, {
            size: 9.2,
            x,
            width,
          });
        });
      }

      function addContactLine(text, x, width, color) {
        if (!text) return;

        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(8);
        pdf.setTextColor(...color);

        const lines = pdf.splitTextToSize(String(text), width - 8);
        lines.forEach((line) => {
          if (y > pageHeight - 12) return;
          pdf.text(line, x + 4, y);
          y += 4.2;
        });
      }

      const name = String(formData.fullName || "Your Name").trim();
      const jobTitle = String(formData.jobTitle || "").trim();
      const contactItems = [
        formData.email,
        formData.phone,
        formData.location,
        formData.linkedin,
        formData.portfolio,
      ].filter(Boolean);

      // MODERN TEAL: real two-column PDF layout with a sidebar.
      if (isTeal) {
        const sidebarWidth = 57;
        const mainX = sidebarWidth + 10;
        const mainWidth = pageWidth - mainX - margin;

        pdf.setFillColor(...colors.primary);
        pdf.rect(0, 0, sidebarWidth, pageHeight, "F");

        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(17);
        pdf.setTextColor(255, 255, 255);

        const nameLines = pdf.splitTextToSize(name, sidebarWidth - 12);
        pdf.text(nameLines, 6, 18);

        let sidebarY = 20 + nameLines.length * 6;
        if (jobTitle) {
          pdf.setFont("helvetica", "normal");
          pdf.setFontSize(9);
          pdf.setTextColor(170, 238, 229);

          const titleLines = pdf.splitTextToSize(jobTitle, sidebarWidth - 12);
          pdf.text(titleLines, 6, sidebarY);
          sidebarY += titleLines.length * 4.2 + 8;
        }

        function sidebarHeading(label) {
          sidebarY += 5;
          pdf.setFont("helvetica", "bold");
          pdf.setFontSize(9);
          pdf.setTextColor(255, 255, 255);
          pdf.text(label.toUpperCase(), 6, sidebarY);
          sidebarY += 2;

          pdf.setDrawColor(91, 196, 181);
          pdf.line(6, sidebarY, sidebarWidth - 6, sidebarY);
          sidebarY += 5;
        }

        if (contactItems.length) {
          sidebarHeading("Contact");
          contactItems.forEach((item) => {
            pdf.setFont("helvetica", "normal");
            pdf.setFontSize(7.5);
            pdf.setTextColor(235, 244, 243);

            const lines = pdf.splitTextToSize(String(item), sidebarWidth - 12);
            lines.forEach((line) => {
              pdf.text(line, 6, sidebarY);
              sidebarY += 4;
            });
            sidebarY += 1.5;
          });
        }

        const skills = getSkills();
        if (skills.length) {
          sidebarHeading("Skills");
          skills.forEach((skill) => {
            pdf.setFont("helvetica", "normal");
            pdf.setFontSize(8);
            pdf.setTextColor(255, 255, 255);

            const lines = pdf.splitTextToSize(`• ${skill}`, sidebarWidth - 12);
            lines.forEach((line) => {
              pdf.text(line, 6, sidebarY);
              sidebarY += 4.2;
            });
          });
        }

        currentX = mainX;
        currentWidth = mainWidth;
        y = 18;

        if (formData.summary) {
          addSection("Professional Summary", formData.summary, "summary");
        }
        addSection("Experience & Internships", formData.experience, "experience");
        addSection("Education", formData.education, "education");
        addSection("Projects", formData.projects, "projects");
      } else {
        // CLASSIC, MINIMAL and DEVELOPER use different header treatments
        // and their own section order.
        const headerHeight = isMinimal || isATS ? 31 : isDeveloper || isSoftware ? 43 : 39;

        if (isMinimal || isATS || isGraduate) {
          pdf.setFillColor(255, 255, 255);
          pdf.rect(0, 0, pageWidth, headerHeight, "F");
          pdf.setDrawColor(...colors.primary);
          pdf.setLineWidth(0.8);
          pdf.line(margin, headerHeight, pageWidth - margin, headerHeight);
        } else {
          pdf.setFillColor(...colors.primary);
          pdf.rect(0, 0, pageWidth, headerHeight, "F");

          if (isDeveloper) {
            pdf.setFillColor(...colors.accent);
            pdf.rect(0, headerHeight - 3, pageWidth, 3, "F");
          }
        }

        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(isDeveloper || isSoftware ? 22 : 20);
        pdf.setTextColor(
          ...(isMinimal || isATS || isGraduate ? colors.primary : [255, 255, 255])
        );

        const nameLines = pdf.splitTextToSize(name, currentWidth);
        pdf.text(nameLines, margin, isMinimal ? 13 : 13);

        if (jobTitle) {
          pdf.setFont("helvetica", "normal");
          pdf.setFontSize(10);
          pdf.setTextColor(
            ...(isMinimal || isATS || isGraduate ? colors.accent : isDeveloper ? [221, 215, 255] : isSoftware ? [207, 250, 254] : [190, 238, 232])
          );
          pdf.text(jobTitle, margin, 13 + nameLines.length * 7);
        }

        y = headerHeight + 7;

        if (contactItems.length) {
          addText(contactItems.join("  |  "), {
            size: 8,
            color: [100, 116, 139],
          });
          y += 2;
        }

        if (isDeveloper || isSoftware) {
          addSection("Professional Summary", formData.summary, "summary");
          addSection("Technical Skills", formData.skills, "skills");
          addSection("Featured Projects", formData.projects, "projects");
          addSection("Experience & Internships", formData.experience, "experience");
          addSection("Education", formData.education, "education");
        } else if (isGraduate) {
          addSection("Professional Summary", formData.summary, "summary");
          addSection("Education", formData.education, "education");
          addSection("Projects", formData.projects, "projects");
          addSection("Skills", formData.skills, "skills");
          addSection("Experience & Internships", formData.experience, "experience");
        } else {
          // Classic, Minimal and ATS keep a straightforward reading order.
          addSection("Professional Summary", formData.summary, "summary");
          addSection("Education", formData.education, "education");
          addSection("Experience & Internships", formData.experience, "experience");
          addSection("Skills", formData.skills, "skills");
          addSection("Projects", formData.projects, "projects");
        }
      }

      const safeName = (formData.fullName || "My")
        .trim()
        .replace(/[^a-z0-9]+/gi, "-")
        .replace(/^-|-$/g, "");

      pdf.save(`${safeName || "My"}-CV.pdf`);
      setError("");
    } catch (err) {
      console.error("CV PDF generation failed:", err);
      setError("Unable to generate the PDF. Please try again.");
    }
  }

  const selectedTemplateName =
    templates.find((item) => item.id === selectedTemplate)?.name || "Classic Professional";

  return (
    <>
      <Navbar />

      <main className="cv-page">
        <div className="cv-container">
          <header className="cv-heading">
            <div>
              <p className="cv-eyebrow">YOUR CAREER WORKSPACE</p>
              <h1>CV Generator</h1>
              <p>
                Choose a layout, add your information, preview your CV,
                and download it as a PDF.
              </p>
            </div>
            <Link to="/dashboard" className="cv-back-link">
              ← Back to Dashboard
            </Link>
          </header>

          <nav className="cv-builder-progress" aria-label="CV creation steps">
            <div className="cv-progress-step is-complete">
              <span>01</span><div><strong>Choose a design</strong><small>Pick your CV template</small></div>
            </div>
            <span className="cv-progress-line" aria-hidden="true" />
            <div className="cv-progress-step is-active">
              <span>02</span><div><strong>Add your details</strong><small>Complete your information</small></div>
            </div>
            <span className="cv-progress-line" aria-hidden="true" />
            <div className="cv-progress-step">
              <span>03</span><div><strong>Preview & download</strong><small>Review your finished CV</small></div>
            </div>
          </nav>

          {loading ? (
            <div className="cv-status">Preparing your CV...</div>
          ) : (
            <>
              <section className="cv-template-section">
                <div className="cv-template-heading">
                  <div>
                    <p className="cv-eyebrow">CHOOSE YOUR DESIGN</p>
                    <h2>CV Templates</h2>
                  </div>
                  <span>{templates.length} free templates</span>
                </div>

                <div className="cv-template-grid">
                  {templates.map((template) => (
                    <button
                      type="button"
                      key={template.id}
                      className={`cv-template-card ${
                        selectedTemplate === template.id ? "selected" : ""
                      }`}
                      onClick={() => setSelectedTemplate(template.id)}
                      aria-pressed={selectedTemplate === template.id}
                    >
                      <div
                        className={`cv-template-thumbnail cv-thumb-${template.id}`}
                        aria-hidden="true"
                      >
                        {template.id === "teal" ? (
                          <div className="cv-thumb-two-column">
                            <div className="cv-thumb-sidebar">
                              <i />
                              <i />
                              <i />
                              <i />
                            </div>
                            <div className="cv-thumb-main">
                              <i className="cv-thumb-title" />
                              <i />
                              <i />
                              <i className="cv-thumb-section" />
                              <i />
                              <i />
                            </div>
                          </div>
                        ) : template.id === "developer" || template.id === "software" ? (
                          <div className="cv-thumb-developer-layout">
                            <i className="cv-thumb-header" />
                            <i className="cv-thumb-title" />
                            <div className="cv-thumb-chips">
                              <i />
                              <i />
                              <i />
                            </div>
                            <i className="cv-thumb-section" />
                            <i />
                            <i />
                            <i className="cv-thumb-section" />
                            <i />
                          </div>
                        ) : (
                          <div className="cv-thumb-standard-layout">
                            <i className="cv-thumb-header" />
                            <i className="cv-thumb-title" />
                            <i className="cv-thumb-line short" />
                            <i className="cv-thumb-section" />
                            <i />
                            <i className="cv-thumb-line medium" />
                            <i className="cv-thumb-section" />
                            <i />
                            <i className="cv-thumb-line short" />
                          </div>
                        )}
                      </div>

                      <span className="cv-template-card-name">{template.name}</span>
                      <span className="cv-template-card-description">
                        {template.description}
                      </span>
                      <span className="cv-template-card-action">
                        {selectedTemplate === template.id
                          ? "✓ Selected"
                          : "Use this template"}
                      </span>
                    </button>
                  ))}
                </div>
              </section>

              <section className="cv-color-section" aria-labelledby="cv-color-heading">
                <div className="cv-color-heading">
                  <div>
                    <p className="cv-eyebrow">PERSONALIZE COLORS</p>
                    <h2 id="cv-color-heading">Choose a Color Theme</h2>
                    <p>Colors change independently. Your selected template layout stays the same.</p>
                  </div>
                  <span className="cv-color-selected">{colorPalettes[selectedPalette].name}</span>
                </div>
                <div className="cv-palette-grid">
                  {Object.entries(colorPalettes).map(([id, palette]) => {
                    const defaultColors = templateColors[selectedTemplate] || templateColors.classic;
                    const primary = palette.primary || `rgb(${defaultColors.primary.join(",")})`;
                    const accent = palette.accent || `rgb(${defaultColors.accent.join(",")})`;
                    return (
                      <button
                        type="button"
                        key={id}
                        className={`cv-palette-option ${selectedPalette === id ? "selected" : ""}`}
                        onClick={() => setSelectedPalette(id)}
                        aria-pressed={selectedPalette === id}
                      >
                        <span className="cv-palette-swatches" aria-hidden="true">
                          <i style={{ background: primary }} />
                          <i style={{ background: accent }} />
                        </span>
                        <span>{palette.name}</span>
                        {selectedPalette === id && <span className="cv-palette-check">✓</span>}
                      </button>
                    );
                  })}
                </div>
              </section>

              <div className="cv-workspace cv-workspace-redesigned">
                <section className="cv-editor cv-editor-redesigned">
                  <div className="cv-panel-heading">
                    <div>
                      <p className="cv-eyebrow">STEP 1</p>
                      <h2>Your Information</h2>
                    </div>
                    <span className="cv-save-status" role="status">
                      {saved ? "Draft saved" : "Auto-save enabled"}
                    </span>
                  </div>

                  <p className="cv-helper">
                    Your profile details are prefilled where available.
                    Edit any field to personalize your CV.
                  </p>

                  <form onSubmit={(event) => event.preventDefault()}>
                    <div className="cv-form-grid">
                      <div className="cv-field">
                        <label htmlFor="cv-fullName">Full Name</label>
                        <input
                          id="cv-fullName"
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleChange}
                          placeholder="Your full name"
                          maxLength={100}
                        />
                      </div>

                      <div className="cv-field">
                        <label htmlFor="cv-jobTitle">Target Job Title</label>
                        <input
                          id="cv-jobTitle"
                          name="jobTitle"
                          value={formData.jobTitle}
                          onChange={handleChange}
                          placeholder="e.g. Frontend Developer"
                          maxLength={100}
                        />
                      </div>

                      <div className="cv-field">
                        <label htmlFor="cv-email">Email</label>
                        <input
                          id="cv-email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="you@example.com"
                          maxLength={150}
                        />
                      </div>

                      <div className="cv-field">
                        <label htmlFor="cv-phone">Phone</label>
                        <input
                          id="cv-phone"
                          name="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="Your contact number"
                          maxLength={40}
                        />
                      </div>

                      <div className="cv-field">
                        <label htmlFor="cv-location">Location</label>
                        <input
                          id="cv-location"
                          name="location"
                          value={formData.location}
                          onChange={handleChange}
                          placeholder="City, Country"
                          maxLength={100}
                        />
                      </div>

                      <div className="cv-field">
                        <label htmlFor="cv-linkedin">LinkedIn URL</label>
                        <input
                          id="cv-linkedin"
                          name="linkedin"
                          value={formData.linkedin}
                          onChange={handleChange}
                          placeholder="linkedin.com/in/yourname"
                          maxLength={200}
                        />
                      </div>

                      <div className="cv-field cv-field-full">
                        <label htmlFor="cv-portfolio">Portfolio / GitHub URL</label>
                        <input
                          id="cv-portfolio"
                          name="portfolio"
                          value={formData.portfolio}
                          onChange={handleChange}
                          placeholder="Your portfolio or GitHub link"
                          maxLength={200}
                        />
                      </div>

                      <div className="cv-field cv-field-full">
                        <label>Professional Summary</label>
                        <RichTextField
                          value={formData.summary}
                          placeholder="Write your professional summary"
                          onChange={(html) => handleRichTextChange("summary", html)}
                        />
                      </div>

                      <div className="cv-field cv-field-full">
                        <label>Education</label>
                        <RichTextField
                          value={formData.education}
                          placeholder="Qualifications, institutions, and dates"
                          onChange={(html) => handleRichTextChange("education", html)}
                        />
                      </div>

                      <div className="cv-field cv-field-full">
                        <label>Experience & Internships</label>
                        <RichTextField
                          value={formData.experience}
                          placeholder="Responsibilities and achievements"
                          onChange={(html) => handleRichTextChange("experience", html)}
                        />
                      </div>

                      <div className="cv-field cv-field-full">
                        <label htmlFor="cv-skills">Skills (separate with commas)</label>
                        <textarea
                          id="cv-skills"
                          name="skills"
                          value={formData.skills}
                          onChange={handleChange}
                          placeholder="HTML, CSS, JavaScript, React, Node.js, SQL"
                          rows={3}
                          maxLength={1500}
                        />
                      </div>

                      <div className="cv-field cv-field-full">
                        <label>Projects</label>
                        <RichTextField
                          value={formData.projects}
                          placeholder="Project details, your contribution, and technologies"
                          onChange={(html) => handleRichTextChange("projects", html)}
                        />
                      </div>
                    </div>
                  </form>

                  {error && <p className="cv-error" role="alert">{error}</p>}

                  <div className="cv-editor-actions">
                    <button
                      type="button"
                      className="cv-download-button"
                      onClick={downloadPDF}
                    >
                      Download CV as PDF ↓
                    </button>
                  </div>
                </section>

                <section className="cv-preview-panel cv-preview-redesigned">
                  <div className="cv-preview-toolbar">
                    <div>
                      <p className="cv-eyebrow">STEP 2</p>
                      <h2>Live Preview</h2>
                    </div>
                    <span className="cv-template-label">{selectedTemplateName}</span>
                  </div>

                  <article
                    className={`cv-document cv-document-${selectedTemplate}`}
                    style={selectedPalette !== "default" ? {
                      "--cv-primary": colorPalettes[selectedPalette].primary,
                      "--cv-accent": colorPalettes[selectedPalette].accent,
                    } : undefined}
                  >
                    {selectedTemplate === "teal" ? (
                      <div className="cv-document-teal-layout">
                        <aside className="cv-document-sidebar">
                          <header className="cv-document-header">
                            <h2>{formData.fullName || "Your Name"}</h2>
                            {formData.jobTitle && (
                              <p className="cv-document-job">{formData.jobTitle}</p>
                            )}
                          </header>

                          <section className="cv-sidebar-section">
                            <h3>Contact</h3>
                            {renderContacts("cv-contact-sidebar")}
                          </section>

                          {renderSkills({ chips: false })}
                        </aside>

                        <div className="cv-document-main">
                          {renderPreviewSection(
                            "Professional Summary",
                            formData.summary,
                            "summary"
                          )}
                          {renderPreviewSection(
                            "Experience & Internships",
                            formData.experience,
                            "experience"
                          )}
                          {renderPreviewSection(
                            "Education",
                            formData.education,
                            "education"
                          )}
                          {renderPreviewSection("Projects", formData.projects, "projects")}
                        </div>
                      </div>
                    ) : selectedTemplate === "ats" ? (
                      <>
                        <header className="cv-document-header">
                          <h2>{formData.fullName || "Your Name"}</h2>
                          {formData.jobTitle && <p className="cv-document-job">{formData.jobTitle}</p>}
                        </header>
                        {renderContacts()}
                        {renderPreviewSection("Professional Summary", formData.summary, "summary")}
                        {renderPreviewSection("Experience & Internships", formData.experience, "experience")}
                        {renderPreviewSection("Education", formData.education, "education")}
                        {renderSkills()}
                        {renderPreviewSection("Projects", formData.projects, "projects")}
                      </>
                    ) : selectedTemplate === "graduate" ? (
                      <>
                        <header className="cv-document-header">
                          <h2>{formData.fullName || "Your Name"}</h2>
                          {formData.jobTitle && <p className="cv-document-job">{formData.jobTitle}</p>}
                        </header>
                        {renderContacts()}
                        {renderPreviewSection("Professional Summary", formData.summary, "summary")}
                        {renderPreviewSection("Education", formData.education, "education")}
                        {renderPreviewSection("Projects", formData.projects, "projects")}
                        {renderSkills()}
                        {renderPreviewSection("Experience & Internships", formData.experience, "experience")}
                      </>
                    ) : selectedTemplate === "software" ? (
                      <>
                        <header className="cv-document-header">
                          <p className="cv-developer-kicker">SOFTWARE ENGINEER</p>
                          <h2>{formData.fullName || "Your Name"}</h2>
                          {formData.jobTitle && <p className="cv-document-job">{formData.jobTitle}</p>}
                        </header>
                        {renderContacts()}
                        {renderPreviewSection("Professional Summary", formData.summary, "summary")}
                        {renderSkills({ chips: true })}
                        {renderStandardSections({ developer: true })}
                      </>
                    ) : selectedTemplate === "minimal" ? (
                      <>
                        <header className="cv-document-header">
                          <h2>{formData.fullName || "Your Name"}</h2>
                          {formData.jobTitle && (
                            <p className="cv-document-job">{formData.jobTitle}</p>
                          )}
                        </header>
                        {renderContacts()}
                        {renderPreviewSection(
                          "Professional Summary",
                          formData.summary,
                          "summary"
                        )}
                        {renderPreviewSection("Education", formData.education, "education")}
                        {renderPreviewSection(
                          "Experience & Internships",
                          formData.experience,
                          "experience"
                        )}
                        {renderSkills()}
                        {renderPreviewSection("Projects", formData.projects, "projects")}
                      </>
                    ) : selectedTemplate === "developer" ? (
                      <>
                        <header className="cv-document-header">
                          <p className="cv-developer-kicker">DEVELOPER PROFILE</p>
                          <h2>{formData.fullName || "Your Name"}</h2>
                          {formData.jobTitle && (
                            <p className="cv-document-job">{formData.jobTitle}</p>
                          )}
                        </header>
                        {renderContacts()}
                        {renderPreviewSection(
                          "Professional Summary",
                          formData.summary,
                          "summary"
                        )}
                        {renderSkills({ chips: true })}
                        {renderStandardSections({ developer: true })}
                      </>
                    ) : (
                      <>
                        <header className="cv-document-header">
                          <h2>{formData.fullName || "Your Name"}</h2>
                          {formData.jobTitle && (
                            <p className="cv-document-job">{formData.jobTitle}</p>
                          )}
                        </header>
                        {renderContacts()}
                        {renderPreviewSection(
                          "Professional Summary",
                          formData.summary,
                          "summary"
                        )}
                        {renderStandardSections()}
                        {renderSkills()}
                      </>
                    )}

                    {!formData.summary &&
                      !formData.education &&
                      !formData.experience &&
                      !formData.skills &&
                      !formData.projects && (
                        <p className="cv-preview-empty">
                          Your CV sections will appear here as you complete the form.
                        </p>
                      )}
                  </article>

                  <p className="cv-preview-note">
                    The selected template controls the PDF layout and section order.
                    Review the downloaded file before sending it to an employer.
                  </p>
                </section>
              </div>
            </>
          )}
        </div>
      </main>
    </>
  );
}

export default CVGenerator;
