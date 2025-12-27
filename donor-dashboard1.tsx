import { useState, useEffect } from "react";
import { useRedLinkStore, BloodGroup } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Bell, BellOff, CheckCircle2, Clock, XCircle, MapPin, Navigation, Timer, Moon, LogOut, User, ShieldAlert, Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format, formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";

export function DonorDashboard() {
  const { 
    currentDonorId,
    donors,
    authenticateDonor,
    logoutDonor,
    setDonorAvailability, 
    scheduleAvailability,
    activeRequests,
    respondToRequest
  } = useRedLinkStore();

  const donor = currentDonorId ? donors[currentDonorId] : null;
  const isDonorAuthenticated = !!currentDonorId;
  const donorName = donor?.name || "";
  const donorBloodGroup = donor?.bloodGroup || null;
  const isAvailable = donor?.isAvailable ?? false;
  const scheduledActiveTime = donor?.scheduledActiveTime ?? null;
  const donationCount = donor?.donationCount ?? 0;
  const lastDonationDate = donor?.lastDonationDate ?? null;

  const { toast } = useToast();
  
  const [showRoute, setShowRoute] = useState<string | null>(null);
  const [isMaintenanceEnabled, setIsMaintenanceEnabled] = useState(false);
  const [thankYouRequest, setThankYouRequest] = useState<string | null>(null);
  
  // Login form state
  const [loginName, setLoginName] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginBloodGroup, setLoginBloodGroup] = useState<BloodGroup | "">("");
  const [loginAge, setLoginAge] = useState("");
  const [loginWeight, setLoginWeight] = useState("");
  const [loginLastDonation, setLoginLastDonation] = useState("");
  const [eligibilityError, setEligibilityError] = useState<string | null>(null);

  const isActuallyAvailable = isAvailable && !scheduledActiveTime;
  
  // Calculate if the donor is in a forced recovery period
  const threeMonthsAgo = Date.now() - (90 * 24 * 3600000);
  const isInRecovery = lastDonationDate ? lastDonationDate > threeMonthsAgo : false;
  const isHardLocked = isInRecovery || donationCount >= 2;

  useEffect(() => {
    if (donationCount >= 2 && isActuallyAvailable) {
      toast({
        title: "Daily Limit Reached",
        description: `For your health, you can only donate twice in a day. You are now inactive until ${format(Date.now() + (90 * 24 * 3600000), "PPP")}.`,
        variant: "destructive",
        duration: 8000,
      });
    }
  }, [donationCount, isActuallyAvailable, toast]);

  useEffect(() => {
    if (lastDonationDate) {
      const threeMonthsAgoCheck = Date.now() - (90 * 24 * 3600000);
      if (lastDonationDate > threeMonthsAgoCheck && isActuallyAvailable) {
         toast({
          title: "Waiting Period Active",
          description: "You recently donated blood. For your safety, you remain inactive until the 3-month recovery period is complete.",
          duration: 8000,
        });
      }
    }
  }, [lastDonationDate, isActuallyAvailable, toast]);

  useEffect(() => {
    if (!scheduledActiveTime) return;

    const checkTime = setInterval(() => {
      const now = Date.now();
      if (now >= scheduledActiveTime) {
        clearInterval(checkTime);
        setIsMaintenanceEnabled(false);
        toast({
          title: "Inactive Period Over",
          description: "Your scheduled break has finished. Ready to reactivate?",
          action: <Button variant="outline" size="sm" onClick={() => setDonorAvailability(true)}>Activate Now</Button>,
          duration: 10000,
        });
      }
    }, 1000);

    return () => clearInterval(checkTime);
  }, [scheduledActiveTime, setDonorAvailability, toast]);

  // Logic to show matching requests for the CURRENT donor
  const matchingRequests = activeRequests.filter(req => 
    req.bloodGroup === donorBloodGroup && 
    (req.status === 'pending' || req.acceptedByDonor === donorName)
  );
  const pendingRequests = matchingRequests.filter(req => req.status === 'pending');
  const historyRequests = matchingRequests.filter(req => req.status === 'accepted');

  const handleDonorLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const ageNum = parseInt(loginAge);
    const weightNum = parseFloat(loginWeight);
    const lastDate = loginLastDonation ? new Date(loginLastDonation).getTime() : null;

    if (ageNum < 18) {
      setEligibilityError("Minimum age for blood donation is 18 years.");
      return;
    }
    if (weightNum < 50) {
      setEligibilityError("Minimum weight for blood donation is 50kg.");
      return;
    }

    if (loginName && loginBloodGroup && ageNum && weightNum && loginPassword) {
      authenticateDonor(loginName, loginBloodGroup as BloodGroup, ageNum, weightNum, lastDate, loginPassword);
      toast({ title: "Welcome!", description: `Logged in as ${loginName}` });
    }
  };

  if (!isDonorAuthenticated) {
    return (
      <div className="container flex items-center justify-center min-h-[80vh] px-4">
        <Card className="w-full max-w-md p-8 border-t-4 border-t-primary shadow-2xl">
          <div className="text-center mb-8">
            <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-3xl font-bold font-heading">Donor Access</h2>
            <p className="text-muted-foreground mt-2">Setup your donor profile to start saving lives.</p>
          </div>
          <form onSubmit={handleDonorLogin} className="space-y-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input 
                placeholder="e.g. John Doe" 
                value={loginName} 
                onChange={(e) => setLoginName(e.target.value)} 
                className="h-12"
              />
            </div>
            <div className="space-y-2">
              <Label>Security Password</Label>
              <Input 
                type="password"
                placeholder="Unique key for your profile" 
                value={loginPassword} 
                onChange={(e) => setLoginPassword(e.target.value)} 
                className="h-12"
              />
            </div>
            <div className="space-y-2">
              <Label>Your Blood Group</Label>
              <Select value={loginBloodGroup} onValueChange={(v) => setLoginBloodGroup(v as BloodGroup)}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Select Group" />
                </SelectTrigger>
                <SelectContent>
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                    <SelectItem key={bg} value={bg}>{bg}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Age</Label>
                <Input 
                  type="number"
                  placeholder="e.g. 25" 
                  value={loginAge} 
                  onChange={(e) => {
                    setLoginAge(e.target.value);
                    setEligibilityError(null);
                  }} 
                  className="h-12"
                />
              </div>
              <div className="space-y-2">
                <Label>Weight (kg)</Label>
                <Input 
                  type="number"
                  placeholder="e.g. 70" 
                  value={loginWeight} 
                  onChange={(e) => {
                    setLoginWeight(e.target.value);
                    setEligibilityError(null);
                  }} 
                  className="h-12"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Last Donation Date (Optional)</Label>
              <Input 
                type="date"
                value={loginLastDonation} 
                onChange={(e) => {
                  setLoginLastDonation(e.target.value);
                  const lastDateInput = new Date(e.target.value).getTime();
                  const threeMonthsAgoLimit = Date.now() - (90 * 24 * 3600000);
                  if (lastDateInput > threeMonthsAgoLimit) {
                    setEligibilityError("Note: Last donation was less than 3 months ago. You will be inactive until the recovery period ends.");
                  } else {
                    setEligibilityError(null);
                  }
                }} 
                className="h-12"
              />
            </div>

            <AnimatePresence>
              {eligibilityError && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  className={`p-3 border rounded-lg flex items-center gap-2 text-sm ${eligibilityError.includes("Note:") ? "bg-amber-50 border-amber-200 text-amber-700" : "bg-destructive/10 border-destructive/20 text-destructive"}`}
                >
                  <ShieldAlert className="h-4 w-4 shrink-0" />
                  {eligibilityError}
                </motion.div>
              )}
            </AnimatePresence>

            <Button type="submit" className="w-full h-12 text-lg font-bold" disabled={!loginName || !loginPassword || !loginBloodGroup || !loginAge || !loginWeight}>
              Start Helping
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold font-heading">Hello, {donorName}</h1>
          <p className="text-muted-foreground">Blood Type: <span className="font-bold text-primary">{donorBloodGroup}</span></p>
        </div>
        <Button variant="ghost" size="sm" onClick={logoutDonor} className="text-muted-foreground hover:text-destructive">
          <LogOut className="h-4 w-4 mr-2" /> Logout
        </Button>
      </div>

      <Tabs defaultValue="status" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="status">Status & Alerts</TabsTrigger>
          <TabsTrigger value="history">Full History</TabsTrigger>
        </TabsList>

        <TabsContent value="status">
          <div className="grid gap-8 md:grid-cols-[300px_1fr]">
            <div className="space-y-6">
              <Card className="p-6 border-none shadow-lg bg-white relative overflow-hidden">
                <div className={`absolute top-0 left-0 w-full h-2 ${isActuallyAvailable ? 'bg-green-500' : scheduledActiveTime ? 'bg-amber-500' : 'bg-slate-200'}`} />
                
                <div className="mb-6">
                  <h2 className="text-xl font-bold mb-1">Donor Status</h2>
                  <p className="text-sm text-muted-foreground">Control your availability</p>
                </div>

                <div className="space-y-6">
                  <div className="flex flex-col gap-4 p-4 rounded-xl bg-muted/30 border">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`h-2.5 w-2.5 rounded-full ${isActuallyAvailable ? 'bg-green-500 animate-pulse' : 'bg-slate-400'}`} />
                        <Label className="font-bold text-sm">Active Mode</Label>
                      </div>
                      <Badge variant={isActuallyAvailable ? "default" : "secondary"} className={isActuallyAvailable ? "bg-green-100 text-green-700 hover:bg-green-100 border-green-200" : ""}>
                        {isActuallyAvailable ? "ONLINE" : "PAUSED"}
                      </Badge>
                    </div>
                    
                    <div className="space-y-4 pt-2 border-t">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="inactive-mode" className="text-xs font-semibold uppercase text-muted-foreground flex items-center gap-2">
                          <Moon className="h-3 w-3" /> Inactive Mode
                        </Label>
                        <Switch 
                          id="inactive-mode"
                          disabled={isHardLocked}
                          checked={!isAvailable || !!scheduledActiveTime}
                          onCheckedChange={(val) => {
                            if (isHardLocked) return;
                            if (!val) {
                              setDonorAvailability(true);
                              setIsMaintenanceEnabled(false);
                            } else {
                              setDonorAvailability(false);
                              setIsMaintenanceEnabled(true);
                            }
                          }}
                        />
                      </div>

                      <AnimatePresence>
                        {(isMaintenanceEnabled || !!scheduledActiveTime || isHardLocked) && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="space-y-3 overflow-hidden"
                          >
                            {!scheduledActiveTime && !isHardLocked && (
                              <div className="grid grid-cols-2 gap-2">
                                <Button variant="outline" size="sm" onClick={() => scheduleAvailability(1)}>1 Hour</Button>
                                <Button variant="outline" size="sm" onClick={() => scheduleAvailability(4)}>4 Hours</Button>
                                <Button variant="outline" size="sm" onClick={() => scheduleAvailability(8)}>8 Hours</Button>
                                <Button variant="outline" size="sm" onClick={() => scheduleAvailability(24)}>24 Hours</Button>
                              </div>
                            )}
                            
                            <div className={`p-3 border rounded-lg ${isHardLocked ? 'bg-destructive/5 border-destructive/20' : 'bg-amber-50 border-amber-100'}`}>
                              <p className={`text-[11px] font-medium leading-tight ${isHardLocked ? 'text-destructive' : 'text-amber-800'}`}>
                                {isHardLocked 
                                  ? `Medical Lock: You cannot change status until your recovery ends on ${format(scheduledActiveTime || (lastDonationDate ? lastDonationDate + (90 * 24 * 3600000) : Date.now()), "PPP")}.`
                                  : scheduledActiveTime 
                                    ? `Currently unavailable. Auto-reactivating ${formatDistanceToNow(scheduledActiveTime, { addSuffix: true })}.`
                                    : "Select a duration to become temporarily unavailable for emergency requests."}
                              </p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold font-heading">Emergency Alerts</h2>
                <Badge variant="outline" className="px-3 py-1">
                  {isActuallyAvailable ? pendingRequests.length : 0} Active
                </Badge>
              </div>

              <div className="space-y-4">
                <AnimatePresence>
                  {!isActuallyAvailable ? (
                    <div className="space-y-6">
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                        <div className="bg-white p-4 rounded-full inline-block mb-4 shadow-sm border border-slate-100">
                          <BellOff className="h-8 w-8 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-medium text-slate-600">Feed Paused</h3>
                        <p className="text-slate-400 max-w-[200px] mx-auto text-sm">You are currently unavailable for new alerts.</p>
                      </motion.div>

                      {historyRequests.filter(r => r.status === 'accepted').length > 0 && (
                        <div className="space-y-3">
                          <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Recently Accepted</h4>
                          {historyRequests.filter(r => r.status === 'accepted').slice(0, 2).map((req) => (
                            <Card key={req.id} className="p-4 border-l-4 border-l-green-500 shadow-sm opacity-80">
                              <div className="flex justify-between items-center">
                                <div>
                                  <h5 className="font-bold text-sm">{req.hospitalName}</h5>
                                  <p className="text-xs text-muted-foreground">Coordinating {req.bloodGroup} delivery</p>
                                </div>
                                <CheckCircle2 className="h-5 w-5 text-green-500" />
                              </div>
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : pendingRequests.length === 0 ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12 bg-muted/20 rounded-2xl border border-dashed">
                      <CheckCircle2 className="h-8 w-8 text-green-500 mx-auto mb-4" />
                      <h3 className="text-lg font-medium">No Active Emergencies</h3>
                    </motion.div>
                  ) : (
                    pendingRequests.map((req) => (
                      <motion.div key={req.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                        <Card className="p-5 border-l-4 border-l-primary shadow-md">
                          <div className="flex flex-col sm:flex-row justify-between gap-4">
                            <div>
                              <Badge variant="destructive" className="mb-2">EMERGENCY</Badge>
                              <h3 className="text-lg font-bold">{req.hospitalName}</h3>
                              <p className="text-muted-foreground">Needs {req.quantity} units of {req.bloodGroup}</p>
                            </div>
                            <div className="flex gap-2">
                              <Button 
                                onClick={() => {
                                  respondToRequest(req.id, 'accepted');
                                  setThankYouRequest(req.id);
                                  setTimeout(() => setThankYouRequest(null), 5000);
                                }}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                Accept
                              </Button>
                              <Button variant="outline" onClick={() => respondToRequest(req.id, 'ignored')}>Ignore</Button>
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="history">
          <AnimatePresence>
            {thankYouRequest && (
              <motion.div
                initial={{ opacity: 0, y: -20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="mb-8 p-8 bg-green-50 border-2 border-green-200 rounded-3xl text-center shadow-xl relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-green-500" />
                <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1, repeat: Infinity }} className="inline-block mb-4">
                  <Heart className="h-12 w-12 text-green-600 fill-current" />
                </motion.div>
                <h2 className="text-3xl font-bold text-green-800 mb-2">Life Saver!</h2>
                <p className="text-green-700 text-lg">Thank you for accepting the request. Your selfless act can save a life today.</p>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-4">
            {matchingRequests.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground">No coordination history found.</div>
            ) : (
              matchingRequests.map((req) => (
                <Card key={req.id} className={`p-5 ${req.status === 'pending' ? 'border-l-4 border-l-amber-400' : ''}`}>
                  <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold">{req.hospitalName}</h3>
                        <p className="text-sm text-muted-foreground">{req.bloodGroup} • {req.quantity} units • {formatDistanceToNow(req.timestamp)} ago</p>
                      </div>
                      <Badge 
                        variant={req.status === 'accepted' ? 'default' : req.status === 'pending' ? 'secondary' : 'outline'}
                        className={req.status === 'accepted' ? "bg-green-600 hover:bg-green-700" : ""}
                      >
                        {req.status}
                      </Badge>
                    </div>
                    
                    {req.status === 'accepted' && (
                      <div className="border-t pt-4 space-y-4">
                        <div className="flex items-center gap-4 text-sm font-medium">
                          <Button variant="outline" size="sm" onClick={() => setShowRoute(showRoute === req.id ? null : req.id)}>
                            <Navigation className="h-4 w-4 mr-2" /> {showRoute === req.id ? "Hide Route" : "Show Route to Hospital"}
                          </Button>
                          <div className="flex items-center text-green-600">
                            <MapPin className="h-4 w-4 mr-1" /> Hospital is tracking your arrival
                          </div>
                        </div>

                        {donationCount >= 2 && (
                          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-2 text-destructive text-xs font-bold">
                            <ShieldAlert className="h-4 w-4 shrink-0" />
                            SAFETY LIMIT REACHED: Inactive until recovery period ends.
                          </div>
                        )}
                        
                        {showRoute === req.id && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="bg-muted rounded-lg p-4 h-48 flex items-center justify-center relative overflow-hidden">
                            <div className="absolute inset-0 bg-[url('https://api.placeholder.com/600/400')] bg-cover opacity-50" />
                            <div className="relative z-10 text-center font-bold text-primary">
                              <Navigation className="h-8 w-8 mb-2 animate-bounce mx-auto" />
                              Fastest route: 12 mins via Main St.
                            </div>
                          </motion.div>
                        )}
                      </div>
                    )}
                  </div>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
