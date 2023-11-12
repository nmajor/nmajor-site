import * as React from "react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { Input } from "@/components/ui/input";

export default function UiPage({
  className,
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <div className={cn(className)}>
      <div className="container flex flex-col gap-8">
        <div className="flex flex-col gap-3">
          <div>Buttons</div>
          <div className="flex items-center gap-3">
            <Button size="icon" variant="default">
              <Icons.sun />
            </Button>
            <Button size="sm" variant="default">
              Default sm
            </Button>
            <Button size="default" variant="default">
              Default
            </Button>
            <Button size="lg" variant="default">
              Default lg
            </Button>
          </div>
          <div className="flex items-center gap-3">
            <Button size="icon" variant="destructive">
              <Icons.sun />
            </Button>
            <Button size="sm" variant="destructive">
              Destructive sm
            </Button>
            <Button size="default" variant="destructive">
              Destructive
            </Button>
            <Button size="lg" variant="destructive">
              Destructive lg
            </Button>
          </div>
          <div className="flex items-center gap-3">
            <Button size="icon" variant="ghost">
              <Icons.sun />
            </Button>
            <Button size="sm" variant="ghost">
              Ghost sm
            </Button>
            <Button size="default" variant="ghost">
              Ghost
            </Button>
            <Button size="lg" variant="ghost">
              Ghost lg
            </Button>
          </div>
          <div className="flex items-center gap-3">
            <Button size="icon" variant="link">
              <Icons.sun />
            </Button>
            <Button size="sm" variant="link">
              Link sm
            </Button>
            <Button size="default" variant="link">
              Link
            </Button>
            <Button size="lg" variant="link">
              Link lg
            </Button>
          </div>
          <div className="flex items-center gap-3">
            <Button size="icon" variant="outline">
              <Icons.sun />
            </Button>
            <Button size="sm" variant="outline">
              Outline sm
            </Button>
            <Button size="default" variant="outline">
              Outline
            </Button>
            <Button size="lg" variant="outline">
              Outline lg
            </Button>
          </div>
          <div className="flex items-center gap-3">
            <Button size="icon" variant="secondary">
              <Icons.sun />
            </Button>
            <Button size="sm" variant="secondary">
              Secondary sm
            </Button>
            <Button size="default" variant="secondary">
              Secondary
            </Button>
            <Button size="lg" variant="secondary">
              Secondary lg
            </Button>
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <div>Input</div>
          <div className="flex items-center gap-3">
            <Input />
          </div>
        </div>
      </div>
    </div>
  );
}
