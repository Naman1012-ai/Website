import { motion } from "framer-motion";
import { Link } from "wouter";
import { Heart, Building2, ArrowRight, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import bgImage from "@assets/generated_images/abstract_medical_network_background_with_red_connections_on_white..png";

export function Hero() {
  return (
    <div className="relative overflow-hidden bg-background pt-16 pb-32 lg:pt-32 lg:pb-48">
      {/* Background decoration */}
      <div className="absolute inset-0 z-0 opacity-10">
         <img src={bgImage} alt="Background" className="w-full h-full object-cover" />
      </div>
      
      <div className="container relative z-10 px-4 mx-auto text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-3xl"
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-background/50 backdrop-blur-sm px-4 py-1.5 text-sm font-medium text-primary shadow-sm">
            <Activity className="h-4 w-4" />
            <span>Live: Emergency Coordination System</span>
          </div>
          
          <h1 className="mb-6 text-5xl font-bold tracking-tight text-foreground sm:text-7xl font-heading">
            Save a life in <span className="text-primary relative inline-block">
              real-time.
              <svg className="absolute -bottom-2 left-0 w-full h-3 text-primary/30" viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="3" fill="none" />
              </svg>
            </span>
          </h1>
          
          <p className="mb-10 text-xl text-muted-foreground leading-relaxed">
            RedLink connects hospitals directly with nearby donors during critical emergencies. 
            No searching, no delays—just instant alerts when it matters most.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/donor">
              <Button size="lg" className="h-14 px-8 text-lg rounded-full shadow-lg hover:shadow-primary/25 transition-all">
                <Heart className="mr-2 h-5 w-5 fill-current" />
                I am a Donor
              </Button>
            </Link>
            <Link href="/hospital">
              <Button size="lg" variant="outline" className="h-14 px-8 text-lg rounded-full border-2 hover:bg-muted/50">
                <Building2 className="mr-2 h-5 w-5" />
                Hospital Login
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
