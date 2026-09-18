"use client"

import { useState } from "react"
import { XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

interface RejectModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (reason: string) => void
  residenceCode: string
}

export function RejectModal({ isOpen, onClose, onConfirm, residenceCode }: RejectModalProps) {
  const [reason, setReason] = useState("")

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setReason("")
      onClose()
    }
  }

  const handleConfirm = () => {
    if (reason.trim()) {
      onConfirm(reason.trim())
      setReason("")
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[450px] rounded-[28px] p-0 overflow-hidden">
        <div className="p-8">
          <div className="mx-auto w-16 h-16 rounded-full bg-status-rejected/10 flex items-center justify-center mb-6">
            <XCircle className="h-8 w-8 text-status-rejected" />
          </div>

          <DialogHeader className="mb-6 text-center">
            <DialogTitle className="text-xl font-semibold text-foreground">
              Rejeitar Residência
            </DialogTitle>
            <DialogDescription className="text-muted-foreground mt-2">
              Indique o motivo da rejeição da residência {residenceCode}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mb-6">
            <div className="space-y-2">
              <Label htmlFor="reason" className="text-sm font-medium text-foreground">
                Motivo da Rejeição
              </Label>
              <Textarea
                id="reason"
                placeholder="Descreva o motivo pelo qual esta residência está a ser rejeitada..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="min-h-[120px] rounded-xl resize-none bg-muted/30 border-border focus:border-primary"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1 h-11 rounded-xl"
              onClick={() => handleOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              className="flex-1 h-11 rounded-xl bg-status-rejected hover:bg-status-rejected/90 text-white"
              onClick={handleConfirm}
              disabled={!reason.trim()}
            >
              Confirmar Rejeição
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}