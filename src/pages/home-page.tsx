import { motion } from 'motion/react';
import { Calendar, CheckCircle2, ChevronRight, Menu, Zap, Palette, Cpu, Users, BarChart3, Shield } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRef, useEffect, useState } from 'react';

const testimonials = [
  { name: "Sarah Chen", role: "Product Lead", company: "TechFlow", quote: "Appointly has completely transformed our scheduling flow.", avatar: "SC" },
  { name: "Marcus Thorne", role: "CEO", company: "GrowthScale", quote: "The automated reminders alone saved us 20 hours a month.", avatar: "MT" },
  { name: "Elena Rodriguez", role: "HR Manager", company: "Nexus", quote: "Finally, a tool that works for our global team rotations.", avatar: "ER" },
  { name: "David Kim", role: "Consultant", company: "SoloPath", quote: "My clients love the professional branded links.", avatar: "DK" },
  { name: "Jessica Wu", role: "Studio Director", company: "CreativeEdge", quote: "The interface is beautiful and so easy to use.", avatar: "JW" },
  { name: "Tom Baker", role: "Ops Lead", company: "RapidLog", quote: "Reliability is key for us, and Appointly delivers.", avatar: "TB" },
  { name: "Anna Smirnova", role: "Freelancer", company: "DesignLoop", quote: "Best investment for my small business this year.", avatar: "AS" },
  { name: "Liam O'Connor", role: "Founder", company: "SyncBase", quote: "Scaling was easy once we automated our appointments.", avatar: "LO" },
  { name: "Sita Ram", role: "Events Coord", company: "Gatherings", quote: "Handles complex event bookings without breaking a sweat.", avatar: "SR" },
  { name: "Mimi Sato", role: "Customer Success", company: "HelpHub", quote: "Our satisfaction scores went up noticeably.", avatar: "MS" },
];

const features = [
  { 
    title: "Fluid Scheduling", 
    persona: "THE SCALE-UP TEAM",
    description: "Real-time sync across 24 timezones. Eliminate the 'back-and-forth' with infrastructure that anticipates conflict before it happens.", 
    icon: Zap 
  },
  { 
    title: "Custom Branding", 
    persona: "THE DESIGN VISIONARY",
    description: "Your brand isn't a template. Create bespoke booking experiences with deep CSS access and white-labeled domains.", 
    icon: Palette 
  },
  { 
    title: "Smart Automations", 
    persona: "THE OPS ARCHITECT",
    description: "Trigger complex event chains. From internal webhooks to personalized SMS follow-ups, automate the entire lifecycle.", 
    icon: Cpu 
  },
  { 
    title: "Team Rotations", 
    persona: "THE GROWTH LEADER",
    description: "Fair-share distribution at scale. Round-robin, priority weighted, or skill-based routing for your highest-performing teams.", 
    icon: Users 
  },
  { 
    title: "Deep Analytics", 
    persona: "THE DATA ANALYST",
    description: "Granular insights into your conversion funnel. Track drop-offs, peak demand, and consultant performance in real-time.", 
    icon: BarChart3 
  },
  { 
    title: "Ironclad Security", 
    persona: "THE CTO",
    description: "SSO, role-based access, and SOC2 compliance. Infrastructure that satisfies even the most rigorous legal audits.", 
    icon: Shield 
  },
];

