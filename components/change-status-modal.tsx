"use client"

import { useEffect, useState } from "react"
import { CheckCircle2, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

type ResidenceState = "valido" | "invalido"

interface ChangeStatusModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (message: string) => void
  residenceCode: string
  nextState: ResidenceState
}

export function ChangeStatusModal({ isOpen, onClose, onConfirm, residenceCode, nextState }: ChangeStatusModalProps) {
  const [message, setMessage] = useState("")
  const isValid = nextState === "valido"

  useEffect(() => {
    if (!isOpen) setMessage("")
  }, [isOpen])

  const handleConfirm = () => {
    const normalizedMessage = message.trim()
    if (normalizedMessage) onConfirm(normalizedMessage)
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[450px] rounded-[28px] p-0 overflow-hidden">
        <div className="p-8">
          <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-6 ${isValid ? "bg-status-approved/10" : "bg-status-rejected/10"}`}>
            {isValid ? <CheckCircle2 className="h-8 w-8 text-status-approved" /> : <XCircle className="h-8 w-8 text-status-rejected" />}
          </div>

          <DialogHeader className="mb-6 text-center">
            <DialogTitle className="text-xl font-semibold text-foreground">
              Marcar residência como {isValid ? "válida" : "inválida"}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground mt-2">
              Informe ao morador o motivo da alteração da residência {residenceCode}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 mb-6">
            <Label htmlFor="status-message" className="text-sm font-medium text-foreground">
              Mensagem para o morador
            </Label>
            <Textarea
              id="status-message"
              placeholder="Explique o motivo da alteração do estado..."
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              className="min-h-[120px] rounded-xl resize-none bg-muted/30 border-border focus:border-primary"
            />
          </div>

          <div className="flex gap-3">
            <Button variant="outline" className="flex-1 h-11 rounded-xl" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              className={`flex-1 h-11 rounded-xl text-white ${isValid ? "bg-status-approved hover:bg-status-approved/90" : "bg-status-rejected hover:bg-status-rejected/90"}`}
              onClick={handleConfirm}
              disabled={!message.trim()}
            >
              Confirmar alteração
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
