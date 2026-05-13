import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect, useState, useRef } from "react"
import { 
  Mail, 
  Save, 
  RotateCcw, 
  CheckCircle2, 
  Info, 
  ExternalLink,
  ChevronRight,
  AlertCircle,
  Copy
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import {
  getEmailTemplates,
  resetEmailTemplate,
  updateEmailTemplate,
} from "@/lib/api"
import type { EmailTemplate, EmailType } from "@/lib/types"
import { useAuthStore } from "@/store/auth-store"
import { cn } from "@/lib/utils"

type TemplateDraft = {
  subjectTemplate: string
  bodyTemplate: string
  active: boolean
}

export function EmailsPage() {
  const queryClient = useQueryClient()
  const activeTeamId = useAuthStore((state) => state.activeTeamId)
  const bodyRef = useRef<HTMLTextAreaElement>(null)
  const subjectRef = useRef<HTMLInputElement>(null)

  const emailTemplatesQuery = useQuery({
    queryKey: ["email-templates", activeTeamId],
    queryFn: getEmailTemplates,
  })

  const [selectedEmailType, setSelectedEmailType] = useState<EmailType | null>(null)
  const [templateDrafts, setTemplateDrafts] = useState<Record<string, TemplateDraft>>({})

  useEffect(() => {
    if (!emailTemplatesQuery.data) return

    setTemplateDrafts(
      Object.fromEntries(
        emailTemplatesQuery.data.map((template) => [
          template.type,
          {
            subjectTemplate: template.subjectTemplate,
            bodyTemplate: template.bodyTemplate,
            active: template.active,
          },
        ])
      )
    )

    setSelectedEmailType((current) => {
      if (current && emailTemplatesQuery.data.some((t) => t.type === current)) return current
      return emailTemplatesQuery.data[0]?.type ?? null
    })
  }, [emailTemplatesQuery.data])

  const saveTemplateMutation = useMutation({
    mutationFn: ({ type, payload }: { type: EmailType; payload: TemplateDraft }) => 
      updateEmailTemplate(type, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["email-templates", activeTeamId] })
    },
  })

  const resetTemplateMutation = useMutation({
    mutationFn: (type: EmailType) => resetEmailTemplate(type),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["email-templates", activeTeamId] })
    },
  })

  const emailTemplates = emailTemplatesQuery.data ?? []
  const selectedTemplate = emailTemplates.find((t) => t.type === selectedEmailType) ?? emailTemplates[0] ?? null
  const selectedDraft = selectedTemplate ? templateDrafts[selectedTemplate.type] : null

  const hasTemplateChanges = !!selectedTemplate && !!selectedDraft && (
    selectedDraft.subjectTemplate !== selectedTemplate.subjectTemplate ||
    selectedDraft.bodyTemplate !== selectedTemplate.bodyTemplate ||
    selectedDraft.active !== selectedTemplate.active
  )

  const insertPlaceholder = (placeholder: string, target: "subject" | "body") => {
    const text = `{{${placeholder}}}`
    if (target === "subject") {
      updateSelectedDraft({ subjectTemplate: (selectedDraft?.subjectTemplate ?? "") + text })
      subjectRef.current?.focus()
    } else {
      updateSelectedDraft({ bodyTemplate: (selectedDraft?.bodyTemplate ?? "") + text })
      bodyRef.current?.focus()
    }
  }

  const updateSelectedDraft = (changes: Partial<TemplateDraft>) => {
    if (!selectedTemplate || !selectedDraft) return
    setTemplateDrafts((prev) => ({
      ...prev,
      [selectedTemplate.type]: { ...selectedDraft, ...changes },
    }))
  }

  if (emailTemplatesQuery.isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm font-medium text-muted-foreground">Loading templates...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 pb-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black tracking-tight">Email Templates</h1>
        <p className="text-muted-foreground">Customize the automated emails sent to your team and clients.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        {/* Template Navigation */}
        <Card className="h-fit border-none shadow-sm ring-1 ring-border/50">
          <CardHeader className="p-4 border-b">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Select Template
            </CardTitle>
          </CardHeader>
          <CardContent className="p-2">
            <div className="flex flex-col gap-1">
              {emailTemplates.map((template) => {
                const isSelected = selectedTemplate?.type === template.type
                return (
                  <button
                    key={template.type}
                    onClick={() => setSelectedEmailType(template.type)}
                    className={cn(
                      "group flex items-center justify-between rounded-xl px-4 py-3 text-left transition-all",
                      isSelected 
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                        : "hover:bg-muted/50 text-foreground"
                    )}
                  >
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-bold">{template.displayName}</span>
                      <span className={cn(
                        "text-[10px] opacity-70",
                        isSelected ? "text-primary-foreground/80" : "text-muted-foreground"
                      )}>
                        {template.active ? "Active Override" : "System Default"}
                      </span>
                    </div>
                    <ChevronRight className={cn("size-4 transition-transform", isSelected ? "translate-x-1" : "opacity-0 group-hover:opacity-50")} />
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Template Editor */}
        <div className="flex flex-col gap-6">
          {selectedTemplate && selectedDraft ? (
            <>
              <Card className="border-none shadow-xl ring-1 ring-border/50 overflow-hidden">
                <CardHeader className="bg-muted/30 border-b p-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex size-12 items-center justify-center rounded-2xl bg-background shadow-sm border">
                        <Mail className="size-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-xl font-black">{selectedTemplate.displayName}</CardTitle>
                        <CardDescription>{selectedTemplate.description}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 rounded-2xl bg-background border px-4 py-2.5 shadow-sm">
                      <div className="text-right">
                        <p className="text-xs font-bold">Override Enabled</p>
                        <p className="text-[10px] text-muted-foreground">Use custom content</p>
                      </div>
                      <Switch
                        checked={selectedDraft.active}
                        onCheckedChange={(checked) => updateSelectedDraft({ active: checked })}
                      />
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-6 space-y-8">
                  {/* Editor Section */}
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="subject" className="text-sm font-bold">Subject Line</Label>
                        <span className="text-[10px] font-medium text-muted-foreground">Supports placeholders</span>
                      </div>
                      <Input
                        id="subject"
                        ref={subjectRef}
                        value={selectedDraft.subjectTemplate}
                        onChange={(e) => updateSelectedDraft({ subjectTemplate: e.target.value })}
                        placeholder="Enter email subject..."
                        className="h-12 text-base font-medium border-border/60 focus:border-primary/50 transition-all"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="body" className="text-sm font-bold">Email Body (Plain Text)</Label>
                        <span className="text-[10px] font-medium text-muted-foreground">Markdown not supported</span>
                      </div>
                      <Textarea
                        id="body"
                        ref={bodyRef}
                        value={selectedDraft.bodyTemplate}
                        onChange={(e) => updateSelectedDraft({ bodyTemplate: e.target.value })}
                        placeholder="Write your email content here..."
                        className="min-h-[300px] text-base leading-relaxed resize-y border-border/60 focus:border-primary/50 transition-all font-mono"
                      />
                    </div>
                  </div>

                  {/* Placeholders Toolbar */}
                  <div className="rounded-2xl border bg-muted/10 p-5 space-y-4">
                    <div className="flex items-center gap-2">
                      <Info className="size-4 text-primary" />
                      <h4 className="text-sm font-bold uppercase tracking-wider">Available Placeholders</h4>
                    </div>
                    <p className="text-xs text-muted-foreground">Click a pill to insert it at the end of the body.</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedTemplate.variables.map((variable) => (
                        <button
                          key={variable}
                          onClick={() => insertPlaceholder(variable, "body")}
                          className="group flex items-center gap-1.5 rounded-full bg-background border px-3 py-1.5 text-[11px] font-black transition-all hover:border-primary hover:text-primary hover:shadow-md"
                        >
                          <span className="text-primary opacity-50">{"{{"}</span>
                          {variable}
                          <span className="text-primary opacity-50">{"}}"}</span>
                          <Copy className="size-3 opacity-0 transition-opacity group-hover:opacity-100" />
                        </button>
                      ))}
                    </div>
                  </div>
                </CardContent>

                <Separator className="bg-border/40" />

                <CardFooter className="p-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-muted/5">
                  <Button
                    variant="ghost"
                    className="font-bold text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    disabled={resetTemplateMutation.isPending || !selectedTemplate.customized}
                    onClick={() => resetTemplateMutation.mutate(selectedTemplate.type)}
                  >
                    <RotateCcw className="mr-2 size-4" />
                    Reset to Default
                  </Button>
                  
                  <div className="flex items-center gap-3">
                    {hasTemplateChanges && (
                      <span className="flex items-center gap-1.5 text-xs font-bold text-amber-600">
                        <AlertCircle className="size-3.5" />
                        Unsaved changes
                      </span>
                    )}
                    <Button
                      className="px-8 h-11 font-black shadow-lg shadow-primary/20"
                      disabled={
                        saveTemplateMutation.isPending ||
                        !hasTemplateChanges ||
                        !selectedDraft.subjectTemplate.trim() ||
                        !selectedDraft.bodyTemplate.trim()
                      }
                      onClick={() =>
                        saveTemplateMutation.mutate({
                          type: selectedTemplate.type,
                          payload: {
                            subjectTemplate: selectedDraft.subjectTemplate.trim(),
                            bodyTemplate: selectedDraft.bodyTemplate.trim(),
                            active: selectedDraft.active,
                          },
                        })
                      }
                    >
                      <Save className="mr-2 size-4" />
                      {saveTemplateMutation.isPending ? "Saving..." : "Save Template"}
                    </Button>
                  </div>
                </CardFooter>
              </Card>

              {/* Default Preview Section */}
              <Card className="border-none bg-background shadow-md ring-1 ring-border/30 opacity-60 grayscale-[0.5] hover:opacity-100 hover:grayscale-0 transition-all">
                <CardHeader className="p-4 border-b border-dashed">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                      <ExternalLink className="size-4" />
                      System Default Preview
                    </CardTitle>
                    <Badge variant="outline">Read-Only</Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase">Default Subject</p>
                    <p className="text-sm font-bold">{selectedTemplate.defaultSubjectTemplate}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase">Default Body</p>
                    <pre className="text-sm font-mono whitespace-pre-wrap bg-muted/20 p-4 rounded-xl border leading-relaxed">
                      {selectedTemplate.defaultBodyTemplate}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <div className="flex h-96 items-center justify-center text-muted-foreground italic">
              Select a template to start editing.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

