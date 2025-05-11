// 📄 frontend/components/AnimatedIconButton.jsx

import { motion } from "framer-motion"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function AnimatedIconButton({ onClick }) {
  return (
    <motion.div
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <Button
        variant="ghost"
        size="icon"
        onClick={onClick}
        className="text-primary hover:bg-border hover:text-foreground"
      >
        <Plus className="w-5 h-5" />
      </Button>
    </motion.div>
  )
}