export default function Home() {
  const containerRef = useRef(null);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  useEffect(() => {
    const initUnicorn = () => {
      // @ts-ignore
      if (window.UnicornStudio && window.UnicornStudio.init) {
        // @ts-ignore
        window.UnicornStudio.init();
      }
    };

    // Attempt initialization at different intervals to ensure the DOM element is ready
    initUnicorn();
    const timer = setTimeout(initUnicorn, 500);
    const timer2 = setTimeout(initUnicorn, 1500);

    return () => {
      clearTimeout(timer);
      clearTimeout(timer2);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative min-h-screen text-foreground overflow-x-hidden font-sans italic-none">
      {/* Global Grain/Noise Overlay */}
      <div className="fixed inset-0 z-[100] pointer-events-none opacity-[0.03] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

      {/* Base Background Layer */}
      <div className="fixed inset-0 -z-10 bg-background" aria-hidden="true" />

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Navigation */}
        <nav className="fixed top-6 left-1/2 -translate-x-1/2 w-[95%] max-w-screen-2xl z-50 border border-white/10 bg-background/30 backdrop-blur-3xl rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
        <div className="w-full mx-auto px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary/20 border border-primary/30 rounded-xl flex items-center justify-center shadow-lg shadow-primary/5">
              <Calendar className="w-6 h-6 text-primary" />
            </div>
            <span className="text-2xl font-black tracking-tighter uppercase text-white/90">Appointly</span>
          </div>

          <div className="hidden lg:flex items-center gap-x-12">
            {["Product", "Solutions", "Pricing", "Enterprise", "Resources"].map((link) => (
              <a key={link} href="#" className="text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">
                {link}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <Button onClick={() => location.href="/login"} variant="secondary" className="hidden sm:inline-flex px-6 font-black uppercase tracking-widest border-none bg-white/5 hover:bg-white/10 text-white/70">
              Login
            </Button>
            <Button onClick={() => location.href="/register"} className="px-6 font-black uppercase tracking-widest shadow-xl shadow-primary/20 brightness-110">
              Join up
            </Button>
            <Button variant="ghost" size="icon" className="lg:hidden text-white/70">
              <Menu className="w-6 h-6" />
            </Button>
          </div>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="relative h-screen min-h-[700px] w-full flex flex-col justify-end px-6 pb-8 sm:px-12 sm:pb-16 lg:px-20 lg:pb-20 overflow-hidden">
          {/* Background Layer: Unicorn Studio interactive background - Moved here to be local to Hero */}
          <div 
            id="unicorn-studio-bg" 
            className="absolute inset-0 z-0 w-full h-full opacity-100 pointer-events-none"
            aria-hidden="true"
          >
            <div 
              className="w-full h-full scale-[1.02]" 
              style={{ minWidth: "100%", minHeight: "100%" }}
              data-us-project="KOk4EaSuhn1h4dySAiRD"
            ></div>
          </div>

          {/* Backlit glow leak from background */}
          <div className="absolute inset-0 bg-transparent z-10 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-full h-[50vh] bg-primary/5 blur-[120px] mix-blend-color-dodge z-10 pointer-events-none" />

          <div className="relative z-10 max-w-screen-2xl mx-auto w-full">
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.2, 0.4, 0, 1] }}
              className="space-y-8"
            >
              <h1 className="text-[9vw] sm:text-[7vw] lg:text-[6.5vw] font-black leading-[0.85] tracking-tighter uppercase max-w-[15ch] text-white brightness-125 drop-shadow-[0_0_30px_rgba(var(--primary),0.3)]">
                APPOINTMENTS <br />
                <span className="text-primary italic">SIMPLIFIED</span>, <br />
                FINALLY.
              </h1>
              
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-12">
                <Button size="lg" className="h-16 px-10 text-lg font-black uppercase tracking-widest rounded-none shadow-[0_0_40px_rgba(var(--primary),0.3)] group brightness-110 border-none relative overflow-hidden">
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:100%_4px] opacity-20" />
                  <span className="relative z-10 flex items-center">
                    Try it out
                    <ChevronRight className="ml-2 w-6 h-6 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Button>
                <p className="max-w-md text-lg lg:text-xl font-medium leading-[1.3] text-white/50 backdrop-blur-sm p-2 border-l border-white/10">
                  The mission-critical infrastructure for modern scheduling workflows. 
                  Beautifully fluid, endlessly scalable.
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Testimonials Infinite Marquee */}
        <section className="py-24 space-y-8 bg-background relative z-10 overflow-hidden">
          {/* Subtle glow leaks */}
          <div className="absolute top-0 left-1/4 w-px h-full bg-primary/20 rotate-[25deg] blur-md -z-10" />
          <div className="absolute top-0 right-1/4 w-px h-full bg-primary/10 rotate-[25deg] blur-lg -z-10" />

          <div className="px-6 max-w-screen-2xl mx-auto mb-12">
            <h2 className="text-sm font-black uppercase tracking-[0.4em] text-primary/80">Trusted by Professionals</h2>
          </div>
          
          <div className="flex overflow-hidden group">
            <motion.div 
              className="flex gap-8 py-4 px-4 animate-marquee whitespace-nowrap"
              animate={{ x: [0, -2500] }}
              transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
            >
              {[...testimonials, ...testimonials].map((t, i) => (
                <TestimonialCard key={i} {...t} />
              ))}
            </motion.div>
          </div>

          <div className="flex overflow-hidden group">
            <motion.div 
              className="flex gap-8 py-4 px-4 animate-marquee whitespace-nowrap"
              animate={{ x: [-2500, 0] }}
              transition={{ duration: 55, repeat: Infinity, ease: "linear" }}
            >
              {[...testimonials, ...testimonials].map((t, i) => (
                <TestimonialCard key={i} {...t} />
              ))}
            </motion.div>
          </div>
        </section>

        {/* Features persona stack */}
        <section className="bg-background relative z-10 border-t border-white/5 py-40 overflow-hidden font-sans">
          {/* Subtle Grid Pattern */}
          <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#ffffff1a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff1a_1px,transparent_1px)] bg-[size:60px_60px]" />
          
          <div className="max-w-screen-2xl mx-auto px-6 lg:px-20 relative z-10">
            <div className="mb-32">
              <h2 className="text-4xl sm:text-6xl font-black uppercase tracking-[0.2em] text-white/90 leading-none">
                CORE <span className="text-primary italic">INFRASTRUCTURE</span>
              </h2>
              <div className="w-24 h-1 bg-primary mt-6" />
            </div>

            <div className="relative flex flex-col items-center pt-32">
              {features.map((feature, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, x: -100, rotateX: 45 }}
                  whileInView={{ opacity: 1, x: 0, rotateX: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                  transition={{ 
                    duration: 0.8, 
                    delay: idx * 0.05,
                    ease: [0.22, 1, 0.36, 1] 
                  }}
                  className="w-full max-w-5xl group relative"
                  style={{
                    marginTop: idx === 0 ? 0 : "-5rem", 
                    zIndex: hoveredIdx === idx ? 50 : features.length - idx
                  }}
                >
                  <div className={`
                    relative w-full p-8 sm:p-14 -skew-x-12 border-t-[6px] border-b-2 transition-all duration-700 backdrop-blur-md
                    ${idx === 0 
                      ? 'bg-primary/90 border-white text-background' 
                      : idx % 2 !== 0 
                        ? 'bg-[#121212]/80 border-white/20 text-white' 
                        : 'bg-white/90 border-primary text-background'}
                    group-hover:translate-x-12 group-hover:scale-[1.01] shadow-[30px_30px_80px_rgba(0,0,0,0.6)]
                  `}>
                    
                    {/* Scanline Texture Overlay - Moved inside and restrained */}
                    <div className="absolute inset-0 pointer-events-none opacity-[0.05] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_4px,3px_100%]" />

                    {/* Stylized Numbering Box */}
                    <div className={`
                      absolute top-0 left-0 translate-x-4 -translate-y-1/2 px-6 py-2 font-black italic -skew-x-12 text-2xl z-20 shadow-xl
                      ${idx === 0 ? 'bg-white text-primary' : 'bg-primary text-background'}
                    `}>
                      No.{idx + 1}
                    </div>

                    {/* Inner content wrapper */}
                    <div className="skew-x-12 flex flex-col md:flex-row items-center gap-12 relative z-10">
                      <div className="flex flex-col items-center justify-center">
                        <feature.icon className={`w-16 h-16 ${idx === 0 ? 'text-background/60' : idx % 2 !== 0 ? 'text-primary' : 'text-primary/60'}`} />
                      </div>

                      <div className="flex-1 space-y-3">
                        <div className={`text-[10px] font-black uppercase tracking-[0.5em] opacity-40`}>
                          INFRASTRUCTURE SECTOR // {feature.persona}
                        </div>
                        <h3 className="text-4xl sm:text-6xl font-black uppercase tracking-tighter italic">
                          {feature.title}
                        </h3>
                        <p className={`text-lg font-black uppercase leading-tight ${idx === 0 ? 'text-background/80' : idx % 2 !== 0 ? 'text-white/30' : 'text-background/40'} group-hover:opacity-100 transition-opacity max-w-2xl`}>
                          {feature.description}
                        </p>
                      </div>

                      <Button 
                        variant="ghost" 
                        className={`
                          p-0 h-auto font-black uppercase tracking-[0.3em] text-[10px] 
                          ${idx === 0 ? 'text-background hover:scale-110' : 'text-primary hover:text-white'}
                          transition-all
                        `}
                      >
                        INITIATE <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>

                    {/* Background "Status" Watermark */}
                    <div className={`absolute bottom-4 right-8 text-6xl font-black select-none opacity-[0.03] italic -skew-x-12 pointer-events-none uppercase`}>
                      {idx % 2 === 0 ? 'Acknowledged' : 'Unaccessed'}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-60 px-6 text-center bg-primary text-primary-foreground relative overflow-hidden group">
          <div className="absolute inset-0 opacity-[0.05] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-white/20 blur-[100px] rounded-full animate-pulse" />
          
          <div className="max-w-4xl mx-auto space-y-16 relative z-10">
            <h2 className="text-6xl sm:text-8xl lg:text-9xl font-black uppercase tracking-tighter leading-[0.8] text-white">
              START YOUR <br /> TRIAL TODAY.
            </h2>
            <div className="flex flex-col items-center gap-10">
              <p className="text-2xl sm:text-3xl opacity-90 max-w-2xl mx-auto font-black uppercase tracking-tight leading-none text-white/80">
                Ready to automate your <span className="italic underline decoration-4 underline-offset-8">scheduling</span> engine?
              </p>
              <Button size="lg" variant="secondary" className="h-24 px-16 text-2xl font-black uppercase tracking-[0.2em] rounded-none shadow-[0_20px_60px_rgba(0,0,0,0.4)] hover:shadow-primary/20 hover:scale-105 transition-all text-background bg-white">
                Get Started Now
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/5 py-32 px-6 bg-background">
        <div className="max-w-screen-2xl mx-auto grid grid-cols-2 lg:grid-cols-5 gap-20">
          <div className="col-span-2 space-y-8">
            <div className="flex items-center gap-2">
              <Calendar className="w-10 h-10 text-primary" />
              <span className="text-3xl font-black uppercase tracking-tighter text-white/90">Appointly</span>
            </div>
            <p className="text-white/30 text-xl max-w-xs font-medium italic">
              Mission-critical infrastructure for elite scheduling workflows.
            </p>
            <div className="flex gap-4 opacity-30">
              <div className="w-10 h-1 border-t-2 border-white" />
              <div className="w-10 h-1 border-t-2 border-white opacity-50" />
              <div className="w-10 h-1 border-t-2 border-white opacity-20" />
            </div>
          </div>
          {["Company", "Product", "Legals"].map((cat) => (
            <div key={cat} className="space-y-10">
              <h4 className="font-black uppercase tracking-[0.3em] text-xs text-primary/60">{cat}</h4>
              <ul className="space-y-6 text-white/40 font-black uppercase tracking-widest text-[10px]">
                <li><a href="#" className="hover:text-primary transition-colors">About Appointly</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Contact Press</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Privacy Center</a></li>
              </ul>
            </div>
          ))}
        </div>
        <div className="max-w-screen-2xl mx-auto mt-32 pt-12 border-t border-white/5 flex flex-col md:row items-center justify-between text-white/20 text-[10px] font-black uppercase tracking-[0.5em]">
          <p>© 2026 APPOINTLY INFRASTRUCTURE INC.</p>
          <p>DESIGNED IN CLOUD STUDIO</p>
        </div>
      </footer>
      </div>
    </div>
  );
}

function TestimonialCard({ name, role, company, quote, avatar }: any) {
  return (
    <Card className="min-w-[450px] bg-white/[0.03] backdrop-blur-xl border-white/5 hover:border-primary/20 transition-all cursor-default select-none shadow-2xl rounded-none group overflow-hidden">
      <CardContent className="p-10 space-y-8 relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl -z-10 group-hover:bg-primary/10 transition-all" />
        <div className="flex items-center gap-5">
          <Avatar className="w-16 h-16 border border-white/10 p-1 bg-white/5 rounded-none">
            <AvatarFallback className="bg-primary/10 text-primary font-black uppercase text-xl rounded-none">{avatar}</AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <h4 className="font-black uppercase tracking-tight text-lg text-white/90">{name}</h4>
            <p className="text-[10px] text-white/30 font-black uppercase tracking-[0.2em]">{role} @ <span className="text-primary/60">{company}</span></p>
          </div>
        </div>
        <p className="text-xl font-medium italic leading-relaxed text-balance text-white/70 group-hover:text-white/90 transition-colors">
          "{quote}"
        </p>
      </CardContent>
    </Card>
  );
}
