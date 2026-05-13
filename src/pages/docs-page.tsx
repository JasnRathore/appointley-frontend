import { DocsSidebar } from "@/components/docs/docs-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

import { DocsSidebar } from "@/components/docs/docs-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Info, Lightbulb, ShieldCheck, Zap, ArrowRight, CheckCircle2 } from "lucide-react"

export default function DocsPage() {
  return (
    <SidebarProvider>
      <DocsSidebar />
      <SidebarInset className="bg-[#030303]">
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b border-white/5 bg-background/60 backdrop-blur-md px-6">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4 bg-white/10" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/" className="text-xs font-bold uppercase tracking-widest text-muted-foreground/50 hover:text-primary transition-colors">
                  Home
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="text-white/10" />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-xs font-bold uppercase tracking-widest text-white/90">The Complete Guide</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        <div className="flex flex-1 flex-col lg:flex-row">
          <div className="flex-1 p-6 md:p-12 lg:p-16 max-w-4xl mx-auto w-full">
            <div className="space-y-12">
              {/* Hero Section */}
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-black uppercase tracking-[0.2em] text-primary">
                  <ShieldCheck className="size-3" /> Professional Standard
                </div>
                <h1 className="text-6xl font-black tracking-tighter uppercase italic text-white leading-[0.9]">
                  Platform<br /><span className="text-primary">Intelligence</span><br />Reference
                </h1>
                <p className="text-xl text-muted-foreground/80 leading-relaxed font-medium max-w-2xl">
                  A deep-dive into every interface, algorithm, and configuration within the Appointly ecosystem.
                </p>
              </div>

              <Separator className="bg-white/5" />

              {/* Chapter 1: Dashboard */}
              <section id="introduction" className="space-y-8 scroll-mt-24">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-black text-primary bg-primary/10 px-2 py-0.5 rounded tracking-widest">CHAPTER 01</span>
                    <h2 className="text-4xl font-black uppercase tracking-tight italic text-white/90">Mission Control</h2>
                  </div>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    The Dashboard is your workspace's high-level operational view. It aggregates data from across your organization to provide real-time insights into scheduling health.
                  </p>
                </div>

                <div className="grid gap-6">
                  <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 space-y-6">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <LayoutDashboard className="size-5 text-primary" />
                      Analytical Matrix
                    </h3>
                    <div className="grid sm:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <p className="text-sm font-bold text-white/80 uppercase tracking-wider">Upcoming Meetings</p>
                        <p className="text-xs text-muted-foreground leading-relaxed">Calculates all sessions with a status of <code>SCHEDULED</code>. This is your primary workload indicator for the immediate future.</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-bold text-white/80 uppercase tracking-wider">Active Links</p>
                        <p className="text-xs text-muted-foreground leading-relaxed">The total count of live booking pages currently accepting client inputs across the entire workspace.</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-bold text-white/80 uppercase tracking-wider">Recent Activity</p>
                        <p className="text-xs text-muted-foreground leading-relaxed">A rolling 24-hour log of system events, including new bookings, cancellations, and settings modifications.</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-bold text-white/80 uppercase tracking-wider">Team Capacity</p>
                        <p className="text-xs text-muted-foreground leading-relaxed">The ratio of active members vs. pending invites, giving you a clear view of your operational scaling.</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4 p-6 rounded-3xl bg-amber-500/5 border border-amber-500/10 items-start">
                    <Activity className="size-5 text-amber-400 shrink-0 mt-1" />
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-amber-100 italic">The Audit Log Engine</p>
                      <p className="text-sm text-amber-100/60 leading-relaxed">Every action in the dashboard is immutable and logged. This ensures complete accountability for team owners when monitoring workspace-wide changes.</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Chapter 2: Meetings */}
              <section id="managing-meetings" className="space-y-8 scroll-mt-24">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-black text-primary bg-primary/10 px-2 py-0.5 rounded tracking-widest">CHAPTER 02</span>
                    <h2 className="text-4xl font-black uppercase tracking-tight italic text-white/90">Meeting Lifecycle</h2>
                  </div>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    Meetings are the core unit of value in Appointly. The system handles the entire transition from a client's initial request to the final confirmed appointment.
                  </p>
                </div>

                <div className="space-y-10">
                  <div className="grid gap-4">
                    <div className="group p-6 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all duration-300">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-bold text-white">Status: Scheduled</h4>
                        <span className="px-2 py-0.5 rounded bg-green-500/10 text-green-500 text-[10px] font-black">CONFIRMED</span>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">The default state after a successful booking. The system has automatically updated both calendars and sent confirmation emails to all participants.</p>
                    </div>
                    <div className="group p-6 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all duration-300">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-bold text-white">Status: Cancelled</h4>
                        <span className="px-2 py-0.5 rounded bg-red-500/10 text-red-500 text-[10px] font-black">TERMINATED</span>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">Meetings can be cancelled by either party. Appointly's <strong>Zero-Friction Cancellation</strong> engine handles the cleanup of calendar events and notifies the counterparty instantly.</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h3 className="text-2xl font-black uppercase tracking-tight italic text-white/80">The Rescheduling Dialog</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      Instead of a simple "Delete and Re-book" flow, Appointly uses a persistent state for rescheduling. 
                      This allows you to propose new times while maintaining the original context, notes, and metadata of the appointment.
                    </p>
                    <div className="p-1 rounded-3xl bg-gradient-to-r from-primary/20 via-primary/5 to-transparent">
                      <div className="p-8 rounded-[22px] bg-[#050505] space-y-4">
                        <div className="flex items-center gap-2 text-primary">
                          <CheckCircle2 className="size-5" />
                          <p className="font-bold uppercase tracking-[0.2em] text-[10px]">Technical Note</p>
                        </div>
                        <p className="text-sm text-white/90 font-medium">When rescheduling, the system performs a real-time availability check across all integrated calendars to ensure no double-booking occurs, even in high-speed, back-to-back environments.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Chapter 3: Scheduling Architecture */}
              <section id="booking-flows" className="space-y-8 scroll-mt-24">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-black text-primary bg-primary/10 px-2 py-0.5 rounded tracking-widest">CHAPTER 03</span>
                    <h2 className="text-4xl font-black uppercase tracking-tight italic text-white/90">Scheduling Architecture</h2>
                  </div>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    Appointly's availability engine is multi-layered, combining weekly patterns with specific date exclusions for absolute control over your time.
                  </p>
                </div>

                <div className="grid gap-8">
                  <div className="space-y-6">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      <CalendarIcon className="size-5 text-primary" />
                      Weekly Availability Rules
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Define your core operational hours for each day of the week. These rules serve as the "Master Pattern" that the system uses to generate available slots for clients.
                    </p>
                    <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 border-dashed">
                       <code className="text-xs text-primary/80">
                         MONDAY: 09:00 AM - 05:00 PM<br />
                         TUESDAY: 09:00 AM - 05:00 PM<br />
                         WEDNESDAY: 09:00 AM - 02:00 PM (Early close)
                       </code>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      <ShieldCheck className="size-5 text-red-400" />
                      Blocked Dates (Overlays)
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      For one-off events like vacations or workshops, use <strong>Blocked Dates</strong>. These take absolute precedence over weekly rules, instantly wiping your availability for the specified range without modifying your core settings.
                    </p>
                  </div>
                </div>
              </section>

              {/* Chapter 4: Team Collaboration */}
              <section id="team-rotations" className="space-y-8 scroll-mt-24">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-black text-primary bg-primary/10 px-2 py-0.5 rounded tracking-widest">CHAPTER 04</span>
                    <h2 className="text-4xl font-black uppercase tracking-tight italic text-white/90">Team Intelligence</h2>
                  </div>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    Scaling with Appointly means leveraging our sophisticated team management and rotation systems.
                  </p>
                </div>

                <div className="grid gap-6">
                  <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 space-y-6">
                    <div className="space-y-2">
                      <h4 className="text-lg font-bold text-white">Hierarchical Permissions</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">Roles are granular and determine access to workspace-wide settings.</p>
                    </div>
                    <div className="grid sm:grid-cols-3 gap-4">
                      <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 space-y-2">
                        <p className="text-[10px] font-black text-primary tracking-widest uppercase">OWNER</p>
                        <p className="text-xs text-muted-foreground">Full destructive rights and billing control.</p>
                      </div>
                      <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                        <p className="text-[10px] font-black text-white/50 tracking-widest uppercase">ADMIN</p>
                        <p className="text-xs text-muted-foreground">Team management and link configuration.</p>
                      </div>
                      <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                        <p className="text-[10px] font-black text-white/50 tracking-widest uppercase">MEMBER</p>
                        <p className="text-xs text-muted-foreground">Personal availability and meeting view.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Chapter 5: Advanced Settings */}
              <section id="customization" className="space-y-8 scroll-mt-24">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-black text-primary bg-primary/10 px-2 py-0.5 rounded tracking-widest">CHAPTER 05</span>
                    <h2 className="text-4xl font-black uppercase tracking-tight italic text-white/90">Advanced Configuration</h2>
                  </div>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    Fine-tune your personal and workspace preferences to match your operational speed.
                  </p>
                </div>

                <div className="grid gap-6">
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 space-y-3">
                      <div className="flex items-center gap-2 text-primary">
                        <Bell className="size-4" />
                        <h4 className="font-bold text-sm uppercase tracking-wider">Notification Matrix</h4>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">Toggle between instant Email alerts, In-App badges, and Weekly Digests. Customize your noise level per event type.</p>
                    </div>
                    <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 space-y-3">
                      <div className="flex items-center gap-2 text-red-500">
                        <Trash2 className="size-4" />
                        <h4 className="font-bold text-sm uppercase tracking-wider">The Danger Zone</h4>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">Destructive actions like Workspace Deletion or Account Termination are protected by multi-step confirmations to prevent accidental data loss.</p>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>

          {/* Right Sidebar - TOC */}
          <div className="hidden xl:block w-72 h-[calc(100vh-4rem)] sticky top-16 p-8 border-l border-white/5 bg-[#050505]/50">
            <div className="space-y-6">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">The Syllabus</p>
              <nav className="space-y-4">
                {[
                  { id: "introduction", label: "01. Mission Control" },
                  { id: "managing-meetings", label: "02. Meeting Lifecycle" },
                  { id: "booking-flows", label: "03. Scheduling Arch" },
                  { id: "team-rotations", label: "04. Team Intelligence" },
                  { id: "customization", label: "05. Advanced Config" },
                ].map((item) => (
                  <a 
                    key={item.id} 
                    href={`#${item.id}`} 
                    className="block text-[11px] font-black uppercase tracking-[0.1em] text-muted-foreground/60 hover:text-primary transition-colors border-l-2 border-transparent hover:border-primary pl-4"
                  >
                    {item.label}
                  </a>
                ))}
              </nav>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
