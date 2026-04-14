import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { ChatContent } from "./_components/chat-content"
import { ChatSidebar } from "./_components/chat-sidebar"

export default function FullChatApp() {
  return (
    <SidebarProvider>
      <ChatSidebar />
      <SidebarInset>
        <ChatContent />
      </SidebarInset>
    </SidebarProvider>
  )
}
