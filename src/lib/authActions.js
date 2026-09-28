import { GoogleAuthProvider, getAdditionalUserInfo, signInWithPopup } from "firebase/auth";
import { auth } from "@/lib/firebase";

// تسجيل الدخول عبر Google. يعيد isNewUser لتوجيه المستخدم الجديد لإكمال ملفه.
export async function signInWithGoogle() {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  const result = await signInWithPopup(auth, provider);
  return { user: result.user, isNewUser: !!getAdditionalUserInfo(result)?.isNewUser };
}

// وجهة ما بعد الدخول عبر Google: المستخدم الجديد يكمل ملفه أولًا.
export function afterGoogleSignIn(isNewUser, returnTo) {
  if (isNewUser) return "/profile?welcome=1";
  return returnTo;
}
