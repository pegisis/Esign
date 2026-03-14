"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Header } from "@/components/header"
import { DocumentViewer } from "@/components/document-viewer"
import { Upload, FileText, Image as ImageIcon } from "lucide-react"

export default function SignPage() {
  const [uploadedFile, setUploadedFile] = useState<{
    url: string
    name: string
    type: string
  } | null>(null)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setUploadedFile({
        url,
        name: file.name,
        type: file.type,
      })
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
      "application/pdf": [".pdf"],
    },
    maxFiles: 1,
  })

  const handleReset = () => {
    if (uploadedFile) {
      URL.revokeObjectURL(uploadedFile.url)
    }
    setUploadedFile(null)
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      {!uploadedFile ? (
        <div className="flex flex-1 items-center justify-center p-4">
          <div className="w-full max-w-2xl">
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold text-foreground">Upload Your Document</h1>
              <p className="mt-2 text-muted-foreground">
                Upload a document to add your signature
              </p>
            </div>

            <div
              {...getRootProps()}
              className={`
                flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-12 transition-all
                ${
                  isDragActive
                    ? "border-primary bg-primary/5"
                    : "border-border bg-card hover:border-primary/50 hover:bg-muted/30"
                }
              `}
            >
              <input {...getInputProps()} />
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Upload className="h-8 w-8 text-primary" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-foreground">
                {isDragActive ? "Drop your file here" : "Drag and drop your document"}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                or click to browse from your computer
              </p>
              <div className="mt-6 flex gap-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  PDF
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <ImageIcon className="h-4 w-4" />
                  Images
                </div>
              </div>
            </div>

            <p className="mt-4 text-center text-sm text-muted-foreground">
              Your files are processed securely and never stored permanently
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-1 flex-col">
          <div className="border-b border-border bg-muted/30 px-4 py-2">
            <button
              onClick={handleReset}
              className="text-sm font-medium text-primary hover:underline"
            >
              ← Upload different document
            </button>
          </div>
          <div className="flex-1">
            <DocumentViewer
              documentUrl={uploadedFile.url}
              documentName={uploadedFile.name}
              documentType={uploadedFile.type}
            />
          </div>
        </div>
      )}
    </div>
  )
}
