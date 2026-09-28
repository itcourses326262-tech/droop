import { useEffect, useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { isUnread, subscribeMyConversations } from "@/lib/conversations";

// محادثات المستخدم الحالي (لحظيًا) + عدد غير المقروءة.
export function useConversations() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const uid = user?.uid;

  useEffect(() => {
    if (!uid) {
      setConversations([]);
      setLoading(false);
      return undefined;
    }
    setLoading(true);
    return subscribeMyConversations(
      uid,
      (list) => {
        setConversations(list);
        setLoading(false);
        setError(null);
      },
      (e) => {
        console.error("Conversations subscription failed:", e);
        setError(e);
        setLoading(false);
      }
    );
  }, [uid]);

  const unreadCount = uid ? conversations.filter((c) => isUnread(c, uid)).length : 0;
  return { conversations, unreadCount, loading, error };
}
