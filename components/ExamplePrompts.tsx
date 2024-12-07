import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { Button } from "@/components/ui/button"
import { Info } from "lucide-react"

interface ExamplePromptsProps {
  prompts: string[]
  onSelect: (prompt: string) => void
}

export function ExamplePrompts({ prompts, onSelect }: ExamplePromptsProps) {
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Button variant="ghost" size="sm">
          <Info className="h-4 w-4 mr-2" />
          View example prompts
        </Button>
      </HoverCardTrigger>
      <HoverCardContent className="w-80">
        <div className="space-y-2">
          <h4 className="text-sm font-semibold">Example Prompts</h4>
          <div className="space-y-1">
            {prompts.map((prompt, i) => (
              <Button
                key={i}
                variant="ghost"
                size="sm"
                className="w-full justify-start text-left"
                onClick={() => onSelect(prompt)}
              >
                {prompt}
              </Button>
            ))}
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  )
} 