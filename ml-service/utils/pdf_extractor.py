"""
PDF Text Extractor
Uses PyMuPDF (fitz) as primary extractor with pdfplumber as fallback
"""

import io
import logging

logger = logging.getLogger(__name__)


def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    """
    Extract plain text from PDF bytes.
    Tries PyMuPDF first, falls back to pdfplumber.
    """
    text = _extract_with_pymupdf(pdf_bytes)
    if text and len(text.strip()) > 50:
        return text

    logger.info("PyMuPDF extraction sparse, trying pdfplumber...")
    text = _extract_with_pdfplumber(pdf_bytes)
    return text


def _extract_with_pymupdf(pdf_bytes: bytes) -> str:
    try:
        import fitz  # PyMuPDF

        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        pages = []
        for page in doc:
            pages.append(page.get_text("text"))
        doc.close()
        return "\n".join(pages)
    except ImportError:
        logger.warning("PyMuPDF not installed, skipping.")
        return ""
    except Exception as e:
        logger.warning(f"PyMuPDF failed: {e}")
        return ""


def _extract_with_pdfplumber(pdf_bytes: bytes) -> str:
    try:
        import pdfplumber

        pages = []
        with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
            for page in pdf.pages:
                text = page.extract_text()
                if text:
                    pages.append(text)
        return "\n".join(pages)
    except ImportError:
        logger.warning("pdfplumber not installed.")
        return ""
    except Exception as e:
        logger.warning(f"pdfplumber failed: {e}")
        return ""
