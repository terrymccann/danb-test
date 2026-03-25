import { Badge } from "@/components/ui/badge";

interface ScienceTagProps {
  label: string;
}

export function ScienceTag({ label }: ScienceTagProps) {
  return (
    <Badge variant="secondary" className="text-xs font-medium">
      {label}
    </Badge>
  );
}
