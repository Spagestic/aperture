"use client";

import { Accordion } from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnalyzeQuestionRow, type QuestionRowData } from "./question-row";

export function AnalyzeQuestionTimeline({
  questions,
  active,
}: {
  questions: QuestionRowData[];
  active: boolean;
}) {
  return (
    <Card className="border-border/70">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Research questions</CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="multiple" className="w-full">
          {questions.map((q, i) => (
            <AnalyzeQuestionRow
              key={q._id}
              index={i + 1}
              question={q}
              active={active}
            />
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}
