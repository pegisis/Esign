import { Header } from "@/components/header"
import Link from "next/link"
import { FileSignature, Upload, Download, Shield, Clock, CheckCircle } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
              <CheckCircle className="h-4 w-4" />
              Trusted by 10,000+ users worldwide
            </div>
            <h1 className="text-balance text-4xl font-bold leading-tight text-foreground md:text-5xl lg:text-6xl">
              Sign documents <span className="text-primary">instantly</span> from anywhere
            </h1>
            <p className="max-w-lg text-lg text-muted-foreground">
              Upload your documents, add your signature with just a few clicks, and download the signed version. Simple, secure, and lightning fast.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/sign"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Start Signing
                <FileSignature className="h-5 w-5" />
              </Link>
              <Link
                href="#how-it-works"
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-6 py-3 font-medium text-foreground transition-colors hover:bg-muted"
              >
                Watch Demo
              </Link>
            </div>
            <div className="flex flex-wrap gap-6 pt-4">
              <div className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm">
                <Shield className="h-4 w-4 text-primary" />
                Secure & Encrypted
              </div>
              <div className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm">
                <Clock className="h-4 w-4 text-primary" />
                Sign in Seconds
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="relative mx-auto max-w-md rounded-2xl bg-card p-6 shadow-2xl ring-1 ring-border">
              <div className="mb-4 flex items-center gap-3 border-b border-border pb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <FileSignature className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Contract.pdf</p>
                  <p className="text-sm text-muted-foreground">2 pages • Ready to sign</p>
                </div>
              </div>
              <div className="space-y-3 rounded-lg bg-muted/50 p-4">
                <div className="h-3 w-3/4 rounded bg-muted" />
                <div className="h-3 w-full rounded bg-muted" />
                <div className="h-3 w-2/3 rounded bg-muted" />
                <div className="h-3 w-full rounded bg-muted" />
                <div className="mt-6 h-3 w-1/2 rounded bg-muted" />
              </div>
              <div className="mt-4 flex justify-end border-t border-dashed border-border pt-4">
                <div className="font-dancing text-2xl text-foreground">John Smith</div>
              </div>
            </div>
            <div className="absolute -bottom-6 -right-6 -z-10 h-full w-full rounded-2xl bg-primary/20" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="border-y border-border bg-card py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="text-balance text-3xl font-bold text-foreground md:text-4xl">
              Everything you need to sign documents
            </h2>
            <p className="mt-4 text-muted-foreground">
              Professional document signing made simple
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="rounded-xl border border-border bg-background p-6 transition-shadow hover:shadow-lg">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Upload className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">Upload Any Document</h3>
              <p className="text-muted-foreground">
                Support for PDF, images, and more. Simply drag and drop or click to upload your documents.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-background p-6 transition-shadow hover:shadow-lg">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <FileSignature className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">Multiple Signature Options</h3>
              <p className="text-muted-foreground">
                Type your name, draw your signature, or upload an existing signature image.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-background p-6 transition-shadow hover:shadow-lg">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Download className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">Download Instantly</h3>
              <p className="text-muted-foreground">
                Get your signed document immediately. Download as PDF or share directly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="text-balance text-3xl font-bold text-foreground md:text-4xl">
              How it works
            </h2>
            <p className="mt-4 text-muted-foreground">
              Three simple steps to sign any document
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              { step: "01", title: "Upload Document", description: "Upload your PDF or image document to our secure platform" },
              { step: "02", title: "Add Signature", description: "Choose to type, draw, or upload your signature" },
              { step: "03", title: "Download", description: "Download your signed document instantly" },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                  {item.step}
                </div>
                <h3 className="mb-2 text-lg font-semibold text-foreground">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-border bg-card py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-balance text-3xl font-bold text-foreground md:text-4xl">
            Ready to sign your first document?
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
            Join thousands of users who trust SignDoc for their document signing needs.
          </p>
          <Link
            href="/sign"
            className="mt-8 inline-flex items-center gap-2 rounded-lg bg-primary px-8 py-4 text-lg font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Get Started Free
            <FileSignature className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-background py-8">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 md:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <FileSignature className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-foreground">SignDoc</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2026 SignDoc. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
