"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Document, Page, pdfjs } from "react-pdf"
import { Download, ZoomIn, ZoomOut, FileSignature, ChevronLeft, ChevronRight, X, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SignatureModal } from "./signature-modal"
import { cn } from "@/lib/utils"


// Set up the worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

interface Signature {
  id: string
  type: "text" | "draw" | "image"
  content: string
  x: number
  y: number
  width: number
  height: number
  color?: string
  fontClass?: string
}

interface DocumentViewerProps {
  documentUrl: string
  documentName: string
  documentType?: string
}

export function DocumentViewer({ documentUrl, documentName, documentType }: DocumentViewerProps) {
  const [zoom, setZoom] = useState(100)
  const [signatures, setSignatures] = useState<Signature[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [resizingId, setResizingId] = useState<string | null>(null)
  const [resizeCorner, setResizeCorner] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [initialPos, setInitialPos] = useState({ x: 0, y: 0 })
  const [initialSize, setInitialSize] = useState({ width: 0, height: 0 })
  const [numPages, setNumPages] = useState<number>(1)
  const [currentPage, setCurrentPage] = useState<number>(1)
  const containerRef = useRef<HTMLDivElement>(null)

  const isPdf = documentType === "application/pdf" || documentName.toLowerCase().endsWith(".pdf")

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 25, 200))
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 25, 50))

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages)
  }

  const goToPrevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1))
  const goToNextPage = () => setCurrentPage((prev) => Math.min(prev + 1, numPages))

  const handleAddSignature = (
    content: string,
    type: "text" | "draw" | "image",
    color?: string,
    fontClass?: string
  ) => {
    const newSignature: Signature = {
      id: Date.now().toString(),
      type,
      content,
      x: 50,
      y: 80,
      width: 150,
      height: 60,
      color,
      fontClass,
    }
    setSignatures((prev) => [...prev, newSignature])
    setSelectedId(newSignature.id)
  }

  const handleSignatureClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    setSelectedId(id)
  }

  const handleDragStart = (e: React.MouseEvent, id: string) => {
    e.preventDefault()
    e.stopPropagation()
    const signature = signatures.find((s) => s.id === id)
    if (!signature || !containerRef.current) return

    setSelectedId(id)
    setDragStart({ x: e.clientX, y: e.clientY })
    setInitialPos({ x: signature.x, y: signature.y })
    setDraggingId(id)
  }

  const handleResizeStart = (e: React.MouseEvent, id: string, corner: string) => {
    e.preventDefault()
    e.stopPropagation()
    const signature = signatures.find((s) => s.id === id)
    if (!signature) return

    setSelectedId(id)
    setDragStart({ x: e.clientX, y: e.clientY })
    setInitialSize({ width: signature.width, height: signature.height })
    setInitialPos({ x: signature.x, y: signature.y })
    setResizingId(id)
    setResizeCorner(corner)
  }

  const handleContainerClick = () => {
    setSelectedId(null)
  }

  // Use document-level mouse events for smooth dragging
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!containerRef.current) return
    if (!draggingId && !resizingId) return

    const containerRect = containerRef.current.getBoundingClientRect()
    const deltaX = e.clientX - dragStart.x
    const deltaY = e.clientY - dragStart.y

    if (draggingId) {
      const deltaXPercent = (deltaX / containerRect.width) * 100
      const deltaYPercent = (deltaY / containerRect.height) * 100

      setSignatures((prev) =>
        prev.map((sig) =>
          sig.id === draggingId
            ? {
              ...sig,
              x: Math.max(0, Math.min(85, initialPos.x + deltaXPercent)),
              y: Math.max(0, Math.min(90, initialPos.y + deltaYPercent)),
            }
            : sig
        )
      )
    }

    if (resizingId && resizeCorner) {
      let newWidth = initialSize.width
      let newHeight = initialSize.height
      let newX = initialPos.x
      let newY = initialPos.y

      // Handle resize based on corner
      if (resizeCorner.includes("e")) {
        newWidth = Math.max(80, initialSize.width + deltaX)
      }
      if (resizeCorner.includes("w")) {
        newWidth = Math.max(80, initialSize.width - deltaX)
        newX = initialPos.x + (deltaX / containerRect.width) * 100
      }
      if (resizeCorner.includes("s")) {
        newHeight = Math.max(40, initialSize.height + deltaY)
      }
      if (resizeCorner.includes("n")) {
        newHeight = Math.max(40, initialSize.height - deltaY)
        newY = initialPos.y + (deltaY / containerRect.height) * 100
      }

      setSignatures((prev) =>
        prev.map((sig) =>
          sig.id === resizingId
            ? { ...sig, width: newWidth, height: newHeight, x: newX, y: newY }
            : sig
        )
      )
    }
  }, [draggingId, resizingId, resizeCorner, dragStart, initialPos, initialSize])

  const handleMouseUp = useCallback(() => {
    setDraggingId(null)
    setResizingId(null)
    setResizeCorner(null)
  }, [])

  // Add document-level event listeners for drag/resize
  useEffect(() => {
    if (draggingId || resizingId) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
      return () => {
        document.removeEventListener("mousemove", handleMouseMove)
        document.removeEventListener("mouseup", handleMouseUp)
      }
    }
  }, [draggingId, resizingId, handleMouseMove, handleMouseUp])

  const handleRemoveSignature = (id: string) => {
    setSignatures((prev) => prev.filter((sig) => sig.id !== id))
    setSelectedId(null)
  }

  const handleEditSignature = (id: string) => {
    setEditingId(id)
    setIsModalOpen(true)
  }

  const handleUpdateSignature = (
    content: string,
    type: "text" | "draw" | "image",
    color?: string,
    fontClass?: string
  ) => {
    if (editingId) {
      setSignatures((prev) =>
        prev.map((sig) =>
          sig.id === editingId
            ? { ...sig, content, type, color, fontClass }
            : sig
        )
      )
      setEditingId(null)
    } else {
      handleAddSignature(content, type, color, fontClass)
    }
  }

  const handleDownload = async () => {
    try {
      const existingPdfBytes = await fetch(documentUrl).then((res) => res.arrayBuffer())

      // Helper: renders a text signature to a PNG data URL using the actual CSS font
      const renderTextToImage = (sig: Signature): Promise<string> => {
        return new Promise((resolve) => {
          const canvas = document.createElement("canvas")
          canvas.width = sig.width * 2   // 2x for sharpness
          canvas.height = sig.height * 2
          const ctx = canvas.getContext("2d")!
          ctx.scale(2, 2)

          // Get the computed font-family from a temp element with the fontClass applied
          const temp = document.createElement("span")
          temp.className = sig.fontClass || ""
          temp.style.visibility = "hidden"
          temp.style.position = "absolute"
          document.body.appendChild(temp)
          const computedFont = window.getComputedStyle(temp).fontFamily
          document.body.removeChild(temp)

          const fontSize = Math.min(sig.height * 0.6, 36)
          ctx.font = `${fontSize}px ${computedFont}`
          ctx.fillStyle = sig.color || "#000000"
          ctx.textBaseline = "middle"
          ctx.fillText(sig.content, 4, sig.height / 2)

          resolve(canvas.toDataURL("image/png"))
        })
      }

      if (isPdf) {
        const { PDFDocument } = await import("pdf-lib")

        const pdfDoc = await PDFDocument.load(existingPdfBytes)
        const pages = pdfDoc.getPages()
        const page = pages[currentPage - 1]
        const { width: pageWidth, height: pageHeight } = page.getSize()

        for (const sig of signatures) {
          const xPdf = (sig.x / 100) * pageWidth
          const yPdf = pageHeight - (sig.y / 100) * pageHeight - sig.height

          if (sig.type === "text") {
            // Render text with actual font to canvas, embed as PNG image
            const pngDataUrl = await renderTextToImage(sig)
            const pngBytes = await fetch(pngDataUrl).then((r) => r.arrayBuffer())
            const embeddedImage = await pdfDoc.embedPng(pngBytes)
            page.drawImage(embeddedImage, {
              x: xPdf,
              y: yPdf,
              width: sig.width,
              height: sig.height,
            })
          } else {
            // Draw/Upload: embed image directly
            const imageBytes = await fetch(sig.content).then((r) => r.arrayBuffer())
            const isPng =
              sig.content.startsWith("data:image/png") || sig.content.includes(".png")
            const embeddedImage = isPng
              ? await pdfDoc.embedPng(imageBytes)
              : await pdfDoc.embedJpg(imageBytes)
            page.drawImage(embeddedImage, {
              x: xPdf,
              y: yPdf,
              width: sig.width,
              height: sig.height,
            })
          }
        }

        const pdfBytes = await pdfDoc.save()
        const blob = new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = documentName.replace(/\.[^/.]+$/, "") + "_signed.pdf"
        a.click()
        URL.revokeObjectURL(url)
      } else {
        // Image document
        const img = new Image()
        img.crossOrigin = "anonymous"
        img.src = documentUrl
        await new Promise((resolve) => (img.onload = resolve))

        const canvas = document.createElement("canvas")
        canvas.width = img.naturalWidth
        canvas.height = img.naturalHeight
        const ctx = canvas.getContext("2d")!
        ctx.drawImage(img, 0, 0)

        for (const sig of signatures) {
          const xPx = (sig.x / 100) * img.naturalWidth
          const yPx = (sig.y / 100) * img.naturalHeight

          if (sig.type === "text") {
            const temp = document.createElement("span")
            temp.className = sig.fontClass || ""
            temp.style.visibility = "hidden"
            temp.style.position = "absolute"
            document.body.appendChild(temp)
            const computedFont = window.getComputedStyle(temp).fontFamily
            document.body.removeChild(temp)

            const fontSize = Math.min(sig.height * 0.6, 36)
            ctx.font = `${fontSize}px ${computedFont}`
            ctx.fillStyle = sig.color || "#000000"
            ctx.textBaseline = "middle"
            ctx.fillText(sig.content, xPx + 4, yPx + sig.height / 2)
          } else {
            const sigImg = new Image()
            sigImg.crossOrigin = "anonymous"
            sigImg.src = sig.content
            await new Promise((resolve) => (sigImg.onload = resolve))
            ctx.drawImage(sigImg, xPx, yPx, sig.width, sig.height)
          }
        }

        canvas.toBlob((blob) => {
          if (!blob) return
          const url = URL.createObjectURL(blob)
          const a = document.createElement("a")
          a.href = url
          a.download = documentName.replace(/\.[^/.]+$/, "") + "_signed.png"
          a.click()
          URL.revokeObjectURL(url)
        }, "image/png")
      }
    } catch (err) {
      console.error("Download failed:", err)
      alert("Download failed. Check console for details.")
    }
  }

  return (
    <div className="flex h-full flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-border bg-card px-4 py-3">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-foreground">{documentName}</span>
        </div>
        <div className="flex items-center gap-2">

          {/* Thumbnail Carousel - place inside toolbar div */}
          {isPdf && numPages > 0 && (
            <div className="flex items-center gap-1 rounded-lg border border-border bg-muted/30 px-2 py-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={goToPrevPage}
                disabled={currentPage <= 1}
              >
                <ChevronLeft className="h-3 w-3" />
              </Button>

              {/* Show up to 5 page thumbnails centered around current page */}
              <div className="flex items-center gap-1">
                {Array.from({ length: numPages }, (_, i) => i + 1)
                  .filter((page) => {
                    // Show pages around current: 2 before, current, 2 after
                    return Math.abs(page - currentPage) <= 2
                  })
                  .map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={cn(
                        "relative overflow-hidden rounded border-2 transition-all",
                        page === currentPage
                          ? "border-primary shadow-sm"
                          : "border-transparent opacity-60 hover:opacity-100"
                      )}
                      style={{ width: 36, height: 48 }}
                      title={`Page ${page}`}
                    >
                      <Document file={documentUrl} loading={null} error={null}>
                        <Page
                          pageNumber={page}
                          width={36}
                          renderTextLayer={false}
                          renderAnnotationLayer={false}
                        />
                      </Document>
                      {/* Page number badge */}
                      <span className="absolute bottom-0 left-0 right-0 bg-black/40 text-center text-[9px] text-white">
                        {page}
                      </span>
                    </button>
                  ))}
              </div>

              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={goToNextPage}
                disabled={currentPage >= numPages}
              >
                <ChevronRight className="h-3 w-3" />
              </Button>
            </div>
          )}
          <Button variant="outline" size="icon" onClick={handleZoomOut}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="min-w-[60px] text-center text-sm text-muted-foreground">
            {zoom}%
          </span>
          <Button variant="outline" size="icon" onClick={handleZoomIn}>
            <ZoomIn className="h-4 w-4" />
          </Button>
          <div className="mx-2 h-6 w-px bg-border" />
          <Button
            onClick={() => setIsModalOpen(true)}
            className="gap-2"
          >
            <FileSignature className="h-4 w-4" />
            Add Signature
          </Button>
          <Button variant="outline" onClick={handleDownload} className="gap-2">
            <Download className="h-4 w-4" />
            Download
          </Button>
        </div>
      </div>

      {/* Document Area */}
      <div className="flex-1 overflow-auto bg-muted/50 p-8">
        <div className="flex min-h-full items-start justify-center">
          <div
            ref={containerRef}
            className="relative bg-white shadow-lg"
            onClick={handleContainerClick}
          >
            {/* Document content */}
            {isPdf ? (
              <Document
                file={documentUrl}
                onLoadSuccess={onDocumentLoadSuccess}
                loading={
                  <div className="flex h-[800px] w-[600px] items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                  </div>
                }
                error={
                  <div className="flex h-[800px] w-[600px] items-center justify-center text-muted-foreground">
                    Failed to load PDF. Please try a different file.
                  </div>
                }
                className="pdf-document"
              >
                <Page
                  pageNumber={currentPage}
                  scale={zoom / 100}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                />
              </Document>
            ) : (
              <img
                src={documentUrl}
                alt="Document"
                className="max-w-full"
                style={{ transform: `scale(${zoom / 100})`, transformOrigin: "top left" }}
                draggable={false}
              />
            )}

            {/* Signatures overlay */}
            {signatures.map((signature) => {
              const isSelected = selectedId === signature.id
              const isHovered = hoveredId === signature.id
              const isDragging = draggingId === signature.id
              const showControls = isSelected || isHovered

              return (
                <div
                  key={signature.id}
                  className={cn(
                    "group absolute select-none",
                    isDragging && "cursor-grabbing"
                  )}
                  style={{
                    left: `${signature.x}%`,
                    top: `${signature.y}%`,
                    width: `${signature.width}px`,
                    height: `${signature.height}px`,
                    zIndex: isSelected ? 1000 : isHovered ? 500 : 100,
                  }}
                  onClick={(e) => handleSignatureClick(e, signature.id)}
                  onMouseDown={(e) => e.stopPropagation()}
                  onMouseEnter={() => setHoveredId(signature.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  {/* Floating toolbar - show on hover or select */}
                  {showControls && (
                    <div
                      className="absolute -top-10 left-1/2 z-50 flex -translate-x-1/2 items-center gap-1 rounded-lg border border-border bg-card px-1 py-1 shadow-lg"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleEditSignature(signature.id)
                        }}
                        title="Edit signature"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <div className="h-5 w-px bg-border" />
                      <button
                        className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-600"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleRemoveSignature(signature.id)
                        }}
                        title="Delete signature"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}

                  {/* Signature Content with background */}
                  <div
                    className={cn(
                      "flex h-full w-full cursor-grab items-center justify-center rounded-sm border-2 border-transparent transition-all",
                      isSelected ? "border-primary bg-sky-200/70" : isHovered ? "border-primary/50 bg-sky-100/50" : "",
                      isDragging && "cursor-grabbing"
                    )}
                    onMouseDown={(e) => handleDragStart(e, signature.id)}
                    style={{ userSelect: "none" }}
                  >
                    {signature.type === "text" ? (
                      <span
                        className={cn("whitespace-nowrap", signature.fontClass)}
                        style={{
                          color: signature.color,
                          fontSize: `${Math.min(signature.height * 0.6, 36)}px`
                        }}
                      >
                        {signature.content}
                      </span>
                    ) : (
                      <img
                        src={signature.content}
                        alt="Signature"
                        className="max-h-full max-w-full object-contain"
                        draggable={false}
                      />
                    )}
                  </div>

                  {/* Corner resize handles - only show when selected */}
                  {isSelected && (
                    <>
                      {/* Top-left */}
                      <div
                        className="absolute -left-2 -top-2 h-4 w-4 cursor-nw-resize rounded-full border-2 border-primary bg-white shadow-sm"
                        onMouseDown={(e) => handleResizeStart(e, signature.id, "nw")}
                      />
                      {/* Top-right */}
                      <div
                        className="absolute -right-2 -top-2 h-4 w-4 cursor-ne-resize rounded-full border-2 border-primary bg-white shadow-sm"
                        onMouseDown={(e) => handleResizeStart(e, signature.id, "ne")}
                      />
                      {/* Bottom-left */}
                      <div
                        className="absolute -bottom-2 -left-2 h-4 w-4 cursor-sw-resize rounded-full border-2 border-primary bg-white shadow-sm"
                        onMouseDown={(e) => handleResizeStart(e, signature.id, "sw")}
                      />
                      {/* Bottom-right */}
                      <div
                        className="absolute -bottom-2 -right-2 h-4 w-4 cursor-se-resize rounded-full border-2 border-primary bg-white shadow-sm"
                        onMouseDown={(e) => handleResizeStart(e, signature.id, "se")}
                      />
                    </>
                  )}
                </div>
              )
            })}
          </div>

          {/* Page Navigation for PDF */}
          {isPdf && numPages > 1 && (
            <div className="mt-4 flex items-center justify-center gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={goToPrevPage}
                disabled={currentPage <= 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {currentPage} of {numPages}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={goToNextPage}
                disabled={currentPage >= numPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      <SignatureModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingId(null)
        }}
        onSign={handleUpdateSignature}
      />
    </div>
  )
}
