"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, X, Loader2, FileText, Edit2 } from "lucide-react";
import { Textarea } from "./ui/textarea";

interface PlanReviewProps {
  plan: string;
  chatId: string;
  onApprove: () => void;
  onReject: () => void;
}

export function PlanReview({ plan, chatId, onApprove, onReject }: PlanReviewProps) {
  const [editedPlan, setEditedPlan] = useState(plan);
  const [isEditing, setIsEditing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleApprove = async () => {
    setIsGenerating(true);
    setError(null);
    
    try {
      const response = await fetch("/api/generate-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chatId }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to generate code");
      }

      onApprove();
    } catch (err: any) {
      setError(err.message || "Failed to generate code");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    if (!isEditing) {
      setEditedPlan(plan);
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <FileText className="h-4 w-4 text-primary" />
          </div>
          <h3 className="font-medium">Architecture Plan</h3>
        </div>
        {!isEditing && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleEditToggle}
            className="gap-2"
          >
            <Edit2 className="h-4 w-4" />
            Edit
          </Button>
        )}
      </div>

      {isEditing ? (
        <Textarea
          value={editedPlan}
          onChange={(e) => setEditedPlan(e.target.value)}
          className="min-h-[200px] font-mono text-sm"
          placeholder="Edit the plan..."
        />
      ) : (
        <div className="rounded-lg border border-border bg-muted/30 p-4">
          <pre className="whitespace-pre-wrap text-sm font-mono text-foreground">
            {editedPlan}
          </pre>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="flex items-center gap-3">
        {isEditing ? (
          <>
            <Button
              onClick={handleEditToggle}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                setEditedPlan(editedPlan);
                setIsEditing(false);
              }}
              className="flex-1"
            >
              Save Changes
            </Button>
          </>
        ) : (
          <>
            <Button
              onClick={onReject}
              variant="outline"
              className="flex-1 gap-2"
            >
              <X className="h-4 w-4" />
              Reject
            </Button>
            <Button
              onClick={handleApprove}
              disabled={isGenerating}
              className="flex-1 gap-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  Approve & Generate
                </>
              )}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
