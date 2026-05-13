import { Calendar } from "lucide-react"

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 w-[95%] max-w-screen-2xl z-50 border border-white/10 bg-background/30 backdrop-blur-3xl rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
        <div className="w-full mx-auto px-8 h-20 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary/20 border border-primary/30 rounded-xl flex items-center justify-center shadow-lg shadow-primary/5">
              <Calendar className="w-6 h-6 text-primary" />
            </div>
            <span className="text-2xl font-black tracking-tighter uppercase text-white/90">Appointly</span>
          </a>
        </div>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center pt-32 px-6">
        <div className="text-center space-y-6 max-w-2xl">
          <h1 className="text-5xl font-black uppercase tracking-tighter text-white">Pricing Plans</h1>
          <p className="text-xl text-white/50">
            This is a temporary page for Pricing. Subscription tiers and detailed feature matrices will be displayed here soon.
          </p>
        </div>
      </main>
    </div>
  )
}
