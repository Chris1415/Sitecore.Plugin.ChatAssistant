/**
 * Creates a brand kit context message for the system prompt
 */
export function createBrandKitContextMessage(
  brandKitId: string | null | undefined,
  sections: Array<{ sectionId: string }> | null | undefined
): string {
  if (!brandKitId) {
    return "\n[Brand Kit Context]\nIMPORTANT: No brand kit has been selected. The user must select a brand kit from the dropdown menu before using brand review tools. Do not proceed with brand review operations until a brand kit is selected.";
  }

  const sectionsList = sections && sections.length > 0
    ? sections.map((s) => s.sectionId).join(", ")
    : "none specified";

  return `\n[Brand Kit Context]
The current brand kit ID is: ${brandKitId}
The sections from this brand kit that should be used (via sectionId) are: ${sectionsList}
When using brand review tools, you MUST pass this brandKitId as a parameter. Do not use any default values.`;
}

