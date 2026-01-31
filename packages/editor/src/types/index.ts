/**
 * Page size configuration for PDF export
 */
export interface PageSize {
  width: number; // in mm
  height: number; // in mm
  margin: number; // in mm
}

/**
 * Parsed page content
 */
export interface ParsedPage {
  index: number;
  markdown: string;
  html: string;
}

/**
 * Editor configuration options
 */
export interface EditorConfig {
  placeholder?: string;
  lineNumbers?: boolean;
  lineWrapping?: boolean;
}
