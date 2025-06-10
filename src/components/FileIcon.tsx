import { IoDocument } from "react-icons/io5";
import React from "react";

// A constant for common styling to keep the code DRY.
const commonClasses = "size-8 flex-shrink-0";

// --- Icon Components ---
// Defining each icon as a separate component makes the main component cleaner.

const TxtIcon = () => (
  <IoDocument className={`${commonClasses} text-blue-600`} />
);

const ImgIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={commonClasses}
    viewBox="0 0 32 32"
  >
    <path fill="#421CA4" d="M30 5.851v20.298H2V5.851z" />
    <path
      fill="#fff"
      d="M24.232 8.541a2.2 2.2 0 101.127.623 2.2 2.2 0 00-1.127-.623M18.111 20.1q-2.724-3.788-5.45-7.575L4.579 23.766h10.9q1.316-1.832 2.634-3.663M22.057 16q-2.793 3.882-5.584 7.765h11.169Q24.851 19.882 22.057 16"
    />
  </svg>
);

const PdfIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={commonClasses}
    viewBox="0 0 32 32"
  >
    <path
      fill="#909090"
      d="M24.1 2.072l5.564 5.8v22.056H8.879V30h20.856V7.945z"
    />
    <path fill="#f4f4f4" d="M24.031 2H8.808v27.928h20.856V7.873z" />
    <path fill="#7a7b7c" d="M8.655 3.5h-6.39v6.827h20.1V3.5z" />
    <path fill="#dd2025" d="M22.472 10.211H2.395V3.379h20.077z" />
    <path
      fill="#464648"
      d="M9.052 4.534H7.745v4.8h1.028V7.715L9 7.728a2 2 0 00.647-.117 1.4 1.4 0 00.493-.291 1.2 1.2 0 00.335-.454 2.1 2.1 0 00.105-.908 2.2 2.2 0 00-.114-.644 1.17 1.17 0 00-.687-.65 2 2 0 00-.409-.104 2 2 0 00-.319-.026m-.189 2.294h-.089v-1.48h.193a.57.57 0 01.459.181.92.92 0 01.183.558c0 .246 0 .469-.222.626a.94.94 0 01-.524.114m3.671-2.306c-.111 0-.219.008-.295.011L12 4.538h-.78v4.8h.918a2.7 2.7 0 001.028-.175 1.7 1.7 0 00.68-.491 1.9 1.9 0 00.373-.749 3.7 3.7 0 00.114-.949 4.4 4.4 0 00-.087-1.127 1.8 1.8 0 00-.4-.733 1.6 1.6 0 00-.535-.4 2.4 2.4 0 00-.549-.178 1.3 1.3 0 00-.228-.017m-.182 3.937h-.1V5.392h.013a1.06 1.06 0 01.6.107 1.2 1.2 0 01.324.4 1.3 1.3 0 01.142.526c.009.22 0 .4 0 .549a3 3 0 01-.033.513 1.8 1.8 0 01-.169.5 1.1 1.1 0 01-.363.36.67.67 0 01-.416.106m5.08-3.915H15v4.8h1.028V7.434h1.3v-.892h-1.3V5.43h1.4v-.892"
    />
    <path
      fill="#dd2025"
      d="M21.781 20.255s3.188-.578 3.188.511-1.975.646-3.188-.511m-2.357.083a7.5 7.5 0 00-1.473.489l.4-.9c.4-.9.815-2.127.815-2.127a14 14 0 001.658 2.252 13 13 0 00-1.4.288zm-1.262-6.5c0-.949.307-1.208.546-1.208s.508.115.517.939a10.8 10.8 0 01-.517 2.434 4.4 4.4 0 01-.547-2.162zm-4.649 10.516c-.978-.585 2.051-2.386 2.6-2.444-.003.001-1.576 3.056-2.6 2.444M25.9 20.895c-.01-.1-.1-1.207-2.07-1.16a14 14 0 00-2.453.173 12.5 12.5 0 01-2.012-2.655 11.8 11.8 0 00.623-3.1c-.029-1.2-.316-1.888-1.236-1.878s-1.054.815-.933 2.013a9.3 9.3 0 00.665 2.338s-.425 1.323-.987 2.639-.946 2.006-.946 2.006a9.6 9.6 0 00-2.725 1.4c-.824.767-1.159 1.356-.725 1.945.374.508 1.683.623 2.853-.91a23 23 0 001.7-2.492s1.784-.489 2.339-.623 1.226-.24 1.226-.24 1.629 1.639 3.2 1.581 1.495-.939 1.485-1.035"
    />
    <path fill="#909090" d="M23.954 2.077V7.95h5.633z" />
    <path fill="#f4f4f4" d="M24.031 2v5.873h5.633z" />
    <path
      fill="#fff"
      d="M8.975 4.457H7.668v4.8H8.7V7.639l.228.013a2 2 0 00.647-.117 1.4 1.4 0 00.493-.291 1.2 1.2 0 00.332-.454 2.1 2.1 0 00.105-.908 2.2 2.2 0 00-.114-.644 1.17 1.17 0 00-.687-.65 2 2 0 00-.411-.105 2 2 0 00-.319-.026m-.189 2.294h-.089v-1.48h.194a.57.57 0 01.459.181.92.92 0 01.183.558c0 .246 0 .469-.222.626a.94.94 0 01-.524.114m3.67-2.306c-.111 0-.219.008-.295.011l-.235.006h-.78v4.8h.918a2.7 2.7 0 001.028-.175 1.7 1.7 0 00.68-.491 1.9 1.9 0 00.373-.749 3.7 3.7 0 00.114-.949 4.4 4.4 0 00-.087-1.127 1.8 1.8 0 00-.4-.733 1.6 1.6 0 00-.535-.4 2.4 2.4 0 00-.549-.178 1.3 1.3 0 00-.228-.017m-.182 3.937h-.1V5.315h.013a1.06 1.06 0 01.6.107 1.2 1.2 0 01.324.4 1.3 1.3 0 01.142.526c.009.22 0 .4 0 .549a3 3 0 01-.033.513 1.8 1.8 0 01-.169.5 1.1 1.1 0 01-.363.36.67.67 0 01-.416.106m5.077-3.915h-2.43v4.8h1.028V7.357h1.3v-.892h-1.3V5.353h1.4v-.892"
    />
  </svg>
);

const PptIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={commonClasses}
    viewBox="0 0 32 32"
  >
    <defs>
      <linearGradient
        id="powerpoint-gradient"
        x1={4.494}
        x2={13.832}
        y1={-1748.086}
        y2={-1731.914}
        gradientTransform="translate(0 1756)"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset={0} stopColor="#ca4c28" />
        <stop offset={0.5} stopColor="#c5401e" />
        <stop offset={1} stopColor="#b62f14" />
      </linearGradient>
    </defs>
    <path
      fill="#ed6c47"
      d="M18.93 17.3L16.977 3h-.146A12.9 12.9 0 003.953 15.854V16z"
    />
    <path
      fill="#ff8f6b"
      d="M17.123 3h-.146v13l6.511 2.6L30 16v-.146A12.9 12.9 0 0017.123 3"
    />
    <path
      fill="#d35230"
      d="M30 16v.143A12.905 12.905 0 0117.12 29h-.287a12.907 12.907 0 01-12.88-12.857V16z"
    />
    <path
      d="M17.628 9.389V23.26a1.2 1.2 0 01-.742 1.1 1.2 1.2 0 01-.45.091H7.027a10 10 0 01-.521-.65 12.74 12.74 0 01-2.553-7.657v-.286A12.7 12.7 0 016.05 8.85a9 9 0 01.456-.65h9.93a1.2 1.2 0 011.192 1.189"
      opacity={0.1}
    />
    <path
      d="M16.977 10.04v13.871a1.2 1.2 0 01-.091.448 1.2 1.2 0 01-1.1.741H7.62q-.309-.314-.593-.65a10 10 0 01-.521-.65 12.74 12.74 0 01-2.553-7.657v-.286A12.7 12.7 0 016.05 8.85h9.735a1.2 1.2 0 011.192 1.19"
      opacity={0.2}
    />
    <path
      d="M16.977 10.04v12.571a1.2 1.2 0 01-1.192 1.189H6.506a12.74 12.74 0 01-2.553-7.657v-.286A12.7 12.7 0 016.05 8.85h9.735a1.2 1.2 0 011.192 1.19"
      opacity={0.2}
    />
    <path
      d="M16.326 10.04v12.571a1.2 1.2 0 01-1.192 1.189H6.506a12.74 12.74 0 01-2.553-7.657v-.286A12.7 12.7 0 016.05 8.85h9.084a1.2 1.2 0 011.192 1.19"
      opacity={0.2}
    />
    <path
      fill="url(#powerpoint-gradient)"
      d="M3.194 8.85h11.938a1.193 1.193 0 011.194 1.191v11.918a1.193 1.193 0 01-1.194 1.191H3.194A1.19 1.19 0 012 21.959V10.041A1.19 1.19 0 013.194 8.85"
    />
    <path
      fill="#fff"
      d="M9.293 12.028a3.3 3.3 0 012.174.636 2.27 2.27 0 01.756 1.841 2.56 2.56 0 01-.373 1.376 2.5 2.5 0 01-1.059.935 3.6 3.6 0 01-1.591.334H7.687v2.8H6.141v-7.922zM7.686 15.94h1.331a1.74 1.74 0 001.177-.351 1.3 1.3 0 00.4-1.025q0-1.309-1.525-1.31H7.686z"
    />
  </svg>
);

const DocIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={commonClasses}
    viewBox="0 0 32 32"
  >
    <defs>
      <linearGradient
        id="docx-gradient"
        x1={4.494}
        x2={13.832}
        y1={-1712.086}
        y2={-1695.914}
        gradientTransform="translate(0 1720)"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset={0} stopColor="#2368c4" />
        <stop offset={0.5} stopColor="#1a5dbe" />
        <stop offset={1} stopColor="#1146ac" />
      </linearGradient>
    </defs>
    <path
      fill="#41a5ee"
      d="M28.806 3H9.705a1.19 1.19 0 00-1.193 1.191V9.5l11.069 3.25L30 9.5V4.191A1.19 1.19 0 0028.806 3"
    />
    <path fill="#2b7cd3" d="M30 9.5H8.512V16l11.069 1.95L30 16z" />
    <path fill="#185abd" d="M8.512 16v6.5l10.418 1.3L30 22.5V16z" />
    <path
      fill="#103f91"
      d="M9.705 29h19.1A1.19 1.19 0 0030 27.809V22.5H8.512v5.309A1.19 1.19 0 009.705 29"
    />
    <path
      d="M16.434 8.2H8.512v16.25h7.922a1.2 1.2 0 001.194-1.191V9.391A1.2 1.2 0 0016.434 8.2"
      opacity={0.1}
    />
    <path
      d="M15.783 8.85H8.512V25.1h7.271a1.2 1.2 0 001.194-1.191V10.041a1.2 1.2 0 00-1.194-1.191"
      opacity={0.2}
    />
    <path
      d="M15.783 8.85H8.512V23.8h7.271a1.2 1.2 0 001.194-1.191V10.041a1.2 1.2 0 00-1.194-1.191"
      opacity={0.2}
    />
    <path
      d="M15.132 8.85h-6.62V23.8h6.62a1.2 1.2 0 001.194-1.191V10.041a1.2 1.2 0 00-1.194-1.191"
      opacity={0.2}
    />
    <path
      fill="url(#docx-gradient)"
      d="M3.194 8.85h11.938a1.193 1.193 0 011.194 1.191v11.918a1.193 1.193 0 01-1.194 1.191H3.194A1.19 1.19 0 012 21.959V10.041A1.19 1.19 0 013.194 8.85"
    />
    <path
      fill="#fff"
      d="M6.9 17.988q.035.276.046.481h.028q.015-.195.065-.47c.05-.275.062-.338.089-.465l1.255-5.407h1.624l1.3 5.326a8 8 0 01.162 1h.022a8 8 0 01.135-.975l1.039-5.358h1.477l-1.824 7.748h-1.727l-1.237-5.126q-.054-.222-.122-.578t-.084-.52h-.021q-.021.189-.084.561t-.1.552L7.78 19.871H6.024L4.19 12.127h1.5l1.131 5.418a5 5 0 01.079.443"
    />
  </svg>
);

const XlsxIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={commonClasses}
    viewBox="0 0 32 32"
  >
    <defs>
      <linearGradient
        id="xlsx-gradient"
        x1={4.494}
        x2={13.832}
        y1={-2092.086}
        y2={-2075.914}
        gradientTransform="translate(0 2100)"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset={0} stopColor="#18884f" />
        <stop offset={0.5} stopColor="#117e43" />
        <stop offset={1} stopColor="#0b6631" />
      </linearGradient>
    </defs>
    <path
      fill="#185c37"
      d="M19.581 15.35L8.512 13.4v14.409A1.19 1.19 0 009.705 29h19.1A1.19 1.19 0 0030 27.809V22.5z"
    />
    <path
      fill="#21a366"
      d="M19.581 3H9.705a1.19 1.19 0 00-1.193 1.191V9.5L19.581 16l5.861 1.95L30 16V9.5z"
    />
    <path fill="#107c41" d="M8.512 9.5h11.069V16H8.512z" />
    <path
      d="M16.434 8.2H8.512v16.25h7.922a1.2 1.2 0 001.194-1.191V9.391A1.2 1.2 0 0016.434 8.2"
      opacity={0.1}
    />
    <path
      d="M15.783 8.85H8.512V25.1h7.271a1.2 1.2 0 001.194-1.191V10.041a1.2 1.2 0 00-1.194-1.191"
      opacity={0.2}
    />
    <path
      d="M15.783 8.85H8.512V23.8h7.271a1.2 1.2 0 001.194-1.191V10.041a1.2 1.2 0 00-1.194-1.191"
      opacity={0.2}
    />
    <path
      d="M15.132 8.85h-6.62V23.8h6.62a1.2 1.2 0 001.194-1.191V10.041a1.2 1.2 0 00-1.194-1.191"
      opacity={0.2}
    />
    <path
      fill="url(#xlsx-gradient)"
      d="M3.194 8.85h11.938a1.193 1.193 0 011.194 1.191v11.918a1.193 1.193 0 01-1.194 1.191H3.194A1.19 1.19 0 012 21.959V10.041A1.19 1.19 0 013.194 8.85"
    />
    <path
      fill="#fff"
      d="M5.7 19.873l2.511-3.884-2.3-3.862h1.847L9.013 14.6c.116.234.2.408.238.524h.017q.123-.281.26-.546l1.342-2.447h1.7l-2.359 3.84 2.419 3.905h-1.809l-1.45-2.711A2.4 2.4 0 019.2 16.8h-.024a1.7 1.7 0 01-.168.351l-1.493 2.722z"
    />
    <path
      fill="#33c481"
      d="M28.806 3h-9.225v6.5H30V4.191A1.19 1.19 0 0028.806 3"
    />
    <path fill="#107c41" d="M19.581 16H30v6.5H19.581z" />
  </svg>
);

const YamlIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={commonClasses}
    viewBox="0 0 32 32"
  >
    <path
      fill="#ffb703"
      d="M2 12.218c.755 0 1.51-.008 2.264 0l.053.038 2.761 2.758c.891-.906 1.8-1.794 2.7-2.7.053-.052.11-.113.192-.1h1.823a1.4 1.4 0 01.353.019c-.7.67-1.377 1.369-2.069 2.05L5.545 18.8c-.331.324-.648.663-.989.975-.754.022-1.511.007-2.266.007 1.223-1.209 2.431-2.433 3.658-3.637-1.321-1.304-2.63-2.62-3.948-3.927m10.7 0h1.839v7.566c-.611 0-1.222.012-1.832-.008v-4.994c-1.6 1.607-3.209 3.2-4.811 4.8-.089.08-.166.217-.305.194-.824-.006-1.649 0-2.474 0Q8.916 16 12.7 12.218m2.258.002c.47-.009.939 0 1.409 0 .836.853 1.69 1.689 2.536 2.532q1.268-1.267 2.539-2.532h1.4q-.008 3.784 0 7.567c-.471 0-.943.006-1.414 0q.008-2.387 0-4.773c-.844.843-1.676 1.7-2.526 2.536-.856-.835-1.687-1.695-2.532-2.541 0 1.594-.006 3.188.006 4.781-.472 0-.943.005-1.415 0q-.003-3.79-.003-7.57m8.301-.003c.472 0 .944-.007 1.416 0q-.007 3.083 0 6.166h3.782c.063.006.144-.012.191.045.448.454.907.9 1.353 1.354q-3.371.007-6.741 0 .007-3.782-.001-7.565"
    />
  </svg>
);

const MdIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={commonClasses}
    viewBox="0 0 32 32"
  >
    <path
      fill="#0050b2"
      d="M24.023 20.9l1.385 2.1 4.615-7-4.615-7-1.385 2.1 3.232 4.9zM7.977 11.1L6.592 9l-4.615 7 4.615 7 1.385-2.1L4.745 16zM13.035 9h2.8l-.494 2.8h2.8l.494-2.8h2.8l-.494 2.8h2.8l-.495 2.8h-2.8l-.493 2.8h2.8l-.494 2.8h-2.8l-.492 2.8h-2.8l.493-2.8h-2.8l-.485 2.8h-2.808l.493-2.8h-2.8l.494-2.8h2.8l.493-2.793h-2.8l.494-2.807h2.8zm1.319 8.4h2.8l.494-2.8h-2.8z"
    />
  </svg>
);

// --- Configuration Array ---
// This array maps keywords to their corresponding icon components.
// The order matters: more specific keywords should come before general ones.
const iconConfig = [
  { keywords: ["wordprocessingml", "doc"], component: <DocIcon /> },
  { keywords: ["spreadsheetml", "xlsx"], component: <XlsxIcon /> },
  { keywords: ["presentationml", "ppt"], component: <PptIcon /> },
  { keywords: ["pdf"], component: <PdfIcon /> },
  { keywords: ["png", "jpeg", "jpg"], component: <ImgIcon /> },
  { keywords: ["yaml"], component: <YamlIcon /> },
  { keywords: ["markdown", "md"], component: <MdIcon /> },
  { keywords: ["plain", "txt"], component: <TxtIcon /> },
];

/**
 * A component that displays an icon based on the provided file type string.
 * It uses a configuration-based approach for reliable matching.
 *
 * @param {object} props - The component props.
 * @param {string} props.fileType - The file type string (e.g., from a MIME type).
 * @returns {React.ReactElement} The corresponding file icon.
 */
const FileIcon = ({ fileType }: { fileType: string }): React.ReactElement => {
  if (!fileType) {
    return <TxtIcon />; // Return default icon if fileType is empty or null
  }

  // Find the first matching configuration based on the keywords.
  const matchedConfig = iconConfig.find((config) =>
    config.keywords.some((keyword) => fileType.includes(keyword)),
  );

  // If a match is found, return its component. Otherwise, return the fallback icon.
  return matchedConfig ? matchedConfig.component : <TxtIcon />;
};

export default FileIcon;
