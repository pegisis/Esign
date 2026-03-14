"use client"

import { useState, useRef, useEffect } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

type Tab = "TYPE" | "DRAW" | "UPLOAD"
type SignatureColor = "#1a1a1a" | "#1e40af" | "#16a34a"

const SIGNATURE_FONTS = [
  { name: "Dancing Script", className: "font-dancing" },
  { name: "Great Vibes", className: "font-vibes" },
  { name: "Pacifico", className: "font-pacifico" },
  { name: "Satisfy", className: "font-satisfy" },
  { name: "Caveat", className: "font-caveat" },
  { name: "Homemade Apple", className: "font-homemade" },
]

interface SignatureModalProps {
  isOpen: boolean
  onClose: () => void
  onSign: (signature: string, type: "text" | "draw" | "image", color?: string, fontClass?: string) => void
}

export function SignatureModal({ isOpen, onClose, onSign }: SignatureModalProps) {
  const [activeTab, setActiveTab] = useState<Tab>("TYPE")
  const [typedName, setTypedName] = useState("")
  const [selectedFont, setSelectedFont] = useState(SIGNATURE_FONTS[0])
  const [selectedColor, setSelectedColor] = useState<SignatureColor>("#1a1a1a")
  const [isDrawing, setIsDrawing] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)

  const colors: { value: SignatureColor; bg: string }[] = [
    { value: "#1a1a1a", bg: "bg-gray-900" },
    { value: "#1e40af", bg: "bg-blue-700" },
    { value: "#16a34a", bg: "bg-green-600" },
  ]

  useEffect(() => {
    if (activeTab === "DRAW" && canvasRef.current) {
      const canvas = canvasRef.current
      const ctx = canvas.getContext("2d")
      if (ctx) {
        ctx.fillStyle = "#ffffff"
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.strokeStyle = selectedColor
        ctx.lineWidth = 2
        ctx.lineCap = "round"
        ctx.lineJoin = "round"
      }
    }
  }, [activeTab, selectedColor])

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true)
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    const x = "touches" in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left
    const y = "touches" in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top
    
    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    const x = "touches" in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left
    const y = "touches" in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top
    
    ctx.strokeStyle = selectedColor
    ctx.lineTo(x, y)
    ctx.stroke()
  }

  const stopDrawing = () => {
    setIsDrawing(false)
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setUploadedImage(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSign = () => {
    if (activeTab === "TYPE" && typedName) {
      onSign(typedName, "text", selectedColor, selectedFont.className)
    } else if (activeTab === "DRAW" && canvasRef.current) {
      const dataUrl = canvasRef.current.toDataURL("image/png")
      onSign(dataUrl, "draw")
    } else if (activeTab === "UPLOAD" && uploadedImage) {
      onSign(uploadedImage, "image")
    }
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-xl bg-card shadow-2xl">
        {/* Header with tabs */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div className="flex gap-6">
            {(["TYPE", "DRAW", "UPLOAD"] as Tab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "text-sm font-medium transition-colors",
                  activeTab === tab
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {tab}
              </button>
            ))}
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === "TYPE" && (
            <div className="space-y-6">
              <Input
                placeholder="Type your name here"
                value={typedName}
                onChange={(e) => setTypedName(e.target.value)}
                className="h-12 border-border bg-card text-lg"
              />
              <div className="grid grid-cols-3 gap-4">
                {SIGNATURE_FONTS.map((font) => (
                  <button
                    key={font.name}
                    onClick={() => setSelectedFont(font)}
                    className={cn(
                      "flex h-20 items-center justify-center rounded-lg border-2 px-4 transition-all",
                      selectedFont.name === font.name
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    )}
                    style={{ color: selectedColor }}
                  >
                    <span className={cn("text-xl", font.className)}>
                      {typedName || "Type your name"}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeTab === "DRAW" && (
            <div className="space-y-4">
              <div className="overflow-hidden rounded-lg border border-border">
                <canvas
                  ref={canvasRef}
                  width={600}
                  height={200}
                  className="w-full cursor-crosshair touch-none bg-white"
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                />
              </div>
              <Button variant="outline" onClick={clearCanvas} size="sm">
                Clear
              </Button>
            </div>
          )}

          {activeTab === "UPLOAD" && (
            <div className="space-y-4">
              <div className="flex h-48 items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/30">
                {uploadedImage ? (
                  <img
                    src={uploadedImage}
                    alt="Uploaded signature"
                    className="max-h-40 max-w-full object-contain"
                  />
                ) : (
                  <label className="flex cursor-pointer flex-col items-center gap-2 text-muted-foreground">
                    <span className="text-sm">Click to upload your signature image</span>
                    <span className="text-xs">(PNG, JPG, or SVG)</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              {uploadedImage && (
                <Button
                  variant="outline"
                  onClick={() => setUploadedImage(null)}
                  size="sm"
                >
                  Remove
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border px-6 py-4">
          <div className="flex gap-3">
            {colors.map((color) => (
              <button
                key={color.value}
                onClick={() => setSelectedColor(color.value)}
                className={cn(
                  "h-6 w-6 rounded-sm transition-all",
                  color.bg,
                  selectedColor === color.value
                    ? "ring-2 ring-primary ring-offset-2"
                    : ""
                )}
              />
            ))}
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose}>
              CANCEL
            </Button>
            <Button
              onClick={handleSign}
              disabled={
                (activeTab === "TYPE" && !typedName) ||
                (activeTab === "UPLOAD" && !uploadedImage)
              }
            >
              SIGN
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
