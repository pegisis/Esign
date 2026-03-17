"use client"

import { DocumentViewer } from "@/components/document-viewer"
import { useParams, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"


export default function SignPage() {
  const params = useParams()
  const searchParams = useSearchParams()

  const slug = params.slug as string
  const token = searchParams.get("token")

  const [documentUrl, setDocumentUrl] = useState<string | null>(null)

  useEffect(() => {
    // For now (local testing), just use a static PDF
    // Later replace with API call using token
    setDocumentUrl("/sample.pdf") 
  }, [slug, token])

  if (!documentUrl) {
    return <div className="p-10">Loading document...</div>
  }

  return (
    <div className="h-screen w-full">
      <DocumentViewer
        documentUrl={documentUrl}
        documentName={slug}
        documentType="application/pdf"
      />
    </div>
  )
}