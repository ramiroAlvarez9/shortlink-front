"use client"
import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LinkIcon, ListIcon } from "lucide-react"
import LinkGenerator from "@/components/link-generator"
import SavedLinks from "@/components/saved-links"

export default function LinkShortener() {
  const [activeTab, setActiveTab] = useState("generate")
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold text-center mb-8">Acortador de Links</h1>
      <Tabs defaultValue="generate" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="generate" className="flex items-center gap-2">
            <LinkIcon className="h-4 w-4" />
            <span>Generar Links</span>
          </TabsTrigger>
          <TabsTrigger value="saved" className="flex items-center gap-2">
            <ListIcon className="h-4 w-4" />
            <span>Links Guardados</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="generate">
          <LinkGenerator />
        </TabsContent>

        <TabsContent value="saved">
          <SavedLinks />
        </TabsContent>
      </Tabs>
    </div>
  )
}
