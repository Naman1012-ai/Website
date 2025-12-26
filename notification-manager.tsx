import { useEffect } from "react";
import { useRedLinkStore } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import { BellRing } from "lucide-react";

export function NotificationManager() {
  const { activeRequests, isAvailable, donorBloodGroup } = useRedLinkStore();
  const { toast } = useToast();

  useEffect(() => {
    // Check for new pending requests suitable for this donor
    const latestRequest = activeRequests[0];
    
    if (!latestRequest) return;
    
    // Only notify if:
    // 1. Request is new (we check timestamp relative to now roughly, or just if it's pending)
    // 2. Donor is available
    // 3. Status is pending
    // 4. Blood group matches (or is universal donor logic - keeping simple strict match for demo)
    
    const isRelevant = 
        latestRequest.status === 'pending' && 
        isAvailable && 
        (latestRequest.bloodGroup === donorBloodGroup);

    if (isRelevant) {
      // Browser Notification Simulation
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification(`Emergency: ${latestRequest.bloodGroup} Needed`, {
          body: `${latestRequest.hospitalName} needs ${latestRequest.quantity} units urgently.`,
          icon: "/favicon.png"
        });
      }

      // In-App Toast
      toast({
        title: "EMERGENCY ALERT",
        description: `${latestRequest.hospitalName} needs ${latestRequest.bloodGroup} blood immediately.`,
        variant: "destructive",
        duration: 10000,
        action: (
          <div className="flex items-center gap-2">
            <BellRing className="h-4 w-4 animate-pulse" />
            <span>Action Required</span>
          </div>
        )
      });
    }
  }, [activeRequests, isAvailable, donorBloodGroup, toast]);

  // Request notification permission on mount
  useEffect(() => {
    if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);

  return null; // Headless component
}
