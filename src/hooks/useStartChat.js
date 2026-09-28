import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { openConversation } from "@/lib/conversations";
import { toast } from "@/components/ui/use-toast";

// يفتح محادثة خاصة مع شخص (اختياريًا بخصوص طلب) وينتقل إليها.
export function useStartChat() {
  const { user, isAuthenticated, navigateToLogin } = useAuth();
  const navigate = useNavigate();
  const [starting, setStarting] = useState(false);

  const startChat = async (other, request) => {
    if (!isAuthenticated) {
      navigateToLogin();
      return;
    }
    if (!other?.uid || other.uid === user.uid || starting) return;
    setStarting(true);
    try {
      const cid = await openConversation(
        { uid: user.uid, name: user.display_name, photo: user.profile_picture },
        other,
        request
      );
      navigate(`/messages/${cid}`);
    } catch (e) {
      console.error("Opening conversation failed:", e);
      toast({
        variant: "destructive",
        title: "تعذّر بدء المحادثة",
        description: "المراسلة متاحة بين صاحب الطلب وأصحاب المهن فقط.",
      });
    } finally {
      setStarting(false);
    }
  };

  return { startChat, starting };
}
