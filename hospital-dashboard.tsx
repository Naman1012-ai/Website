import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRedLinkStore, BloodGroup } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Activity, Radio, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

const requestSchema = z.object({
  bloodGroup: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']),
  quantity: z.coerce.number().min(1, "At least 1 unit required").max(10, "Max 10 units per request"),
});

export function HospitalDashboard() {
  const { createRequest, activeRequests, hospitalName } = useRedLinkStore();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof requestSchema>>({
    resolver: zodResolver(requestSchema),
    defaultValues: {
      quantity: 1,
    }
  });

  function onSubmit(values: z.infer<typeof requestSchema>) {
    createRequest(values.bloodGroup as BloodGroup, values.quantity);
    toast({
      title: "Broadcast Sent",
      description: `Request for ${values.quantity} units of ${values.bloodGroup} broadcasted to nearby donors.`,
    });
    form.reset({ quantity: 1, bloodGroup: values.bloodGroup });
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="grid gap-8 lg:grid-cols-[400px_1fr]">
        
        {/* Left: Request Form */}
        <div className="space-y-6">
          <Card className="p-6 border-t-4 border-t-primary shadow-lg">
            <div className="mb-6">
              <div className="flex items-center gap-2 text-primary mb-2">
                <Activity className="h-5 w-5" />
                <span className="font-bold tracking-wider text-sm uppercase">Emergency Broadcast</span>
              </div>
              <h2 className="text-2xl font-bold font-heading">Request Blood</h2>
              <p className="text-muted-foreground mt-1">This will alert all active donors immediately.</p>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="bloodGroup"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Required Blood Group</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-12 text-lg">
                            <SelectValue placeholder="Select Type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                            <SelectItem key={bg} value={bg}>{bg}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Units Needed</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} className="h-12 text-lg" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" size="lg" className="w-full h-14 text-lg bg-primary hover:bg-primary/90 animate-pulse-slow">
                  <Radio className="mr-2 h-5 w-5 animate-pulse" />
                  Broadcast Alert
                </Button>
              </form>
            </Form>
          </Card>
          
          <Card className="p-6 bg-slate-900 text-slate-100">
             <div className="flex items-center gap-3 mb-2">
               <Users className="h-5 w-5 text-blue-400" />
               <h3 className="font-bold">System Status</h3>
             </div>
             <p className="text-sm text-slate-400">
               Connected as <strong>{hospitalName}</strong>.<br/>
               Network is active. 124 donors currently online.
             </p>
          </Card>
        </div>

        {/* Right: History */}
        <div className="space-y-6">
           <h2 className="text-2xl font-bold font-heading">Request History</h2>
           <Card className="overflow-hidden">
             <Table>
               <TableHeader>
                 <TableRow>
                   <TableHead>Blood Group</TableHead>
                   <TableHead>Units</TableHead>
                   <TableHead>Status</TableHead>
                   <TableHead className="text-right">Time</TableHead>
                 </TableRow>
               </TableHeader>
               <TableBody>
                 {activeRequests.length === 0 ? (
                   <TableRow>
                     <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                       No requests sent yet.
                     </TableCell>
                   </TableRow>
                 ) : (
                   activeRequests.map((req) => (
                     <TableRow key={req.id}>
                       <TableCell className="font-bold">{req.bloodGroup}</TableCell>
                       <TableCell>{req.quantity}</TableCell>
                       <TableCell>
                         <Badge variant={req.status === 'pending' ? 'secondary' : req.status === 'accepted' ? 'default' : 'outline'} 
                           className={req.status === 'accepted' ? 'bg-green-600 hover:bg-green-700' : ''}>
                           {req.status}
                         </Badge>
                       </TableCell>
                       <TableCell className="text-right text-muted-foreground">
                         {formatDistanceToNow(req.timestamp, { addSuffix: true })}
                       </TableCell>
                     </TableRow>
                   ))
                 )}
               </TableBody>
             </Table>
           </Card>
        </div>

      </div>
    </div>
  );
}
