import { useState } from "react";
import { useRedLinkStore, BloodGroup } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, BellOff, CheckCircle2, Clock, XCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";

export function DonorDashboard() {
  const { 
    isAvailable, 
    setDonorAvailability, 
    donorBloodGroup, 
    setDonorBloodGroup,
    activeRequests,
    respondToRequest
  } = useRedLinkStore();

  const relevantRequests = activeRequests.filter(req => 
    // Show request if it matches blood group OR if the donor has already responded to it (to show history)
    req.bloodGroup === donorBloodGroup
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="grid gap-8 md:grid-cols-[300px_1fr]">
        
        {/* Left Column: Profile & Status */}
        <div className="space-y-6">
          <Card className="p-6 border-none shadow-lg bg-white relative overflow-hidden">
             {/* Status Indicator Background */}
             <div className={`absolute top-0 left-0 w-full h-2 ${isAvailable ? 'bg-green-500' : 'bg-slate-200'}`} />
             
             <div className="mb-6">
               <h2 className="text-xl font-bold mb-1">Donor Status</h2>
               <p className="text-sm text-muted-foreground">Manage your availability</p>
             </div>

             <div className="space-y-6">
               <div className="space-y-2">
                 <Label>Blood Group</Label>
                 <Select value={donorBloodGroup} onValueChange={(v) => setDonorBloodGroup(v as BloodGroup)}>
                   <SelectTrigger>
                     <SelectValue />
                   </SelectTrigger>
                   <SelectContent>
                     {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                       <SelectItem key={bg} value={bg}>{bg}</SelectItem>
                     ))}
                   </SelectContent>
                 </Select>
               </div>

               <div className="flex flex-col gap-4 p-4 rounded-xl bg-muted/30 border">
                 <div className="flex items-center justify-between">
                   <Label htmlFor="availability-mode" className="font-medium">Active Mode</Label>
                   <Switch 
                     id="availability-mode"
                     checked={isAvailable}
                     onCheckedChange={setDonorAvailability}
                   />
                 </div>
                 <div className="text-xs text-muted-foreground leading-relaxed">
                   {isAvailable ? (
                     <span className="flex items-center gap-2 text-green-600 font-medium">
                       <Bell className="h-3 w-3" /> You will receive emergency alerts.
                     </span>
                   ) : (
                     <span className="flex items-center gap-2 text-slate-500">
                       <BellOff className="h-3 w-3" /> Notifications paused.
                     </span>
                   )}
                 </div>
               </div>
             </div>
          </Card>
        </div>

        {/* Right Column: Alerts Feed */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold font-heading">Incoming Alerts</h2>
            <Badge variant="outline" className="px-3 py-1">
              {relevantRequests.filter(r => r.status === 'pending').length} Active
            </Badge>
          </div>

          <div className="space-y-4">
            <AnimatePresence>
              {relevantRequests.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }}
                  className="text-center py-12 bg-muted/20 rounded-2xl border border-dashed"
                >
                  <div className="bg-white p-4 rounded-full inline-block mb-4 shadow-sm">
                    <CheckCircle2 className="h-8 w-8 text-green-500" />
                  </div>
                  <h3 className="text-lg font-medium">All Clear</h3>
                  <p className="text-muted-foreground">No emergency requests nearby for {donorBloodGroup}.</p>
                </motion.div>
              ) : (
                relevantRequests.map((req) => (
                  <motion.div
                    key={req.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                  >
                    <Card className={`p-5 overflow-hidden border-l-4 ${
                      req.status === 'pending' ? 'border-l-primary shadow-md' : 'border-l-slate-200 opacity-80'
                    }`}>
                      <div className="flex flex-col sm:flex-row justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                             <Badge variant={req.status === 'pending' ? 'destructive' : 'secondary'} className="uppercase tracking-wider text-[10px]">
                               {req.status === 'pending' ? 'Emergency' : req.status}
                             </Badge>
                             <span className="text-xs text-muted-foreground flex items-center gap-1">
                               <Clock className="h-3 w-3" /> {formatDistanceToNow(req.timestamp, { addSuffix: true })}
                             </span>
                          </div>
                          <h3 className="text-lg font-bold">{req.hospitalName}</h3>
                          <p className="text-muted-foreground mb-4">
                            Needs <span className="font-semibold text-foreground">{req.quantity} units</span> of <span className="font-semibold text-foreground">{req.bloodGroup}</span> blood.
                          </p>
                        </div>
                        
                        {req.status === 'pending' && (
                          <div className="flex sm:flex-col gap-2 justify-center min-w-[140px]">
                            <Button 
                              onClick={() => respondToRequest(req.id, 'accepted')}
                              className="w-full bg-green-600 hover:bg-green-700"
                            >
                              Accept
                            </Button>
                            <Button 
                              variant="outline" 
                              onClick={() => respondToRequest(req.id, 'ignored')}
                              className="w-full"
                            >
                              Ignore
                            </Button>
                          </div>
                        )}
                        
                        {req.status !== 'pending' && (
                           <div className="flex items-center justify-end sm:justify-center min-w-[140px] text-sm font-medium">
                             {req.status === 'accepted' ? (
                               <span className="text-green-600 flex items-center gap-1">
                                 <CheckCircle2 className="h-4 w-4" /> Accepted
                               </span>
                             ) : (
                               <span className="text-muted-foreground flex items-center gap-1">
                                 <XCircle className="h-4 w-4" /> Ignored
                               </span>
                             )}
                           </div>
                        )}
                      </div>
                    </Card>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
