import { Switch, Route } from "wouter";
import { Layout } from "@/components/layout";
import { Hero } from "@/components/hero";
import { DonorDashboard } from "@/components/donor/donor-dashboard";
import { HospitalDashboard } from "@/components/hospital/hospital-dashboard";
import { NotificationManager } from "@/components/notification-manager";
import { Toaster } from "@/components/ui/toaster";

function App() {
  return (
    <Layout>
      <NotificationManager />
      <Switch>
        <Route path="/" component={Hero} />
        <Route path="/donor" component={DonorDashboard} />
        <Route path="/hospital" component={HospitalDashboard} />
        <Route>
          <div className="container py-20 text-center">
            <h1 className="text-4xl font-bold">404 - Page Not Found</h1>
          </div>
        </Route>
      </Switch>
      <Toaster />
    </Layout>
  );
}

export default App;
