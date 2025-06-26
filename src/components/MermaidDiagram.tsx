import { MermaidDiagram as _MermaidDiagram } from "@lightenna/react-mermaid-diagram";
import { cn } from "../utilities/cn";

export interface MermaidDiagramProps {
  children: string;
  className?: string;
}

export const MermaidDiagram: React.FC<MermaidDiagramProps> = ({
  children,
  className,
}) => {
  return (
    <div
      className={cn(
        className,
        "flex h-full w-full min-w-full items-center justify-start overflow-hidden",
      )}
    >
      <_MermaidDiagram className="min-w-full overflow-hidden" theme="dark">
        {children}
      </_MermaidDiagram>
    </div>
  );
};
