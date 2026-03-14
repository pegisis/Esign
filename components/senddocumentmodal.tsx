"use client"

import { useState, useRef } from "react"
import { X, Mail, Link2, Copy, Check, ChevronDown, Paperclip, Lock, Settings, Bold, Italic, Underline, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// ─── Types ────────────────────────────────────────────────────────────────────

interface Recipient {
  id: string
  name: string
  email: string
  avatar?: string
  initials: string
  color: string
}

interface SendDocumentModalProps {
  isOpen: boolean
  onClose: () => void
  documentName: string
  documentUrl?: string          // URL or blob URL of the signed document
  /** Called after send – passes recipient emails + message */
  onSend?: (payload: SendPayload) => Promise<void>
}

interface SendPayload {
  recipients: Recipient[]
  ccEmails: string[]
  subject: string
  message: string
  sendAsSalesDocument: boolean
  applyOrder: boolean
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const AVATAR_COLORS = [
  "#0d9488", "#0284c7", "#7c3aed", "#db2777", "#ea580c", "#65a30d",
]

function makeInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

function generateShareLink(documentName: string) {
  const slug = encodeURIComponent(documentName.replace(/\s+/g, "-").toLowerCase())
  return `${window.location.origin}/sign/${slug}?token=${Math.random().toString(36).slice(2, 10)}`
}

// Step indicator
const STEPS = 4
function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-6">
      {Array.from({ length: STEPS + 1 }, (_, i) => {
        const step = i + 1
        const done = step < current
        const active = step === current
        return (
          <div key={i} className="flex items-center gap-2">
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-all",
                done
                  ? "bg-teal-500 border-teal-500 text-white"
                  : active
                  ? "border-teal-400 bg-white text-teal-600"
                  : "border-gray-300 bg-white text-gray-400"
              )}
            >
              {done ? (
                <Check className="w-4 h-4" />
              ) : (
                <span>{step}</span>
              )}
            </div>
            {i < STEPS && (
              <div
                className={cn(
                  "w-10 h-0.5 transition-all",
                  done ? "bg-teal-500" : "bg-gray-200"
                )}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function SendDocumentModal({
  isOpen,
  onClose,
  documentName,
  documentUrl,
  onSend,
}: SendDocumentModalProps) {
  // Recipients
  const [recipients, setRecipients] = useState<Recipient[]>([])
  const [recipientInput, setRecipientInput] = useState("")
  const [recipientName, setRecipientName] = useState("")
  const [addingRecipient, setAddingRecipient] = useState(false)

  // CC
  const [ccInput, setCcInput] = useState("")
  const [ccEmails, setCcEmails] = useState<string[]>([])

  // Message
  const [subject, setSubject] = useState(`Please complete ${documentName}`)
  const [message, setMessage] = useState(
    "Hey there,\n\nPlease review and complete this document. You can click on the document below to get started."
  )
  const [bold, setBold] = useState(false)
  const [italic, setItalic] = useState(false)
  const [underline, setUnderline] = useState(false)

  // Toggles
  const [sendAsSales, setSendAsSales] = useState(false)
  const [applyOrder, setApplyOrder] = useState(false)

  // UI state
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  if (!isOpen) return null

  // ── Recipient helpers ──────────────────────────────────────────────────────

  function addRecipient() {
    const email = recipientInput.trim()
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.")
      return
    }
    if (recipients.find((r) => r.email === email)) {
      setError("This recipient is already added.")
      return
    }
    const name = recipientName.trim() || email.split("@")[0]
    setRecipients((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        name,
        email,
        initials: makeInitials(name),
        color: AVATAR_COLORS[prev.length % AVATAR_COLORS.length],
      },
    ])
    setRecipientInput("")
    setRecipientName("")
    setAddingRecipient(false)
    setError(null)
  }

  function removeRecipient(id: string) {
    setRecipients((prev) => prev.filter((r) => r.id !== id))
  }

  function addCc() {
    const email = ccInput.trim()
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return
    if (!ccEmails.includes(email)) setCcEmails((p) => [...p, email])
    setCcInput("")
  }

  // ── Copy share link ────────────────────────────────────────────────────────

  async function handleCopyLink() {
    const link = generateShareLink(documentName)
    try {
      await navigator.clipboard.writeText(link)
      setLinkCopied(true)
      setTimeout(() => setLinkCopied(false), 2500)
    } catch {
      setError("Could not copy link. Please copy it manually.")
    }
  }

  // ── Send ───────────────────────────────────────────────────────────────────

  async function handleSend() {
    if (recipients.length === 0) {
      setError("Please add at least one recipient.")
      return
    }
    setSending(true)
    setError(null)

    const shareLink = generateShareLink(documentName)

    // Build an email body with the signing link
    const emailBody = [
      message,
      "",
      "─────────────────────────────",
      `Sign here: ${shareLink}`,
      "─────────────────────────────",
    ].join("\n")

    try {
      if (onSend) {
        await onSend({
          recipients,
          ccEmails,
          subject,
          message: emailBody,
          sendAsSalesDocument: sendAsSales,
          applyOrder,
        })
      } else {
        // Fallback: open mailto links for each recipient
        for (const r of recipients) {
          const mailto =
            `mailto:${r.email}` +
            `?subject=${encodeURIComponent(subject)}` +
            `&body=${encodeURIComponent(emailBody)}` +
            (ccEmails.length ? `&cc=${encodeURIComponent(ccEmails.join(","))}` : "")
          window.open(mailto, "_blank")
          await new Promise((res) => setTimeout(res, 300))
        }
      }
      setSent(true)
    } catch (err) {
      setError("Failed to send. Please try again.")
    } finally {
      setSending(false)
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="px-8 pt-8 pb-0">
         
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-800">Send Document</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {sent ? (
          // ── Success state ────────────────────────────────────────────────
          <div className="px-8 pb-8 flex flex-col items-center gap-4 text-center">
            <div className="w-16 h-16 rounded-full bg-teal-50 flex items-center justify-center">
              <Check className="w-8 h-8 text-teal-500" />
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-800">Document Sent!</p>
              <p className="text-sm text-gray-500 mt-1">
                {recipients.map((r) => r.email).join(", ")} will receive an email with a signing link.
              </p>
            </div>
            <Button
              onClick={onClose}
              className="bg-teal-500 hover:bg-teal-600 text-white px-8"
            >
              Done
            </Button>
          </div>
        ) : (
          // ── Form ─────────────────────────────────────────────────────────
          <div className="px-8 pb-8">
            <div className="grid grid-cols-2 gap-6">

              {/* LEFT: Recipients */}
              <div className="flex flex-col gap-4">
                

                {/* Recipient label */}
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    People filling out this Document:
                  </p>

                  {/* Current recipients */}
                  <div className="flex flex-col gap-2 mb-2">
                    {recipients.map((r) => (
                      <div
                        key={r.id}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg border border-gray-100 bg-gray-50 group"
                      >
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                          style={{ backgroundColor: r.color }}
                        >
                          {r.initials}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">{r.name}</p>
                          <p className="text-xs text-gray-400 truncate">{r.email}</p>
                        </div>
                        <button
                          onClick={() => removeRecipient(r.id)}
                          className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Add recipient form */}
                  {addingRecipient ? (
                    <div className="flex flex-col gap-2 p-3 border border-primary rounded-lg bg-teal-50/30">
                      <input
                        type="text"
                        placeholder="Full name"
                        value={recipientName}
                        onChange={(e) => setRecipientName(e.target.value)}
                        className="w-full text-sm px-3 py-1.5 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                      <input
                        type="email"
                        placeholder="Email address"
                        value={recipientInput}
                        onChange={(e) => setRecipientInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && addRecipient()}
                        className="w-full text-sm px-3 py-1.5 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={addRecipient}
                          className="flex-1 text-xs py-1.5  text-white rounded-md font-medium transition-colors bg-primary"
                        >
                          Add
                        </button>
                        <button
                          onClick={() => { setAddingRecipient(false); setRecipientInput(""); setRecipientName("") }}
                          className="flex-1 text-xs py-1.5 border border-gray-200 text-gray-500 hover:bg-gray-50 rounded-md transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setAddingRecipient(true)}
                      className="flex items-center gap-1.5 text-sm  font-medium transition-colors text-primary"
                    > 
                      <Plus className="w-4 h-4" />
                      Add recipient
                    </button>
                  )}
                </div>

                {/* Apply sending order */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setApplyOrder((p) => !p)}
                    className={cn(
                      "relative w-9 h-[18px] rounded-full transition-colors flex-shrink-0",
                      applyOrder ? "bg-primary" : "bg-gray-200"
                    )}
                  >
                    <span
                      className={cn(
                        "absolute top-0.5 left-0.5 w-3.5 h-3.5 bg-white rounded-full shadow transition-transform",
                        applyOrder && "translate-x-[18px]"
                      )}
                    />
                  </button>
                  <span className="text-xs text-gray-500">Apply sending order</span>
                </div>

                {/* CC */}
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1.5">
                    CC final completed document to:
                  </p>
                  <div className="flex flex-wrap gap-1 mb-1.5">
                    {ccEmails.map((email) => (
                      <span
                        key={email}
                        className="flex items-center gap-1 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full"
                      >
                        {email}
                        <button onClick={() => setCcEmails((p) => p.filter((e) => e !== email))}>
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <input
                    type="email"
                    placeholder="Enter name or email"
                    value={ccInput}
                    onChange={(e) => setCcInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addCc() } }}
                    className="w-full text-sm px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary bg-white"
                  />
                </div>
              </div>

              {/* RIGHT: Message */}
              <div className="flex flex-col gap-3">
                <p className="text-sm font-medium text-gray-700">Message</p>

                {/* Subject */}
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full text-sm px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                />

                {/* Body */}
                <textarea
                  ref={textareaRef}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={7}
                  className={cn(
                    "w-full text-sm px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary resize-none leading-relaxed",
                    bold && "font-bold",
                    italic && "italic",
                    underline && "underline"
                  )}
                />

                {/* Formatting */}
                <div className="flex items-center gap-1">
                  {[
                    { icon: Bold, key: "bold", active: bold, toggle: () => setBold((p) => !p) },
                    { icon: Italic, key: "italic", active: italic, toggle: () => setItalic((p) => !p) },
                    { icon: Underline, key: "underline", active: underline, toggle: () => setUnderline((p) => !p) },
                  ].map(({ icon: Icon, key, active, toggle }) => (
                    <button
                      key={key}
                      onClick={toggle}
                      className={cn(
                        "w-7 h-7 flex items-center justify-center rounded text-sm transition-colors",
                        active
                          ? "bg-teal-100 text-teal-700"
                          : "text-gray-500 hover:bg-gray-100"
                      )}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Error */}
            {error && (
              <p className="mt-3 text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>
            )}

            {/* Footer actions */}
            <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2">
                {/* Copy link */}
                <button
                  onClick={handleCopyLink}
                  title="Copy signing link"
                  className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-teal-600 transition-colors"
                >
                  {linkCopied ? <Check className="w-4 h-4 text-teal-500" /> : <Link2 className="w-4 h-4" />}
                </button>

                {/* Attach */}
                <button
                  title="Attach file"
                  className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-teal-600 transition-colors"
                >
                  <Paperclip className="w-4 h-4" />
                </button>

                {/* Settings */}
                <button
                  title="Advanced settings"
                  className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-teal-600 transition-colors"
                >
                  <Settings className="w-4 h-4" />
                </button>

                {linkCopied && (
                  <span className="text-xs text-teal-600 font-medium animate-in fade-in">
                    Link copied!
                  </span>
                )}
              </div>

              <button
                onClick={handleSend}
                disabled={sending || recipients.length === 0}
                className={cn(
                  "flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold text-white transition-all shadow-sm",
                  sending || recipients.length === 0
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-teal-500 hover:bg-teal-600 active:scale-95"
                )}
              >
                {sending ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Sending…
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4" />
                    Send
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}