"use client"

import { CheckCircle, Download, Printer } from "lucide-react"
import { QRCodeSVG } from "qrcode.react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface QRCodeModalProps {
  isOpen: boolean
  onClose: () => void
  residenceCode: string
}

export function QRCodeModal({ isOpen, onClose, residenceCode }: QRCodeModalProps) {
  const handlePrint = () => {
    window.print()
  }

  const handleDownload = () => {
    const svgElement = document.getElementById("sircah-qr-code")
    if (!svgElement) return

    const svgData = new XMLSerializer().serializeToString(svgElement)
    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" })
    const url = URL.createObjectURL(svgBlob)

    const downloadLink = document.createElement("a")
    downloadLink.href = url
    downloadLink.download = `QR-${residenceCode}.svg`
    document.body.appendChild(downloadLink)
    downloadLink.click()
    document.body.removeChild(downloadLink)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px] rounded-[28px] p-0 overflow-hidden">
        <div className="p-8 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-status-approved/10 flex items-center justify-center mb-6">
            <CheckCircle className="h-8 w-8 text-status-approved" />
          </div>

          <DialogHeader className="mb-6">
            <DialogTitle className="text-xl font-semibold text-foreground text-center">
              Residência {residenceCode} aprovada com sucesso!
            </DialogTitle>
          </DialogHeader>

          {/* QR Code Dinâmico */}
          <div className="mx-auto w-48 h-48 bg-card border border-border rounded-xl p-4 mb-6 shadow-[0_4px_30px_rgba(0,0,0,0.08)] flex items-center justify-center">
            <QRCodeSVG
              id="sircah-qr-code"
              value={residenceCode || "SIRCAH-PENDING"}
              size={160}
              level="H"
              includeMargin={false}
            />
          </div>

          <p className="text-sm text-muted-foreground mb-6">
            O QR Code foi gerado e está pronto para impressão
          </p>

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1 h-11 rounded-xl border-primary text-primary hover:bg-primary/10"
              onClick={handlePrint}
            >
              <Printer className="h-4 w-4 mr-2" />
              Imprimir
            </Button>
            <Button
              className="flex-1 h-11 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground"
              onClick={handleDownload}
            >
              <Download className="h-4 w-4 mr-2" />
              Baixar SVG
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}