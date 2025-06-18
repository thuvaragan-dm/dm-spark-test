export interface CaretCoordinates {
  top: number;
  left: number;
}

/**
 * Calculates the top and left pixel coordinates of the caret in a textarea.
 * @param element The HTMLTextAreaElement to measure.
 * @param position The numerical position of the caret within the textarea's value.
 * @returns An object with `top` and `left` properties.
 */
export function getCaretCoordinates(
  element: HTMLTextAreaElement,
  position: number,
): CaretCoordinates {
  // We'll create a mirror div to calculate the position
  const mirror = document.createElement("div");
  const style = window.getComputedStyle(element);

  // Copy all the relevant styles from the textarea to the mirror
  [
    "border",
    "boxSizing",
    "fontFamily",
    "fontSize",
    "fontWeight",
    "letterSpacing",
    "lineHeight",
    "padding",
    "textAlign",
    "textDecoration",
    "textIndent",
    "textTransform",
    "whiteSpace",
    "wordSpacing",
    "wordWrap",
  ].forEach((prop) => {
    // The type assertion is safe because the properties are valid CSS properties.
    mirror.style[prop as any] = style[prop as any];
  });

  // Position the mirror absolutely and out of view
  mirror.style.position = "absolute";
  mirror.style.visibility = "hidden";
  // Ensure the mirror's width is the same as the textarea's
  mirror.style.width = `${element.offsetWidth}px`;

  // Get the text content up to the caret position
  const text = element.value.substring(0, position);
  mirror.textContent = text;

  // Create a span to measure the position of the caret
  const span = document.createElement("span");
  // Use a non-breaking space to ensure the span has dimensions
  span.innerHTML = "&nbsp;";
  mirror.appendChild(span);

  // Append the mirror to the body to get layout properties
  document.body.appendChild(mirror);

  const top = span.offsetTop + element.offsetTop - element.scrollTop;
  const left = span.offsetLeft + element.offsetLeft - element.scrollLeft;

  // Clean up by removing the mirror
  document.body.removeChild(mirror);

  return { top, left };
}
