import { parseMermaidToExcalidraw } from '@excalidraw/mermaid-to-excalidraw';
import { convertToExcalidrawElements } from '@excalidraw/excalidraw';
import { ExcalidrawElement } from '@excalidraw/excalidraw/element/types';

/**
 * Convert Mermaid syntax to Excalidraw elements.
 * Returns the elements array ready to load onto the canvas.
 * All elements are tagged with customData.source = "mermaid".
 */
export async function mermaidToElements(
  mermaidSyntax: string,
): Promise<ExcalidrawElement[]> {
  const { elements: rawSkelElements, files } = await parseMermaidToExcalidraw(
    mermaidSyntax,
    { themeVariables: { fontSize: '16px' } } as any,
  );

  // Filter out any null/undefined skeleton elements that can cause
  // "Cannot read properties of undefined (reading 'id')" inside
  // convertToExcalidrawElements due to library version mismatches.
  const skelElements = (rawSkelElements || []).filter(
    (el: any) => el != null && el.type != null,
  );
  if (skelElements.length === 0) {
    throw new Error('Mermaid conversion produced no valid elements. The diagram may use unsupported syntax.');
  }

  // convertToExcalidrawElements fills in all required fields
  const elements = convertToExcalidrawElements(skelElements);

  // Tag all elements as mermaid-origin for merge tracking
  return elements.map((el: any) => ({
    ...el,
    customData: { ...el.customData, source: 'mermaid' },
  })) as ExcalidrawElement[];
}

/**
 * Validate Mermaid syntax without applying.
 * Returns null on success, error message string on failure.
 */
export async function validateMermaid(
  mermaidSyntax: string,
): Promise<string | null> {
  try {
    // Use the full conversion path to catch all errors, including
    // skeleton element compatibility issues.
    await mermaidToElements(mermaidSyntax);
    return null;
  } catch (err: any) {
    return err?.message || 'Invalid Mermaid syntax';
  }
}
