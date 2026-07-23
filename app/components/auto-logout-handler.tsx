"use client";

import { useAutoLogout } from "@/app/hooks/auto-logout";
import { usePathname } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const PUBLIC_PATHS = ['/login', '/tradingpartner-form', '/invite'];

export function AutoLogoutHandler() {
  const pathname = usePathname();
  const isPublicPath = PUBLIC_PATHS.some((p) => pathname?.startsWith(p));

  if (isPublicPath) {
    return null;
  }

  return <AutoLogoutContent />;
}

function AutoLogoutContent() {
  const { isIdle, confirmPresence, performLogout, remainingTime } =
    useAutoLogout();

  return (
    <Dialog open={isIdle} onOpenChange={(open) => !open && performLogout()}>
      <DialogContent className="sm:max-w-md text-center">
        <DialogHeader className="space-y-4">
          <DialogTitle className="text-2xl font-bold text-center">
            Are you still there?
          </DialogTitle>
          <DialogDescription className="text-lg text-center">
            You have been inactive for a while.
            <br />
            You will be logged out automatically in
          </DialogDescription>
        </DialogHeader>

        <div className="py-6 flex justify-center items-center flex-col">
          <div className="text-6xl font-black text-accent tabular-nums">
            {remainingTime}
          </div>
          <div className="text-xl text-muted-theme">seconds</div>
        </div>

        <DialogFooter className="sm:justify-center gap-4">
          <Button
            variant="destructive"
            onClick={performLogout}
            className="w-full sm:w-auto text-lg px-8"
            size="lg"
          >
            Logout
          </Button>
          <Button
            onClick={confirmPresence}
            className="w-full sm:w-auto text-lg px-8"
            size="lg"
          >
            I&apos;m here
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
